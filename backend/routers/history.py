from typing import Any

from fastapi import APIRouter, Query

try:
    from backend.services.history_service import list_analysis_history
except ModuleNotFoundError:
    from services.history_service import list_analysis_history

router = APIRouter(prefix="/analysis-history", tags=["history"])


@router.get("", response_model=list[dict[str, Any]])
def get_analysis_history(limit: int = Query(default=50, ge=1, le=500)) -> list[dict[str, Any]]:
    return list_analysis_history(limit=limit)
