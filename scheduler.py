import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

# --- Constants ---
TIME_MAPPING: Dict[str, str] = {
    "morning": "08:00",
    "afternoon": "13:00",
    "evening": "18:00",
    "night": "21:00",
    "bedtime": "21:00"
}

def parse_duration(duration_list: List[str]) -> int:
    """
    Parses the duration list and returns the number of days.
    Defaults to 1 day if not found or unclear.
    """
    if not duration_list:
        return 1
    
    duration_str = duration_list[0].lower()
    
    # Check for "X days/weeks/months"
    match = re.search(r'(\d+)\s*(days?|weeks?|months?)', duration_str)
    if match:
        val = int(match.group(1))
        unit = match.group(2)
        
        if "week" in unit:
            return val * 7
        elif "month" in unit:
            return val * 30
        else:
            return val
            
    # Check for "until finished" - heuristic, say 5 days
    if "finish" in duration_str:
        return 5
        
    return 1

def generate_reminders(medicine_data: Dict[str, Any], start_date_str: Optional[str] = None) -> List[Dict[str, str]]:
    """
    Generates a list of reminder events for the given medicines.
    start_date_str: 'YYYY-MM-DD', defaults to today.
    """
    if not start_date_str:
        start_date = datetime.now().date()
    else:
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except ValueError:
            # Fallback to today if invalid date format
            start_date = datetime.now().date()
        
    reminders: List[Dict[str, str]] = []
    
    for med in medicine_data.get("medicines", []):
        name = med.get("name", "Unknown Medicine")
        timings = med.get("timing", [])
        duration_days = parse_duration(med.get("duration", []))
        food_instr = ", ".join(med.get("food_instruction", []))
        dosage = ", ".join(med.get("dosage", []))
        
        # Heuristic for missing timing
        if not timings:
            for d in med.get("dosage", []):
                if re.match(r'1-0-1', d):
                    timings = ["morning", "night"]
                elif re.match(r'1-0-0', d):
                    timings = ["morning"]
                elif re.match(r'0-0-1', d):
                    timings = ["night"]
                elif re.match(r'0-1-0', d):
                    timings = ["afternoon"]
                elif re.match(r'BD', d, re.IGNORECASE):
                    timings = ["morning", "night"]
                elif re.match(r'TID', d, re.IGNORECASE):
                    timings = ["morning", "afternoon", "night"]
                elif re.match(r'OD', d, re.IGNORECASE):
                    timings = ["morning"] # Default OD to morning
        
        # Determine time adjustment
        adjustment_minutes = 0
        if "before" in food_instr.lower():
            adjustment_minutes = -30
        elif "after" in food_instr.lower():
            adjustment_minutes = 30
            
        unique_timings = set()
        for t in timings:
            t_lower = t.lower()
            for key, val in TIME_MAPPING.items():
                if key in t_lower:
                    unique_timings.add(val)
        
        sorted_times = sorted(list(unique_timings))
        
        for day_offset in range(duration_days):
            current_date = start_date + timedelta(days=day_offset)
            
            for time_str in sorted_times:
                # Parse base time
                base_dt = datetime.strptime(f"{current_date} {time_str}", "%Y-%m-%d %H:%M")
                
                # Apply adjustment
                final_dt = base_dt + timedelta(minutes=adjustment_minutes)
                
                reminders.append({
                    "medicine": name,
                    "datetime": final_dt.strftime("%Y-%m-%d %H:%M"),
                    "dosage": dosage,
                    "instruction": food_instr
                })
                
    return reminders
