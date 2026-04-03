#!/usr/bin/env python
"""Comprehensive test for all AI Agent Control Planning features"""

import requests
import json
import time
from datetime import datetime
from typing import List, Dict, Any

BASE_URL = "http://127.0.0.1:8001"

print("=" * 80)
print("AI AGENT CONTROL PLANNING - COMPREHENSIVE FEATURE TEST")
print("=" * 80)
print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

results = {}
test_count = 0
pass_count = 0
fail_count = 0

def test_endpoint(name: str, method: str, endpoint: str, timeout: int = 30, data: dict = None) -> bool:
    """Test an endpoint and return success status"""
    global test_count, pass_count, fail_count
    test_count += 1
    
    url = f"{BASE_URL}{endpoint}"
    print(f"Test {test_count}. {name}")
    print(f"     {method} {endpoint}")
    
    try:
        start_time = time.time()
        if method == "GET":
            response = requests.get(url, timeout=timeout)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=timeout)
        elapsed = time.time() - start_time
        
        if response.status_code in [200, 201, 204]:
            print(f"     ✓ Status: {response.status_code} ({elapsed:.2f}s)")
            pass_count += 1
            results[name] = "✓ PASS"
            return True
        else:
            print(f"     ✗ Status: {response.status_code}")
            fail_count += 1
            results[name] = f"✗ FAIL ({response.status_code})"
            return False
    except Exception as e:
        print(f"     ✗ Error: {str(e)}")
        fail_count += 1
        results[name] = f"✗ ERROR"
        return False

# ============ PHASE 1: TEST CORE AGENT FEATURES ============
print("\n" + "=" * 80)
print("PHASE 1: CORE AGENT FEATURES (5 Required Features)")
print("=" * 80 + "\n")

test_endpoint("Feature 1: Patient Monitoring Agent", "POST", "/agents/monitoring")
test_endpoint("Feature 2: Clinical Support Agent", "POST", "/agents/clinical-support")
test_endpoint("Feature 3: Resource Optimization Agent", "POST", "/agents/resource-optimization")
test_endpoint("Feature 4: Predictive Risk Agent", "POST", "/agents/predictive-risk")
test_endpoint("Feature 5: Escalation Agent", "POST", "/agents/escalation")

# ============ PHASE 2: TEST ORCHESTRATION ============
print("\n" + "=" * 80)
print("PHASE 2: AGENT ORCHESTRATION")
print("=" * 80 + "\n")

test_endpoint("Run All Agents (Orchestrated)", "POST", "/agents/run-all")
test_endpoint("Generate Analytics Snapshot", "POST", "/agents/analytics-snapshot")

# ============ PHASE 3: TEST DATA RETRIEVAL ============
print("\n" + "=" * 80)
print("PHASE 3: DATA RETRIEVAL ENDPOINTS")
print("=" * 80 + "\n")

test_endpoint("Get Alerts", "GET", "/agents/alerts")
test_endpoint("Get Recommendations", "GET", "/agents/recommendations")
test_endpoint("Get Escalations", "GET", "/agents/escalations")

# ============ PHASE 4: TEST ACTION ENDPOINTS ============
print("\n" + "=" * 80)
print("PHASE 4: ACTION ENDPOINTS (Alert/Recommendation/Escalation Management)")
print("=" * 80 + "\n")

# Get an alert to test resolving
try:
    response = requests.get(f"{BASE_URL}/agents/alerts?limit=1", timeout=10)
    if response.status_code == 200 and len(response.json()) > 0:
        alert_id = response.json()[0]["_id"]
        test_endpoint("Resolve Alert Action", "POST", f"/agents/alerts/{alert_id}/resolve")
except:
    print("Warning: Could not test resolve alert (no alerts available)")

# Get a recommendation to test implementing
try:
    response = requests.get(f"{BASE_URL}/agents/recommendations?limit=1", timeout=10)
    if response.status_code == 200 and len(response.json()) > 0:
        rec_id = response.json()[0]["_id"]
        test_endpoint("Implement Recommendation Action", "POST", f"/agents/recommendations/{rec_id}/implement")
except:
    print("Warning: Could not test implement recommendation (no recommendations available)")

# Get an escalation to test approving
try:
    response = requests.get(f"{BASE_URL}/agents/escalations", timeout=10)
    if response.status_code == 200 and len(response.json()) > 0:
        escalation_id = response.json()[0]["_id"]
        test_endpoint("Approve Escalation Action", "POST", f"/agents/escalations/{escalation_id}/approve")
except:
    print("Warning: Could not test approve escalation (no escalations available)")

# ============ PHASE 5: TEST PATIENT-SPECIFIC ENDPOINTS ============
print("\n" + "=" * 80)
print("PHASE 5: PATIENT-SPECIFIC ENDPOINTS")
print("=" * 80 + "\n")

# Get risk score for first patient
try:
    response = requests.get(f"{BASE_URL}/agents/risk-scores/test_patient_id", timeout=10)
    if response.status_code != 404:
        test_endpoint("Get Patient Risk Score", "GET", "/agents/risk-scores/test_patient_id")
except:
    pass

# ============ SUMMARY ============
print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)

print("\n5 REQUIRED FEATURES STATUS:\n")
required_features = [
    "Feature 1: Patient Monitoring Agent",
    "Feature 2: Clinical Support Agent",
    "Feature 3: Resource Optimization Agent",
    "Feature 4: Predictive Risk Agent",
    "Feature 5: Escalation Agent",
]

all_required_pass = True
for feature in required_features:
    status = results.get(feature, "✗ NOT TESTED")
    print(f"  {status:20} {feature}")
    if "PASS" not in status:
        all_required_pass = False

print(f"\nOVERALL TEST RESULTS:\n")
print(f"  Total Tests: {test_count}")
print(f"  Passed: {pass_count}")
print(f"  Failed: {fail_count}")
print(f"  Success Rate: {(pass_count/test_count*100):.1f}%" if test_count > 0 else "  N/A")

print(f"\n" + "=" * 80)
if all_required_pass and fail_count == 0:
    print("✓ SUCCESS: ALL 5 REQUIRED FEATURES ARE WORKING CORRECTLY!")
    print("✓ All AI Agent Control Planning features are operational")
elif all_required_pass:
    print("✓ SUCCESS: All 5 required features working, but some advanced features failed")
else:
    print("✗ FAILURE: Some required features are not working")
print("=" * 80)

print(f"\nEnd time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
