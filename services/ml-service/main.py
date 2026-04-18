"""
ML Service - Main FastAPI Application
====================================
Serve các ML models: CLIP embedding, brand/color classification.

Endpoints:
- POST /analyze: Phân tích ảnh đầy đủ (embedding + brand + color + shoeType)
- POST /embedding: Chỉ trả về CLIP embedding
- POST /batch-embeddings: Encode nhiều ảnh cùng lúc (cho script generate embeddings)
- GET  /health: Health check

Usage:
    # Chạy service
    uvicorn main:app --host 0.0.0.0 --port 8080

    # Hoặc chạy với reload (development)
    uvicorn main:app --host 0.0.0.0 --port 8080 --reload

    # Production
    gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8080
"""

import io
import time
import base64
from typing import List, Optional, Literal

import pillow_avif  # noqa: F401 - register AVIF codec with PIL

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from PIL import Image

from clip_encoder import get_clip_encoder
from brand_classifier import (
    get_brand_classifier,
    get_gender_classifier,
    get_shoe_type_classifier,
)
from color_extractor import get_color_extractor, map_to_product_colors


# ============================================================
# APP SETUP
# ============================================================

app = FastAPI(
    title="VietSneaker ML Service",
    description="Visual Search ML Service for VietSneaker e-commerce",
    version="1.0.0",
)

# CORS: cho phép Next.js frontend gọi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production, restrict thành domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"detail": exc.errors()},
    )


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class AnalyzeRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image (with or without data URI prefix)")
    include_embedding: bool = Field(True, description="Include CLIP embedding in response")


class BrandScore(BaseModel):
    brand: str
    score: float


class ColorInfo(BaseModel):
    name: str
    hex: str
    rgb: List[int]
    percentage: float


class AnalyzeResponse(BaseModel):
    success: bool
    brand_prediction: str
    brand_scores: List[BrandScore]
    gender_prediction: str
    shoe_type_prediction: str
    dominant_colors: List[ColorInfo]
    product_colors: List[str]
    embedding: Optional[List[float]] = None
    processing_time_ms: float


class EmbeddingRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image")


class EmbeddingResponse(BaseModel):
    success: bool
    embedding: List[float]
    processing_time_ms: float


class BatchEmbeddingItem(BaseModel):
    id: str
    image_base64: str


class BatchEmbeddingRequest(BaseModel):
    images: List[BatchEmbeddingItem]


class BatchEmbeddingResponse(BaseModel):
    success: bool
    results: List[dict]
    total_processing_time_ms: float


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    uptime_seconds: float


# ============================================================
# STARTUP / SHUTDOWN
# ============================================================

start_time = time.time()


@app.on_event("startup")
async def startup_event():
    """Load models khi service start."""
    print("=" * 60)
    print("[ML Service] Starting up...")
    print("[ML Service] Loading CLIP model...")
    t0 = time.time()
    encoder = get_clip_encoder()
    _ = encoder.embedding_dim  # Force load
    print(f"[ML Service] CLIP model loaded in {time.time() - t0:.1f}s")
    print("[ML Service] Ready to serve!")
    print("=" * 60)


