from pymongo import MongoClient
from pymongo.errors import InvalidURI
from pymongo.database import Database

try:
    from backend.core.config import get_settings
except ModuleNotFoundError:
    from core.config import get_settings

_client: MongoClient | None = None


def connect_mongo() -> MongoClient:
    global _client
    if _client is None:
        settings = get_settings()
        mongodb_uri = settings.mongodb_uri.strip()
        if not (mongodb_uri.startswith("mongodb://") or mongodb_uri.startswith("mongodb+srv://")):
            raise RuntimeError(
                "Invalid MONGODB_URI. It must start with 'mongodb://' or 'mongodb+srv://'."
            )
        try:
            _client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        except InvalidURI as exc:
            raise RuntimeError(f"Invalid MONGODB_URI: {exc}") from exc
    return _client


def get_database() -> Database:
    settings = get_settings()
    client = connect_mongo()
    return client[settings.mongodb_db_name]


def close_mongo() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
