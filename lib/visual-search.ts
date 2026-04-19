/**
 * Visual Search - Similarity Search & Ranking Module
 * ===============================================
 *
 * Pipeline:
 * 1. Nhận ảnh upload từ client
 * 2. Gọi ML service (CLIP) để phân tích ảnh
 * 3. Query PostgreSQL với pgvector (cosine similarity)
 * 4. Ranking & filter kết quả
 * 5. Trả về danh sách sản phẩm
 *
 * Architecture:
 * - ML (Python/FastAPI): xử lý ảnh, trích xuất embedding, classify brand/color
 * - Backend (Next.js): điều phối, query database, ranking
 * - Database (PostgreSQL + pgvector): similarity search
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


// ============================================================
// TYPES
// ============================================================

interface MLAnalysisResult {
  success: boolean;
  brand_prediction: string;
  brand_scores: Array<{ brand: string; score: number }>;
  gender_prediction: string;
  shoe_type_prediction: string;
  dominant_colors: Array<{ name: string; hex: string; rgb: number[]; percentage: number }>;
  product_colors: string[];
  embedding: number[];
  processing_time_ms: number;
}

interface SearchResult {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  colorImages?: Record<string, string[]> | null;
  brand: string;
  gender: string;
  shoeType: string;
  colors: string[];
  stock: number;
  similarityScore: number;
  brandScore: number;
  colorScore: number;
  finalScore: number;
}

interface MLInfo {
  predictedBrand: string;
  brandScores: Array<{ brand: string; score: number }>;
  dominantColors: Array<{ name: string; hex: string; rgb: number[]; percentage: number }>;
  productColors: string[];
  processingTimeMs: number;
}

export interface VisualSearchResponse {
  rankedResults: SearchResult[];
  mlInfo: MLInfo;
}


// ============================================================
// CONFIG
// ============================================================

const ML_SERVICE_URL = process.env.CLIP_API_URL || "http://localhost:8080";
const EMBEDDING_DIM = 512;
const DEFAULT_TOP_K = 12;
const ML_TIMEOUT_MS = 60_000;


// ============================================================
// COLOR NORMALIZATION
// ============================================================

/**
 * Normalize a color name for comparison.
 * ML service returns lowercase; DB stores may have mixed case.
 */
function normalizeColor(name: string): string {
  return name.toLowerCase().trim().replace(/[_-]/g, " ");
}

/**
 * Standard product colors supported by the database.
 * Must match the values in Product.colors String[].
 */
const STANDARD_COLORS: Record<string, string> = {
  // Primary colors
  black: "Black",
  white: "White",
  red: "Red",
  blue: "Blue",
  // Neutral colors
  grey: "Grey",
  gray: "Grey",
  navy: "Navy",
  brown: "Brown",
  beige: "Beige",
  // Vibrant colors
  green: "Green",
  orange: "Orange",
  pink: "Pink",
  purple: "Purple",
  yellow: "Yellow",
  multicolor: "Multicolor",
};

/**
 * Convert a raw color name (from ML or DB) to its standard DB form.
 * Returns null if the color cannot be mapped to a standard product color.
 */
function toStandardColor(color: string): string | null {
  const normalized = normalizeColor(color);
  const mapped = STANDARD_COLORS[normalized];
  return mapped || null;
}


// ============================================================
// RANKING FUNCTION
// ============================================================

/**
 * Tính final score cho mỗi sản phẩm dựa trên nhiều yếu tố.
 *
 * Score components:
 * 1. Similarity Score (60%) - độ giống nhau về hình dạng/kiểu dáng
 * 2. Brand Score (20%) - brand match giữa dự đoán và sản phẩm
 * 3. Color Score (20%) - màu sắc khớp với detected colors
 *
 * Công thức:
 *   finalScore = 0.6 * simNorm + 0.2 * brandNorm + 0.2 * colorNorm
 *
 * Trong đó:
 * - simNorm = similarity / maxSimilarity (normalize về [0,1])
 * - brandNorm = 1.0 nếu brand khớp, 0.3 nếu gần khớp (cùng nhóm sport/lifestyle)
 * - colorNorm = % pixels có màu khớp (normalized by standard color matching)
 */
