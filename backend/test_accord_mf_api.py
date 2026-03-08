"""
Complete NAV fetching solution following the PDF guide

Steps:
1. Read MF.csv (has SCHEMECODE and S_NAME)
2. Use Accord API to get ISIN for each scheme
3. Use ISIN/SCHEMECODE to get NAV data
4. Save complete fund data with NAV
"""
import pandas as pd
import requests
import time
import json

# Token from manager
TOKEN = 'aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz'
BASE_URL = 'https://mf.accordwebservices.com/MF'

print("=" * 70)
print("FETCHING NAV DATA USING ACCORD MF API (Following PDF Guide)")
print("=" * 70)

# Step 1: Load CSV
print("\n1. Loading MF.csv...")
df = pd.read_csv('../MF.csv')
print(f"   ✓ Loaded {len(df)} schemes")
print(f"   Columns: {list(df.columns)}")

# Step 2: Test API with first scheme
test_scheme = df.iloc[0]
scheme_code = test_scheme['SCHEMECODE']
scheme_name = test_scheme['S_NAME']

print(f"\n2. Testing with first scheme:")
print(f"   Code: {scheme_code}")
print(f"   Name: {scheme_name}")

# Test 1: Get ISIN (from PDF page 11)
print(f"\n3. Getting ISIN code...")
isin_url = f'{BASE_URL}/Get_SchemeISINDetails?schemecode={scheme_code}&option=&token={TOKEN}'
try:
    r = requests.get(isin_url, timeout=30)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        isin_data = r.json()
        print(f"   ✅ ISIN Response: {json.dumps(isin_data, indent=2)}")
    else:
        print(f"   ❌ Error: {r.text[:200]}")
except Exception as e:
    print(f"   ❌ Exception: {str(e)}")

# Test 2: Get Fund Factsheet (from PDF page 4)
print(f"\n4. Getting Fund Factsheet...")
factsheet_url = f'{BASE_URL}/GetFundFactsheet?SchemeCode={scheme_code}&token={TOKEN}'
try:
    r = requests.get(factsheet_url, timeout=30)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        factsheet = r.json()
        print(f"   ✅ Factsheet keys: {list(factsheet.keys())}")
        if 'snapshot_summary' in factsheet:
            summary = factsheet['snapshot_summary']
            if summary:
                print(f"   NAV: ₹{summary[0].get('NAVRS', 'N/A')}")
                print(f"   NAV Date: {summary[0].get('NAVDATE', 'N/A')}")
    else:
        print(f"   ❌ Error: {r.text[:200]}")
except Exception as e:
    print(f"   ❌ Exception: {str(e)}")

# Test 3: Get NAV Chart (from PDF page 9)
print(f"\n5. Getting NAV Chart (1 Year)...")
nav_url = f'{BASE_URL}/GetNAVChartData?schemecode={scheme_code}&period=1Y&token={TOKEN}'
try:
    r = requests.get(nav_url, timeout=30)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        nav_data = r.json()
        print(f"   ✅ Got {len(nav_data)} NAV records")
        if nav_data:
            print(f"   Sample: {nav_data[0]}")
            print(f"   Latest: {nav_data[-1]}")
    else:
        print(f"   ❌ Error: {r.text[:200]}")
except Exception as e:
    print(f"   ❌ Exception: {str(e)}")

print("\n" + "=" * 70)
print("API TESTING COMPLETE")
print("=" * 70)
