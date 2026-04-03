from bson import ObjectId
import logging

try:
    from backend.database.collections import patients_collection
    from backend.models.patient import PatientCreate, PatientInDB, PatientUpdate
except ModuleNotFoundError:
    from database.collections import patients_collection
    from models.patient import PatientCreate, PatientInDB, PatientUpdate

logger = logging.getLogger(__name__)


def create_patient(payload: PatientCreate) -> PatientInDB:
    data = payload.model_dump()
    result = patients_collection().insert_one(data)
    data["_id"] = result.inserted_id
    return PatientInDB(**data)


def list_patients() -> list[PatientInDB]:
    try:
        docs = list(patients_collection().find({}))
        patients = []
        for doc in docs:
            try:
                patient = PatientInDB(**doc)
                patients.append(patient)
            except Exception as e:
                logger.error(f"Error converting patient doc {doc.get('_id')}: {e}")
                raise
        return patients
    except Exception as e:
        logger.error(f"Error listing patients: {e}")
        raise


def update_patient(patient_id: str, payload: PatientUpdate) -> PatientInDB | None:
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        existing = patients_collection().find_one({"_id": ObjectId(patient_id)})
        return PatientInDB(**existing) if existing else None

    patients_collection().update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": update_data},
    )
    updated = patients_collection().find_one({"_id": ObjectId(patient_id)})
    return PatientInDB(**updated) if updated else None


def delete_patient(patient_id: str) -> bool:
    result = patients_collection().delete_one({"_id": ObjectId(patient_id)})
    return result.deleted_count > 0
