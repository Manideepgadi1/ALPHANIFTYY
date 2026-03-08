import pandas as pd
import json

print("="*100)
print("COMPARING BASKETS FROM EXCEL WITH MOCK DATA")
print("="*100)

# Read the Excel file
excel_file = 'd:/VSFintech-Platform/Alphanifty/ALLBASKETSPORTIFOLIO.xlsx'
df = pd.read_excel(excel_file, sheet_name='balenced basket(Sheet1)', header=None)

print("\n1. EXTRACTING BASKETS FROM EXCEL")
print("-"*100)

# The Excel has multiple baskets in columns
# Each basket has a name, then Fund Name header, then funds with holdings

baskets_from_excel = {}
col = 0

while col < len(df.columns):
    # Look for basket name (should be before "Fund Name")
    basket_name = None
    fund_name_row = None
    
    # Search first 10 rows for basket name and Fund Name header
    for row in range(10):
        cell_value = str(df.iloc[row, col]).strip()
        if cell_value and cell_value != 'nan':
            if 'Fund Name' in cell_value or 'fund name' in cell_value.lower():
                fund_name_row = row
                break
            elif not basket_name and cell_value not in ['Unnamed', '']:
                basket_name = cell_value
    
    if fund_name_row is not None and basket_name:
        print(f"\n📦 Found Basket: {basket_name}")
        print(f"   Starting at column {col}, Fund Name at row {fund_name_row}")
        
        # Find Holding column (usually next column)
        holding_col = None
        for check_col in range(col, min(col + 5, len(df.columns))):
            cell_val = str(df.iloc[fund_name_row, check_col]).strip().lower()
            if 'holding' in cell_val or 'weight' in cell_val or 'allocation' in cell_val:
                holding_col = check_col
                break
        
        if holding_col is None:
            holding_col = col + 1  # Default to next column
        
        # Extract funds
        funds = []
        for row in range(fund_name_row + 1, len(df)):
            fund_name = str(df.iloc[row, col]).strip()
            
            # Stop if empty or hit section headers
            if not fund_name or fund_name == 'nan' or 'Asset Type' in fund_name or fund_name == '':
                break
            
            # Get holding value
            try:
                holding = df.iloc[row, holding_col]
                holding_val = float(holding)
                if holding_val > 0:
                    funds.append({
                        'name': fund_name,
                        'allocation': round(holding_val * 100, 2)  # Convert to percentage
                    })
            except (ValueError, TypeError):
                pass
        
        if funds:
            total = sum(f['allocation'] for f in funds)
            baskets_from_excel[basket_name] = {
                'funds': funds,
                'total_allocation': round(total, 2),
                'fund_count': len(funds)
            }
            print(f"   ✓ {len(funds)} funds found, Total allocation: {total:.2f}%")
    
    col += 1

print(f"\n{'='*100}")
print(f"TOTAL BASKETS FOUND IN EXCEL: {len(baskets_from_excel)}")
print(f"{'='*100}")

# Print detailed basket info
for basket_name, data in baskets_from_excel.items():
    print(f"\n📊 {basket_name}")
    print(f"   Funds: {data['fund_count']}")
    print(f"   Total: {data['total_allocation']}%")
    print(f"   Top 5 allocations:")
    for i, fund in enumerate(sorted(data['funds'], key=lambda x: x['allocation'], reverse=True)[:5], 1):
        print(f"      {i}. {fund['name']}: {fund['allocation']}%")

print(f"\n\n{'='*100}")
print("2. COMPARING WITH MOCK DATA")
print("-"*100)

# Read mock_data.py to get existing baskets
mock_data_file = 'd:/VSFintech-Platform/Alphanifty/backend/data/mock_data.py'
with open(mock_data_file, 'r', encoding='utf-8') as f:
    mock_content = f.read()

# Extract basket names from mock_data
import re
mock_baskets = []
for match in re.finditer(r"'name':\s*'([^']+)'", mock_content):
    basket_name = match.group(1)
    if 'Basket' in basket_name or 'SIP' in basket_name:
        mock_baskets.append(basket_name)

print(f"\nBaskets in mock_data.py: {len(set(mock_baskets))}")
for name in sorted(set(mock_baskets)):
    print(f"   • {name}")

print(f"\nBaskets in Excel: {len(baskets_from_excel)}")
for name in sorted(baskets_from_excel.keys()):
    print(f"   • {name}")

print(f"\n{'='*100}")
print("3. MATCHING ANALYSIS")
print("-"*100)

# Try to match baskets
for excel_basket in baskets_from_excel.keys():
    excel_lower = excel_basket.lower()
    found_match = False
    
    for mock_basket in set(mock_baskets):
        mock_lower = mock_basket.lower()
        
        # Check for partial matches
        if excel_lower in mock_lower or mock_lower in excel_lower:
            print(f"\n✓ MATCH: '{excel_basket}' <-> '{mock_basket}'")
            found_match = True
            break
        
        # Check for keyword matches
        excel_keywords = set(excel_lower.split())
        mock_keywords = set(mock_lower.split())
        common = excel_keywords & mock_keywords
        if len(common) >= 2:
            print(f"\n≈ PARTIAL: '{excel_basket}' <-> '{mock_basket}' (common: {common})")
            found_match = True
            break
    
    if not found_match:
        print(f"\n✗ NO MATCH: '{excel_basket}' - NOT FOUND IN MOCK DATA")

print(f"\n{'='*100}")
print("SUMMARY")
print("="*100)
print(f"Excel has {len(baskets_from_excel)} basket(s)")
print(f"Mock data has {len(set(mock_baskets))} basket(s)")
print("\nDetailed Excel basket portfolios saved to: excel_baskets_detail.json")

# Save to JSON for reference
with open('excel_baskets_detail.json', 'w', encoding='utf-8') as f:
    json.dump(baskets_from_excel, f, indent=2, ensure_ascii=False)

print("\n✓ Complete!")
