from datetime import datetime
from typing import Any

try:
    from backend.database.collections import analysis_history_collection
except ModuleNotFoundError:
    from database.collections import analysis_history_collection


def list_analysis_history(limit: int = 50) -> list[dict[str, Any]]:
    docs = list(
        analysis_history_collection()
        .find({})
        .sort("timestamp", -1)
        .limit(limit)
    )
    response: list[dict[str, Any]] = []
    for doc in docs:
        timestamp = doc.get("timestamp")
        if isinstance(timestamp, datetime):
            timestamp_iso = timestamp.isoformat()
        else:
            timestamp_iso = datetime.utcnow().isoformat()
        response.append(
            {
                "id": str(doc.get("_id", "")),
                "timestamp": timestamp_iso,
                "result": doc.get("result", {}),
            }
        )
    return response
