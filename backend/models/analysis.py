from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

try:
    from backend.models.common import MongoEntity
except ModuleNotFoundError:
    from models.common import MongoEntity


class RiskLevel(str, Enum):
    ICU_SHORTAGE = "ICU_SHORTAGE"
    STABLE = "STABLE"


class AnalyzeResult(BaseModel):
    risk: RiskLevel
    reason: str
    critical_patients: list[str]
    recommended_actions: list[str]


class AnalyzeHistoryInDB(MongoEntity):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    result: dict[str, Any]
