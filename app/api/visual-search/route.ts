/**
 * Visual Search API Route
 * ====================
 *
 * Endpoint: POST /api/visual-search
 * Endpoint: GET  /api/visual-search
 *
 * Nhận ảnh base64 từ client, gọi ML pipeline,
 * query database, và trả về danh sách sản phẩm tương tự.
 *
 * Response format:
 * {
 *   success: boolean
 *   count: number
 *   results: Product[]
 *   mlInfo: {
 *     predictedBrand: string
 *     dominantColors: Color[]
 *     processingTimeMs: number
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { visualSearchPipeline } from "@/lib/visual-search";


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const image = searchParams.get("image");

  if (!image) {
    return NextResponse.json(
      { error: "Missing 'image' query parameter (base64 encoded)" },
      { status: 400 }
    );
  }

  const topK = parseInt(searchParams.get("topK") || "12", 10);

  try {
    const { rankedResults, mlInfo } = await visualSearchPipeline(image, {
      topK: Math.min(topK, 50),
      minStock: 1,
    });

    return NextResponse.json({
      success: true,
      count: rankedResults.length,
      results: rankedResults,
      mlInfo,
    });
  } catch (error) {
    console.error("[VisualSearch API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, topK = 12 } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Missing 'image' in request body" },
        { status: 400 }
      );
    }

    const { rankedResults, mlInfo } = await visualSearchPipeline(image, {
      topK: Math.min(topK, 50),
      minStock: 1,
    });

    return NextResponse.json({
      success: true,
      count: rankedResults.length,
      results: rankedResults,
      mlInfo,
    });
  } catch (error) {
    console.error("[VisualSearch API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
