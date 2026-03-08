"""
Test fetching NAV data for Accord schemes
"""
import requests
import pandas as pd
from datetime import datetime, timedelta

print("=" * 60)
print("TESTING NAV DATA FETCH")
print("=" * 60)

# Load Accord schemes
print("\n1. Loading Accord schemes...")
df = pd.read_excel('../accord_schemes.xlsx')
print(f"   ✓ {len(df)} schemes loaded")

# Test with first scheme
test_scheme = df.iloc[0]
scheme_code = test_scheme['schemecode']
scheme_name = test_scheme['scheme_name']

print(f"\n2. Testing with scheme:")
print(f"   Code: {scheme_code}")
print(f"   Name: {scheme_name}")

# Try getting NAV data for Sep 30, 2022
print(f"\n3. Fetching NAV data for 30-09-2022...")
url = 'https://contentapi.accordwebservices.com/RawData/GetRawDataJSON?filename=Navhist&date=30092022&section=MFNav&sub=&token=fMqHkvwLKoN6rTyt_j7F3HNgnvhBtWWE'
r = requests.get(url, timeout=30)

if r.status_code == 200:
    nav_data = r.json()['Table']
    print(f"   ✓ Got {len(nav_data)} NAV records")
    
    # Filter for our scheme
    scheme_navs = [n for n in nav_data if str(n['schemecode']) == str(scheme_code)]
    print(f"\n4. NAV records for scheme {scheme_code}:")
    if scheme_navs:
        print(f"   ✓ Found {len(scheme_navs)} NAV records")
        for nav in scheme_navs[:5]:
            print(f"   - Date: {nav['navdate']}, NAV: {nav['navrs']}")
    else:
        print(f"   ✗ No NAV records found for this scheme")
        # Try a few other schemes
        print(f"\n   Trying other schemes...")
        for i in range(1, 6):
            test_code = df.iloc[i]['schemecode']
            test_name = df.iloc[i]['scheme_name']
            found = [n for n in nav_data if str(n['schemecode']) == str(test_code)]
            if found:
                print(f"   ✓ Scheme {test_code} ({test_name[:50]}...): {len(found)} NAVs")
                print(f"      Sample NAV: {found[0]['navdate']} = {found[0]['navrs']}")
                break
else:
    print(f"   ✗ Status {r.status_code}: {r.text[:200]}")

print("\n" + "=" * 60)
