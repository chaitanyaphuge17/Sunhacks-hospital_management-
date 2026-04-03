import requests
import json

try:
    print("Testing API endpoint...")
    resp = requests.get('http://127.0.0.1:8000/patients', timeout=5)
    print(f"Status Code: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"Number of patients: {len(data)}")
        if data:
            print(f"First patient: {json.dumps(data[0], indent=2)}")
    else:
        print(f"Error: {resp.text}")
        
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
