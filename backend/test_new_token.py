"""
Test NEW Accord API token to see what data we can get
"""
import requests
from datetime import datetime

# NEW TOKEN from manager
TOKEN = 'aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz'
BASE_URL = 'https://contentapi.accordwebservices.com/RawData/GetRawDataJSON'

print("=" * 70)
print("TESTING NEW ACCORD API TOKEN")
print("=" * 70)

# Test 1: Check Scheme_master with latest date
print("\n1. TESTING SCHEME_MASTER (Latest):")
print("-" * 70)

test_dates = ['27012026', '26012026', '24012026', '14042024', '30092022']
latest_schemes = None
latest_date = None

for date in test_dates:
    url = f'{BASE_URL}?filename=Scheme_master&date={date}&section=MFMaster&sub=&token={TOKEN}'
    try:
        r = requests.get(url, timeout=30)
        if r.status_code == 200:
            data = r.json()
            schemes = data.get('Table', [])
            if schemes:
                print(f"✅ {date}: {len(schemes)} schemes found")
                if not latest_schemes:
                    latest_schemes = schemes
                    latest_date = date
                    if len(schemes) > 500:  # Found a good date
                        break
        else:
            print(f"   {date}: Status {r.status_code}")
    except Exception as e:
        print(f"   {date}: Error - {str(e)[:50]}")

if latest_schemes:
    print(f"\n✅ BEST DATE: {latest_date} with {len(latest_schemes)} schemes")
    print(f"\nSample schemes:")
    for s in latest_schemes[:5]:
        print(f"  {s['schemecode']}: {s['scheme_name'][:60]}...")
else:
    print("\n❌ No schemes found with any date!")

# Test 2: Check NAV data
print("\n2. TESTING NAV DATA:")
print("-" * 70)

if latest_date:
    url = f'{BASE_URL}?filename=Navhist&date={latest_date}&section=MFNav&sub=&token={TOKEN}'
    try:
        r = requests.get(url, timeout=30)
        if r.status_code == 200:
            navs = r.json().get('Table', [])
            print(f"✅ {latest_date}: {len(navs)} NAV records")
            if navs:
                print(f"\nSample NAV data:")
                for n in navs[:3]:
                    print(f"  Scheme {n['schemecode']}: {n['navdate']} = ₹{n['navrs']}")
        else:
            print(f"❌ Status {r.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

# Test 3: Check if we can get current/recent data
print("\n3. TESTING CURRENT NAV:")
print("-" * 70)

today = datetime.now().strftime('%d%m%Y')
url = f'{BASE_URL}?filename=Currentnav&date={today}&section=MFNav&sub=&token={TOKEN}'
try:
    r = requests.get(url, timeout=30)
    if r.status_code == 200:
        current = r.json().get('Table', [])
        if current:
            print(f"✅ TODAY ({today}): {len(current)} current NAV records")
            print(f"Sample: {current[0]}")
        else:
            print(f"⚠️  No current NAV data for today")
    else:
        print(f"Status {r.status_code}: {r.text[:100]}")
except Exception as e:
    print(f"Error: {str(e)}")

print("\n" + "=" * 70)
print("TOKEN TEST COMPLETE")
print("=" * 70)
