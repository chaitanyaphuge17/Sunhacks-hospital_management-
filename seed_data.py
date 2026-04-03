"""
Seed script to populate database with sample patient data
Run once: python seed_data.py
"""

import sys
import os
from datetime import datetime

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from backend.database.collections import patients_collection, resources_collection
    from backend.models.patient import PatientCreate
except ModuleNotFoundError:
    from database.collections import patients_collection, resources_collection
    from models.patient import PatientCreate

def seed_patients():
    """Seed sample patient data"""
    sample_patients = [
        {
            "name": "Rajesh Kumar",
            "age": 45,
            "disease": "Pneumonia",
            "severity": "high",
            "icu_required": True,
            "status": "admitted",
            "vital_signs": {
                "heart_rate": 95,
                "blood_pressure": "140/90",
                "temperature": 38.5,
                "oxygen_level": 88
            },
            "admission_date": datetime.now().isoformat()
        },
        {
            "name": "Priya Singh",
            "age": 38,
            "disease": "COVID-19",
            "severity": "medium",
            "icu_required": False,
            "status": "admitted",
            "vital_signs": {
                "heart_rate": 80,
                "blood_pressure": "130/85",
                "temperature": 37.2,
                "oxygen_level": 94
            },
            "admission_date": datetime.now().isoformat()
        },
        {
            "name": "Amit Patel",
            "age": 52,
            "disease": "Heart Disease",
            "severity": "high",
            "icu_required": True,
            "status": "admitted",
            "vital_signs": {
                "heart_rate": 105,
                "blood_pressure": "160/95",
                "temperature": 37.0,
                "oxygen_level": 92
            },
            "admission_date": datetime.now().isoformat()
        },
        {
            "name": "Deepa Nair",
            "age": 41,
            "disease": "Diabetes Complications",
            "severity": "low",
            "icu_required": False,
            "status": "admitted",
            "vital_signs": {
                "heart_rate": 72,
                "blood_pressure": "125/80",
                "temperature": 36.8,
                "oxygen_level": 97
            },
            "admission_date": datetime.now().isoformat()
        },
        {
            "name": "Suresh Reddy",
            "age": 58,
            "disease": "Stroke Recovery",
            "severity": "high",
            "icu_required": True,
            "status": "admitted",
            "vital_signs": {
                "heart_rate": 88,
                "blood_pressure": "145/92",
                "temperature": 37.1,
                "oxygen_level": 95
            },
            "admission_date": datetime.now().isoformat()
        },
    ]

    # Insert patients
    result = patients_collection().insert_many(sample_patients)
    print(f"✓ Inserted {len(result.inserted_ids)} sample patients")
    for i, patient in enumerate(sample_patients):
        print(f"  {i+1}. {patient['name']} - {patient['disease']} ({patient['severity']})")

def seed_resources():
    """Seed sample resource data"""
    sample_resources = {
        "icu_beds": {
            "available": 5,
            "total": 10,
            "occupied": 5,
            "last_updated": datetime.now().isoformat()
        },
        "doctors": {
            "available": 8,
            "total": 15,
            "on_duty": 8,
            "last_updated": datetime.now().isoformat()
        },
        "nurses": {
            "available": 12,
            "total": 20,
            "on_duty": 12,
            "last_updated": datetime.now().isoformat()
        },
        "ventilators": {
            "available": 3,
            "total": 8,
            "in_use": 5,
            "last_updated": datetime.now().isoformat()
        },
        "oxygen_supply": {
            "available_cylinders": 25,
            "total_cylinders": 50,
            "percentage": 50,
            "last_updated": datetime.now().isoformat()
        }
    }

    # Insert or update resources
    resources_collection().replace_one(
        {"_id": "hospital_resources"},
        {**sample_resources, "_id": "hospital_resources"},
        upsert=True
    )
    print(f"\n✓ Updated hospital resources")
    print(f"  - ICU Beds: {sample_resources['icu_beds']['available']}/{sample_resources['icu_beds']['total']}")
    print(f"  - Doctors: {sample_resources['doctors']['available']}/{sample_resources['doctors']['total']}")
    print(f"  - Nurses: {sample_resources['nurses']['available']}/{sample_resources['nurses']['total']}")
    print(f"  - Ventilators: {sample_resources['ventilators']['available']}/{sample_resources['ventilators']['total']}")

if __name__ == "__main__":
    try:
        print("🏥 Seeding Hospital Database...")
        print("=" * 50)
        
        # Check if data already exists
        existing_count = patients_collection().count_documents({})
        if existing_count > 0:
            print(f"⚠ Database already contains {existing_count} patients")
            response = input("Do you want to clear and reseed? (y/n): ")
            if response.lower() == 'y':
                patients_collection().delete_many({})
                print("✓ Cleared existing patients")
            else:
                print("Skipping seed operation")
                sys.exit(0)
        
        seed_patients()
        seed_resources()
        
        print("=" * 50)
        print("✓ Database seeding complete!")
        print("\nYou can now:")
        print("1. Login to frontend: admin@hospital.com / Admin@123")
        print("2. Navigate to Patients page to see the sample data")
        print("3. Run analysis to see AI agents in action")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
