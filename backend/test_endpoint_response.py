import json
from mf_service_enhanced import MFServiceEnhanced

service = MFServiceEnhanced()
data = service.get_fund_nav_history('5183', 'SI')

print(f'Response data type: {type(data)}')
print(f'Is it a dict? {isinstance(data, dict)}')

if isinstance(data, dict):
    print(f'Keys: {list(data.keys())}')
    if 'Table' in data:
        table = data['Table']
        print(f'Table type: {type(table)}')
        print(f'Table length: {len(table)}')
        print(f'First 2 entries:')
        for i, entry in enumerate(table[:2]):
            print(f'  [{i}]: {entry}')
        print(f'Last entry: {table[-1]}')
    else:
        print(f'No Table key. Full response: {json.dumps(data, indent=2)[:500]}')
else:
    print(f'Data is not a dict, it is: {data}')
