from pymongo import MongoClient

try:
    print('Connecting to MongoDB Atlas...')
    client = MongoClient('mongodb+srv://Chaitanya:chaitanyadb@cluster0.w422eth.mongodb.net/?appName=Cluster0&serverSelectionTimeoutMS=5000')
    db = client['health-intelligence']
    
    # Try to ping the server
    client.admin.command('ping')
    print('✓ MongoDB connection successful!')
    
    # Check if data exists
    patients_collection = db['patients']
    patient = patients_collection.find_one()
    if patient:
        print(f'✓ Found patient data: {patient.get("name", "Unknown")}')
    else:
        print('⚠ No patient data found')
        
except Exception as e:
    print(f'✗ Error: {type(e).__name__}: {e}')
