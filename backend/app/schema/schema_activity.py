from pydantic import BaseModel
from datetime import datetime
from app.models.activity import ActivityCategory, ActivitySource

class ActivityCreate(BaseModel):
    time: str              # "HH:mm"
    category: ActivityCategory
    # date NON fournie → backend met aujourd’hui

class ActivityOut(BaseModel):
    id: str
    time: str
    date: datetime
    category: ActivityCategory
    created_at: datetime
    created_by: int

class ActivityRead(BaseModel):
    id: str
    time: str
    date: datetime
    category: ActivityCategory
    source: ActivitySource  # ✅ Important pour distinguer MANUAL vs PREDICTED
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True
