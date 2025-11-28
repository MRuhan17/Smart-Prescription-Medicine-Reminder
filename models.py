from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class MedicineModel(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    dosage = Column(JSON) # Storing list as JSON
    timing = Column(JSON) # Storing list as JSON
    duration = Column(JSON) # Storing list as JSON
    food_instruction = Column(JSON) # Storing list as JSON
    
    # Refill info
    total_quantity = Column(Integer, default=0)
    refill_due_date = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    reminders = relationship("ReminderModel", back_populates="medicine")

class ReminderModel(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    datetime = Column(String) # Storing ISO string
    status = Column(String, default="pending") # pending, taken, skipped
    instruction = Column(String, nullable=True)
    dosage_str = Column(String, nullable=True)

    medicine = relationship("MedicineModel", back_populates="reminders")
