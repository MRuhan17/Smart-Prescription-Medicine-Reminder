from sqlalchemy.orm import Session
from models import MedicineModel, ReminderModel
from typing import List, Dict, Any

def create_medicine(db: Session, medicine_data: Dict[str, Any], refill_info: Dict[str, Any]) -> MedicineModel:
    """
    Create a new medicine record.
    """
    db_med = MedicineModel(
        name=medicine_data.get("name"),
        dosage=medicine_data.get("dosage", []),
        timing=medicine_data.get("timing", []),
        duration=medicine_data.get("duration", []),
        food_instruction=medicine_data.get("food_instruction", []),
        total_quantity=refill_info.get("total_quantity_needed", 0),
        refill_due_date=refill_info.get("refill_due_date")
    )
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

def create_reminders(db: Session, medicine_id: int, reminders_data: List[Dict[str, Any]]):
    """
    Create reminder records for a medicine.
    """
    for rem in reminders_data:
        db_rem = ReminderModel(
            medicine_id=medicine_id,
            datetime=rem.get("datetime"),
            instruction=rem.get("instruction"),
            dosage_str=rem.get("dosage"),
            status="pending"
        )
        db.add(db_rem)
    db.commit()

def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    """
    Get all medicines.
    """
    return db.query(MedicineModel).offset(skip).limit(limit).all()

def get_medicine(db: Session, medicine_id: int):
    """
    Get a specific medicine by ID.
    """
    return db.query(MedicineModel).filter(MedicineModel.id == medicine_id).first()

def get_all_medicine_names(db: Session) -> list[str]:
    """Returns a list of all unique medicine names in the DB."""
    results = db.query(MedicineModel.name).distinct().all()
    return [r[0] for r in results]
