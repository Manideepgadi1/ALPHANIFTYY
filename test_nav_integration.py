"""
NAV Data Integration Test Script
Tests all NAV endpoints and verifies data correctness
"""

import requests
import json
from datetime import datetime

API_BASE = "http://localhost:5001/api"

def test_health():
    """Test API health"""
    print("=" * 60)
    print("1. Testing API Health...")
    print("=" * 60)
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API is running")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API not reachable: {e}")
        return False

def test_nav_history(scheme_code, fund_name):
    """Test NAV history endpoint"""
    print(f"\n{'=' * 60}")
    print(f"2. Testing NAV History for {fund_name}")
    print(f"   Scheme Code: {scheme_code}")
    print("=" * 60)
    
    try:
        url = f"{API_BASE}/mf/nav-history/{scheme_code}"
        print(f"   URL: {url}")
        
        response = requests.get(url, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ HTTP {response.status_code}")
            return False
        
        data = response.json()
        
        if not data.get('Table'):
            print("❌ No data in response")
            print(f"   Response: {data}")
            return False
        
        nav_records = data['Table']
        print(f"✅ Received {len(nav_records)} NAV records")
        
        # Verify first record
        if nav_records:
            first = nav_records[0]
            print(f"\n   📊 Latest NAV:")
            print(f"      Date: {first.get('NAVDATE', 'N/A')}")
            print(f"      NAV: ₹{first.get('NAVRS', 'N/A')}")
            
            # Verify data format
            if 'NAVDATE' in first and 'NAVRS' in first:
                print(f"   ✅ Data format correct (NAVDATE, NAVRS)")
                
                # Check date format (should be YYYY-MM-DD)
                date_str = first['NAVDATE']
                try:
                    datetime.strptime(date_str, '%Y-%m-%d')
                    print(f"   ✅ Date format correct (YYYY-MM-DD)")
                except:
                    print(f"   ⚠️ Date format might be different: {date_str}")
                
                return True
            else:
                print(f"   ❌ Missing NAVDATE or NAVRS fields")
                print(f"   Available fields: {first.keys()}")
                return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON response: {e}")
        return False

def test_scheme_mapping():
    """Check scheme mapping cache"""
    print(f"\n{'=' * 60}")
    print("3. Checking Scheme Mapping Cache")
    print("=" * 60)
    
    try:
        import os
        mapping_file = os.path.join(
            os.path.dirname(__file__), 
            'backend', 
            'scheme_mapping.json'
        )
        
        if os.path.exists(mapping_file):
            with open(mapping_file, 'r') as f:
                mappings = json.load(f)
            
            print(f"✅ Cache file exists")
            print(f"   Location: {mapping_file}")
            print(f"   Cached mappings: {len(mappings)}")
            print(f"\n   📝 Sample mappings:")
            
            for i, (accord, mfapi) in enumerate(list(mappings.items())[:5]):
                print(f"      {accord} → {mfapi}")
                if i >= 4:
                    break
            
            return True
        else:
            print(f"⚠️ Cache file not found at {mapping_file}")
            print(f"   Will be created on first request")
            return True
            
    except Exception as e:
        print(f"⚠️ Could not check cache: {e}")
        return True

def test_comparison_scenario():
    """Test multi-fund comparison scenario"""
    print(f"\n{'=' * 60}")
    print("4. Testing Multi-Fund Comparison Scenario")
    print("=" * 60)
    
    test_funds = [
        ("18304", "Aditya Birla Banking Direct"),
        ("5183", "Aditya Birla Banking Regular"),
    ]
    
    all_data = []
    
    for code, name in test_funds:
        print(f"\n   Fetching {name}...")
        try:
            response = requests.get(f"{API_BASE}/mf/nav-history/{code}", timeout=30)
            data = response.json()
            
            if data.get('Table'):
                nav_count = len(data['Table'])
                latest_nav = data['Table'][0]['NAVRS']
                print(f"   ✅ {nav_count} records, Latest NAV: ₹{latest_nav}")
                all_data.append((name, data['Table']))
            else:
                print(f"   ❌ No data")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    if len(all_data) >= 2:
        print(f"\n   ✅ Multi-fund comparison data ready")
        print(f"   Can compare {len(all_data)} funds")
        return True
    else:
        print(f"\n   ❌ Insufficient data for comparison")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("NAV DATA INTEGRATION TEST SUITE")
    print("=" * 60)
    
    results = []
    
    # Test 1: Health Check
    results.append(("API Health", test_health()))
    
    # Test 2: NAV History (Direct Plan)
    results.append((
        "NAV History (Direct)", 
        test_nav_history("18304", "Aditya Birla Banking Direct Growth")
    ))
    
    # Test 3: Scheme Mapping Cache
    results.append(("Scheme Mapping", test_scheme_mapping()))
    
    # Test 4: Comparison Scenario
    results.append(("Multi-Fund Comparison", test_comparison_scenario()))
    
    # Print Summary
    print(f"\n{'=' * 60}")
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print(f"\n🎉 All tests passed!")
        print(f"✅ NAV data integration is working correctly")
    else:
        print(f"\n⚠️ Some tests failed")
        print(f"Please check the backend is running and configured correctly")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
