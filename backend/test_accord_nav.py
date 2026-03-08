import requests
import json

# Test Accord API NAV data
BASE_URL = "https://mf.accordwebservices.com/MF"
TOKEN = "aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz"

# Test with a common fund - NIFTY 50 Index Fund or similar
scheme_code = "5184"  # Example scheme code

# Test different periods
periods = ["SI", "5Y", "3Y", "1Y", "6M", "3M"]

for period in periods:
    print(f"\n{'='*60}")
    print(f"Testing period: {period}")
    print('='*60)
    
    params = {
        'schemecode': scheme_code,
        'period': period,
        'token': TOKEN
    }
    
    try:
        response = requests.get(f"{BASE_URL}/GetNAVChartData", params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if 'Table' in data and data['Table']:
            print(f"✓ Got data for period {period}")
            print(f"  Total records: {len(data['Table'])}")
            print(f"  First record: {data['Table'][0]}")
            print(f"  Last record: {data['Table'][-1]}")
        else:
            print(f"✗ No data for period {period}")
            print(f"  Response: {data}")
    except Exception as e:
        print(f"✗ Error: {str(e)}")

# Also test GetFundFactsheet to see current NAV
print(f"\n{'='*60}")
print(f"Testing GetFundFactsheet")
print('='*60)

params = {
    'SchemeCode': scheme_code,
    'token': TOKEN
}

try:
    response = requests.get(f"{BASE_URL}/GetFundFactsheet", params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    
    if 'snapshot_summary' in data and data['snapshot_summary']:
        print(f"✓ Got factsheet data")
        summary = data['snapshot_summary'][0]
        print(f"  NAV: {summary.get('NAVRS')}")
        print(f"  Date: {summary.get('NAVDATE')}")
        print(f"  AUM: {summary.get('AUM')}")
    else:
        print(f"✗ No factsheet data")
except Exception as e:
    print(f"✗ Error: {str(e)}")
