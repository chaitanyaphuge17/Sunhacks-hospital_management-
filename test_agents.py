#!/usr/bin/env python
"""Test all AI Agent Control Planning features"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8001"

print("=" * 70)
print("AI AGENT CONTROL PLANNING - FEATURE TEST")
print("=" * 70)
print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# Test data
agents = {
    "1. Monitoring": "/agents/monitoring",
    "2. Clinical Support": "/agents/clinical-support",
    "3. Resource Optimization": "/agents/resource-optimization",
    "4. Predictive Risk": "/agents/predictive-risk",
    "5. Escalation": "/agents/escalation",
}

results = {}

# Test each agent individually
print("Testing individual agents...\n")
for agent_name, endpoint in agents.items():
    url = f"{BASE_URL}{endpoint}"
    print(f"Testing {agent_name}")
    print(f"  Endpoint: {endpoint}")
    try:
        start_time = time.time()
        response = requests.post(url, timeout=30)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✓ Status: {response.status_code} (Success)")
            print(f"  ✓ Response time: {elapsed:.2f}s")
            if "data" in data:
                print(f"  ✓ Data: {json.dumps(data['data'], indent=4)}")
            print()
            results[agent_name] = {"status": "✓ PASS", "code": 200, "time": elapsed}
        else:
            print(f"  ✗ Status: {response.status_code} (Failed)")
            print(f"  ✗ Error: {response.text}")
            print()
            results[agent_name] = {"status": "✗ FAIL", "code": response.status_code}
    except requests.exceptions.Timeout:
        print(f"  ✗ Timeout after 30 seconds")
        print()
        results[agent_name] = {"status": "✗ TIMEOUT"}
    except Exception as e:
        print(f"  ✗ Exception: {str(e)}")
        print()
        results[agent_name] = {"status": "✗ ERROR", "error": str(e)}

# Test run-all agents endpoint
print("\nTesting Run All Agents endpoint...\n")
print("Testing: Run All Agents")
print("  Endpoint: /agents/run-all")
try:
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/agents/run-all", timeout=60)
    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        print(f"  ✓ Status: {response.status_code} (Success)")
        print(f"  ✓ Response time: {elapsed:.2f}s")
        if "results" in data:
            print(f"  ✓ Agents executed:")
            for agent, result in data["results"].items():
                print(f"     - {agent}: {result}")
        print()
        results["Run All Agents"] = {"status": "✓ PASS", "code": 200, "time": elapsed}
    else:
        print(f"  ✗ Status: {response.status_code} (Failed)")
        print(f"  ✗ Error: {response.text}")
        print()
        results["Run All Agents"] = {"status": "✗ FAIL", "code": response.status_code}
except requests.exceptions.Timeout:
    print(f"  ✗ Timeout after 60 seconds")
    print()
    results["Run All Agents"] = {"status": "✗ TIMEOUT"}
except Exception as e:
    print(f"  ✗ Exception: {str(e)}")
    print()
    results["Run All Agents"] = {"status": "✗ ERROR", "error": str(e)}

# Test Alert endpoints
print("\nTesting Alert Management endpoints...\n")
alert_endpoints = {
    "Get Alerts": "/agents/alerts",
}

for ep_name, endpoint in alert_endpoints.items():
    url = f"{BASE_URL}{endpoint}"
    print(f"Testing {ep_name}")
    print(f"  Endpoint: {endpoint}")
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else 1
            print(f"  ✓ Status: {response.status_code}")
            print(f"  ✓ Records: {count}")
            print()
            results[ep_name] = {"status": "✓ PASS", "code": 200}
        else:
            print(f"  ✗ Status: {response.status_code}")
            print(f"  ✗ Error: {response.text}")
            print()
            results[ep_name] = {"status": "✗ FAIL", "code": response.status_code}
    except Exception as e:
        print(f"  ✗ Exception: {str(e)}")
        print()
        results[ep_name] = {"status": "✗ ERROR", "error": str(e)}

# Test Recommendations endpoints
print("Testing Recommendation Management endpoints...\n")
rec_endpoints = {
    "Get Recommendations": "/agents/recommendations",
}

for ep_name, endpoint in rec_endpoints.items():
    url = f"{BASE_URL}{endpoint}"
    print(f"Testing {ep_name}")
    print(f"  Endpoint: {endpoint}")
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = len(data) if isinstance(data, list) else 1
            print(f"  ✓ Status: {response.status_code}")
            print(f"  ✓ Records: {count}")
            print()
            results[ep_name] = {"status": "✓ PASS", "code": 200}
        else:
            print(f"  ✗ Status: {response.status_code}")
            print(f"  ✗ Error: {response.text}")
            print()
            results[ep_name] = {"status": "✗ FAIL", "code": response.status_code}
    except Exception as e:
        print(f"  ✗ Exception: {str(e)}")
        print()
        results[ep_name] = {"status": "✗ ERROR", "error": str(e)}

# Print summary
print("\n" + "=" * 70)
print("TEST SUMMARY")
print("=" * 70)

passed = sum(1 for r in results.values() if "PASS" in r.get("status", ""))
failed = sum(1 for r in results.values() if "FAIL" in r.get("status", ""))
errors = sum(1 for r in results.values() if "ERROR" in r.get("status", ""))

print("\nResults by feature:\n")
for feature, result in results.items():
    status_symbol = "✓" if "PASS" in result.get("status", "") else "✗"
    print(f"{status_symbol} {feature}: {result.get('status', 'UNKNOWN')}")

print(f"\nTotal: {len(results)} tests")
print(f"  Passed: {passed}")
print(f"  Failed: {failed}")
print(f"  Errors: {errors}")

if failed == 0 and errors == 0:
    print("\n✓ ALL TESTS PASSED!")
else:
    print(f"\n✗ {failed + errors} TEST(S) FAILED - REVIEW OUTPUT ABOVE")

print(f"\nEnd time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 70)
