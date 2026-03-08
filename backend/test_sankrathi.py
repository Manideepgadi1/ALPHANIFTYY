from data.mock_data import baskets_data

sankrathi = [b for b in baskets_data if b.get('id') == 'b16']
if sankrathi:
    print('✓ Sankrathi basket found!')
    print('Name:', sankrathi[0]['name'])
    print('Number of funds:', len(sankrathi[0].get('fundAllocations', [])))
    print('Excel file:', sankrathi[0].get('excelFile'))
    print('CAGR 5Y:', sankrathi[0].get('cagr5Y'))
    print('\nFund Allocations:')
    for fund in sankrathi[0].get('fundAllocations', []):
        print(f'  - {fund["fundName"]}: {fund["allocationPercent"]}%')
else:
    print('✗ Sankrathi basket not found!')
