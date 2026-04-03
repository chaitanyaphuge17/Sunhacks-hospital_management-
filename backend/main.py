import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from backend.core.config import get_settings
    from backend.core.logging import setup_logging
    from backend.database.mongo import close_mongo
    from backend.database.neo4j_db import close_neo4j
    from backend.routers.analyze import router as analyze_router
    from backend.routers.history import router as history_router
    from backend.routers.patients import router as patients_router
    from backend.routers.resources import router as resources_router
    from backend.routers.agents import router as agents_router
except ModuleNotFoundError:
    from core.config import get_settings
    from core.logging import setup_logging
    from database.mongo import close_mongo
    from database.neo4j_db import close_neo4j
    from routers.analyze import router as analyze_router
    from routers.history import router as history_router
    from routers.patients import router as patients_router
    from routers.resources import router as resources_router
    from routers.agents import router as agents_router

settings = get_settings()
setup_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Application startup complete")
    yield
    close_mongo()
    close_neo4j()
    logger.info("Database clients disconnected")


app = FastAPI(
    title="Autonomous Hospital Decision Intelligence System",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS - MUST be added before routes
cors_origins = settings.cors_origins_list
logger.info(f"CORS Origins configured: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Include all routers
app.include_router(patients_router, tags=["patients"])
app.include_router(resources_router, tags=["resources"])
app.include_router(analyze_router, tags=["analyze"])
app.include_router(history_router, tags=["history"])
app.include_router(agents_router, tags=["agents"])


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Autonomous Hospital Decision Intelligence API"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    """Handle CORS preflight requests"""
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"message": "Validation error", "errors": exc.errors()},
    )


@app.exception_handler(RuntimeError)
async def runtime_exception_handler(_request: Request, exc: RuntimeError):
    logger.error("Runtime configuration/dependency error: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"message": str(exc)},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )
