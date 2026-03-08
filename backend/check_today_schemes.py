import requests
from datetime import datetime

# Try today's date
today = datetime.now().strftime('%d%m%Y')
print(f"Trying date: {today}")

url = f'https://contentapi.accordwebservices.com/RawData/GetRawDataJSON?filename=Scheme_master&date={today}&section=MFMaster&sub=&token=fMqHkvwLKoN6rTyt_j7F3HNgnvhBtWWE'
r = requests.get(url, timeout=30)

print(f"Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    schemes = data.get('Table', [])
    print(f"✓ Got {len(schemes)} schemes")
    
    # Find Aditya Birla funds
    ab_funds = [s for s in schemes if 'aditya birla' in s['scheme_name'].lower()]
    print(f"\nAditya Birla funds: {len(ab_funds)}")
elif r.status_code == 204:
    print("✗ No Content (204) - No changes on this date")
else:
    print(f"Error: {r.text[:200]}")
