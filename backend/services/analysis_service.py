import json
import logging
from datetime import datetime

from fastapi import HTTPException
from pydantic import ValidationError

try:
    from backend.agents.prompts import REPAIR_PROMPT
    from backend.agents.workflow import build_workflow
    from backend.core.config import get_settings
    from backend.database.collections import analysis_history_collection
    from backend.models.analysis import AnalyzeResult
except ModuleNotFoundError:
    from agents.prompts import REPAIR_PROMPT
    from agents.workflow import build_workflow
    from core.config import get_settings
    from database.collections import analysis_history_collection
    from models.analysis import AnalyzeResult

logger = logging.getLogger(__name__)
_compiled_workflow = None


def _extract_json(raw_output: str) -> dict:
    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


def _repair_output(raw_output: str) -> str:
    from langchain_groq import ChatGroq

    settings = get_settings()
    llm = ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, temperature=0)
    prompt = f"{REPAIR_PROMPT}\n\nPrevious output:\n{raw_output}"
    result = llm.invoke(prompt)
    content = getattr(result, "content", "")
    return content if isinstance(content, str) else str(content)


def run_analysis() -> AnalyzeResult:
    global _compiled_workflow
    if _compiled_workflow is None:
        _compiled_workflow = build_workflow()

    final_state = _compiled_workflow.invoke({})
    raw_output = final_state.get("llm_output", "").strip()
    if not raw_output:
        raise HTTPException(status_code=502, detail="Groq returned empty output")

    try:
        parsed = _extract_json(raw_output)
        result = AnalyzeResult.model_validate(parsed)
    except (json.JSONDecodeError, ValidationError) as first_error:
        logger.warning("Initial Groq output invalid, running one repair attempt: %s", first_error)
        repaired_output = _repair_output(raw_output)
        try:
            parsed = _extract_json(repaired_output)
            result = AnalyzeResult.model_validate(parsed)
        except (json.JSONDecodeError, ValidationError) as second_error:
            logger.exception("Groq output validation failed after repair: %s", second_error)
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "Failed to produce valid structured analysis JSON",
                    "raw_output": repaired_output,
                },
            ) from second_error

    analysis_history_collection().insert_one(
        {
            "timestamp": datetime.utcnow(),
            "result": result.model_dump(),
        }
    )
    return result
