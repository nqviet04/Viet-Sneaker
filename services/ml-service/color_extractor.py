"""
Color Extraction Module
=====================
Trích xuất màu chủ đạo từ ảnh giày dùng K-Means clustering:
- K-Means clustering trên pixel values (RGB)
- Map RGB -> tên màu (color naming)
- HSV-based filtering để loại bỏ background
- Nhiều chiến lược: pixel-heavy, edge detection, center focus
"""

import io
import numpy as np
import cv2
from PIL import Image
from typing import Dict, List, Tuple
from sklearn.cluster import MiniBatchKMeans
from collections import Counter


# ============================================================
# COLOR NAMING
# ============================================================

# RGB ranges cho các màu cơ bản
# Hue range: 0-180 (OpenCV), Saturation: 0-255, Value: 0-255
COLOR_RANGES = {
    "white": {
        "hsv": {"h_min": 0, "h_max": 180, "s_min": 0, "s_max": 30, "v_min": 200, "v_max": 255},
    },
    "black": {
        "hsv": {"h_min": 0, "h_max": 180, "s_min": 0, "s_max": 255, "v_min": 0, "v_max": 50},
    },
    "gray": {
        "hsv": {"h_min": 0, "h_max": 180, "s_min": 0, "s_max": 20, "v_min": 50, "v_max": 200},
    },
    "red": {
        "hsv": [
            {"h_min": 0, "h_max": 10, "s_min": 100, "s_max": 255, "v_min": 100, "v_max": 255},
            {"h_min": 170, "h_max": 180, "s_min": 100, "s_max": 255, "v_min": 100, "v_max": 255},
        ],
    },
    "orange": {
        "hsv": {"h_min": 11, "h_max": 25, "s_min": 100, "s_max": 255, "v_min": 100, "v_max": 255},
    },
    "yellow": {
        "hsv": {"h_min": 26, "h_max": 35, "s_min": 80, "s_max": 255, "v_min": 100, "v_max": 255},
    },
    "green": {
        "hsv": {"h_min": 36, "h_max": 85, "s_min": 30, "s_max": 255, "v_min": 30, "v_max": 255},
    },
    "cyan": {
        "hsv": {"h_min": 86, "h_max": 100, "s_min": 50, "s_max": 255, "v_min": 50, "v_max": 255},
    },
    "blue": {
        "hsv": {"h_min": 101, "h_max": 130, "s_min": 50, "s_max": 255, "v_min": 50, "v_max": 255},
    },
    "purple": {
        "hsv": {"h_min": 131, "h_max": 160, "s_min": 50, "s_max": 255, "v_min": 50, "v_max": 255},
    },
    "pink": {
        "hsv": {"h_min": 161, "h_max": 169, "s_min": 50, "s_max": 255, "v_min": 100, "v_max": 255},
    },
    "brown": {
        "hsv": {"h_min": 5, "h_max": 25, "s_min": 50, "s_max": 200, "v_min": 30, "v_max": 150},
    },
}

# Màu ưu tiên cho mapping (thứ tự ưu tiên)
COLOR_PRIORITY = [
    "red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "brown",
    "white", "gray", "black"
]


def rgb_to_name(r: int, g: int, b: int) -> str:
    """
    Map một RGB tuple sang tên màu gần nhất.
    Dùng Euclidean distance trong RGB space.
    """
    # Convert sang HSV trước để phân biệt tốt hơn
    hsv = rgb_to_hsv(r, g, b)
    h, s, v = hsv

    # Quick checks trước
    if v < 50:
        return "black"
    if s < 30 and v > 200:
        return "white"
    if s < 30 and 50 <= v <= 200:
        return "gray"

    # Hue-based naming
    if (h <= 10 or h >= 170) and s > 100 and v > 100:
        return "red"
    if 11 <= h <= 25 and s > 100:
        return "orange"
    if 26 <= h <= 35 and s > 80:
        return "yellow"
    if 36 <= h <= 85 and s > 30 and v > 30:
        return "green"
    if 86 <= h <= 100 and s > 50:
        return "cyan"
    if 101 <= h <= 130 and s > 50:
        return "blue"
    if 131 <= h <= 160 and s > 50:
        return "purple"
    if 161 <= h <= 169 and s > 50:
        return "pink"
    if 5 <= h <= 25 and 50 <= s <= 200 and 30 <= v <= 150:
        return "brown"

    return "gray"


def rgb_to_hsv(r: int, g: int, b: int) -> Tuple[int, int, int]:
    """Convert RGB (0-255) -> HSV (OpenCV format: H:0-180, S:0-255, V:0-255)."""
    rgb = np.uint8([[[b, g, r]]])  # OpenCV uses BGR
    hsv = cv2.cvtColor(rgb, cv2.COLOR_BGR2HSV)
    return int(hsv[0][0][0]), int(hsv[0][0][1]), int(hsv[0][0][2])


def hsv_in_range(h: int, s: int, v: int, h_min: int, h_max: int, s_min: int, s_max: int, v_min: int, v_max: int) -> bool:
    """Check if HSV value falls within range."""
    if h_min <= h_max:
        return h_min <= h <= h_max and s_min <= s <= s_max and v_min <= v <= v_max
    else:
        # Wrap around (for red: h 0-10 and 170-180)
        return (h_min <= h <= 180 or 0 <= h <= h_max) and s_min <= s <= s_max and v_min <= v <= v_max


