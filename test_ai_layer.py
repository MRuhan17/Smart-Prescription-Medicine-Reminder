import unittest
from unittest.mock import patch, MagicMock
from ai_engine.pipeline import PrescriptionParser
import numpy as np

class TestAILayer(unittest.TestCase):

    @patch('ai_engine.pipeline.preprocess_image')
    @patch('ai_engine.pipeline.pytesseract.image_to_string')
    def test_pipeline_flow(self, mock_ocr, mock_preprocess):
        # Setup Mocks
        mock_preprocess.return_value = MagicMock() # Mock PIL Image
        
        # Simulate OCR output
        mock_ocr.return_value = """
        Dr. Smith Clinic
        Rx
        Paracetamol 500mg 1-0-1 for 5 days
        Amoxicillin 250mg BD after food for 1 week
        """
        
        # Run Pipeline
        parser = PrescriptionParser()
        result = parser.run("dummy_path.jpg")
        
        # Verify Structure
        self.assertIn("medicines", result)
        self.assertEqual(len(result["medicines"]), 2)
        
        # Verify Medicine 1: Paracetamol
        med1 = next(m for m in result["medicines"] if m["name"] == "Paracetamol")
        self.assertIn("500mg", med1["dosage"])
        self.assertIn("1-0-1", med1["dosage"])
        self.assertIn("5 days", med1["duration"])
        self.assertEqual(med1["quantity_required"], 10) # 2 * 5
        
        # Verify Medicine 2: Amoxicillin
        med2 = next(m for m in result["medicines"] if m["name"] == "Amoxicillin")
        self.assertIn("BD", med2["dosage"])
        self.assertIn("after food", med2["food_instruction"])
        self.assertEqual(med2["quantity_required"], 14) # 2 * 7

    def test_refill_logic(self):
        from ai_engine.refill_estimator import parse_frequency, parse_duration_days
        
        self.assertEqual(parse_frequency(["1-0-1"]), 2)
        self.assertEqual(parse_frequency(["TID"]), 3)
        self.assertEqual(parse_frequency(["Once a day"]), 1)
        
        self.assertEqual(parse_duration_days(["5 days"]), 5)
        self.assertEqual(parse_duration_days(["2 weeks"]), 14)

if __name__ == '__main__':
    unittest.main()