function calculateFinalScore(
  similarityScore: number,
  maxSimilarity: number,
  predictedBrand: string,
  productBrand: string,
  brandScore: number,
  detectedColors: string[],
  productColors: string[]
): { finalScore: number; colorScore: number } {
  // 1. Similarity score (normalized)
  const simNorm = maxSimilarity > 0 ? similarityScore / maxSimilarity : 0;

  // 2. Brand score
  // Brand khớp chính xác = 1.0
  // Brand gần khớp (cùng nhóm) = 0.3
  // Brand không khớp = 0
  let brandNorm = 0;
  if (predictedBrand === productBrand) {
    brandNorm = 1.0;
  } else {
    // Brand affinity groups
    const brandGroups: Record<string, string[]> = {
      NIKE: ["ADIDAS", "PUMA", "NEW_BALANCE"],
      ADIDAS: ["NIKE", "PUMA", "NEW_BALANCE"],
      PUMA: ["NIKE", "ADIDAS", "NEW_BALANCE"],
      NEW_BALANCE: ["NIKE", "ADIDAS", "PUMA"],
      CONVERSE: ["VANS"],
      VANS: ["CONVERSE"],
    };
    const affinity = brandGroups[predictedBrand] || [];
    brandNorm = affinity.includes(productBrand) ? 0.3 : 0;
  }
  // Blend với CLIP brand prediction confidence
  brandNorm = brandNorm * 0.7 + brandScore * 0.3;

  // 3. Color score - FIX: normalize both sides to standard form
  let colorNorm = 0;
  if (detectedColors.length > 0 && productColors.length > 0) {
    // Normalize detected colors to standard DB form
    const normalizedDetected = detectedColors
      .map(toStandardColor)
      .filter((c): c is string => c !== null);

    // Normalize product colors to standard DB form
    const normalizedProduct = productColors
      .map(toStandardColor)
      .filter((c): c is string => c !== null);

    if (normalizedDetected.length > 0 && normalizedProduct.length > 0) {
      // Count how many detected colors match product colors
      const matched = normalizedDetected.filter((dc) =>
        normalizedProduct.some((pc) => pc === dc)
      );
      colorNorm = matched.length / normalizedDetected.length;
    }
  } else if (productColors.length === 0) {
    // Không có màu trong DB -> coi như match
    colorNorm = 0.5;
  }

  // 4. Final score
  const finalScore = 0.6 * simNorm + 0.2 * brandNorm + 0.2 * colorNorm;

  return {
    finalScore: Math.round(finalScore * 1000) / 1000,
    colorScore: Math.round(colorNorm * 1000) / 1000,
  };
}


// ============================================================
// VECTOR SEARCH
// ============================================================

/**
 * Tìm sản phẩm tương tự dùng pgvector cosine similarity.
 *
 * PostgreSQL query:
 *   ORDER BY embedding <=> $embedding  -- <=> là cosine distance
 *   LIMIT $topK
 *
 * pgvector cần extension:
 *   CREATE EXTENSION IF NOT EXISTS vector;
 *   ALTER TABLE "Product" ADD COLUMN embedding vector(512);
 */
