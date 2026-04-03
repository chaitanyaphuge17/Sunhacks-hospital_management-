from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
import logging

try:
    from backend.models.patient import PatientCreate, PatientInDB, PatientUpdate
    from backend.services.patient_service import create_patient, delete_patient, list_patients, update_patient
except ModuleNotFoundError:
    from models.patient import PatientCreate, PatientInDB, PatientUpdate
    from services.patient_service import create_patient, delete_patient, list_patients, update_patient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/patients", tags=["patients"])


@router.post("", response_model=PatientInDB, status_code=status.HTTP_201_CREATED)
def create_patient_endpoint(payload: PatientCreate) -> PatientInDB:
    try:
        return create_patient(payload)
    except Exception as e:
        logger.exception("Error creating patient")
        raise HTTPException(status_code=500, detail=f"Error creating patient: {str(e)}")


@router.get("", response_model=list[PatientInDB])
def list_patients_endpoint() -> list[PatientInDB]:
    try:
        return list_patients()
    except Exception as e:
        logger.exception("Error listing patients")
        raise HTTPException(status_code=500, detail=f"Error listing patients: {str(e)}")


@router.put("/{patient_id}", response_model=PatientInDB)
def update_patient_endpoint(patient_id: str, payload: PatientUpdate) -> PatientInDB:
    try:
        if not ObjectId.is_valid(patient_id):
            raise HTTPException(status_code=400, detail="Invalid patient id")
        updated = update_patient(patient_id, payload)
        if not updated:
            raise HTTPException(status_code=404, detail="Patient not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error updating patient")
        raise HTTPException(status_code=500, detail=f"Error updating patient: {str(e)}")


@router.post("/{patient_id}/discharge", response_model=PatientInDB)
def discharge_patient_endpoint(patient_id: str) -> PatientInDB:
    try:
        if not ObjectId.is_valid(patient_id):
            raise HTTPException(status_code=400, detail="Invalid patient id")
        updated = update_patient(patient_id, PatientUpdate(status="discharged"))
        if not updated:
            raise HTTPException(status_code=404, detail="Patient not found")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error discharging patient")
        raise HTTPException(status_code=500, detail=f"Error discharging patient: {str(e)}")


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient_endpoint(patient_id: str) -> None:
    try:
        if not ObjectId.is_valid(patient_id):
            raise HTTPException(status_code=400, detail="Invalid patient id")
        deleted = delete_patient(patient_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Patient not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error deleting patient")
        raise HTTPException(status_code=500, detail=f"Error deleting patient: {str(e)}")
