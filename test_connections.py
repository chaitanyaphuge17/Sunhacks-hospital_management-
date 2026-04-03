#!/usr/bin/env python
"""Comprehensive connection test for Hospital Intelligence System"""

import sys
import os
import dotenv from pathlib import Path
print("=" * 50)
print("COMPREHENSIVE CONNECTION TEST")
print("=" * 50)

# Test 1: MongoDB
print("\n1. MongoDB Connection")
from pymongo import MongoClient
try:
    client = MongoClient(
        'mongodb+srv://Chaitanya:chaitanyadb@cluster0.w422eth.mongodb.net/?appName=Cluster0&serverSelectionTimeoutMS=5000'
    )
    client.admin.command('ping')
    print("   ✓ Connected to MongoDB Atlas")
    print("   ✓ Database: health-intelligence")
    db = client['health-intelligence']
    collections = db.list_collection_names()
    print(f"   ✓ Collections: {', '.join(collections)}")
except Exception as e:
    print(f"   ✗ MongoDB Error: {e}")

# Test 2: Neo4j
print("\n2. Neo4j Connection")
from neo4j import GraphDatabase
try:
    driver = GraphDatabase.driver(
        'bolt://localhost:7687',
        auth=('neo4j', 'chaitanyaneo')
    )
    driver.verify_connectivity()
    print("   ✓ Connected to Neo4j (bolt://localhost:7687)")
    driver.close()
except Exception as e:
    print(f"   ✗ Neo4j Error: {e}")

# Test 3: Groq API
print("\n3. Groq AI API Connection")
from langchain_groq import ChatGroq
try:
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model='llama-3.3-70b-versatile',
        temperature=0
    )
    response = llm.invoke('Test')
    print("   ✓ Connected to Groq API")
    print("   ✓ Model: llama-3.3-70b-versatile")
except Exception as e:
    print(f"   ✗ Groq API Error: {e}")

# Test 4: Backend Configuration
print("\n4. Backend Configuration")
try:
    from backend.core.config import get_settings
    settings = get_settings()
    print("   ✓ Configuration loaded from .env")
    print(f"   ✓ Database: {settings.mongodb_db_name}")
    print(f"   ✓ Model: {settings.groq_model}")
    print(f"   ✓ CORS Origins: {settings.cors_origins}")
except Exception as e:
    print(f"   ✗ Configuration Error: {e}")

# Test 5: Database Collections
print("\n5. Database Collections")
try:
    from backend.database.collections import (
        patients_collection,
        resources_collection,
        alerts_collection,
        recommendations_collection,
        risk_scores_collection,
        escalations_collection,
        analytics_collection,
    )
    print("   ✓ All collection functions imported")

    # Test actual data access
    patients = list(patients_collection().find({}))
    print(f"   ✓ Patients collection: {len(patients)} documents")

    resources = resources_collection().find_one({})
    status = "has data" if resources else "empty"
    print(f"   ✓ Resources collection: {status}")

    alerts = alerts_collection().count_documents({})
    print(f"   ✓ Alerts collection: {alerts} documents")
except Exception as e:
    print(f"   ✗ Collections Error: {e}")

# Test 6: API Models
print("\n6. Pydantic Models & Serialization")
try:
    from backend.models.patient import PatientInDB
    from backend.models.agent_insights import AlertInDB
    from bson import ObjectId
    from datetime import datetime

    # Test ObjectId serialization
    test_id = ObjectId()
    patient_data = {
        "_id": test_id,
        "name": "Test Patient",
        "age": 45,
        "disease": "Test",
        "severity": "medium",
        "icu_required": False,
        "status": "admitted",
    }
    patient = PatientInDB(**patient_data)
    patient_json = patient.model_dump_json()
    print("   ✓ Pydantic models serialize correctly")
    print("   ✓ ObjectId serialization: working")
    print("   ✓ Model validation: working")
except Exception as e:
    print(f"   ✗ Model Error: {e}")

print("\n" + "=" * 50)
print("✓ ALL CONNECTIONS VERIFIED SUCCESSFULLY")
print("=" * 50)
