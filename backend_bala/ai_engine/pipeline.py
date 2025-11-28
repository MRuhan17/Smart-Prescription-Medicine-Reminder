import pytesseract
from .image_processor import preprocess_image
from .text_processor import extract_entities
from .refill_estimator import enrich_with_refill_info
from typing import Dict, Any, Optional, List

class PrescriptionParser:
    """
    The main orchestrator class for the AI Intelligence Layer.
    It connects image processing, OCR, text extraction, and refill estimation
    into a single, easy-to-use pipeline.
    """
    def __init__(self, tesseract_cmd: Optional[str] = None):
        """
        Initializes the parser.
        
        Args:
            tesseract_cmd (str, optional): Path to the Tesseract binary. 
                                           If not provided, relies on the system PATH.
        """
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    def run(self, image_path: Optional[str] = None, raw_text: Optional[str] = None, medicine_db: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Executes the full parsing pipeline.

        Workflow:
        1.  **Image Processing** (if `image_path` provided): Preprocesses the image (deskew, denoise).
        2.  **OCR** (if `image_path` provided): Extracts text using Tesseract.
        3.  **Text Extraction**: Parses the text (raw or OCR'd) to identify medicines, dosages, etc.
        4.  **Refill Estimation**: Calculates quantity needed and refill dates.

        Args:
            image_path (str, optional): Path to the prescription image.
            raw_text (str, optional): Direct text input (bypasses OCR).
            medicine_db (List[str], optional): List of known medicines for fuzzy matching.

        Returns:
            Dict[str, Any]: Structured data containing medicines, reminders, and refill info.
                            Returns a dictionary with an "error" key if a step fails.
        """
        if image_path:
            # 1. Image Preprocessing
            try:
                processed_img = preprocess_image(image_path)
            except Exception as e:
                return {"error": f"Image processing failed: {str(e)}"}

            # 2. OCR
            try:
                text = pytesseract.image_to_string(processed_img)
            except Exception as e:
                return {"error": f"OCR failed: {str(e)}"}
        elif raw_text:
            text = raw_text
        else:
            return {"error": "No image_path or raw_text provided"}

        # 3. Text Extraction
        data = extract_entities(text, medicine_db=medicine_db)

        # 4. Refill Estimation
        data["medicines"] = enrich_with_refill_info(data["medicines"])

        return data
