import os
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
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

app = FastAPI(
    title="Prescription OCR API",
    version="1.0.0",
    description="API for parsing prescription text and managing medicine reminders"
)

# Initialize AI Parser
ai_parser = PrescriptionParser()

# --- CORS Configuration ---
# Get allowed origins from environment or default to all for development
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class OCRRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)

class Medicine(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    dosage: List[str] = Field(default_factory=list)
    timing: List[str] = Field(default_factory=list)
    duration: List[str] = Field(default_factory=list)
    food_instruction: List[str] = Field(default_factory=list)
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Medicine name cannot be empty')
        return v.strip()

class Reminder(BaseModel):
    medicine: str
    datetime: str
    dosage: str
    instruction: str

class RefillInfo(BaseModel):
    medicine: str
    total_quantity_needed: int = Field(..., ge=0)
    refill_due_date: str
    duration_days: int = Field(..., ge=0)
    daily_frequency: int = Field(..., ge=0)

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
    text: str = Field(..., min_length=1, max_length=10000, description="Raw prescription text to parse")
    
    @validator('text')
    def text_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy"}

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
                "duration_days": 0,
                "daily_frequency": 0
            })

        return {
            "medicines": medicines_data,
            "raw_text": extracted_data.get("raw_text", ""),
            "reminders": reminders,
            "refill_info": refill_info
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error processing prescription")

@app.post("/save")
async def save_prescription(data: SaveRequest, db: Session = Depends(get_db)):
    """
    Saves the confirmed prescription data to the database.
    """
    try:
        if not data.medicines:
            raise HTTPException(status_code=400, detail="No medicines to save")
            
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
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error saving prescription")

@app.get("/medicines")
async def get_all_medicines(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """
    Get all saved medicines with pagination.
    """
    medicines = crud.get_medicines(db, skip=skip, limit=limit)
    return medicines

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Prescription OCR API is running",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)
