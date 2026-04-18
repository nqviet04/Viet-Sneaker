# VietSneaker ML Service - Visual Search

## Tổng quan

Python ML service cung cấp các chức năng Visual Search cho website VietSneaker:

1. **CLIP Embedding** — Trích xuất vector đặc trưng từ ảnh giày
2. **Brand Classification** — Dự đoán thương hiệu giày (Nike, Adidas, Puma, ...)
3. **Color Extraction** — Trích xuất màu chủ đạo bằng K-Means
4. **Shoe Type Classification** — Dự đoán loại giày (running, casual, boots, ...)

## Kiến trúc

```
User Upload Image
       ↓
Next.js API (/api/visual-search)
       ↓
ML Service (FastAPI:8080)
       ├── CLIP Encoder → embedding vector
       ├── Brand Classifier → predicted brand
       ├── Color Extractor → dominant colors
       └── Gender/ShoeType Classifier
       ↓
PostgreSQL (pgvector)
       └── Cosine similarity search
       ↓
Ranked Results → Frontend
```

## Cài đặt

### 1. Cài đặt Python dependencies

```bash
cd services/ml-service
pip install -r requirements.txt
```

Hoặc dùng conda:

```bash
conda create -n viet-sneaker-ml python=3.11
conda activate viet-sneaker-ml
pip install -r requirements.txt
```

### 2. Chạy ML Service

```bash
# Development (auto-reload)
uvicorn main:app --host 0.0.0.0 --port 8080 --reload

# Production
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8080
```

Service sẽ tự động tải CLIP model khi start (lần đầu ~30s, sau đó ~3s từ cache).

### 3. Verify

```bash
curl http://localhost:8080/health
```

Response:

```json
{"status":"healthy","model_loaded":true,"uptime_seconds":10.5}
```

## API Endpoints

### POST /analyze

Phân tích ảnh đầy đủ:

```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQ...", "include_embedding": true}'
```

Response:

```json
{
  "success": true,
  "brand_prediction": "NIKE",
  "brand_scores": [
    {"brand": "NIKE", "score": 0.847},
    {"brand": "ADIDAS", "score": 0.123},
    {"brand": "PUMA", "score": 0.015}
  ],
  "gender_prediction": "MEN",
  "shoe_type_prediction": "RUNNING",
  "dominant_colors": [
    {"name": "white", "hex": "#FFFFFF", "rgb": [255,255,255], "percentage": 0.45},
    {"name": "black", "hex": "#000000", "rgb": [0,0,0], "percentage": 0.30}
  ],
  "product_colors": ["white", "black"],
  "embedding": [0.123, -0.456, ...],
  "processing_time_ms": 850.3
}
```

### POST /embedding

Chỉ trả về CLIP embedding:

```bash
curl -X POST http://localhost:8080/embedding \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQ..."}'
```

### POST /batch-embeddings

Encode nhiều ảnh cùng lúc (cho script generate embeddings):

```bash
curl -X POST http://localhost:8080/batch-embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      {"id": "prod_1", "image_base64": "..."},
      {"id": "prod_2", "image_base64": "..."}
    ]
  }'
```

### GET /health

Health check:

```bash
curl http://localhost:8080/health
```

## Cấu trúc module

```
services/ml-service/
├── main.py              # FastAPI app, endpoints
├── clip_encoder.py      # CLIP model wrapper (encode image/text)
├── brand_classifier.py  # Zero-shot brand classification
├── color_extractor.py   # K-Means color extraction
├── preprocess.py         # Image preprocessing (resize, crop, normalize)
└── requirements.txt     # Python dependencies
```

## Database Setup (pgvector)

### Enable pgvector extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

### Cập nhật Prisma Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

### Generate Embeddings cho sản phẩm

```bash
# Chạy script generate embeddings
npx tsx scripts/generate-embeddings.ts

# Dry run (preview only)
npx tsx scripts/generate-embeddings.ts --dry-run

# Chỉ một brand
npx tsx scripts/generate-embeddings.ts --brand=NIKE
```

## Performance

| Operation | Time |
|---|---|
| CLIP encode (1 image) | ~100-300ms |
| Brand classification | ~50ms (reuse embeddings) |
| Color extraction | ~30ms |
| Full analyze | ~300-500ms |
| Batch 10 images | ~500ms |
| pgvector query (10K products) | ~5-20ms |

Total end-to-end latency (image → results): **~500-1000ms**

## GPU Acceleration

Nếu có GPU NVIDIA:

```bash
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

CLIP sẽ tự động dùng GPU nếu available, giảm thời gian encode từ ~300ms → ~30ms.

## Mở rộng

### Thêm thương hiệu mới

Edit `brand_classifier.py`, thêm vào `BRAND_PROMPTS`:

```python
BRAND_PROMPTS = {
    # ... existing brands ...
    "NEW_BRAND": [
        "New Brand sneakers, New Brand shoes",
        "New Brand athletic footwear",
    ],
}
```

### Thêm loại giày mới

Edit `brand_classifier.py`, thêm vào `SHOE_TYPE_PROMPTS`:

```python
SHOE_TYPE_PROMPTS = {
    # ... existing types ...
    "NEW_TYPE": ["New type shoes", "..."],
}
```

### Fine-tune Brand Classifier

Để cải thiện accuracy của brand classification, có thể fine-tune một CNN nhỏ:

```python
# Chuyển sang bản fine-tuned model
encoder = CustomBrandClassifier(model_path="models/brand_classifier_v1.pt")
```

Dataset cho fine-tuning: ~100-200 ảnh/brand × 6 brands = 600-1200 ảnh.

## Troubleshooting

### Lỗi "CUDA out of memory"

```bash
# Giảm batch size hoặc chạy trên CPU
CUDA_VISIBLE_DEVICES="" uvicorn main:app --port 8080
```

### Lỗi "model not found"

Đảm bảo internet để tải CLIP model từ HuggingFace:

```bash
# Hoặc cache trước
python -c "from transformers import CLIPModel; CLIPModel.from_pretrained('openai/clip-vit-base-patch32')"
```

### ML service không phản hồi

```bash
# Check health
curl http://localhost:8080/health

# Check logs
uvicorn main:app --host 0.0.0.0 --port 8080 --reload --log-level debug
```
