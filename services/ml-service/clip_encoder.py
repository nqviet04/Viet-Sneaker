"""
CLIP Encoder Module
==================
Wrapper cho OpenAI CLIP model:
- Load model (cached sau lần đầu)
- Encode ảnh -> vector embedding (512 hoặc 768 dims)
- Encode text -> vector embedding (cho zero-shot classification)
"""

import torch
import numpy as np
from typing import Union, List
from PIL import Image
from functools import lru_cache


@lru_cache(maxsize=1)
def load_clip_model():
    """Load CLIP model một lần, cache lại. Dùng ViT-B/32 cho tốc độ."""
    from transformers import CLIPProcessor, CLIPModel

    model_name = "openai/clip-vit-base-patch32"
    print(f"[CLIP] Loading model: {model_name}")

    model = CLIPModel.from_pretrained(model_name)
    processor = CLIPProcessor.from_pretrained(model_name)
    model.eval()

    print(f"[CLIP] Model loaded successfully. Embedding dim: {model.config.projection_dim}")
    return model, processor


class CLIPEncoder:
    """CLIP Encoder wrapper cho image và text."""

    def __init__(self, model_name: str = "openai/clip-vit-base-patch32"):
        self.model_name = model_name
        self._model = None
        self._processor = None

    @property
    def model(self):
        if self._model is None:
            self._model, self._processor = load_clip_model()
        return self._model

    @property
    def processor(self):
        if self._processor is None:
            self._model, self._processor = load_clip_model()
        return self._processor

    def encode_image(self, image: Union[Image.Image, torch.Tensor]) -> np.ndarray:
        """
        Encode image -> embedding vector.
        - PIL Image: dùng processor để preprocess
        - torch.Tensor: đã preprocess rồi (từ preprocess.py)
        """
        if isinstance(image, torch.Tensor):
            # Tensor đã preprocess, chỉ cần encode
            with torch.no_grad():
                image_features = self.model.get_image_features(pixel_values=image.unsqueeze(0))
            embedding = image_features.cpu().numpy().flatten()
        else:
            # PIL Image -> preprocess rồi encode
            with torch.no_grad():
                inputs = self.processor(images=image, return_tensors="pt")
                image_features = self.model.get_image_features(**inputs)
            embedding = image_features.cpu().numpy().flatten()

        # L2 normalize
        embedding = embedding / np.linalg.norm(embedding)
        return embedding

    def encode_images_batch(self, images: List[Image.Image]) -> np.ndarray:
        """Encode nhiều ảnh cùng lúc (nhanh hơn gọi từng ảnh)."""
        with torch.no_grad():
            inputs = self.processor(images=images, return_tensors="pt", padding=True)
            image_features = self.model.get_image_features(**inputs)
        embeddings = image_features.cpu().numpy()

        # L2 normalize từng embedding
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        embeddings = embeddings / (norms + 1e-8)

        return embeddings

    def encode_text(self, texts: Union[str, List[str]]) -> np.ndarray:
        """
        Encode text -> embedding vector.
        Dùng cho zero-shot classification.
        """
        if isinstance(texts, str):
            texts = [texts]

        with torch.no_grad():
            inputs = self.processor(text=texts, return_tensors="pt", padding=True)
            text_features = self.model.get_text_features(**inputs)
        embeddings = text_features.cpu().numpy()

        # L2 normalize
        embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
        return embeddings

    def compute_similarity(
        self,
        image_embedding: np.ndarray,
        text_embeddings: np.ndarray
    ) -> np.ndarray:
        """
        Tính cosine similarity giữa image embedding và text embeddings.
        Returns array of similarity scores [0, 1].
        """
        # Dot product vì đã L2 normalized = cosine similarity
        similarities = np.dot(image_embedding, text_embeddings.T)
        return similarities

    @property
    def embedding_dim(self) -> int:
        """Embedding dimension của model."""
        return self.model.config.projection_dim


# Singleton instance
_encoder: CLIPEncoder = None

def get_clip_encoder() -> CLIPEncoder:
    global _encoder
    if _encoder is None:
        _encoder = CLIPEncoder()
    return _encoder
