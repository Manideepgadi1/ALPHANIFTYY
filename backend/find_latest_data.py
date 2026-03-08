"""
Try to find the latest available date by going backwards from today
"""
import requests
from datetime import datetime, timedelta

TOKEN = 'fMqHkvwLKoN6rTyt_j7F3HNgnvhBtWWE'
BASE_URL = 'https://contentapi.accordwebservices.com/RawData/GetRawDataJSON'

print("=" * 70)
print("SEARCHING FOR LATEST DATA (Going back day by day)")
print("=" * 70)

# Start from today and go back
start_date = datetime.now()
found_dates = []

print("\nSearching Scheme_master...")
for i in range(365 * 2):  # Check last 2 years
    check_date = start_date - timedelta(days=i)
    date_str = check_date.strftime('%d%m%Y')
    
    url = f'{BASE_URL}?filename=Scheme_master&date={date_str}&section=MFMaster&sub=&token={TOKEN}'
    r = requests.get(url, timeout=30)
    
    if r.status_code == 200:
        data = r.json()
        schemes = data.get('Table', [])
        if schemes:
            print(f"\n✓ FOUND: {date_str} ({check_date.strftime('%d-%b-%Y')})")
            print(f"   Schemes: {len(schemes)}")
            found_dates.append({'date': date_str, 'display': check_date.strftime('%d-%b-%Y'), 'schemes': len(schemes)})
            
            if len(found_dates) >= 5:  # Stop after finding 5 dates
                break
    
    if i % 30 == 0:
        print(f"  Checked {i} days back... ({check_date.strftime('%d-%b-%Y')})")

print("\n" + "=" * 70)
print(f"FOUND {len(found_dates)} DATES WITH DATA:")
for d in found_dates:
    print(f"  • {d['display']} ({d['date']}): {d['schemes']} schemes")
print("=" * 70)
