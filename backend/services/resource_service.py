try:
    from backend.database.collections import resources_collection
    from backend.models.resource import ResourceCreate, ResourceInDB
except ModuleNotFoundError:
    from database.collections import resources_collection
    from models.resource import ResourceCreate, ResourceInDB


def upsert_resources(payload: ResourceCreate) -> ResourceInDB:
    data = payload.model_dump()
    coll = resources_collection()
    existing = coll.find_one({})

    if existing:
        coll.update_one({"_id": existing["_id"]}, {"$set": data})
        existing.update(data)
        return ResourceInDB(**existing)

    result = coll.insert_one(data)
    data["_id"] = result.inserted_id
    return ResourceInDB(**data)


def get_resources() -> ResourceInDB | None:
    existing = resources_collection().find_one({})
    return ResourceInDB(**existing) if existing else None
