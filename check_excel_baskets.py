import sys
sys.path.append('backend/data')
from mock_data import baskets_data

print("Baskets using Excel files for performance graphs:")
print("="*80)

for basket in baskets_data:
    if 'excelFile' in basket and basket['excelFile']:
        print(f"\nBasket ID: {basket['id']}")
        print(f"Name: {basket['name']}")
        print(f"Excel File: {basket['excelFile']}")
        print("-"*80)
