from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from ai_engine import PrescriptionParser
from ai_engine.text_processor import MEDICINE_DB as DEFAULT_MEDICINE_DB
from scheduler import generate_reminders
from database import engine, get_db, Base
from models import MedicineModel
import crud

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Prescription OCR API", version="1.0.0")

# Initialize AI Parser
ai_parser = PrescriptionParser()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now (dev mode)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class OCRRequest(BaseModel):
    text: str

class Medicine(BaseModel):
    name: str
    dosage: List[str]
    timing: List[str]
    duration: List[str]
    food_instruction: List[str]

class Reminder(BaseModel):
    medicine: str
    datetime: str
    dosage: str
    instruction: str

class RefillInfo(BaseModel):
    medicine: str
    total_quantity_needed: int
    refill_due_date: str
    duration_days: int
    daily_frequency: int

class ParseResponse(BaseModel):
    medicines: List[Medicine]
    raw_text: str
    reminders: List[Reminder]
    refill_info: List[RefillInfo]

class SaveRequest(BaseModel):
    medicines: List[Medicine]
    reminders: List[Reminder]
    refill_info: List[RefillInfo]

class ParseRequest(BaseModel):
    text: str

@app.post("/parse", response_model=ParseResponse)
def parse_prescription(request: ParseRequest, db: Session = Depends(get_db)):
    """
    Parses raw prescription text using the AI Engine.
    Fetches known medicines from DB to improve fuzzy matching.
    """
    try:
        # 1. Get known medicines from DB
        db_medicines = crud.get_all_medicine_names(db)
        
        # 2. Combine with default list (to ensure we have a base knowledge)
        combined_medicines = list(set(DEFAULT_MEDICINE_DB + db_medicines))
        
        # 3. Run AI Pipeline
        extracted_data = ai_parser.run(raw_text=request.text, medicine_db=combined_medicines)
        
        if "error" in extracted_data:
            raise HTTPException(status_code=400, detail=extracted_data["error"])

        medicines_data = extracted_data.get("medicines", [])
        
        # 4. Generate Reminders (Scheduler Logic)
        reminders = generate_reminders(extracted_data)
        
        # 5. Refill Info is already calculated by AI Engine
        # But we need to ensure the format matches the API response model
        refill_info = []
        for med in medicines_data:
            refill_info.append({
                "medicine": med["name"],
                "total_quantity_needed": med.get("quantity_required", 0),
                "refill_due_date": med.get("estimated_refill_date", ""),
                "duration_days": 0, # AI engine might not return raw days int easily, but we can infer or ignore
                "daily_frequency": 0 # AI engine handles this internally
            })

        return {
            "medicines": medicines_data,
            "raw_text": extracted_data.get("raw_text", ""),
            "reminders": reminders,
            "refill_info": refill_info
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save")
async def save_prescription(data: SaveRequest, db: Session = Depends(get_db)):
    """
    Saves the confirmed prescription data to the database.
    """
    try:
        saved_medicines = []
        
        # Group reminders and refill info by medicine name for easy access
        reminders_by_med = {}
        for rem in data.reminders:
            if rem.medicine not in reminders_by_med:
                reminders_by_med[rem.medicine] = []
            reminders_by_med[rem.medicine].append(rem.dict())
            
        refill_by_med = {}
        for ref in data.refill_info:
            refill_by_med[ref.medicine] = ref.dict()
            
        for med in data.medicines:
            # Get associated refill info
            ref_info = refill_by_med.get(med.name, {})
            
            # Create Medicine record
            db_med = crud.create_medicine(db, med.dict(), ref_info)
            
            # Create Reminder records
            med_reminders = reminders_by_med.get(med.name, [])
            crud.create_reminders(db, db_med.id, med_reminders)
            
            saved_medicines.append(db_med.name)
            
        return {"message": "Prescription saved successfully", "saved_medicines": saved_medicines}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/medicines")
async def get_all_medicines(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all saved medicines.
    """
    medicines = crud.get_medicines(db, skip=skip, limit=limit)
    return medicines

@app.get("/")
async def root():
    return {"message": "Prescription OCR API is running. Use POST /parse to extract data."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
