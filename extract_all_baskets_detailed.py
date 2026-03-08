import pandas as pd

# Read without headers
df = pd.read_excel('ALLBASKETSPORTIFOLIO.xlsx', header=None)

print("="*100)
print("FINDING ALL BASKETS IN ALLBASKETSPORTIFOLIO.xlsx")
print("="*100)

basket_locations = []

# Search for basket names
for col in range(df.shape[1]):
    for row in range(50):
        if row >= len(df):
            break
        val = str(df.iloc[row, col])
        if 'Basket' in val or 'basket' in val or 'BASKET' in val:
            if val != 'nan' and 'Fund' not in val:
                basket_locations.append({
                    'name': val,
                    'row': row,
                    'col': col
                })
                print(f"\n📦 Found: {val}")
                print(f"   Location: Row {row}, Column {col}")

print(f"\n\n{'='*100}")
print(f"EXTRACTING PORTFOLIO DATA FOR {len(basket_locations)} BASKETS")
print("="*100)

all_baskets = {}

for basket_info in basket_locations:
    basket_name = basket_info['name']
    start_col = basket_info['col']
    start_row = basket_info['row']
    
    print(f"\n{'─'*100}")
    print(f"📊 {basket_name}")
    print(f"{'─'*100}")
    
    # Find "Fund Name" header (should be 1-2 rows after basket name)
    fund_name_row = None
    for check_row in range(start_row, min(start_row + 5, len(df))):
        if 'Fund Name' in str(df.iloc[check_row, start_col]):
            fund_name_row = check_row
            break
    
    if fund_name_row is None:
        print("   ⚠️  Could not find 'Fund Name' header")
        continue
    
    print(f"   Fund Name row: {fund_name_row}")
    
    # Find Holding column (should be to the right of Fund Name)
    holding_col = None
    for check_col in range(start_col, min(start_col + 5, df.shape[1])):
        val = str(df.iloc[fund_name_row, check_col])
        if 'Holding' in val or 'holding' in val or 'Weight' in val:
            holding_col = check_col
            break
    
    if holding_col is None:
        # Try next column as default
        holding_col = start_col + 1
        print(f"   Using default holding column: {holding_col}")
    else:
        print(f"   Holding column: {holding_col}")
    
    # Extract funds
    funds = []
    for row_idx in range(fund_name_row + 1, len(df)):
        fund_name = str(df.iloc[row_idx, start_col]).strip()
        
        # Stop conditions
        if fund_name == 'nan' or fund_name == '' or len(fund_name) < 2:
            # Check if we hit another basket or section
            if 'Asset Type' in fund_name or 'Basket' in fund_name:
                break
            continue
        
        # Stop if we hit section headers
        if 'Asset Type' in fund_name or 'Total' in fund_name:
            break
        
        # Get holding
        try:
            holding_val = df.iloc[row_idx, holding_col]
            if pd.notna(holding_val):
                allocation = float(holding_val)
                # Convert decimal to percentage if needed
                if allocation < 1:
                    allocation *= 100
                
                if allocation > 0:
                    funds.append({
                        'name': fund_name,
                        'allocation': round(allocation, 2)
                    })
        except (ValueError, TypeError):
            pass
    
    if funds:
        total = sum(f['allocation'] for f in funds)
        all_baskets[basket_name] = funds
        
        print(f"\n   ✅ {len(funds)} funds extracted")
        print(f"   Total allocation: {total:.2f}%")
        print(f"\n   Holdings:")
        for i, fund in enumerate(sorted(funds, key=lambda x: x['allocation'], reverse=True), 1):
            print(f"      {i}. {fund['name'][:70]:<70} {fund['allocation']:>6.2f}%")
    else:
        print("   ⚠️  No funds extracted")

print(f"\n\n{'='*100}")
print("SUMMARY")
print("="*100)
print(f"\nTotal baskets extracted: {len(all_baskets)}")

for basket_name in sorted(all_baskets.keys()):
    funds = all_baskets[basket_name]
    total = sum(f['allocation'] for f in funds)
    print(f"\n• {basket_name}: {len(funds)} funds, {total:.2f}% total")

# Save to file
import json
with open('all_baskets_from_excel.json', 'w', encoding='utf-8') as f:
    json.dump(all_baskets, f, indent=2, ensure_ascii=False)

print(f"\n✓ Data saved to: all_baskets_from_excel.json")
