import cv2
import numpy as np
from PIL import Image
from typing import Tuple

def preprocess_image(image_path: str) -> Image.Image:
    """
    Loads an image from the specified path and applies a series of preprocessing steps
    to optimize it for OCR (Optical Character Recognition).

    Steps:
    1.  **Load Image**: Reads the image using OpenCV.
    2.  **Grayscale**: Converts the image to grayscale to reduce complexity.
    3.  **Denoise**: Applies a median blur to remove salt-and-pepper noise while preserving edges.
    4.  **Adaptive Thresholding**: Binarizes the image (black and white) using adaptive thresholding,
        which handles varying lighting conditions better than global thresholding.
    5.  **Deskewing**: Detects the orientation of the text and rotates the image to align it horizontally.

    Args:
        image_path (str): The absolute or relative path to the image file.

    Returns:
        Image.Image: A PIL Image object containing the preprocessed, binary, deskewed image.

    Raises:
        ValueError: If the image cannot be loaded from the given path.
    """
    # 1. Load Image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")

    # 2. Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. Noise Removal (Median Blur)
    # Removes salt-and-pepper noise while preserving edges
    denoised = cv2.medianBlur(gray, 3)

    # 4. Adaptive Thresholding (Binarization)
    # Good for varying lighting conditions
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # 5. Deskewing
    coords = np.column_stack(np.where(thresh > 0))
    angle = cv2.minAreaRect(coords)[-1]
    
    # Correct the angle
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
        
    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Convert back to PIL Image for Tesseract
    return Image.fromarray(rotated)
