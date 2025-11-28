from typing import List, Dict, Any
from datetime import datetime, timedelta
import re

def parse_frequency(dosage_list: List[str]) -> int:
    """
    Estimates the daily frequency of medication intake based on dosage strings.
    
    Examples:
    - "1-0-1" -> 2
    - "TID" -> 3
    - "Once a day" -> 1
    
    Args:
        dosage_list (List[str]): A list of extracted dosage strings.

    Returns:
        int: The maximum estimated daily frequency. Defaults to 1 if no pattern matches.
    """
    max_freq = 0
    
    for dose in dosage_list:
        dose = dose.lower()
        
        # Pattern: 1-0-1 (Morning-Afternoon-Night)
        if re.match(r'\b\d+-\d+-\d+(?:-\d+)?\b', dose):
            parts = [int(x) for x in dose.split('-')]
            # Count non-zero doses
            freq = sum(1 for x in parts if x > 0)
            max_freq = max(max_freq, freq)
            
        # Pattern: Latin abbreviations and English phrases
        elif "bd" in dose or "twice" in dose:
            max_freq = max(max_freq, 2)
        elif "tid" in dose or "thrice" in dose:
            max_freq = max(max_freq, 3)
        elif "qid" in dose or "four times" in dose:
            max_freq = max(max_freq, 4)
        elif "od" in dose or "once" in dose:
            max_freq = max(max_freq, 1)
        elif "hs" in dose or "bedtime" in dose:
            max_freq = max(max_freq, 1)
            
    return max_freq if max_freq > 0 else 1

def parse_duration_days(duration_list: List[str]) -> int:
    """
    Parses duration strings to determine the total number of days.
    
    Examples:
    - "5 days" -> 5
    - "1 week" -> 7
    - "1 month" -> 30
    
    Args:
        duration_list (List[str]): A list of extracted duration strings.

    Returns:
        int: The total duration in days. Defaults to 5 if no pattern matches.
    """
    for dur in duration_list:
        dur = dur.lower()
        
        # "5 days"
        match = re.search(r'(\d+)\s*days?', dur)
        if match:
            return int(match.group(1))
            
        # "1 week"
        match = re.search(r'(\d+)\s*weeks?', dur)
        if match:
            return int(match.group(1)) * 7
            
        # "1 month"
        match = re.search(r'(\d+)\s*months?', dur)
        if match:
            return int(match.group(1)) * 30
            
    return 5 # Default fallback

def enrich_with_refill_info(medicines: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calculates the total quantity required and the estimated refill date for each medicine.
    
    Logic:
    1.  Parse daily frequency from dosage.
    2.  Parse duration in days.
    3.  Total Quantity = Frequency * Days.
    4.  Refill Date = Start Date (Today) + Days.

    Args:
        medicines (List[Dict[str, Any]]): A list of medicine objects.

    Returns:
        List[Dict[str, Any]]: The updated list of medicine objects with 'quantity_required' 
                              and 'estimated_refill_date' fields added.
    """
    start_date = datetime.now()
    
    for med in medicines:
        freq = parse_frequency(med.get("dosage", []))
        days = parse_duration_days(med.get("duration", []))
        
        total_qty = freq * days
        refill_date = start_date + timedelta(days=days)
        
        med["quantity_required"] = total_qty
        med["estimated_refill_date"] = refill_date.strftime("%Y-%m-%d")
        
    return medicines
