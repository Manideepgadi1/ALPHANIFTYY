"""
Test NAV fetching with 10 sample schemes
"""
import pandas as pd
import requests
import time

TOKEN = 'aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz'
BASE_URL = 'https://mf.accordwebservices.com/MF'

print("Testing NAV fetch for 10 sample schemes...\n")

# Load first 10 schemes
df = pd.read_csv('../MF.csv', nrows=10)
print(f"Loaded {len(df)} sample schemes\n")

results = []

for idx, row in df.iterrows():
    scheme_code = row['SCHEMECODE']
    scheme_name = row['S_NAME'][:50]
    
    try:
        url = f'{BASE_URL}/GetFundFactsheet?SchemeCode={scheme_code}&token={TOKEN}'
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'snapshot_summary' in data and data['snapshot_summary']:
                summary = data['snapshot_summary'][0]
                nav = summary.get('NAVRS', 'N/A')
                nav_date = summary.get('NAVDATE', 'N/A')
                status = '✅'
            else:
                nav = 'No data'
                nav_date = 'N/A'
                status = '⚠️'
        else:
            nav = f'Error {response.status_code}'
            nav_date = 'N/A'
            status = '❌'
            
        results.append({
            'Status': status,
            'Scheme': scheme_code,
            'Name': scheme_name,
            'NAV': nav,
            'Date': nav_date
        })
        
        print(f"{status} {scheme_code}: {scheme_name[:40]:40} | NAV: {str(nav):12} | {nav_date}")
        time.sleep(0.1)
        
    except Exception as e:
        results.append({
            'Status': '❌',
            'Scheme': scheme_code,
            'Name': scheme_name,
            'NAV': 'Error',
            'Date': str(e)[:30]
        })
        print(f"❌ {scheme_code}: Error - {str(e)[:50]}")

print("\n" + "="*80)
success = len([r for r in results if r['Status'] == '✅'])
print(f"✅ Success: {success}/{len(results)}")
print(f"❌ Errors: {len(results) - success}/{len(results)}")
print("="*80)

if success > 0:
    print("\n🎉 API is working! You can now fetch NAV for all 9,891 schemes.")
    print("   Run: python fetch_all_nav_data.py (will take ~15-20 minutes)")
