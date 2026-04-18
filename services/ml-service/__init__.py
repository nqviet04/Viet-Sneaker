"""
ML Service cho VietSneaker Visual Search
==========================================
Xử lý ảnh giày: embedding, brand classification, color extraction

Modules:
- main.py: FastAPI app, routing
- clip_encoder.py: CLIP model wrapper
- brand_classifier.py: Zero-shot brand classification
- color_extractor.py: K-Means color extraction
- preprocess.py: Image preprocessing
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

__all__ = ["app"]
