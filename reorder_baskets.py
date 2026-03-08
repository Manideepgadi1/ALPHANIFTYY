import sys
sys.path.append('backend/data')
from mock_data import baskets_data, funds_data

# Separate baskets with and without Excel files
with_excel = []
without_excel = []

for basket in baskets_data:
    if 'excelFile' in basket and basket['excelFile']:
        with_excel.append(basket)
    else:
        without_excel.append(basket)

# New ordered list: Excel baskets first, then others
reordered_baskets = with_excel + without_excel

# Write the new mock_data.py
with open('backend/data/mock_data.py', 'w', encoding='utf-8') as f:
    # Write funds_data first
    f.write("funds_data = [\n")
    for i, fund in enumerate(funds_data):
        f.write("    {\n")
        for key, value in fund.items():
            if isinstance(value, str):
                f.write(f"        '{key}': '{value}',\n")
            else:
                f.write(f"        '{key}': {value},\n")
        f.write("    },\n")
    f.write("]\n\n")
    
    # Write reordered baskets_data
    f.write("baskets_data = [\n")
    for basket in reordered_baskets:
        # Write basket comment
        f.write(f"    # {basket['name']}\n")
        f.write("    {\n")
        
        # Write each key-value pair
        for key, value in basket.items():
            if isinstance(value, str):
                f.write(f"        '{key}': '{value}',\n")
            elif isinstance(value, (list, dict)):
                # Handle complex types
                import json
                f.write(f"        '{key}': {json.dumps(value, ensure_ascii=False)},\n")
            else:
                f.write(f"        '{key}': {value},\n")
        
        f.write("    },\n")
    f.write("]\n")

print("✓ Baskets reordered successfully!")
print(f"  - {len(with_excel)} baskets with Excel files (shown first)")
print(f"  - {len(without_excel)} baskets without Excel files (shown last)")
