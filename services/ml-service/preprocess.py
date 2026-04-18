"""
Image Preprocessing Module
=========================
Tiền xử lý ảnh trước khi đưa vào model:
- Resize về kích thước chuẩn
- Normalize pixel values
- Center crop để giữ subject (giày) ở giữa
- Convert RGBA -> RGB (loại bỏ alpha channel)
"""

import io
import numpy as np
from PIL import Image
from typing import Tuple


# CLIP standard input size
CLIP_IMAGE_SIZE = 224


def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """Load PIL Image từ bytes."""
    image = Image.open(io.BytesIO(image_bytes))
    return image


def load_image_from_base64(base64_str: str) -> Image.Image:
    """Load PIL Image từ base64 string (strip data URI prefix nếu có)."""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    import base64 as b64
    image_bytes = b64.b64decode(base64_str)
    return load_image_from_bytes(image_bytes)


def convert_to_rgb(image: Image.Image) -> Image.Image:
    """Convert ảnh sang RGB, loại bỏ alpha channel."""
    if image.mode == "RGBA":
        # Tạo nền trắng cho ảnh có alpha
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[3])
        return background
    if image.mode != "RGB":
        return image.convert("RGB")
    return image


def smart_center_crop(image: Image.Image, target_size: int = CLIP_IMAGE_SIZE) -> Image.Image:
    """
    Center crop thông minh — giả định giày ở giữa ảnh.
    Crop với tỉ lệ 4:5 (vertical focus phù hợp với giày).
    """
    width, height = image.size

    # Tỉ lệ crop: 4:5 (width:height) - phù hợp với product photo
    target_ratio = target_size / (target_size * 1.25)  # 224:280
    current_ratio = width / height

    if current_ratio > target_ratio:
        # Ảnh rộng hơn -> crop chiều rộng
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        right = left + new_width
        top, bottom = 0, height
    else:
        # Ảnh cao hơn -> crop chiều cao
        new_height = int(width / target_ratio)
        top = (height - new_height) // 2
        bottom = top + new_height
        left, right = 0, width

    image = image.crop((left, top, right, bottom))

    # Resize về target_size
    return image.resize((target_size, target_size), Image.LANCZOS)


def preprocess_for_clip(image: Image.Image) -> "torch.Tensor":
    """
    Full preprocessing pipeline cho CLIP model.
    Returns normalized tensor sẵn sàng cho CLIP encode.
    """
    # 1. Convert RGBA -> RGB
    image = convert_to_rgb(image)

    # 2. Smart center crop
    image = smart_center_crop(image, CLIP_IMAGE_SIZE)

    # 3. Convert sang numpy array
    img_array = np.array(image).astype(np.float32) / 255.0

    # 4. CLIP normalization (ImageNet mean/std)
    mean = np.array([0.48145466, 0.4578275, 0.40821073])
    std = np.array([0.26862954, 0.26130258, 0.27577711])
    img_array = (img_array - mean) / std

    # 5. Convert sang tensor format (C, H, W)
    import torch
    tensor = torch.from_numpy(img_array.transpose(2, 0, 1))

    return tensor


def get_dominant_colors(image: Image.Image, k: int = 5) -> np.ndarray:
    """
    Quick color extraction cho bước preprocess (trước K-Means).
    Resize nhỏ để tăng tốc, không crop (cần full image cho color).
    """
    # Resize nhỏ để tăng tốc K-Means
    image_small = image.convert("RGB").resize((100, 100), Image.LANCZOS)
    pixels = np.array(image_small).reshape(-1, 3)
    return pixels


def remove_background_simple(image: Image.Image) -> Image.Image:
    """
    Simple background removal bằng threshold trên alpha channel.
    Giữ lại phần giày, thay nền bằng trắng.
    Đủ dùng cho product photos đơn giản.
    """
    if image.mode != "RGBA":
        return image

    # Lấy alpha channel
    alpha = np.array(image)[:, :, 3]

    # Tạo mask: pixels có alpha > 128 được giữ lại
    threshold = 128
    mask = alpha > threshold

    # Convert sang RGB
    rgb = np.array(image.convert("RGB"))

    # Thay nền (không được giữ) bằng trắng
    rgb[~mask] = [255, 255, 255]

    return Image.fromarray(rgb.astype(np.uint8))
