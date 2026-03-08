from mf_service_enhanced import MFServiceEnhanced

print("Testing NAV history retrieval...")
service = MFServiceEnhanced()

# Test with scheme 5183 (Aditya Birla Banking & PSU fund from the screenshot)
scheme_code = '5183'
period = 'SI'

print(f"\nFetching NAV history for scheme {scheme_code}, period: {period}")
data = service.get_fund_nav_history(scheme_code, period)

print(f"\nResponse type: {type(data)}")
print(f"Response keys: {data.keys() if isinstance(data, dict) else 'Not a dict'}")

if 'Table' in data:
    table = data['Table']
    print(f"\n✓ Table key found")
    print(f"  Total records: {len(table)}")
    if table:
        print(f"  First record: {table[0]}")
        print(f"  Last record: {table[-1]}")
    else:
        print(f"  Table is empty!")
elif 'error' in data:
    print(f"\n✗ Error in response: {data['error']}")
else:
    print(f"\n✗ Unexpected response structure: {data}")
