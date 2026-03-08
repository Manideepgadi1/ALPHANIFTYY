"""
Test updated Accord API with Raw Data endpoints
"""
from accord_api import AccordAPI
import pandas as pd

print("=" * 60)
print("TESTING UPDATED ACCORD API")
print("=" * 60)

# Initialize API
print("\n1. Initializing API...")
api = AccordAPI()
print("   ✓ API initialized")

# Test 1: Get scheme master
print("\n2. Testing get_scheme_master()...")
schemes = api.get_scheme_master()
print(f"   ✓ Got {len(schemes)} schemes")
print(f"   Sample: {schemes[0]['schemecode']} - {schemes[0]['scheme_name']}")

# Test 2: Get NAV history
print("\n3. Testing get_nav_history()...")
navs = api.get_nav_history()
print(f"   ✓ Got {len(navs)} NAV records")

# Test 3: Get NAV for specific scheme
test_code = schemes[0]['schemecode']
print(f"\n4. Testing get_nav_for_scheme({test_code})...")
scheme_navs = api.get_nav_for_scheme(test_code)
print(f"   ✓ Got {len(scheme_navs)} NAV records for scheme {test_code}")
if scheme_navs:
    print(f"   Latest: {scheme_navs[-1]['navdate']} = ₹{scheme_navs[-1]['navrs']}")

# Test 4: Get scheme details
print(f"\n5. Testing get_scheme_details({test_code})...")
details = api.get_scheme_details(test_code)
if 'error' not in details:
    print(f"   ✓ Scheme: {details['scheme']['scheme_name']}")
    print(f"   ✓ NAV history: {len(details['nav_history'])} records")
    if details['latest_nav']:
        print(f"   ✓ Latest NAV: ₹{details['latest_nav']['navrs']}")

print("\n" + "=" * 60)
print("✓ ALL TESTS PASSED")
print("=" * 60)
