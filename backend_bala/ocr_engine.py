import re
import json
from typing import List, Dict, Optional, Any
from thefuzz import process, fuzz

# --- Mock Medicine Database ---
MEDICINE_DB: List[str] = [
    "Paracetamol", "Amoxicillin", "Ibuprofen", "Cetirizine", "Metformin",
    "Atorvastatin", "Amlodipine", "Omeprazole", "Losartan", "Azithromycin",
    "Metoprolol", "Pantoprazole", "Gabapentin", "Prednisone", "Levothyroxine",
    "Dolo 650", "Augmentin", "Pan 40", "Telma 40", "Glycomet", "Insulin",
    "Aspirin", "Clopidogrel", "Rosuvastatin", "Vitamin D3", "Calcium"
]

# --- Regex Patterns ---
DOSAGE_PATTERNS: List[str] = [
    r'\b\d+(?:[\.,]\d+)?\s*(?:mg|g|mcg|IU|ml|tsp|tbsp)\b', # Units with decimals: 0.5 mg, 500mcg
    r'\b\d+/\d+\s*(?:tablet|tab|cap|capsule)?\b',          # Fractions: 1/2 tablet
    r'\b\d+(?:[\.,]\d+)?\s*(?:tablet|tab|cap|capsule)s?\b', # 1 tablet, 2 caps
    r'\b\d+-\d+-\d+(?:-\d+)?\b',                            # 1-0-1, 1-0-1-0
    r'\b[01](?:-[01])+\b',                                  # 1-0-1 specific
    r'\b(BD|TID|QID|OD|SOS|HS|STAT|Q\d+H)\b',               # Frequencies
    r'\b(Twice|Thrice|Once|Four times)\s+a\s+day\b'
]

TIMING_PATTERNS: List[str] = [
    r'\b(morning|afternoon|evening|night|bedtime)\b',
]

FOOD_PATTERNS: List[str] = [
    r'\b(before|after)\s+(food|meal|breakfast|lunch|dinner|supper)\b',
    r'\b(empty stomach)\b',
    r'\b(with food)\b'
]

DURATION_PATTERNS: List[str] = [
    r'\b\d+\s*(?:days|weeks|months|years)\b',
    r'\bfor\s+\d+\s*(?:days|weeks|months)\b',
    r'\b\d+\s*d\b', # 5d
    r'\b(?:till finish|until finished)\b'
]

NOISE_PATTERNS: List[str] = [
    r'Dr\.', r'Clinic', r'Hospital', r'Ph:', r'Date:', r'Name:', r'Age:', r'Sex:', r'Rx'
]

def clean_text(text: str) -> str:
    """
    Basic text cleaning: remove extra whitespace.
    """
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def is_noise(line: str) -> bool:
    """
    Check if a line is likely noise (doctor info, headers).
    """
    for pattern in NOISE_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            return True
    return False

def extract_medicine(line: str, threshold: int = 85) -> Optional[str]:
    """
    Fuzzy match words in the line against the medicine database.
    Returns the best match if score > threshold.
    """
    # 1. Try whole line match
    best_match, score = process.extractOne(line, MEDICINE_DB, scorer=fuzz.token_set_ratio)
    if score >= threshold:
        return best_match
    
    # 2. Try splitting by words (for messy lines)
    words = line.split()
    for word in words:
        if len(word) > 3:
            match, score = process.extractOne(word, MEDICINE_DB)
            if score >= 90: # Higher threshold for single words
                return match
    return None

def extract_patterns(text: str, patterns: List[str]) -> List[str]:
    """
    Find all matches for a list of regex patterns in the text.
    """
    matches = []
    for pattern in patterns:
        found = re.findall(pattern, text, re.IGNORECASE)
        matches.extend(found)
    
    final_matches = []
    for m in matches:
        if isinstance(m, tuple):
            # Filter out empty strings from groups
            parts = [p for p in m if p]
            if parts:
                final_matches.append(" ".join(parts))
        else:
            final_matches.append(m)
            
    return list(set(final_matches))

def process_prescription(ocr_text: str) -> Dict[str, Any]:
    """
    Main function to process raw OCR text and return structured data.
    Returns a dictionary containing extracted medicines and raw text.
    """
    cleaned_text = clean_text(ocr_text)
    lines = [l.strip() for l in ocr_text.split('\n') if l.strip()]
    
    extracted_data: Dict[str, Any] = {
        "medicines": [],
        "raw_text": cleaned_text
    }
    
    current_med: Optional[Dict[str, Any]] = None
    
    for line in lines:
        if is_noise(line):
            continue
            
        med_name = extract_medicine(line)
        
        if med_name:
            # Save previous med
            if current_med:
                extracted_data["medicines"].append(current_med)
            
            current_med = {
                "name": med_name,
                "dosage": [],
                "timing": [],
                "duration": [],
                "food_instruction": []
            }
            
            # Look for details in the same line
            current_med["dosage"] = extract_patterns(line, DOSAGE_PATTERNS)
            current_med["timing"] = extract_patterns(line, TIMING_PATTERNS)
            current_med["duration"] = extract_patterns(line, DURATION_PATTERNS)
            current_med["food_instruction"] = extract_patterns(line, FOOD_PATTERNS)
            
        elif current_med:
            # Look for details in subsequent lines
            dosages = extract_patterns(line, DOSAGE_PATTERNS)
            timings = extract_patterns(line, TIMING_PATTERNS)
            durations = extract_patterns(line, DURATION_PATTERNS)
            foods = extract_patterns(line, FOOD_PATTERNS)
            
            if dosages or timings or durations or foods:
                current_med["dosage"].extend(dosages)
                current_med["timing"].extend(timings)
                current_med["duration"].extend(durations)
                current_med["food_instruction"].extend(foods)
    
    # Append the last one
    if current_med:
        extracted_data["medicines"].append(current_med)
        
    # Deduplication and Cleanup
    unique_meds: Dict[str, Dict[str, Any]] = {}
    for med in extracted_data["medicines"]:
        name = med["name"]
        if name not in unique_meds:
            unique_meds[name] = med
        else:
            # Merge details
            unique_meds[name]["dosage"].extend(med["dosage"])
            unique_meds[name]["timing"].extend(med["timing"])
            unique_meds[name]["duration"].extend(med["duration"])
            unique_meds[name]["food_instruction"].extend(med["food_instruction"])
            
    # Final pass to unique lists
    final_list = []
    for med in unique_meds.values():
        med["dosage"] = list(set(med["dosage"]))
        med["timing"] = list(set(med["timing"]))
        med["duration"] = list(set(med["duration"]))
        med["food_instruction"] = list(set(med["food_instruction"]))
        final_list.append(med)

    extracted_data["medicines"] = final_list

    return extracted_data
