import json
from scheduler import generate_reminders

def run_tests():
    # Mock input data (similar to what ocr_engine returns)
    mock_data = {
        "medicines": [
            {
                "name": "Paracetamol",
                "dosage": ["500mg", "1-0-1"],
                "timing": ["morning", "night"],
                "duration": ["3 days"],
                "food_instruction": ["after food"]
            },
            {
                "name": "Amoxicillin",
                "dosage": ["250mg"],
                "timing": ["morning", "afternoon", "night"],
                "duration": ["1 week"],
                "food_instruction": []
            },
            {
                "name": "Vitamin D",
                "dosage": ["OD"],
                "timing": [], # Should infer from OD -> Morning (heuristic) or stay empty if strict
                # Our scheduler adds heuristic for OD -> Morning
                "duration": ["1 month"],
                "food_instruction": []
            }
        ]
    }
    
    print("Generating reminders starting from 2023-10-27...")
    reminders = generate_reminders(mock_data, start_date_str="2023-10-27")
    
    print(f"Total reminders generated: {len(reminders)}")
    
    # Verification
    # Paracetamol: 2 times/day * 3 days = 6 reminders
    para_reminders = [r for r in reminders if r["medicine"] == "Paracetamol"]
    print(f"Paracetamol reminders: {len(para_reminders)} (Expected 6)")
    
    # Check Paracetamol time adjustment (after food -> +30 mins)
    # Morning (08:00) -> 08:30
    # Night (21:00) -> 21:30
    if para_reminders:
        first_rem = para_reminders[0]
        print(f"Sample Paracetamol reminder: {first_rem['datetime']}")
        if "08:30" in first_rem['datetime']:
            print("PASSED: Paracetamol morning time adjusted correctly (08:30)")
        else:
            print(f"FAILED: Paracetamol time incorrect. Got {first_rem['datetime']}")

    # Amoxicillin: 3 times/day * 7 days = 21 reminders
    amox_reminders = [r for r in reminders if r["medicine"] == "Amoxicillin"]
    print(f"Amoxicillin reminders: {len(amox_reminders)} (Expected 21)")
    
    # Vitamin D: 1 time/day * 30 days = 30 reminders
    vit_reminders = [r for r in reminders if r["medicine"] == "Vitamin D"]
    print(f"Vitamin D reminders: {len(vit_reminders)} (Expected 30)")
    
    # Check specific times
    if amox_reminders:
        # No food instruction -> No adjustment
        # Morning -> 08:00
        print(f"Sample Amoxicillin reminder: {amox_reminders[0]['datetime']}") 
        if "08:00" in amox_reminders[0]['datetime']:
             print("PASSED: Amoxicillin time correct (08:00)")
        else:
             print(f"FAILED: Amoxicillin time incorrect. Got {amox_reminders[0]['datetime']}")

if __name__ == "__main__":
    run_tests()
