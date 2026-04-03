from fastapi import APIRouter

try:
    from backend.models.analysis import AnalyzeResult
    from backend.services.analysis_service import run_analysis
except ModuleNotFoundError:
    from models.analysis import AnalyzeResult
    from services.analysis_service import run_analysis

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("", response_model=AnalyzeResult)
def analyze_endpoint() -> AnalyzeResult:
    return run_analysis()
