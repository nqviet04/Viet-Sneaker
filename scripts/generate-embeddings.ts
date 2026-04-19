/**
 * Generate CLIP Embeddings Script
 * =============================
 *
 * Chạy: npx tsx scripts/generate-embeddings.ts
 *
 * Script này:
 * 1. Lấy tất cả sản phẩm từ database (chưa có embedding)
 * 2. Tải ảnh sản phẩm về
 * 3. Encode ảnh bằng CLIP (gọi ML service)
 * 4. Lưu embedding vào database
 * 5. Trích xuất dominant colors từ ảnh
 * 6. Cập nhật product colors bằng ML-detected colors
 *
 * Chiến lược:
 * - Batch processing: gửi nhiều ảnh cùng lúc để tăng tốc
 * - Retry logic: thử lại nếu ML service lỗi tạm thời
 * - Progress tracking: hiển thị tiến độ
 * - Dry run mode: chỉ hiển thị sản phẩm cần encode, không lưu
 */

import { PrismaClient, Brand, Gender, ShoeType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

const prisma = new PrismaClient();

const ML_SERVICE_URL = process.env.CLIP_API_URL || "http://localhost:8080";
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;


// ============================================================
// COLOR NORMALIZATION
// ============================================================

const STANDARD_COLORS: Record<string, string> = {
  black: "Black",
  white: "White",
  red: "Red",
  blue: "Blue",
  grey: "Grey",
  gray: "Grey",
  navy: "Navy",
  brown: "Brown",
  beige: "Beige",
  green: "Green",
  orange: "Orange",
  pink: "Pink",
  purple: "Purple",
  yellow: "Yellow",
  multicolor: "Multicolor",
};

function toStandardColor(color: string): string | null {
  const normalized = color.toLowerCase().trim().replace(/[_-]/g, " ");
  return STANDARD_COLORS[normalized] || null;
}


// ============================================================
// HELPERS
// ============================================================

async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const request = protocol.get(url, { timeout: 15000 }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    });
    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}


async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}


async function callMLServiceWithRetry(
  images: Array<{ id: string; image_base64: string }>
): Promise<any> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);
      const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map((img) => ({
            id: img.id,
            image_base64: img.image_base64,
          })),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ML service error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < MAX_RETRIES - 1) {
        console.warn(
          `  Retry ${attempt + 1}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms...`
        );
        await sleep(RETRY_DELAY_MS);
      } else {
        throw error;
      }
    }
  }
}


// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const brandFilter = args.find((a) => a.startsWith("--brand="))?.split("=")[1];

  console.log("=".repeat(60));
  console.log("Generate CLIP Embeddings for VietSneaker");
  console.log("=".repeat(60));
  console.log(`ML Service: ${ML_SERVICE_URL}`);
  console.log(`Mode: ${dryRun ? "DRY RUN (no changes)" : "LIVE (will update database)"}`);
  if (brandFilter) console.log(`Brand filter: ${brandFilter}`);
  console.log();

  // 1. Lấy sản phẩm chưa có embedding
  const whereClause: any = {
    images: { isEmpty: false },
  };

  if (brandFilter) {
    whereClause.brand = brandFilter.toUpperCase();
  }

  const totalProducts = await prisma.product.count({ where: whereClause });
  console.log(`Total products to process: ${totalProducts}`);
  console.log();

  if (totalProducts === 0) {
    console.log("No products need embedding. Done!");
    return;
  }

  // 2. Lấy sản phẩm theo batch
  let processed = 0;
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  const startTime = Date.now();

  while (processed < totalProducts) {
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        images: true,
        brand: true,
        colors: true,
      },
      take: BATCH_SIZE,
      skip: processed,
      orderBy: { createdAt: "asc" },
    });

    if (products.length === 0) break;

    console.log(
      `[Batch ${Math.floor(processed / BATCH_SIZE) + 1}] Processing ${products.length} products...`
    );

    // 3. Download ảnh và encode
    const batchImages: Array<{ id: string; image_base64: string }> = [];
    const productMap = new Map<string, (typeof products)[0]>();

    for (const product of products) {
      const imageUrl = product.images[0];
      if (!imageUrl) {
        console.warn(`  [${product.id}] No images, skipping`);
        skippedCount++;
        processed++;
        continue;
      }

      try {
        const imageBuffer = await downloadImage(imageUrl);
        const base64 = imageBuffer.toString("base64");
        batchImages.push({ id: product.id, image_base64: base64 });
        productMap.set(product.id, product);
      } catch (error) {
        console.warn(`  [${product.id}] Failed to download: ${error}`);
        skippedCount++;
      }

      processed++;
    }

    // 4. Gọi ML service (batch) - use /analyze to get both embedding + colors
    if (batchImages.length > 0) {
      try {
        // Use /analyze endpoint for full analysis (embedding + colors)
        const mlResults: Array<{
          id: string;
          embedding: number[];
          dominant_colors: Array<{ name: string }>;
          success: boolean;
          error?: string;
        }> = [];

        // Process individually since ML service uses /analyze per image
        for (const img of batchImages) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60_000);
            const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: img.image_base64, include_embedding: true }),
              signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!response.ok) {
              throw new Error(`ML service returned ${response.status}`);
            }

            const data = await response.json();
            mlResults.push({
              id: img.id,
              embedding: data.embedding,
              dominant_colors: data.dominant_colors || [],
              success: true,
            });
          } catch (err) {
            console.warn(`  [${img.id}] ML analysis failed: ${err}`);
            mlResults.push({ id: img.id, embedding: [], dominant_colors: [], success: false, error: String(err) });
          }
        }

        // 5. Cập nhật database
        if (!dryRun) {
          for (const result of mlResults) {
            if (!result.success || !result.embedding?.length) continue;

            const product = productMap.get(result.id);
            if (!product) continue;

            // Normalize colors to standard form
            const normalizedColors = (result.dominant_colors || [])
              .map((c: { name: string }) => toStandardColor(c.name))
              .filter((c: string | null): c is string => c !== null);

            // Build embedding string for PostgreSQL vector type
            const embeddingStr = `[${result.embedding.join(",")}]`;

            await prisma.product.update({
              where: { id: result.id },
              data: {
                embedding: embeddingStr as unknown as object,
                dominantColors: normalizedColors,
              },
            });
          }
        }

        const successInBatch = mlResults.filter((r) => r.success).length;
        successCount += successInBatch;
        errorCount += mlResults.length - successInBatch;

        console.log(
          `  Done: ${successInBatch}/${mlResults.length} success, ${mlResults.length - successInBatch} errors`
        );
      } catch (error) {
        console.error(`  Batch failed: ${error}`);
        errorCount += batchImages.length;
      }
    }

    // Progress bar
    const progress = Math.round((processed / totalProducts) * 100);
    const bar = "█".repeat(Math.floor(progress / 5)) + "░".repeat(20 - Math.floor(progress / 5));
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\r  Progress: [${bar}] ${progress}% (${processed}/${totalProducts}) - ${elapsed}s    \r`);
  }

  console.log();
  console.log();
  console.log("=".repeat(60));
  console.log("DONE");
  console.log(`  Total: ${totalProducts}`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log("=".repeat(60));
}


// ============================================================
// USAGE
// ============================================================

async function printUsage() {
  console.log(`
Usage:
  npx tsx scripts/generate-embeddings.ts [options]

Options:
  --dry-run        Preview products without saving
  --brand=NIKE     Only process Nike products

Examples:
  npx tsx scripts/generate-embeddings.ts
  npx tsx scripts/generate-embeddings.ts --dry-run
  npx tsx scripts/generate-embeddings.ts --brand=ADIDAS

Prerequisites:
  1. ML service must be running: uvicorn services.ml-service.main:app --port 8080
  2. Database must have products with images
`);
}


main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
