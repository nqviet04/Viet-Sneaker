"""
Brand Classification Module
==========================
Zero-shot brand classification dùng CLIP:
- Dùng CLIP text-image similarity
- Prompts được thiết kế để phân biệt 6 thương hiệu giày
- Không cần training, không cần dataset label
- Accuracy ~70-85% tùy ảnh (MVP), có thể nâng cao với fine-tuned model
"""

import numpy as np
from typing import Dict, List
from PIL import Image

from clip_encoder import get_clip_encoder


# Brand definitions với prompts cho CLIP zero-shot
BRAND_PROMPTS = {
    "NIKE": [
        "Nike sneakers, Nike Air Max, Nike shoes",
        "Nike athletic shoes, Nike running shoes",
        "Nike brand footwear, swoosh logo shoe",
    ],
    "ADIDAS": [
        "Adidas sneakers, Adidas Originals, Adidas shoes",
        "Adidas athletic shoes, three stripes brand",
        "Adidas Stan Smith, Adidas Superstar footwear",
    ],
    "PUMA": [
        "Puma sneakers, Puma RS, Puma shoes",
        "Puma athletic shoes, Puma Suede",
        "Puma lifestyle footwear, leaping cat logo",
    ],
    "NEW_BALANCE": [
        "New Balance sneakers, New Balance shoes",
        "New Balance running shoes, NB footwear",
        "New Balance 550, New Balance 990",
    ],
    "CONVERSE": [
        "Converse Chuck Taylor All Star, Converse sneakers",
        "Converse canvas shoes, Converse high top",
        "Converse rubber sole shoes, star patch logo",
    ],
    "VANS": [
        "Vans sneakers, Vans Old Skool, Vans shoes",
        "Vans skate shoes, Vans slip-on",
        "Vans classic footwear, side stripe logo",
    ],
}

# Gender prompts cho gender classification
GENDER_PROMPTS = {
    "MEN": [
        "Men's shoes, men's sneakers, men's footwear",
        "Large size sneakers, men's athletic shoes",
    ],
    "WOMEN": [
        "Women's shoes, women's sneakers, women's footwear",
        "Women's running shoes, women's athletic shoes",
    ],
    "UNISEX": [
        "Unisex shoes, unisex sneakers, gender neutral footwear",
        "Universal size shoes, everyone can wear",
    ],
}

# Shoe type prompts cho shoe type classification
SHOE_TYPE_PROMPTS = {
    "RUNNING": ["Running shoes, running sneakers", "Athletic running footwear", "Jogging shoes"],
    "CASUAL": ["Casual sneakers, casual shoes", "Lifestyle sneakers", "Everyday comfortable shoes"],
    "BOOTS": ["Boots, ankle boots, booties", "Winter boots, combat boots", "Boot style footwear"],
    "FORMAL": ["Formal shoes, dress shoes", "Oxford shoes, leather shoes", "Elegant dress footwear"],
    "SLIPPERS": ["Slippers, house shoes", "Comfortable indoor shoes", "Slip-on casual shoes"],
    "BASKETBALL": ["Basketball shoes, basketball sneakers", "High top basketball footwear", "NBA style shoes"],
    "SKATEBOARDING": ["Skate shoes, skateboard sneakers", "Vans style skate shoes", "Skateboarding footwear"],
    "TRAINING": ["Training shoes, gym shoes", "Cross training footwear", "Workout athletic shoes"],
    "HIKING": ["Hiking shoes, hiking boots", "Outdoor hiking footwear", "Trail running shoes"],
}


def get_all_brand_texts() -> List[str]:
    """Gộp tất cả brand prompts thành flat list."""
    texts = []
    for brand, prompts in BRAND_PROMPTS.items():
        texts.extend(prompts)
    return texts


def get_brand_to_indices() -> Dict[str, List[int]]:
    """Map brand -> list of text indices trong flat list."""
    mapping = {}
    idx = 0
    for brand in BRAND_PROMPTS:
        count = len(BRAND_PROMPTS[brand])
        mapping[brand] = list(range(idx, idx + count))
        idx += count
    return mapping


