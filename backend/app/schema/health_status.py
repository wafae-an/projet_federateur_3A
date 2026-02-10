from pydantic import BaseModel
from datetime import date, time
from typing import List

# Ce que le surveillé envoie (le dependent_id sera déduit du token)
class HealthStatusCreate(BaseModel):
    status_type: str  # 'WELL', 'TIRED', 'SICK', 'PAIN', 'AT_HOME'

# Ce que l'aidant reçoit
class HealthStatusHistoryResponse(BaseModel):
    full_name: str
    age: int
    status: str
    log_date: date
    log_time: str