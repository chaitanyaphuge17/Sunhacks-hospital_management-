from neo4j import Driver, GraphDatabase

try:
    from backend.core.config import get_settings
except ModuleNotFoundError:
    from core.config import get_settings

_driver: Driver | None = None


def connect_neo4j() -> Driver:
    global _driver
    if _driver is None:
        settings = get_settings()
        neo4j_uri = settings.neo4j_uri.strip()
        if not (
            neo4j_uri.startswith("bolt://")
            or neo4j_uri.startswith("neo4j://")
            or neo4j_uri.startswith("neo4j+s://")
        ):
            raise RuntimeError(
                "Invalid NEO4J_URI. Use one of: bolt://, neo4j://, or neo4j+s://"
            )
        _driver = GraphDatabase.driver(
            neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
    return _driver


def close_neo4j() -> None:
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None
