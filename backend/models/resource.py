from pydantic import BaseModel

try:
    from backend.models.common import MongoEntity
except ModuleNotFoundError:
    from models.common import MongoEntity


class ResourceBase(BaseModel):
    icu_beds: int
    doctors_available: int


class ResourceCreate(ResourceBase):
    pass


class ResourceInDB(MongoEntity, ResourceBase):
    pass
