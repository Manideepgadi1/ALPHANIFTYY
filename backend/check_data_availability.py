"""
Check total schemes and NAV date availability
"""
import requests
from datetime import datetime, timedelta

TOKEN = 'fMqHkvwLKoN6rTyt_j7F3HNgnvhBtWWE'
BASE_URL = 'https://contentapi.accordwebservices.com/RawData/GetRawDataJSON'

print("=" * 70)
print("CHECKING ACCORD API DATA AVAILABILITY")
print("=" * 70)

# Try different dates to find latest Scheme_master
print("\n1. CHECKING SCHEME_MASTER AVAILABILITY:")
print("-" * 70)

test_dates = [
    '27012026',  # Today
    '26012026',  # Yesterday
    '24012026',  # Friday
    '31122025',  # End of 2025
    '30122025',  # Dec 30
    '01012025',  # Start of 2025
    '31122024',  # End of 2024
    '30092022',  # Our working date
]

latest_schemes = None
latest_date = None

for date in test_dates:
    url = f'{BASE_URL}?filename=Scheme_master&date={date}&section=MFMaster&sub=&token={TOKEN}'
    r = requests.get(url, timeout=30)
    if r.status_code == 200:
        data = r.json()
        schemes = data.get('Table', [])
        if schemes:
            print(f"✓ {date}: {len(schemes)} schemes")
            if not latest_schemes:
                latest_schemes = schemes
                latest_date = date
    else:
        print(f"  {date}: Status {r.status_code}")

print(f"\n** Latest available: {latest_date} with {len(latest_schemes)} schemes **")

# Try different dates for NAV data
print("\n2. CHECKING NAV DATA AVAILABILITY:")
print("-" * 70)

nav_dates = []
for date in test_dates:
    url = f'{BASE_URL}?filename=Navhist&date={date}&section=MFNav&sub=&token={TOKEN}'
    r = requests.get(url, timeout=30)
    if r.status_code == 200:
        data = r.json()
        navs = data.get('Table', [])
        if navs:
            # Get unique NAV dates from data
            unique_dates = set([n['navdate'] for n in navs[:10]])
            print(f"✓ {date}: {len(navs)} NAV records")
            print(f"   Sample NAV dates: {list(unique_dates)[:3]}")
            nav_dates.append(date)
    else:
        print(f"  {date}: Status {r.status_code}")

print(f"\n** NAV data available for dates: {nav_dates} **")

# Check if there are more schemes with Currentnav
print("\n3. CHECKING CURRENT NAV:")
print("-" * 70)
url = f'{BASE_URL}?filename=Currentnav&date={latest_date}&section=MFNav&sub=&token={TOKEN}'
r = requests.get(url, timeout=30)
if r.status_code == 200:
    current_navs = r.json().get('Table', [])
    if current_navs:
        unique_schemes = set([str(n['schemecode']) for n in current_navs])
        print(f"✓ Current NAV has {len(current_navs)} records for {len(unique_schemes)} unique schemes")
        print(f"   Sample: {current_navs[0]}")
else:
    print(f"  Status {r.status_code}")

print("\n" + "=" * 70)
