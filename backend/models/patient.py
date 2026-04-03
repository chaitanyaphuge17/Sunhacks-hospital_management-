from enum import Enum

from pydantic import BaseModel

try:
    from backend.models.common import MongoEntity
except ModuleNotFoundError:
    from models.common import MongoEntity


class SeverityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class PatientStatus(str, Enum):
    admitted = "admitted"
    discharged = "discharged"


class PatientBase(BaseModel):
    name: str
    age: int
    disease: str
    severity: SeverityLevel
    icu_required: bool
    status: PatientStatus


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    disease: str | None = None
    severity: SeverityLevel | None = None
    icu_required: bool | None = None
    status: PatientStatus | None = None


class PatientInDB(MongoEntity, PatientBase):
    pass
