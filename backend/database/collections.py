from pymongo.collection import Collection

try:
    from backend.database.mongo import get_database
except ModuleNotFoundError:
    from database.mongo import get_database


def patients_collection() -> Collection:
    return get_database()["patients"]


def resources_collection() -> Collection:
    return get_database()["resources"]


def analysis_history_collection() -> Collection:
    return get_database()["analysis_history"]


def alerts_collection() -> Collection:
    return get_database()["alerts"]


def recommendations_collection() -> Collection:
    return get_database()["recommendations"]


def risk_scores_collection() -> Collection:
    return get_database()["risk_scores"]


def escalations_collection() -> Collection:
    return get_database()["escalations"]


def analytics_collection() -> Collection:
    return get_database()["analytics_snapshots"]
