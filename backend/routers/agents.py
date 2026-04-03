from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import logging

try:
    from backend.services.agents_service import (
        run_all_agents,
        run_patient_monitoring_agent,
        run_clinical_support_agent,
        run_resource_optimization_agent,
        run_predictive_risk_agent,
        run_escalation_agent,
        generate_analytics_snapshot,
        get_recent_alerts,
        get_priority_recommendations,
        get_patient_risk_score,
        get_pending_escalations,
        resolve_alert,
        implement_recommendation,
        approve_escalation,
    )
    from backend.models.agent_insights import (
        AlertInDB,
        RecommendationInDB,
        RiskScoreInDB,
        EscalationEventInDB,
        AnalyticsSnapshotInDB,
    )
except ModuleNotFoundError:
    from services.agents_service import (
        run_all_agents,
        run_patient_monitoring_agent,
        run_clinical_support_agent,
        run_resource_optimization_agent,
        run_predictive_risk_agent,
        run_escalation_agent,
        generate_analytics_snapshot,
        get_recent_alerts,
        get_priority_recommendations,
        get_patient_risk_score,
        get_pending_escalations,
        resolve_alert,
        implement_recommendation,
        approve_escalation,
    )
    from models.agent_insights import (
        AlertInDB,
        RecommendationInDB,
        RiskScoreInDB,
        EscalationEventInDB,
        AnalyticsSnapshotInDB,
    )

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/agents", tags=["agents"])


# ============ MAIN AGENT OPERATIONS ============

@router.post("/run-all", status_code=status.HTTP_200_OK)
def run_all_agents_endpoint():
    """Run all AI agents at once"""
    try:
        results = run_all_agents()
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "results": results
        }
    except Exception as e:
        logger.exception("Error running agents")
        raise HTTPException(status_code=500, detail=f"Error running agents: {str(e)}")


@router.post("/monitoring", status_code=status.HTTP_200_OK)
def run_monitoring_endpoint():
    """Run patient monitoring agent"""
    try:
        result = run_patient_monitoring_agent()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.exception("Error in monitoring agent")
        raise HTTPException(status_code=500, detail=f"Monitoring agent error: {str(e)}")


@router.post("/clinical-support", status_code=status.HTTP_200_OK)
def run_clinical_support_endpoint():
    """Run clinical decision support agent"""
    try:
        result = run_clinical_support_agent()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.exception("Error in clinical support agent")
        raise HTTPException(status_code=500, detail=f"Clinical support error: {str(e)}")


@router.post("/resource-optimization", status_code=status.HTTP_200_OK)
def run_resource_optimization_endpoint():
    """Run resource optimization agent"""
    try:
        result = run_resource_optimization_agent()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.exception("Error in resource optimization agent")
        raise HTTPException(status_code=500, detail=f"Resource optimization error: {str(e)}")


@router.post("/predictive-risk", status_code=status.HTTP_200_OK)
def run_predictive_risk_endpoint():
    """Run predictive risk agent"""
    try:
        result = run_predictive_risk_agent()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.exception("Error in predictive risk agent")
        raise HTTPException(status_code=500, detail=f"Predictive risk error: {str(e)}")


@router.post("/escalation", status_code=status.HTTP_200_OK)
def run_escalation_endpoint():
    """Run autonomous escalation agent"""
    try:
        result = run_escalation_agent()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.exception("Error in escalation agent")
        raise HTTPException(status_code=500, detail=f"Escalation agent error: {str(e)}")


@router.post("/analytics-snapshot", status_code=status.HTTP_200_OK)
def generate_analytics_endpoint():
    """Generate analytics snapshot"""
    try:
        result = generate_analytics_snapshot()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.exception("Error generating analytics")
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")


# ============ ALERTS ============

@router.get("/alerts", response_model=list[AlertInDB])
def get_alerts_endpoint(limit: int = 10):
    """Get recent unresolved alerts"""
    try:
        alerts = get_recent_alerts(limit)
        return alerts
    except Exception as e:
        logger.exception("Error retrieving alerts")
        raise HTTPException(status_code=500, detail=f"Error retrieving alerts: {str(e)}")


@router.post("/alerts/{alert_id}/resolve", status_code=status.HTTP_200_OK)
def resolve_alert_endpoint(alert_id: str):
    """Mark alert as resolved"""
    try:
        resolve_alert(alert_id)
        return {"status": "success", "message": f"Alert {alert_id} resolved"}
    except Exception as e:
        logger.exception("Error resolving alert")
        raise HTTPException(status_code=500, detail=f"Error resolving alert: {str(e)}")


# ============ RECOMMENDATIONS ============

@router.get("/recommendations", response_model=list[RecommendationInDB])
def get_recommendations_endpoint(limit: int = 10):
    """Get priority recommendations"""
    try:
        recs = get_priority_recommendations(limit)
        return recs
    except Exception as e:
        logger.exception("Error retrieving recommendations")
        raise HTTPException(status_code=500, detail=f"Error retrieving recommendations: {str(e)}")


@router.post("/recommendations/{rec_id}/implement", status_code=status.HTTP_200_OK)
def implement_recommendation_endpoint(rec_id: str):
    """Mark recommendation as implemented"""
    try:
        implement_recommendation(rec_id)
        return {"status": "success", "message": f"Recommendation {rec_id} marked as implemented"}
    except Exception as e:
        logger.exception("Error implementing recommendation")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ============ RISK SCORES ============

@router.get("/risk-scores/{patient_id}", response_model=RiskScoreInDB)
def get_risk_score_endpoint(patient_id: str):
    """Get risk score for a patient"""
    try:
        risk_score = get_patient_risk_score(patient_id)
        if not risk_score:
            raise HTTPException(status_code=404, detail="Risk score not found")
        return risk_score
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error retrieving risk score")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ============ ESCALATIONS ============

@router.get("/escalations", response_model=list[EscalationEventInDB])
def get_escalations_endpoint():
    """Get pending escalations"""
    try:
        escalations = get_pending_escalations()
        return escalations
    except Exception as e:
        logger.exception("Error retrieving escalations")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/escalations/{escalation_id}/approve", status_code=status.HTTP_200_OK)
def approve_escalation_endpoint(escalation_id: str):
    """Approve a pending escalation"""
    try:
        approve_escalation(escalation_id)
        return {"status": "success", "message": f"Escalation {escalation_id} approved"}
    except Exception as e:
        logger.exception("Error approving escalation")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
