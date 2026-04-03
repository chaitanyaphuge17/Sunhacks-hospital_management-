import logging
from datetime import datetime
from bson import ObjectId
import json

try:
    from backend.database.collections import (
        patients_collection,
        resources_collection,
        alerts_collection,
        recommendations_collection,
        risk_scores_collection,
        escalations_collection,
        analytics_collection,
    )
    from backend.models.agent_insights import (
        AlertType,
        AlertSeverity,
        AlertInDB,
        RecommendationType,
        RecommendationInDB,
        RiskScoreInDB,
        EscalationEventInDB,
        AnalyticsSnapshotInDB,
    )
except ModuleNotFoundError:
    from database.collections import (
        patients_collection,
        resources_collection,
        alerts_collection,
        recommendations_collection,
        risk_scores_collection,
        escalations_collection,
        analytics_collection,
    )
    from models.agent_insights import (
        AlertType,
        AlertSeverity,
        AlertInDB,
        RecommendationType,
        RecommendationInDB,
        RiskScoreInDB,
        EscalationEventInDB,
        AnalyticsSnapshotInDB,
    )

logger = logging.getLogger(__name__)


# ============ HELPER FUNCTIONS ============
def convert_objectid_to_str(obj):
    """Recursively convert ObjectId and datetime objects to strings for JSON serialization"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {key: convert_objectid_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    return obj



def run_patient_monitoring_agent():
    """Monitor all admitted patients for deterioration patterns"""
    try:
        patients = list(patients_collection().find({"status": "admitted"}))
        
        for patient in patients:
            patient_id = str(patient["_id"])
            
            # Check for deterioration patterns
            alerts = []
            
            # Rule 1: High severity + ICU not required yet = escalation warning
            if patient.get("severity") == "high" and not patient.get("icu_required"):
                alerts.append({
                    "type": AlertType.critical_threshold,
                    "severity": AlertSeverity.high,
                    "title": "High Severity Patient Not in ICU",
                    "message": f"{patient['name']} has high severity {patient['disease']} but is not in ICU",
                    "recommendation": "Consider ICU transfer"
                })
            
            # Rule 2: ICU required patients needing bed allocation
            if patient.get("icu_required"):
                resources = resources_collection().find_one({}) or {}
                if resources.get("icu_beds", 0) <= 0:
                    alerts.append({
                        "type": AlertType.resource_shortage,
                        "severity": AlertSeverity.critical,
                        "title": "ICU Bed Shortage - Patient Needs ICU",
                        "message": f"Patient {patient['name']} requires ICU but no beds available",
                        "recommendation": "Urgent: Discharge stable patients or arrange transfer"
                    })
            
            # Rule 3: Multiple high-severity patients
            high_severity_count = patients_collection().count_documents({
                "status": "admitted",
                "severity": "high"
            })
            if high_severity_count >= 3:
                alerts.append({
                    "type": AlertType.deterioration,
                    "severity": AlertSeverity.critical,
                    "title": f"Multiple Critical Patients ({high_severity_count})",
                    "message": "Hospital has 3+ high-severity patients simultaneously",
                    "recommendation": "Activate overflow protocols, alert senior staff"
                })
            
            # Create alerts in database
            for alert_data in alerts:
                existing = alerts_collection().find_one({
                    "patient_id": patient_id,
                    "alert_type": alert_data["type"].value,
                    "resolved": False
                })
                
                if not existing:  # Only create if not already present
                    alert_doc = {
                        "patient_id": patient_id,
                        "alert_type": alert_data["type"].value,
                        "severity": alert_data["severity"].value,
                        "title": alert_data["title"],
                        "message": alert_data["message"],
                        "recommendations": [alert_data["recommendation"]],
                        "timestamp": datetime.now(),
                        "resolved": False,
                    }
                    alerts_collection().insert_one(alert_doc)
                    logger.info(f"Alert created for patient {patient_id}: {alert_data['title']}")
        
        return {"status": "completed", "monitored_patients": len(patients)}
    
    except Exception as e:
        logger.error(f"Error in monitoring agent: {e}")
        raise


# ============ CLINICAL DECISION SUPPORT AGENT ============
def run_clinical_support_agent():
    """Generate clinical recommendations based on patient conditions"""
    try:
        patients = list(patients_collection().find({"status": "admitted"}))
        recommendations = []
        
        for patient in patients:
            patient_id = str(patient["_id"])
            disease = patient.get("disease", "").lower()
            severity = patient.get("severity", "low")
            age = patient.get("age", 0)
            
            # Generate recommendations based on disease patterns
            clinical_recs = []
            
            # Pneumonia recommendations
            if "pneumonia" in disease:
                clinical_recs.append({
                    "title": "Respiratory Support Assessment",
                    "description": "Patient has pneumonia. Assess oxygen saturation and consider oxygen therapy",
                    "action": "Check SpO2 levels, initiate oxygen if <94%"
                })
                if severity == "high":
                    clinical_recs.append({
                        "title": "Consider Ventillation",
                        "description": "High severity pneumonia may require mechanical ventilation",
                        "action": "Consult respiratory team, prepare for possible intubation"
                    })
            
            # High severity recommendations
            if severity == "high":
                clinical_recs.append({
                    "title": "Intensive Monitoring Required",
                    "description": "High severity condition requires continuous monitoring",
                    "action": "Increase monitoring frequency, consider ICU transfer"
                })
            
            # Age-based recommendations
            if age > 65:
                clinical_recs.append({
                    "title": "Elderly Patient Protocol",
                    "description": "Patient is elderly (65+) - increased fall/complication risk",
                    "action": "Implement fall prevention, check medication interactions"
                })
            
            # Create recommendations in database
            for rec_data in clinical_recs:
                existing = recommendations_collection().find_one({
                    "patient_id": patient_id,
                    "title": rec_data["title"],
                    "implemented": False
                })
                
                if not existing:
                    rec_doc = {
                        "patient_id": patient_id,
                        "recommendation_type": RecommendationType.clinical.value,
                        "title": rec_data["title"],
                        "description": rec_data["description"],
                        "action": rec_data["action"],
                        "priority": 8 if severity == "high" else (6 if severity == "medium" else 4),
                        "timestamp": datetime.now(),
                        "implemented": False,
                    }
                    recommendations_collection().insert_one(rec_doc)
                    logger.info(f"Clinical recommendation created for patient {patient_id}")
        
        return {"status": "completed", "recommendations_count": len(recommendations)}
    
    except Exception as e:
        logger.error(f"Error in clinical support agent: {e}")
        raise


# ============ RESOURCE OPTIMIZATION AGENT ============
def run_resource_optimization_agent():
    """Optimize ICU bed allocation and doctor assignments"""
    try:
        patients = list(patients_collection().find({"status": "admitted"}))
        resources = resources_collection().find_one({}) or {}
        
        icu_required = [p for p in patients if p.get("icu_required")]
        high_severity = [p for p in patients if p.get("severity") == "high"]
        
        recommendations = []
        
        # Calculate ICU utilization
        icu_beds = resources.get("icu_beds", 0)
        icu_occupied = len(icu_required)
        icu_utilization = (icu_occupied / icu_beds * 100) if icu_beds > 0 else 0
        
        # Recommendation 1: ICU capacity warnings
        if icu_occupied >= icu_beds:
            recommendations.append({
                "title": "ICU at Maximum Capacity",
                "description": f"All {icu_beds} ICU beds are occupied. No buffer for emergencies.",
                "action": "Add more ICU beds or discharge stable patients",
                "priority": 9
            })
        elif icu_utilization > 80:
            recommendations.append({
                "title": "ICU Capacity Warning",
                "description": f"ICU is {icu_utilization:.0f}% full. Limited beds for new admissions.",
                "action": "Plan for ICU expansion or discharge candidates"
            })
        
        # Recommendation 2: Doctor workload
        doctors = resources.get("doctors_available", 0)
        patient_per_doctor = len(patients) / doctors if doctors > 0 else 0
        
        if patient_per_doctor > 15:
            recommendations.append({
                "title": "Doctor Workload Exceeds Safe Limits",
                "description": f"Each doctor managing {patient_per_doctor:.1f} patients (ideal: <8)",
                "action": "Hire additional doctors or reduce admissions"
            })
        elif patient_per_doctor > 10:
            recommendations.append({
                "title": "High Doctor Workload",
                "description": f"Each doctor managing {patient_per_doctor:.1f} patients",
                "action": "Consider temporary staff or shift extensions"
            })
        
        # Recommendation 3: Resource allocation strategy
        if len(high_severity) > icu_beds:
            recommendations.append({
                "title": "Insufficient ICU Beds for High-Severity Patients",
                "description": f"{len(high_severity)} high-severity patients but only {icu_beds} ICU beds",
                "action": "Prioritize highest severity for ICU, arrange transfers for others"
            })
        
        # Store recommendations
        for rec_data in recommendations:
            rec_doc = {
                "patient_id": None,  # System-wide recommendation
                "recommendation_type": RecommendationType.resource.value,
                "title": rec_data["title"],
                "description": rec_data["description"],
                "action": rec_data["action"],
                "priority": rec_data.get("priority", 7),
                "timestamp": datetime.now(),
                "implemented": False,
            }
            recommendations_collection().insert_one(rec_doc)
        
        return {
            "status": "completed",
            "icu_utilization": f"{icu_utilization:.1f}%",
            "patient_per_doctor": f"{patient_per_doctor:.1f}",
            "recommendations_count": len(recommendations)
        }
    
    except Exception as e:
        logger.error(f"Error in resource optimization agent: {e}")
        raise


# ============ PREDICTIVE RISK AGENT ============
def run_predictive_risk_agent():
    """Generate risk scores for all patients"""
    try:
        patients = list(patients_collection().find({"status": "admitted"}))
        
        for patient in patients:
            patient_id = str(patient["_id"])
            
            # Calculate risk factors
            age = patient.get("age", 0)
            severity = patient.get("severity", "low")
            disease = patient.get("disease", "").lower()
            icu_required = patient.get("icu_required", False)
            
            # Base risk scores
            age_risk = min(100, (age - 50) * 2) if age > 50 else max(0, 20 - age/5)
            severity_risk = {"low": 15, "medium": 50, "high": 85}.get(severity, 50)
            
            # Disease-specific risks
            disease_risk = 30
            if "pneumonia" in disease:
                disease_risk = 70
            elif "cardiac" in disease or "heart" in disease:
                disease_risk = 80
            elif "sepsis" in disease:
                disease_risk = 95
            elif "diabetes" in disease:
                disease_risk = 60
            
            # Calculate composite risks
            overall_risk = (severity_risk + disease_risk + age_risk) / 3
            deterioration_risk = min(100, severity_risk * 1.2 + age_risk * 0.5)
            infection_risk = min(100, disease_risk * 0.8 + age_risk * 0.3)
            icu_need_probability = min(100, severity_risk + disease_risk * 0.5)
            readmission_risk = min(100, severity_risk * 0.6 + age_risk * 0.8)
            
            # Length of stay prediction (simplified)
            los_days = 3
            if severity == "high":
                los_days += 5
            if icu_required:
                los_days += 3
            if age > 65:
                los_days += 2
            
            # Risk factors list
            risk_factors = []
            if severity == "high":
                risk_factors.append(f"High severity: {disease}")
            if icu_required:
                risk_factors.append("Currently requires ICU")
            if age > 65:
                risk_factors.append(f"Advanced age: {age} years")
            if disease_risk > 70:
                risk_factors.append(f"High-risk disease: {disease}")
            if deterioration_risk > 70:
                risk_factors.append("High deterioration risk in 24h")
            
            # Store risk score
            risk_doc = {
                "patient_id": patient_id,
                "overall_risk": round(overall_risk, 2),
                "deterioration_risk": round(deterioration_risk, 2),
                "infection_risk": round(infection_risk, 2),
                "icu_need_probability": round(icu_need_probability, 2),
                "readmission_risk": round(readmission_risk, 2),
                "length_of_stay_prediction": los_days,
                "risk_factors": risk_factors,
                "timestamp": datetime.now(),
            }
            
            # Replace existing risk score or insert new
            risk_scores_collection().replace_one(
                {"patient_id": patient_id},
                risk_doc,
                upsert=True
            )
            logger.info(f"Risk score calculated for patient {patient_id}: {overall_risk:.1f}")
        
        return {"status": "completed", "risk_scores_count": len(patients)}
    
    except Exception as e:
        logger.error(f"Error in predictive risk agent: {e}")
        raise


# ============ AUTONOMOUS ESCALATION AGENT ============
def run_escalation_agent():
    """Automatically escalate patients when risk thresholds are exceeded"""
    try:
        patients = list(patients_collection().find({"status": "admitted"}))
        escalations = []
        
        for patient in patients:
            patient_id = str(patient["_id"])
            
            # Check if escalation is needed
            should_escalate = False
            escalation_reason = ""
            escalation_level = ""
            severity = AlertSeverity.high
            
            # Criterion 1: High severity + not in ICU
            if patient.get("severity") == "high" and not patient.get("icu_required"):
                should_escalate = True
                escalation_reason = f"High severity ({patient.get('disease')}) without ICU support"
                escalation_level = "icu_consideration"
                severity = AlertSeverity.critical
            
            # Criterion 2: Critical risk score
            risk_score = risk_scores_collection().find_one({"patient_id": patient_id})
            if risk_score and risk_score.get("overall_risk", 0) > 85:
                should_escalate = True
                escalation_reason = f"Critical risk score: {risk_score['overall_risk']:.1f}/100"
                escalation_level = "icu_consideration"
                severity = AlertSeverity.critical
            
            # Criterion 3: High deterioration risk
            if risk_score and risk_score.get("deterioration_risk", 0) > 80:
                should_escalate = True
                escalation_reason = f"High deterioration risk: {risk_score['deterioration_risk']:.1f}%"
                escalation_level = "enhanced_monitoring"
                severity = AlertSeverity.high
            
            # Create escalation event if needed
            if should_escalate:
                # Check if escalation already pending
                existing = escalations_collection().find_one({
                    "patient_id": patient_id,
                    "status": "pending"
                })
                
                if not existing:
                    escalation_doc = {
                        "patient_id": patient_id,
                        "escalation_reason": escalation_reason,
                        "escalation_level": escalation_level,
                        "triggered_by": "autonomous_escalation_agent",
                        "severity": severity.value,
                        "timestamp": datetime.now(),
                        "status": "pending",
                    }
                    escalations_collection().insert_one(escalation_doc)
                    escalations.append(escalation_doc)
                    logger.info(f"Escalation triggered for patient {patient_id}: {escalation_reason}")
        
        return {"status": "completed", "escalations_count": len(escalations)}
    
    except Exception as e:
        logger.error(f"Error in escalation agent: {e}")
        raise


# ============ ANALYTICS SNAPSHOT AGENT ============
def generate_analytics_snapshot():
    """Generate real-time analytics snapshot"""
    try:
        patients = list(patients_collection().find({}))
        admitted = [p for p in patients if p.get("status") == "admitted"]
        critical = [p for p in admitted if p.get("severity") == "high" or p.get("icu_required")]
        
        resources = resources_collection().find_one({}) or {}
        icu_beds_total = resources.get("icu_beds", 0)
        icu_occupied = len([p for p in admitted if p.get("icu_required")])
        doctors = resources.get("doctors_available", 0)
        
        alerts = alerts_collection().count_documents({"resolved": False})
        recommendations = recommendations_collection().count_documents({"implemented": False})
        escalations = escalations_collection().count_documents({"status": "pending"})
        
        # Calculate average risk
        risk_scores = list(risk_scores_collection().find({}))
        avg_risk = sum(r.get("overall_risk", 0) for r in risk_scores) / len(risk_scores) if risk_scores else 0
        
        now = datetime.now()
        snapshot = {
            "timestamp": now,
            "total_patients": len(patients),
            "admitted_patients": len(admitted),
            "critical_patients": len(critical),
            "icu_occupied": icu_occupied,
            "icu_available": max(0, icu_beds_total - icu_occupied),
            "doctors_available": doctors,
            "average_risk_score": round(avg_risk, 2),
            "pending_alerts": alerts,
            "pending_recommendations": recommendations,
            "escalations_today": escalations,
        }
        
        analytics_collection().insert_one(snapshot)
        logger.info("Analytics snapshot generated")
        
        # Return JSON-serializable version
        return {
            "timestamp": now.isoformat(),
            "total_patients": len(patients),
            "admitted_patients": len(admitted),
            "critical_patients": len(critical),
            "icu_occupied": icu_occupied,
            "icu_available": max(0, icu_beds_total - icu_occupied),
            "doctors_available": doctors,
            "average_risk_score": round(avg_risk, 2),
            "pending_alerts": alerts,
            "pending_recommendations": recommendations,
            "escalations_today": escalations,
        }
    
    except Exception as e:
        logger.error(f"Error generating analytics snapshot: {e}")
        raise


# ============ RUN ALL AGENTS ============
def run_all_agents():
    """Run all agents sequentially"""
    try:
        logger.info("Starting agent suite execution...")
        
        results = {}
        
        # Run monitoring first
        results["patient_monitoring"] = run_patient_monitoring_agent()
        
        # Run clinical support
        results["clinical_support"] = run_clinical_support_agent()
        
        # Run resource optimization
        results["resource_optimization"] = run_resource_optimization_agent()
        
        # Run predictive risk
        results["predictive_risk"] = run_predictive_risk_agent()
        
        # Run escalation
        results["escalation"] = run_escalation_agent()
        
        # Generate analytics
        results["analytics"] = generate_analytics_snapshot()
        
        logger.info("All agents completed successfully")
        # Convert ObjectId to strings for JSON serialization
        return convert_objectid_to_str(results)
    
    except Exception as e:
        logger.error(f"Error running agent suite: {e}")
        raise


# ============ HELPER FUNCTIONS ============
def get_recent_alerts(limit: int = 10):
    """Get recent unresolved alerts"""
    alerts = list(
        alerts_collection()
        .find({"resolved": False})
        .sort("timestamp", -1)
        .limit(limit)
    )
    return [AlertInDB(**alert) for alert in alerts]


def get_priority_recommendations(limit: int = 10):
    """Get recommendations sorted by priority"""
    recs = list(
        recommendations_collection()
        .find({"implemented": False})
        .sort("priority", -1)
        .limit(limit)
    )
    return [RecommendationInDB(**rec) for rec in recs]


def get_patient_risk_score(patient_id: str):
    """Get latest risk score for a patient"""
    risk = risk_scores_collection().find_one({"patient_id": patient_id})
    return RiskScoreInDB(**risk) if risk else None


def get_pending_escalations():
    """Get all pending escalations"""
    escalations = list(escalations_collection().find({"status": "pending"}))
    return [EscalationEventInDB(**e) for e in escalations]


def resolve_alert(alert_id: str):
    """Mark an alert as resolved"""
    alerts_collection().update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"resolved": True}}
    )
    logger.info(f"Alert {alert_id} resolved")


def implement_recommendation(rec_id: str):
    """Mark a recommendation as implemented"""
    recommendations_collection().update_one(
        {"_id": ObjectId(rec_id)},
        {"$set": {"implemented": True}}
    )
    logger.info(f"Recommendation {rec_id} marked as implemented")


def approve_escalation(escalation_id: str):
    """Approve a pending escalation"""
    escalations_collection().update_one(
        {"_id": ObjectId(escalation_id)},
        {"$set": {"status": "approved"}}
    )
    logger.info(f"Escalation {escalation_id} approved")
