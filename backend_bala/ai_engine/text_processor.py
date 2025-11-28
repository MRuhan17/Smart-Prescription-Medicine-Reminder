import re
from typing import List, Dict, Any, Optional
from thefuzz import process

"""
Text Processor Module
=====================
This module handles the extraction of structured entities from raw OCR text.
It uses a combination of:
1.  **Fuzzy Matching**: To identify medicine names from a known database, handling OCR typos.
2.  **Regular Expressions**: To extract dosages, timings, durations, and food instructions.
3.  **Contextual Parsing**: To associate extracted details with the correct medicine.
"""

# --- Constants ---
MEDICINE_DB = [
    "Paracetamol", "Amoxicillin", "Ibuprofen", "Cetirizine", "Metformin",
    "Atorvastatin", "Amlodipine", "Omeprazole", "Losartan", "Azithromycin",
    "Metoprolol", "Pantoprazole", "Gabapentin", "Prednisone", "Levothyroxine",
    "Dolo 650", "Augmentin", "Pan 40", "Telma 40", "Glycomet", "Insulin",
    "Aspirin", "Clopidogrel", "Rosuvastatin", "Vitamin D3", "Calcium"
]

DOSAGE_PATTERNS = [
    r'\b\d+(?:[\.,]\d+)?\s*(?:mg|g|mcg|IU|ml|tsp|tbsp)\b',
    r'\b\d+/\d+\s*(?:tablet|tab|cap|capsule)?\b',
    r'\b\d+(?:[\.,]\d+)?\s*(?:tablet|tab|cap|capsule)s?\b',
    r'\b\d+-\d+-\d+(?:-\d+)?\b',
    r'\b[01](?:-[01])+\b',
    r'\b(BD|TID|QID|OD|SOS|HS|STAT|Q\d+H)\b',
    r'\b(Twice|Thrice|Once|Four times)\s+a\s+day\b'
]

TIMING_PATTERNS = [
    r'\b(morning|afternoon|evening|night|bedtime)\b',
]

FOOD_PATTERNS = [
    r'\b(before|after)\s+(food|meal|breakfast|lunch|dinner|supper)\b',
    r'\b(empty stomach)\b',
    r'\b(with food)\b'
]

DURATION_PATTERNS = [
    r'\d+\s*(?:days|weeks|months|years)',
    r'for\s+\d+\s*(?:days|weeks|months)',
    r'\d+\s*d\b',
    r'(?:till finish|until finished)',
    r'\d+\s*week' # Explicit fallback
]

NOISE_PATTERNS = [
    r'Dr\.', r'Clinic', r'Hospital', r'Ph:', r'Date:', r'Name:', r'Age:', r'Sex:', r'Rx'
]

def is_noise(line: str) -> bool:
    """
    Checks if a line contains common prescription noise (headers, doctor info, etc.).
    """
    for pattern in NOISE_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            return True
    return False

def extract_entities(text: str, medicine_db: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Extracts structured medicine data from raw text.

    Args:
        text (str): The raw OCR text output.
        medicine_db (List[str], optional): A list of known medicine names for fuzzy matching.
                                           Defaults to the internal MEDICINE_DB if not provided.

    Returns:
        Dict[str, Any]: A dictionary containing:
            - 'medicines': A list of medicine objects (dicts).
            - 'raw_text': The original input text.
    """
    if medicine_db is None:
        medicine_db = MEDICINE_DB
        
    lines = text.split('\n')
    medicines = []
    
    current_med = None
    
    for line in lines:
        line = line.strip()
        if not line or is_noise(line):
            continue
            
        # 1. Identify Medicine Name (Fuzzy Match)
        # We use a high score cutoff (80) to avoid false positives on random text
        best_match = process.extractOne(line, medicine_db, score_cutoff=80)
        
        if best_match:
            # Save previous medicine if exists
            if current_med:
                medicines.append(current_med)
            
            current_med = {
                "name": best_match[0],
                "dosage": [],
                "timing": [],
                "duration": [],
                "food_instruction": []
            }
            
            # Remove the medicine name from the line to parse the rest of the details
            # This prevents the medicine name itself from triggering other regex matches
            line = line.replace(best_match[0], "") 
            
        if current_med:
            # 2. Extract Dosage
            for pattern in DOSAGE_PATTERNS:
                matches = re.findall(pattern, line, re.IGNORECASE)
                if matches:
                    current_med["dosage"].extend(matches)
            
            # 3. Extract Timing
            for pattern in TIMING_PATTERNS:
                matches = re.findall(pattern, line, re.IGNORECASE)
                if matches:
                    current_med["timing"].extend([m.lower() for m in matches])

            # 4. Extract Food Instructions
            for pattern in FOOD_PATTERNS:
                matches = re.findall(pattern, line, re.IGNORECASE)
                if matches:
                    # Flatten tuple matches if any (some regex groups return tuples)
                    for m in matches:
                        if isinstance(m, tuple):
                            current_med["food_instruction"].append(" ".join(m).lower())
                        else:
                            current_med["food_instruction"].append(m.lower())

            # 5. Extract Duration
            for pattern in DURATION_PATTERNS:
                matches = re.findall(pattern, line, re.IGNORECASE)
                if matches:
                    current_med["duration"].extend(matches)
                    
    # Append the last medicine found
    if current_med:
        medicines.append(current_med)
        
    # Deduplicate within each medicine object
    for med in medicines:
        med["dosage"] = list(set(med["dosage"]))
        med["timing"] = list(set(med["timing"]))
        med["duration"] = list(set(med["duration"]))
        med["food_instruction"] = list(set(med["food_instruction"]))
        
    # Deduplicate medicines list (in case the same medicine appears multiple times)
    unique_medicines = []
    seen_names = set()
    for med in medicines:
        if med["name"] not in seen_names:
            unique_medicines.append(med)
            seen_names.add(med["name"])
            
    return {"medicines": unique_medicines, "raw_text": text}
