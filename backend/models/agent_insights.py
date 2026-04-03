from enum import Enum
from datetime import datetime
from pydantic import BaseModel

try:
    from backend.models.common import MongoEntity
except ModuleNotFoundError:
    from models.common import MongoEntity


class AlertSeverity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AlertType(str, Enum):
    deterioration = "deterioration"
    critical_threshold = "critical_threshold"
    icu_escalation = "icu_escalation"
    resource_shortage = "resource_shortage"
    infection_risk = "infection_risk"


class AlertBase(BaseModel):
    patient_id: str
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    recommendations: list[str] = []
    timestamp: datetime = datetime.now()
    resolved: bool = False


class AlertInDB(MongoEntity, AlertBase):
    pass


class RecommendationType(str, Enum):
    clinical = "clinical"
    resource = "resource"
    escalation = "escalation"
    preventive = "preventive"


class RecommendationBase(BaseModel):
    patient_id: str | None = None
    recommendation_type: RecommendationType
    title: str
    description: str
    priority: int  # 1-10, higher is more urgent
    action: str  # Recommended action to take
    timestamp: datetime = datetime.now()
    implemented: bool = False


class RecommendationInDB(MongoEntity, RecommendationBase):
    pass


class RiskScoreBase(BaseModel):
    patient_id: str
    overall_risk: float  # 0-100
    deterioration_risk: float  # Probability of worsening in 24h
    infection_risk: float
    icu_need_probability: float
    readmission_risk: float
    length_of_stay_prediction: int  # Expected days
    risk_factors: list[str] = []
    timestamp: datetime = datetime.now()


class RiskScoreInDB(MongoEntity, RiskScoreBase):
    pass


class EscalationEventBase(BaseModel):
    patient_id: str
    escalation_reason: str
    escalation_level: str  # "ward" -> "icu_consideration" -> "icu_admission"
    triggered_by: str  # "automated" or agent name
    severity: AlertSeverity
    timestamp: datetime = datetime.now()
    status: str = "pending"  # pending, approved, rejected, completed


class EscalationEventInDB(MongoEntity, EscalationEventBase):
    pass


class AnalyticsSnapshot(BaseModel):
    timestamp: datetime = datetime.now()
    total_patients: int
    admitted_patients: int
    critical_patients: int
    icu_occupied: int
    icu_available: int
    doctors_available: int
    average_risk_score: float
    pending_alerts: int
    pending_recommendations: int
    escalations_today: int


class AnalyticsSnapshotInDB(MongoEntity, AnalyticsSnapshot):
    pass
