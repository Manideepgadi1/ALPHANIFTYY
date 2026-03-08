import pandas as pd

df = pd.read_excel('ALLBASKETSPORTIFOLIO.xlsx', header=None)

print("="*100)
print("EXTRACTING 1_BALANCED Premium BASKET")
print("="*100)

# Find the basket at column 0
basket_col = 0
fund_name_row = 1  # Based on previous output
holding_col = 2  # Based on structure

print(f"\nBasket Name: {df.iloc[0, basket_col]}")
print(f"Fund Name Row: {fund_name_row}")
print(f"Holding Column: {holding_col}")

funds = []
print("\nExtracting funds:")

for row in range(fund_name_row + 1, len(df)):
    fund_name = str(df.iloc[row, basket_col]).strip()
    
    # Stop conditions
    if fund_name == 'nan' or fund_name == '':
        continue
    if 'Asset Type' in fund_name or 'Sankranthi' in fund_name or 'Aggressive' in fund_name:
        break
    
    try:
        holding = df.iloc[row, holding_col]
        if pd.notna(holding):
            allocation = float(holding) * 100  # Convert to percentage
            if allocation > 0:
                funds.append({
                    'name': fund_name,
                    'allocation': round(allocation, 2)
                })
                print(f"  {len(funds)}. {fund_name[:70]:<70} {allocation:>6.2f}%")
    except (ValueError, TypeError):
        pass

total = sum(f['allocation'] for f in funds)
print(f"\n{'='*100}")
print(f"Total Funds: {len(funds)}")
print(f"Total Allocation: {total:.2f}%")
print("="*100)

# Print in Python dict format
print("\n\nFund allocations for mock_data.py:")
print("        'fundAllocations': [")
for i, fund in enumerate(funds, 1):
    fund_id = f"fund-bal-{i}"
    print(f"            {{'fundId': '{fund_id}', 'fundName': '{fund['name']}', 'allocationPercent': {fund['allocation']}, 'category': 'Equity'}},")
print("        ],")