class BrandClassifier:
    """
    Zero-shot brand classifier dùng CLIP.
    Tính similarity giữa ảnh và tất cả prompts,
    sau đó group theo brand và lấy max.
    """

    def __init__(self):
        self.encoder = get_clip_encoder()
        self.brand_texts = get_all_brand_texts()
        self.brand_to_indices = get_brand_to_indices()
        self._text_embeddings: np.ndarray = None

    @property
    def text_embeddings(self) -> np.ndarray:
        """Lazy load text embeddings (encode 1 lần, reuse)."""
        if self._text_embeddings is None:
            print("[BrandClassifier] Encoding brand prompts...")
            self._text_embeddings = self.encoder.encode_text(self.brand_texts)
            print(f"[BrandClassifier] Cached {len(self.brand_texts)} text embeddings")
        return self._text_embeddings

    def predict(self, image: Image.Image) -> Dict[str, float]:
        """
        Dự đoán brand từ ảnh giày.

        Returns:
            Dict với keys là brand và values là confidence score [0, 1].
            VD: {"NIKE": 0.85, "ADIDAS": 0.12, ...}
        """
        # Encode ảnh
        image_emb = self.encoder.encode_image(image)

        # Tính similarity với tất cả prompts
        similarities = self.encoder.compute_similarity(image_emb, self.text_embeddings)

        # Group by brand, lấy max similarity cho mỗi brand
        brand_scores = {}
        for brand, indices in self.brand_to_indices.items():
            brand_scores[brand] = float(np.max(similarities[indices]))

        # Sort theo score giảm dần
        sorted_scores = dict(
            sorted(brand_scores.items(), key=lambda x: x[1], reverse=True)
        )

        return sorted_scores

    def predict_top(
        self,
        image: Image.Image,
        top_k: int = 3
    ) -> List[tuple]:
        """
        Dự đoán top-k brands.

        Returns:
            List of (brand, score) tuples sorted by confidence.
        """
        scores = self.predict(image)
        return list(scores.items())[:top_k]

    def predict_best(self, image: Image.Image) -> str:
        """Trả về brand có confidence cao nhất."""
        scores = self.predict(image)
        return max(scores, key=scores.get)


class GenderClassifier:
    """Zero-shot gender classifier dùng CLIP."""

    def __init__(self):
        self.encoder = get_clip_encoder()
        self.gender_texts = []
        self.gender_to_indices = {}
        idx = 0
        for gender, prompts in GENDER_PROMPTS.items():
            self.gender_texts.extend(prompts)
            self.gender_to_indices[gender] = list(range(idx, idx + len(prompts)))
            idx += len(prompts)
        self._text_embeddings: np.ndarray = None

    @property
    def text_embeddings(self) -> np.ndarray:
        if self._text_embeddings is None:
            self._text_embeddings = self.encoder.encode_text(self.gender_texts)
        return self._text_embeddings

    def predict(self, image: Image.Image) -> Dict[str, float]:
        image_emb = self.encoder.encode_image(image)
        similarities = self.encoder.compute_similarity(image_emb, self.text_embeddings)
        gender_scores = {}
        for gender, indices in self.gender_to_indices.items():
            gender_scores[gender] = float(np.max(similarities[indices]))
        return dict(sorted(gender_scores.items(), key=lambda x: x[1], reverse=True))

    def predict_best(self, image: Image.Image) -> str:
        scores = self.predict(image)
        return max(scores, key=scores.get)


class ShoeTypeClassifier:
    """Zero-shot shoe type classifier dùng CLIP."""

    def __init__(self):
        self.encoder = get_clip_encoder()
        self.type_texts = []
        self.type_to_indices = {}
        idx = 0
        for shoe_type, prompts in SHOE_TYPE_PROMPTS.items():
            self.type_texts.extend(prompts)
            self.type_to_indices[shoe_type] = list(range(idx, idx + len(prompts)))
            idx += len(prompts)
        self._text_embeddings: np.ndarray = None

    @property
    def text_embeddings(self) -> np.ndarray:
        if self._text_embeddings is None:
            self._text_embeddings = self.encoder.encode_text(self.type_texts)
        return self._text_embeddings

    def predict(self, image: Image.Image) -> Dict[str, float]:
        image_emb = self.encoder.encode_image(image)
        similarities = self.encoder.compute_similarity(image_emb, self.text_embeddings)
        type_scores = {}
        for shoe_type, indices in self.type_to_indices.items():
            type_scores[shoe_type] = float(np.max(similarities[indices]))
        return dict(sorted(type_scores.items(), key=lambda x: x[1], reverse=True))

    def predict_best(self, image: Image.Image) -> str:
        scores = self.predict(image)
        return max(scores, key=scores.get)


# Singleton instances
_brand_classifier: BrandClassifier = None
_gender_classifier: GenderClassifier = None
_shoe_type_classifier: ShoeTypeClassifier = None


def get_brand_classifier() -> BrandClassifier:
    global _brand_classifier
    if _brand_classifier is None:
        _brand_classifier = BrandClassifier()
    return _brand_classifier


def get_gender_classifier() -> GenderClassifier:
    global _gender_classifier
    if _gender_classifier is None:
        _gender_classifier = GenderClassifier()
    return _gender_classifier


def get_shoe_type_classifier() -> ShoeTypeClassifier:
    global _shoe_type_classifier
    if _shoe_type_classifier is None:
        _shoe_type_classifier = ShoeTypeClassifier()
    return _shoe_type_classifier