async function searchByEmbedding(
  embedding: number[],
  topK: number
): Promise<Array<{ id: string; similarity: number }>> {
  // pgvector cosine distance operator: <=>
  // cosine_distance = 1 - cosine_similarity
  // Vì đã L2 normalized embeddings, dot product = cosine_similarity
  // Sử dụng raw query để tận dụng pgvector
  const results = await prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
    SELECT
      id,
      1 - (embedding <=> ${embedding}::vector) AS similarity
    FROM "Product"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT ${topK}
  `;

  return results;
}


// ============================================================
// FALLBACK SEARCH (brand/color/shoeType)
// ============================================================

interface FallbackSearchParams {
  predictedBrand: string;
  brandScores: Array<{ brand: string; score: number }>;
  detectedColors: string[];
  productColors: string[];
  topK: number;
  minStock?: number;
}

async function fallbackSearch(
  params: FallbackSearchParams
): Promise<Array<{ id: string; fallbackScore: number }>> {
  const { predictedBrand, brandScores, detectedColors, productColors, topK, minStock } = params;

  // Build a weighted score for each product based on brand + color match
  // We'll query products and score them in-memory (suitable for smaller datasets)
  const where: any = {
    ...(minStock !== undefined && minStock > 0 ? { stock: { gte: minStock } } : {}),
  };

  const products = await prisma.product.findMany({
    where,
    select: { id: true, brand: true, colors: true, shoeType: true },
    take: 200, // Reasonable limit for in-memory scoring
  });

  const scored = products.map((product) => {
    let score = 0;

    // Brand score (0-1)
    const brandMatch = brandScores.find(
      (b) => b.brand.toUpperCase() === product.brand.toUpperCase()
    );
    score += (brandMatch?.score || 0) * 0.7;

    // Affinity brand (0-0.3)
    const affinityBrands: Record<string, string[]> = {
      NIKE: ["ADIDAS", "PUMA", "NEW_BALANCE"],
      ADIDAS: ["NIKE", "PUMA", "NEW_BALANCE"],
      PUMA: ["NIKE", "ADIDAS", "NEW_BALANCE"],
      NEW_BALANCE: ["NIKE", "ADIDAS", "PUMA"],
      CONVERSE: ["VANS"],
      VANS: ["CONVERSE"],
    };
    const predictedUpper = predictedBrand.toUpperCase();
    const productBrandUpper = product.brand.toUpperCase();
    if (affinityBrands[predictedUpper]?.includes(productBrandUpper)) {
      score += 0.3;
    }

    // Color score (0-1)
    if (detectedColors.length > 0 && productColors.length > 0) {
      const normalizedDetected = detectedColors
        .map(toStandardColor)
        .filter((c): c is string => c !== null);
      const normalizedProduct = product.colors
        .map(toStandardColor)
        .filter((c): c is string => c !== null);
      if (normalizedDetected.length > 0 && normalizedProduct.length > 0) {
        const matched = normalizedDetected.filter((dc) =>
          normalizedProduct.some((pc) => pc === dc)
        );
        score += (matched.length / normalizedDetected.length) * 0.5;
      }
    }

    return { id: product.id, fallbackScore: score };
  });

  return scored
    .sort((a, b) => b.fallbackScore - a.fallbackScore)
    .slice(0, topK);
}


// ============================================================
// MAIN SEARCH PIPELINE
// ============================================================

export async function visualSearchPipeline(
  imageBase64: string,
  options: {
    topK?: number;
    filterBrand?: string;
    filterGender?: string;
    filterShoeType?: string;
    minStock?: number;
  } = {}
): Promise<VisualSearchResponse> {
  const { topK = DEFAULT_TOP_K, minStock = 0 } = options;

  // =====================================================
  // STEP 1: Gọi ML Service để phân tích ảnh
  // =====================================================
  let mlResult: MLAnalysisResult;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageBase64,
        include_embedding: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errBody = await response.json();
        errorDetail = errBody?.detail || "";
      } catch {
        errorDetail = await response.text();
      }
      throw new Error(
        `ML service returned ${response.status}${errorDetail ? `: ${errorDetail}` : ""}`
      );
    }

    mlResult = await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "ML service timeout. Please try again or check if the ML service is running."
      );
    }
    console.error("[VisualSearch] ML service call failed:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Không thể phân tích hình ảnh. Vui lòng thử lại."
    );
  }

  const {
    embedding,
    brand_prediction: predictedBrand,
    brand_scores: brandScores,
    dominant_colors: detectedColors,
    product_colors: productColors,
  } = mlResult;

  // =====================================================
  // STEP 2: Vector similarity search
  // =====================================================
  const candidates = await searchByEmbedding(embedding, topK * 3);

  let rankedResults: SearchResult[];
  const mlInfo: MLInfo = {
    predictedBrand,
    brandScores,
    dominantColors: detectedColors,
    productColors,
    processingTimeMs: mlResult.processing_time_ms,
  };

  if (candidates.length === 0) {
    // FIX: Return proper structure + fallback search instead of empty array
    // Fallback: search by brand/color without embedding
    console.log("[VisualSearch] No embeddings found in DB, using fallback search");

    const fallbackCandidates = await fallbackSearch({
      predictedBrand,
      brandScores,
      detectedColors: detectedColors.map((c) => c.name),
      productColors,
      topK,
      minStock,
    });

    if (fallbackCandidates.length === 0) {
      return { rankedResults: [], mlInfo };
    }

    // Fetch product details for fallback results
    const fallbackIds = fallbackCandidates.map((c) => c.id);
    const fallbackScoreMap = new Map(
      fallbackCandidates.map((c) => [c.id, c.fallbackScore])
    );

    const products = await prisma.product.findMany({
      where: { id: { in: fallbackIds } },
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        images: true,
        colorImages: true,
        brand: true,
        gender: true,
        shoeType: true,
        colors: true,
        stock: true,
      },
    });

    rankedResults = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || undefined,
      images: product.images,
      colorImages: product.colorImages ?? undefined,
      brand: product.brand,
      gender: product.gender,
      shoeType: product.shoeType,
      colors: product.colors,
      stock: product.stock,
      similarityScore: 0,
      brandScore: fallbackScoreMap.get(product.id) || 0,
      colorScore: 0,
      finalScore: Math.round((fallbackScoreMap.get(product.id) || 0) * 1000) / 1000,
    }));

    return { rankedResults, mlInfo };
  }

  // =====================================================
  // STEP 3: Fetch product details và apply filters
  // =====================================================
  const candidateIds = candidates.map((c) => c.id);
  const similarityMap = new Map(candidates.map((c) => [c.id, c.similarity]));

  const products = await prisma.product.findMany({
    where: {
      id: { in: candidateIds },
      ...(minStock > 0 && { stock: { gte: minStock } }),
    },
    select: {
      id: true,
      name: true,
      price: true,
      originalPrice: true,
      images: true,
      colorImages: true,
      brand: true,
      gender: true,
      shoeType: true,
      colors: true,
      stock: true,
    },
  });

  // =====================================================
  // STEP 4: Calculate final scores
  // =====================================================
  const maxSimilarity = Math.max(...candidates.map((c) => c.similarity));

  const scoredProducts: SearchResult[] = products.map((product) => {
    const similarityScore = similarityMap.get(product.id) || 0;
    const brandScore =
      brandScores.find((b) => b.brand === product.brand)?.score || 0;

    const { finalScore, colorScore } = calculateFinalScore(
      similarityScore,
      maxSimilarity,
      predictedBrand,
      product.brand,
      brandScore,
      detectedColors.map((c) => c.name),
      product.colors
    );

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || undefined,
      images: product.images,
      colorImages: product.colorImages ?? undefined,
      brand: product.brand,
      gender: product.gender,
      shoeType: product.shoeType,
      colors: product.colors,
      stock: product.stock,
      similarityScore: Math.round(similarityScore * 1000) / 1000,
      brandScore: Math.round(brandScore * 1000) / 1000,
      colorScore,
      finalScore,
    };
  });

  // =====================================================
  // STEP 5: Sort by final score, take top K
  // =====================================================
  rankedResults = scoredProducts
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, topK);

  return { rankedResults, mlInfo };
}


// ============================================================
// GET /api/visual-search
// ============================================================

// NOTE: GET and POST handlers are defined in app/api/visual-search/route.ts
// This file exports the shared visualSearchPipeline function used by the route.
