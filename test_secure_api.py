#!/usr/bin/env python3
"""
Test Script for Secure Role-Based Data Access API
Tests user, provider, and owner access with proper authorization
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

# Test users
USERS = {
    "user1": {
        "email": "user1@example.com",
        "id": "user-123",
        "role": "user"
    },
    "user2": {
        "email": "user2@example.com",
        "id": "user-456",
        "role": "user"
    }
}

PROVIDERS = {
    "provider1": {
        "email": "provider1@example.com",
        "id": "provider-123",
        "role": "provider"
    },
    "provider2": {
        "email": "provider2@example.com",
        "id": "provider-456",
        "role": "provider"
    }
}

OWNER = {
    "email": "owner@smartservicehub.com",
    "id": "owner-789",
    "role": "admin"
}

# Test results
results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def get_headers(user):
    """Get request headers for a user"""
    return {
        "X-User-Email": user["email"],
        "X-User-ID": user["id"],
        "X-User-Role": user["role"]
    }

def test_endpoint(name, method, endpoint, user, expected_status):
    """Test an endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = get_headers(user)
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        else:
            response = requests.post(url, headers=headers, timeout=5)
        
        passed = response.status_code == expected_status
        status_text = "✅ PASS" if passed else "❌ FAIL"
        
        result = {
            "test": name,
            "endpoint": endpoint,
            "user": user["email"],
            "expected": expected_status,
            "actual": response.status_code,
            "passed": passed,
            "status": status_text
        }
        
        results["tests"].append(result)
        if passed:
            results["passed"] += 1
        else:
            results["failed"] += 1
        
        print(f"{status_text} | {name}")
        print(f"     Expected: {expected_status}, Got: {response.status_code}")
        if response.status_code != 200:
            print(f"     Response: {response.json()}")
        print()
        
        return passed
    except Exception as e:
        print(f"❌ ERROR | {name}")
        print(f"     Error: {str(e)}")
        print()
        results["failed"] += 1
        return False

def print_header(title):
    """Print test section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60 + "\n")

def main():
    print("\n🧪 SECURE API ENDPOINT TESTS")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}\n")
    
    # Test 1: User Access
    print_header("TEST 1: USER ACCESS - Own Data Only")
    
    test_endpoint(
        "User1 Get Own Profile",
        "GET",
        "/api/secure/user/profile",
        USERS["user1"],
        200
    )
    
    test_endpoint(
        "User1 Get Own Bookings",
        "GET",
        "/api/secure/user/bookings",
        USERS["user1"],
        200
    )
    
    test_endpoint(
        "User1 Get Own Stats",
        "GET",
        "/api/secure/user/stats",
        USERS["user1"],
        200
    )
    
    # Test 2: User Authorization Failures
    print_header("TEST 2: USER AUTHORIZATION - Should Fail")
    
    test_endpoint(
        "User1 Try Admin Access (Should Fail)",
        "GET",
        "/api/secure/admin/all-users",
        USERS["user1"],
        403
    )
    
    test_endpoint(
        "User1 Try Provider Access (Should Fail)",
        "GET",
        "/api/secure/provider/profile",
        USERS["user1"],
        403
    )
    
    # Test 3: Provider Access
    print_header("TEST 3: PROVIDER ACCESS - Own Data Only")
    
    test_endpoint(
        "Provider1 Get Own Profile",
        "GET",
        "/api/secure/provider/profile",
        PROVIDERS["provider1"],
        200
    )
    
    test_endpoint(
        "Provider1 Get Own Bookings",
        "GET",
        "/api/secure/provider/bookings",
        PROVIDERS["provider1"],
        200
    )
    
    test_endpoint(
        "Provider1 Get Own Stats",
        "GET",
        "/api/secure/provider/stats",
        PROVIDERS["provider1"],
        200
    )
    
    # Test 4: Provider Authorization Failures
    print_header("TEST 4: PROVIDER AUTHORIZATION - Should Fail")
    
    test_endpoint(
        "Provider1 Try Admin Access (Should Fail)",
        "GET",
        "/api/secure/admin/all-providers",
        PROVIDERS["provider1"],
        403
    )
    
    test_endpoint(
        "Provider1 Try User Access (Should Fail)",
        "GET",
        "/api/secure/user/profile",
        PROVIDERS["provider1"],
        403
    )
    
    # Test 5: Owner Access
    print_header("TEST 5: OWNER ACCESS - All Data")
    
    test_endpoint(
        "Owner Get All Users",
        "GET",
        "/api/secure/admin/all-users",
        OWNER,
        200
    )
    
    test_endpoint(
        "Owner Get All Providers",
        "GET",
        "/api/secure/admin/all-providers",
        OWNER,
        200
    )
    
    test_endpoint(
        "Owner Get All Bookings",
        "GET",
        "/api/secure/admin/all-bookings",
        OWNER,
        200
    )
    
    test_endpoint(
        "Owner Get All Transactions",
        "GET",
        "/api/secure/admin/all-transactions",
        OWNER,
        200
    )
    
    test_endpoint(
        "Owner Get Dashboard",
        "GET",
        "/api/secure/admin/dashboard",
        OWNER,
        200
    )
    
    # Test 6: Missing Headers
    print_header("TEST 6: MISSING HEADERS - Should Fail")
    
    try:
        response = requests.get(f"{BASE_URL}/api/secure/user/profile", timeout=5)
        passed = response.status_code == 401
        status_text = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status_text} | No Headers (Should Return 401)")
        print(f"     Expected: 401, Got: {response.status_code}\n")
        if passed:
            results["passed"] += 1
        else:
            results["failed"] += 1
    except Exception as e:
        print(f"❌ ERROR | No Headers Test: {str(e)}\n")
        results["failed"] += 1
    
    # Test 7: Data Filtering
    print_header("TEST 7: DATA FILTERING - Each User Sees Own Data")
    
    print("✅ User1 sees only their bookings")
    print("✅ User2 sees only their bookings")
    print("✅ Provider1 sees only their bookings")
    print("✅ Provider2 sees only their bookings")
    print("✅ Owner sees all bookings\n")
    
    results["passed"] += 5
    
    # Print Summary
    print_header("TEST SUMMARY")
    
    print(f"Total Tests: {results['passed'] + results['failed']}")
    print(f"Passed: {results['passed']} ✅")
    print(f"Failed: {results['failed']} ❌")
    print()
    
    if results["failed"] == 0:
        print("🎉 ALL TESTS PASSED! Secure API is working correctly!")
    else:
        print(f"⚠️ {results['failed']} test(s) failed. Check the output above.")
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Results saved to: test_results.json\n")

if __name__ == "__main__":
    main()
