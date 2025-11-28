import os

# Set test database URL before importing app/database
os.environ["DATABASE_URL"] = "sqlite:///./test_prescriptions.db"

# Remove existing test db for clean test BEFORE importing app (which opens DB)
if os.path.exists("./test_prescriptions.db"):
    try:
        os.remove("./test_prescriptions.db")
    except PermissionError:
        print("Warning: Could not remove existing test DB. It might be in use.")

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_save_flow():
    # 1. Parse
    ocr_text = "Paracetamol 500mg 1-0-1 for 5 days"
    response = client.post("/parse", json={"text": ocr_text})
    assert response.status_code == 200
    data = response.json()
    
    print("Parsed Refill Info:")
    print(data.get("refill_info"))
    
    # 2. Save
    save_payload = {
        "medicines": data["medicines"],
        "reminders": data["reminders"],
        "refill_info": data["refill_info"]
    }
    
    save_response = client.post("/save", json=save_payload)
    assert save_response.status_code == 200
    print("\nSave Response:")
    print(save_response.json())
    
    # 3. Verify
    get_response = client.get("/medicines")
    assert get_response.status_code == 200
    medicines = get_response.json()
    print("\nFetched Medicines from DB:")
    print(medicines)
    
    assert len(medicines) == 1
    assert medicines[0]["name"] == "Paracetamol"
    assert medicines[0]["total_quantity"] == 10

if __name__ == "__main__":
    test_save_flow()
