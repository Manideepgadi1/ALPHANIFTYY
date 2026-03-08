import pandas as pd
import json

# Read the Excel file - read without header to see raw structure
excel_file = 'ALLBASKETSPORTIFOLIO.xlsx'
df = pd.read_excel(excel_file, header=None)

print("Raw Excel Structure (first 20 rows, first 12 columns):")
print("="*120)
print(df.iloc[:20, :12].to_string())
print("\n" + "="*120 + "\n")

# Now try to identify baskets by looking for "Fund Name" markers
print("Looking for basket patterns...")

# Check each column pair for basket data
baskets_found = []
for col_idx in range(0, len(df.columns), 2):
    if col_idx + 1 < len(df.columns):
        # Check if this looks like a basket (has "Fund Name" in first row)
        first_cell = df.iloc[0, col_idx]
        
        if pd.notna(first_cell) and 'Fund Name' not in str(first_cell):
            # This might be a basket name
            basket_name = first_cell
            
            # Check if next column has "Holding"
            holding_header = df.iloc[0, col_idx + 1]
            
            if pd.notna(holding_header) and 'Holding' in str(holding_header):
                print(f"\nFound basket: '{basket_name}' at columns {col_idx}-{col_idx+1}")
                baskets_found.append({
                    'name': basket_name,
                    'name_col': col_idx,
                    'holding_col': col_idx + 1
                })

print(f"\n\nTotal baskets found: {len(baskets_found)}")
for basket in baskets_found:
    print(f"  - {basket['name']}")
