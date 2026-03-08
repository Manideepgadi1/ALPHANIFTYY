import requests

r = requests.get('https://contentapi.accordwebservices.com/RawData/GetRawDataJSON?filename=Scheme_master&date=30092022&section=MFMaster&sub=&token=fMqHkvwLKoN6rTyt_j7F3HNgnvhBtWWE', timeout=30)
schemes = r.json()['Table']

# Find Aditya Birla funds
ab_funds = [s for s in schemes if 'aditya birla' in s['scheme_name'].lower()]
print(f'Found {len(ab_funds)} Aditya Birla funds in Accord API:')
print()
for s in ab_funds:
    print(f"  {s['schemecode']}: {s['scheme_name']}")
