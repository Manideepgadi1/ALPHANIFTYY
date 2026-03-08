import sys
sys.path.append('backend/data')
from mock_data import baskets_data

# Separate baskets with and without Excel files
with_excel = []
without_excel = []

for basket in baskets_data:
    if 'excelFile' in basket and basket['excelFile']:
        with_excel.append(basket)
    else:
        without_excel.append(basket)

print(f"Baskets WITH Excel files ({len(with_excel)}):")
for b in with_excel:
    print(f"  {b['id']} - {b['name']}")

print(f"\nBaskets WITHOUT Excel files ({len(without_excel)}):")
for b in without_excel:
    print(f"  {b['id']} - {b['name']}")

print(f"\nNew order will be:")
print(f"1. First {len(with_excel)} baskets with Excel files")
print(f"2. Then {len(without_excel)} baskets without Excel files")
