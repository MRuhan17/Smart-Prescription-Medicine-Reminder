import json
from refill_logic import calculate_refill_info

def run_tests():
    mock_data = {
        "medicines": [
            {
                "name": "Paracetamol",
                "dosage": ["500mg", "1-0-1"], # 2 per day
                "duration": ["5 days"]
            },
            {
                "name": "Amoxicillin",
                "dosage": ["250mg", "TID"], # 3 per day
                "duration": ["1 week"] # 7 days
            },
            {
                "name": "Vitamin D",
                "dosage": ["OD"], # 1 per day
                "duration": ["30 days"]
            },
            {
                "name": "Complex Med",
                "dosage": ["1-1-1-1"], # 4 per day
                "duration": ["2 days"]
            }
        ]
    }
    
    print("Calculating refill info...")
    results = calculate_refill_info(mock_data, start_date_str="2023-01-01")
    
    for res in results:
        print(f"Medicine: {res['medicine']}")
        print(f"  Frequency: {res['daily_frequency']}/day")
        print(f"  Duration: {res['duration_days']} days")
        print(f"  Total Needed: {res['total_quantity_needed']}")
        print(f"  Refill Due: {res['refill_due_date']}")
        print("-" * 20)
        
    # Verification
    # Paracetamol: 2 * 5 = 10
    para = next(r for r in results if r["medicine"] == "Paracetamol")
    if para["total_quantity_needed"] == 10:
        print("PASSED: Paracetamol total 10")
    else:
        print(f"FAILED: Paracetamol expected 10, got {para['total_quantity_needed']}")

    # Amoxicillin: 3 * 7 = 21
    amox = next(r for r in results if r["medicine"] == "Amoxicillin")
    if amox["total_quantity_needed"] == 21:
        print("PASSED: Amoxicillin total 21")
    else:
        print(f"FAILED: Amoxicillin expected 21, got {amox['total_quantity_needed']}")

if __name__ == "__main__":
    run_tests()
