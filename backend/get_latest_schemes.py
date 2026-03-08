"""
Get complete scheme list from the date with most schemes
"""
import requests
import pandas as pd

TOKEN = 'fMqHkvwLKoN6rTyt_j7F3HNgnvhBtWWE'
BASE_URL = 'https://contentapi.accordwebservices.com/RawData/GetRawDataJSON'

# Date with most schemes: 14042024 (334 schemes)
date = '14042024'

print("=" * 70)
print(f"FETCHING COMPLETE SCHEME LIST - {date} (14-Apr-2024)")
print("=" * 70)

# Get Scheme_master
print("\n1. Fetching Scheme_master...")
url = f'{BASE_URL}?filename=Scheme_master&date={date}&section=MFMaster&sub=&token={TOKEN}'
r = requests.get(url, timeout=30)
schemes = r.json()['Table']
print(f"   ✓ Got {len(schemes)} schemes")

# Get NAV data for same date
print("\n2. Fetching NAV data...")
url = f'{BASE_URL}?filename=Navhist&date={date}&section=MFNav&sub=&token={TOKEN}'
r = requests.get(url, timeout=30)
if r.status_code == 200:
    navs = r.json().get('Table', [])
    print(f"   ✓ Got {len(navs)} NAV records")
    
    # Get NAV date range
    if navs:
        nav_dates = [n['navdate'] for n in navs]
        print(f"   NAV date range: {min(nav_dates)} to {max(nav_dates)}")
else:
    print(f"   Status {r.status_code}: No NAV data")

# Sample schemes
print("\n3. Sample schemes:")
print("-" * 70)
df = pd.DataFrame(schemes)
print(df[['schemecode', 'scheme_name']].head(10).to_string(index=False))

# Count by AMC
print("\n4. Schemes by AMC:")
print("-" * 70)
amc_counts = df.groupby('amc_code').size().sort_values(ascending=False).head(10)
for amc, count in amc_counts.items():
    sample = df[df['amc_code'] == amc].iloc[0]
    print(f"   {count:3d} schemes - {sample['scheme_name'][:50]}...")

# Save updated Excel
excel_path = '../accord_schemes_latest.xlsx'
print(f"\n5. Saving to {excel_path}...")
df.to_excel(excel_path, index=False)
print(f"   ✓ Saved {len(df)} schemes")

print("\n" + "=" * 70)
print(f"✓ COMPLETE! Use date: {date} for latest data")
print(f"✓ Total schemes: {len(schemes)}")
print("=" * 70)