# ============================================================
# COLOR EXTRACTION
# ============================================================

class ColorExtractor:
    """
    Trích xuất màu chủ đạo từ ảnh giày.
    Strategy: K-Means clustering trên pixels.
    """

    def __init__(self, n_colors: int = 5):
        self.n_colors = n_colors

    def _preprocess_image(self, image: Image.Image) -> np.ndarray:
        """Resize và convert ảnh, lấy pixels."""
        # Resize nhỏ để tăng tốc K-Means
        img = image.convert("RGB").resize((150, 150), Image.LANCZOS)
        return np.array(img)

    def _mask_background(self, pixels: np.ndarray) -> np.ndarray:
        """
        Loại bỏ background đơn giản bằng saturation thresholding.
        Chỉ giữ lại pixels có saturation đủ cao (tức không phải nền trắng/đen).
        """
        # Reshape về 2D để compute saturation
        h, w, c = pixels.shape
        flat = pixels.reshape(-1, 3)

        # Tính saturation: s = 1 - min(R,G,B)/V
        min_rgb = flat.min(axis=1)
        max_rgb = flat.max(axis=1)
        saturation = (max_rgb - min_rgb) / (max_rgb + 1e-8)

        # Mask: giữ pixels có saturation > 0.1 (tức có màu)
        # Hoặc pixels có brightness không quá trắng/quá đen
        brightness = max_rgb / 255.0
        mask = (saturation > 0.05) & (brightness > 0.05) & (brightness < 0.95)

        # Nếu mask giữ lại quá ít pixels, dùng tất cả
        if mask.sum() < 100:
            return flat

        return flat[mask]

    def _extract_with_kmeans(self, pixels: np.ndarray) -> List[Tuple[np.ndarray, float]]:
        """
        Chạy K-Means để tìm dominant colors.
        Returns: List of (RGB centroid, percentage) tuples.
        """
        n_samples = min(len(pixels), 5000)
        indices = np.random.choice(len(pixels), n_samples, replace=False)
        sample = pixels[indices]

        kmeans = MiniBatchKMeans(
            n_clusters=self.n_colors,
            random_state=42,
            batch_size=1024,
            n_init=3,
        )
        labels = kmeans.fit_predict(sample)
        centroids = kmeans.cluster_centers_

        # Tính percentage của mỗi cluster
        label_counts = Counter(labels)
        total = len(labels)
        colors_with_pct = []
        for i in range(self.n_colors):
            if i in label_counts:
                pct = label_counts[i] / total
                colors_with_pct.append((centroids[i], pct))

        # Sort theo percentage
        colors_with_pct.sort(key=lambda x: x[1], reverse=True)
        return colors_with_pct

    def extract(self, image: Image.Image) -> List[Dict]:
        """
        Trích xuất màu chủ đạo từ ảnh.

        Returns:
            List of color dicts với keys: name, hex, rgb, percentage
            VD: [{"name": "white", "hex": "#FFFFFF", "rgb": [255,255,255], "percentage": 0.45}, ...]
        """
        # 1. Preprocess
        pixels = self._preprocess_image(image)

        # 2. Mask background (loại bỏ nền trắng/đen)
        meaningful_pixels = self._mask_background(pixels)

        # 3. K-Means clustering
        colors_with_pct = self._extract_with_kmeans(meaningful_pixels)

        # 4. Map to color names và format output
        results = []
        seen_names = set()
        for rgb, pct in colors_with_pct:
            r, g, b = int(rgb[0]), int(rgb[1]), int(rgb[2])
            name = rgb_to_name(r, g, b)

            # Skip nếu đã có màu này rồi (gộp màu trùng)
            if name in seen_names:
                continue
            seen_names.add(name)

            hex_color = "#{:02X}{:02X}{:02X}".format(r, g, b)
            results.append({
                "name": name,
                "hex": hex_color,
                "rgb": [r, g, b],
                "percentage": round(pct, 3),
            })

            if len(results) >= self.n_colors:
                break

        return results

    def extract_primary_only(self, image: Image.Image) -> str:
        """Trả về tên màu chủ đạo nhất."""
        colors = self.extract(image)
        if colors:
            return colors[0]["name"]
        return "unknown"


def map_to_product_colors(detected_colors: List[str]) -> List[str]:
    """
    Map detected colors sang color values trong product schema.
    Product.colors là String[] như: ["black", "white", "red", "blue", "navy", "gray", "brown", "pink", "green", "orange", "yellow"]
    """
    product_color_map = {
        "white": "white",
        "black": "black",
        "gray": "gray",
        "red": "red",
        "orange": "orange",
        "yellow": "yellow",
        "green": "green",
        "cyan": "blue",
        "blue": "blue",
        "purple": "pink",
        "pink": "pink",
        "brown": "brown",
    }

    result = []
    for color in detected_colors:
        mapped = product_color_map.get(color)
        if mapped and mapped not in result:
            result.append(mapped)

    return result


# Singleton instance
_color_extractor: ColorExtractor = None


def get_color_extractor() -> ColorExtractor:
    global _color_extractor
    if _color_extractor is None:
        _color_extractor = ColorExtractor(n_colors=5)
    return _color_extractor
