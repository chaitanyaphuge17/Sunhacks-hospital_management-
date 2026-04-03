from fastapi import APIRouter, HTTPException, status

try:
    from backend.models.resource import ResourceCreate, ResourceInDB
    from backend.services.resource_service import get_resources, upsert_resources
except ModuleNotFoundError:
    from models.resource import ResourceCreate, ResourceInDB
    from services.resource_service import get_resources, upsert_resources

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("", response_model=ResourceInDB)
def get_resources_endpoint() -> ResourceInDB:
    resources = get_resources()
    if not resources:
        raise HTTPException(status_code=404, detail="Resources not configured")
    return resources


@router.post("", response_model=ResourceInDB, status_code=status.HTTP_201_CREATED)
def create_or_update_resources_endpoint(payload: ResourceCreate) -> ResourceInDB:
    return upsert_resources(payload)
