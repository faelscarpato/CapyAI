#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class V0APITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    try:
                        response_data = response.json()
                        print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    except:
                        pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if success and response.headers.get('content-type', '').startswith('application/json') else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_v0_page_load(self):
        """Test that the v0 page loads successfully"""
        success, _ = self.run_test(
            "V0 Page Load",
            "GET",
            "v0",
            200
        )
        return success

    def test_api_generate_without_params(self):
        """Test API generation endpoint without required parameters"""
        success, response = self.run_test(
            "API Generate - Missing Params",
            "POST",
            "api/generate",
            400,
            data={}
        )
        return success

    def test_api_generate_with_invalid_key(self):
        """Test API generation with invalid API key"""
        success, response = self.run_test(
            "API Generate - Invalid Key",
            "POST",
            "api/generate",
            500,  # Should fail with invalid key
            data={
                "apiKey": "invalid_key_12345",
                "model": "gemini-1.5-flash",
                "prompt": "Create a simple button component",
                "type": "component"
            }
        )
        return success

    def test_api_generate_structure(self):
        """Test API generation endpoint structure (without real API key)"""
        success, response = self.run_test(
            "API Generate - Structure Test",
            "POST",
            "api/generate",
            400,  # Should return 400 for missing fields
            data={
                "prompt": "Create a simple button component"
                # Missing apiKey and model
            }
        )
        return success

def main():
    print("🚀 Starting V0 Clone API Tests")
    print("=" * 50)
    
    # Setup
    tester = V0APITester("http://localhost:3000")
    
    # Test basic page load
    if not tester.test_v0_page_load():
        print("❌ Basic page load failed, stopping tests")
        return 1

    # Test API endpoints
    tester.test_api_generate_without_params()
    tester.test_api_generate_structure()
    tester.test_api_generate_with_invalid_key()

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests Summary: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - check implementation")
        return 1

if __name__ == "__main__":
    sys.exit(main())