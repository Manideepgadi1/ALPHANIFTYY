import pandas as pd
import os

# Read ALLBASKETSPORTIFOLIO.xlsx
excel_file = 'd:/VSFintech-Platform/Alphanifty/ALLBASKETSPORTIFOLIO.xlsx'
df = pd.read_excel(excel_file, sheet_name='balenced basket(Sheet1)', header=None)

print("="*80)
print("EXTRACTING ALL BASKET PORTFOLIOS")
print("="*80)

# The file has multiple baskets side by side
# Let's identify where each basket starts
print("\nFirst few rows and columns:")
print(df.iloc[:5, :12])

# Find columns that contain "Fund Name"
fund_name_cols = []
for col in df.columns:
    for idx in range(min(5, len(df))):
        if 'Fund Name' in str(df.iloc[idx, col]):
            fund_name_cols.append(col)
            break

print(f"\nFound {len(fund_name_cols)} baskets (columns with 'Fund Name'): {fund_name_cols}")

# Extract each basket
baskets = {}
for col_idx in fund_name_cols:
    # Find the basket name (should be in row above "Fund Name")
    basket_name = None
    for row_idx in range(10):
        cell_value = str(df.iloc[row_idx, col_idx])
        if cell_value and cell_value != 'nan' and 'Fund Name' not in cell_value:
            basket_name = cell_value
            break
    
    if not basket_name:
        basket_name = f"Basket_{col_idx}"
    
    print(f"\n{'='*80}")
    print(f"BASKET: {basket_name}")
    print(f"{'='*80}")
    
    # Find where "Fund Name" row is
    fund_name_row = None
    for row_idx in range(10):
        if 'Fund Name' in str(df.iloc[row_idx, col_idx]):
            fund_name_row = row_idx
            break
    
    if fund_name_row is None:
        continue
    
    # Extract fund data starting from the row after "Fund Name"
    funds = []
    holding_col = col_idx + 1  # Assuming Holding is in the next column
    
    # Check if "Holding" header exists
    holding_found = False
    for check_col in range(col_idx, min(col_idx + 5, len(df.columns))):
        if 'Holding' in str(df.iloc[fund_name_row, check_col]) or 'holding' in str(df.iloc[fund_name_row, check_col]):
            holding_col = check_col
            holding_found = True
            break
    
    print(f"Fund Name Column: {col_idx}, Holding Column: {holding_col}")
    
    # Extract funds
    for row_idx in range(fund_name_row + 1, len(df)):
        fund_name = df.iloc[row_idx, col_idx]
        holding = df.iloc[row_idx, holding_col]
        
        # Stop if we hit empty rows or section headers
        if pd.isna(fund_name) or 'Asset Type' in str(fund_name):
            break
        
        try:
            holding_val = float(holding)
            if holding_val > 0:
                funds.append({
                    'fund_name': str(fund_name).strip(),
                    'allocation': holding_val * 100  # Convert to percentage
                })
        except:
            pass
    
    baskets[basket_name] = funds
    
    print(f"\nTotal Funds: {len(funds)}")
    total_allocation = sum(f['allocation'] for f in funds)
    print(f"Total Allocation: {total_allocation:.2f}%")
    
    print("\nFund Allocations:")
    for i, fund in enumerate(funds, 1):
        print(f"{i}. {fund['fund_name']}: {fund['allocation']:.2f}%")

print("\n" + "="*80)
print(f"TOTAL BASKETS FOUND: {len(baskets)}")
print("="*80)

# Print summary
for basket_name, funds in baskets.items():
    print(f"\n{basket_name}: {len(funds)} funds")
