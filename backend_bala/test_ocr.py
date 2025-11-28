import json
from ocr_engine import process_prescription

def run_tests():
    test_cases = [
        {
            "name": "Simple Case",
            "input": """
            Dr. John Doe
            1. Paracetamol 500mg
            1-0-1 after food
            for 3 days
            """,
            "expected_med": "Paracetamol",
            "check_food": "after food"
        },
        {
            "name": "Misspelled Medicine",
            "input": """
            2. Amoxcilin 250 mg
            BD
            """,
            "expected_med": "Amoxicillin"
        },
        {
            "name": "Complex Timing",
            "input": """
            3. Metformin 500mg
            1-0-0 before breakfast
            0-0-1 after dinner
            """,
            "expected_med": "Metformin",
            "check_food": "before breakfast"
        },
        {
            "name": "Fractions and Units",
            "input": """
            4. Levothyroxine 12.5 mcg
            1/2 tablet
            OD
            """,
            "expected_med": "Levothyroxine",
            "check_dosage": "1/2 tablet"
        },
        {
            "name": "Noise Filtering",
            "input": """
            City Hospital
            Ph: 123456
            Rx
            Atorvastatin 10mg
            HS
            """,
            "expected_med": "Atorvastatin"
        }
    ]
    
    for case in test_cases:
        print(f"Running test: {case['name']}")
        # process_prescription now returns a dict, so no need to json.loads
        result = process_prescription(case['input'])
        
        medicines = result.get("medicines", [])
        if not medicines:
            print(f"FAILED: No medicines found. Output: {result}")
            continue
            
        found_med = medicines[0]["name"]
        if found_med == case["expected_med"]:
            print(f"PASSED: Found {found_med}")
            
            if "check_dosage" in case:
                dosages = medicines[0]["dosage"]
                if any(case["check_dosage"] in d for d in dosages):
                     print(f"PASSED: Found dosage {case['check_dosage']}")
                else:
                     print(f"FAILED: Expected dosage {case['check_dosage']}, got {dosages}")
            
            if "check_food" in case:
                foods = medicines[0].get("food_instruction", [])
                if any(case["check_food"] in f for f in foods):
                    print(f"PASSED: Found food instruction {case['check_food']}")
                else:
                    print(f"FAILED: Expected food instruction {case['check_food']}, got {foods}")
            
            print(f"Details: {json.dumps(medicines[0], indent=2)}")
        else:
            print(f"FAILED: Expected {case['expected_med']}, got {found_med}")
        print("-" * 20)

if __name__ == "__main__":
    run_tests()
