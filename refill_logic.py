import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from scheduler import parse_duration

def parse_frequency(dosage_list: List[str]) -> int:
    """
    Parses the dosage list to determine daily frequency.
    Returns integer frequency (e.g., 3 for '1-0-1' or 'TID').
    Defaults to 1 if unclear.
    """
    if not dosage_list:
        return 1
        
    # Join all dosage strings to search across them
    combined_dosage = " ".join(dosage_list).lower()
    
    # Check for X-X-X pattern (e.g., 1-0-1, 1-1-1-1)
    # Sum the digits
    pattern_match = re.findall(r'\b(\d+)-(\d+)-(\d+)(?:-(\d+))?\b', combined_dosage)
    if pattern_match:
        # Take the first match
        parts = pattern_match[0]
        total = 0
        for p in parts:
            if p:
                total += int(p)
        return total if total > 0 else 1

    # Check for specific keywords
    if re.search(r'\b(qid|four times)\b', combined_dosage):
        return 4
    if re.search(r'\b(tid|thrice|three times)\b', combined_dosage):
        return 3
    if re.search(r'\b(bd|bid|twice|two times)\b', combined_dosage):
        return 2
    if re.search(r'\b(od|once|one time)\b', combined_dosage):
        return 1
        
    return 1

def calculate_refill_info(medicine_data: Dict[str, Any], start_date_str: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Calculates total quantity needed and refill due date for each medicine.
    """
    if not start_date_str:
        start_date = datetime.now().date()
    else:
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except ValueError:
            start_date = datetime.now().date()
        
    refill_info: List[Dict[str, Any]] = []
    
    for med in medicine_data.get("medicines", []):
        name = med.get("name", "Unknown Medicine")
        duration_days = parse_duration(med.get("duration", []))
        frequency = parse_frequency(med.get("dosage", []))
        
        total_quantity = duration_days * frequency
        refill_date = start_date + timedelta(days=duration_days)
        
        refill_info.append({
            "medicine": name,
            "total_quantity_needed": total_quantity,
            "refill_due_date": refill_date.strftime("%Y-%m-%d"),
            "duration_days": duration_days,
            "daily_frequency": frequency
        })
        
    return refill_info
