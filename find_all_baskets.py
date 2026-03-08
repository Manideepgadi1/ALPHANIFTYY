import pandas as pd

# Read the Excel file without header
excel_file = 'ALLBASKETSPORTIFOLIO.xlsx'
df = pd.read_excel(excel_file, header=None)

print("Searching for all basket names in the Excel file...")
print("="*80)

# Look for cells that might be basket names
# They typically appear before "Fund Name" rows
basket_names = []

for row_idx in range(len(df)):
    for col_idx in range(len(df.columns)):
        cell_value = df.iloc[row_idx, col_idx]
        
        if pd.notna(cell_value):
            cell_str = str(cell_value)
            
            # Look for basket name patterns
            if 'Basket' in cell_str or 'basket' in cell_str:
                basket_names.append({
                    'name': cell_str,
                    'row': row_idx,
                    'col': col_idx
                })
                print(f"Found: '{cell_str}' at row {row_idx}, column {col_idx}")
            
            # Also look for specific names mentioned
            if any(keyword in cell_str.lower() for keyword in ['common india', 'raising', 'sip', 'aggressive', 'balanced', 'premium']):
                if cell_str not in [b['name'] for b in basket_names]:
                    basket_names.append({
                        'name': cell_str,
                        'row': row_idx,
                        'col': col_idx
                    })
                    print(f"Found: '{cell_str}' at row {row_idx}, column {col_idx}")

print(f"\n\nTotal potential baskets found: {len(basket_names)}")
print("\nBasket names:")
for basket in basket_names:
    print(f"  - {basket['name']}")