# ============================================================
# ENDPOINTS
# ============================================================

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_image(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Phân tích ảnh giày đầy đủ:
    1. Trích xuất CLIP embedding
    2. Dự đoán brand (zero-shot CLIP)
    3. Dự đoán gender (zero-shot CLIP)
    4. Dự đoán shoe type (zero-shot CLIP)
    5. Trích xuất màu chủ đạo (K-Means)

    Returns đầy đủ thông tin để query database.
    """
    t0 = time.time()

    try:
        # 1. Load và validate image
        try:
            image = _load_image_from_base64(req.image)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

        # 2. CLIP embedding
        encoder = get_clip_encoder()
        embedding = encoder.encode_image(image)
        embedding_list = embedding.tolist() if req.include_embedding else None

        # 3. Brand classification
        brand_clf = get_brand_classifier()
        brand_scores = brand_clf.predict(image)
        top_brand = max(brand_scores, key=brand_scores.get)

        # 4. Gender classification
        gender_clf = get_gender_classifier()
        gender_scores = gender_clf.predict(image)
        top_gender = max(gender_scores, key=gender_scores.get)

        # 5. Shoe type classification
        shoe_clf = get_shoe_type_classifier()
        shoe_scores = shoe_clf.predict(image)
        top_shoe_type = max(shoe_scores, key=shoe_scores.get)

        # 6. Color extraction
        color_extractor = get_color_extractor()
        dominant_colors = color_extractor.extract(image)
        detected_color_names = [c["name"] for c in dominant_colors]
        product_colors = map_to_product_colors(detected_color_names)

        processing_time = (time.time() - t0) * 1000

        return AnalyzeResponse(
            success=True,
            brand_prediction=top_brand,
            brand_scores=[
                BrandScore(brand=b, score=s)
                for b, s in sorted(brand_scores.items(), key=lambda x: x[1], reverse=True)[:5]
            ],
            gender_prediction=top_gender,
            shoe_type_prediction=top_shoe_type,
            dominant_colors=[ColorInfo(**c) for c in dominant_colors],
            product_colors=product_colors,
            embedding=embedding_list,
            processing_time_ms=round(processing_time, 1),
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/embedding", response_model=EmbeddingResponse)
async def get_embedding(req: EmbeddingRequest) -> EmbeddingResponse:
    """Chỉ trả về CLIP embedding cho 1 ảnh. Dùng cho batch processing."""
    t0 = time.time()

    try:
        image = _load_image_from_base64(req.image)
        encoder = get_clip_encoder()
        embedding = encoder.encode_image(image)
        return EmbeddingResponse(
            success=True,
            embedding=embedding.tolist(),
            processing_time_ms=round((time.time() - t0) * 1000, 1),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to encode image: {str(e)}")


@app.post("/batch-embeddings", response_model=BatchEmbeddingResponse)
async def batch_embeddings(req: BatchEmbeddingRequest) -> BatchEmbeddingResponse:
    """
    Encode nhiều ảnh cùng lúc.
    Dùng cho script generate-embeddings.ts để tạo embeddings cho tất cả sản phẩm.
    """
    t0 = time.time()
    results = []

    for item in req.images:
        try:
            image = _load_image_from_base64(item.image_base64)
            encoder = get_clip_encoder()
            embedding = encoder.encode_image(image)
            results.append({
                "id": item.id,
                "embedding": embedding.tolist(),
                "success": True,
                "error": None,
            })
        except Exception as e:
            results.append({
                "id": item.id,
                "embedding": None,
                "success": False,
                "error": str(e),
            })

    total_time = (time.time() - t0) * 1000

    return BatchEmbeddingResponse(
        success=True,
        results=results,
        total_processing_time_ms=round(total_time, 1),
    )


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint cho monitoring."""
    encoder = get_clip_encoder()
    return HealthResponse(
        status="healthy",
        model_loaded=True,
        uptime_seconds=round(time.time() - start_time, 1),
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "VietSneaker ML Service",
        "version": "1.0.0",
        "endpoints": ["/analyze", "/embedding", "/batch-embeddings", "/health"],
    }


# ============================================================
# HELPERS
# ============================================================

def _load_image_from_base64(base64_str: str) -> Image.Image:
    """Parse base64 string (có hoặc không có data URI prefix) -> PIL Image."""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(base64_str)
    except Exception as e:
        raise ValueError(f"Base64 decode failed: {e}")

    image = Image.open(io.BytesIO(image_bytes))

    # Convert RGBA -> RGB (loại bỏ alpha)
    if image.mode == "RGBA":
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[3])
        return background

    if image.mode != "RGB":
        return image.convert("RGB")

    return image


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
