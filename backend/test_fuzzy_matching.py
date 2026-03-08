"""
Test fuzzy matching between Excel fund names and Accord API fund names
"""
import pandas as pd
import requests
from fuzzywuzzy import fuzz

print("=" * 60)
print("TESTING FUND NAME MATCHING")
print("=" * 60)

# Load Excel
print("\n1. Loading Excel...")
excel = pd.read_excel('../MF.xlsx')
print(f"   ✓ {len(excel)} funds in Excel")

# Load Accord API
print("\n2. Loading Accord API schemes...")
url = 'https://contentapi.accordwebservices.com/RawData/GetRawDataJSON?filename=Scheme_master&date=30092022&section=MFMaster&sub=&token=fMqHkvwLKoN6rTyt_j7F3HNgnvhBtWWE'
r = requests.get(url, timeout=30)
accord_schemes = r.json()['Table']
print(f"   ✓ {len(accord_schemes)} schemes in Accord API")

# Test matching first 5
print("\n3. Testing matches for first 5 funds:")
print("-" * 60)

for i in range(5):
    excel_name = excel.iloc[i]['S_NAME']
    excel_code = excel.iloc[i]['SCHEMECODE']
    
    # Find best match
    best_match = None
    best_score = 0
    
    for scheme in accord_schemes:
        score = fuzz.ratio(excel_name.lower(), scheme['scheme_name'].lower())
        if score > best_score:
            best_score = score
            best_match = scheme
    
    print(f"\nExcel [{excel_code}]: {excel_name}")
    if best_match:
        print(f"Match [{best_match['schemecode']}] (Score: {best_score}%): {best_match['scheme_name']}")
    else:
        print("   ✗ No match found")

print("\n" + "=" * 60)
