import pandas as pd
import json

# Read the Excel file without header
excel_file = 'ALLBASKETSPORTIFOLIO.xlsx'
df = pd.read_excel(excel_file, header=None)

def extract_basket_from_row(df, start_row, basket_name):
    """Extract basket data starting from a specific row"""
    print(f"\n{'='*80}")
    print(f"Extracting: {basket_name}")
    print('='*80)
    
    funds = []
    
    # Look for "Fund Name" header
    fund_name_row = None
    for i in range(start_row, min(start_row + 5, len(df))):
        if df.iloc[i, 0] == 'Fund Name':
            fund_name_row = i
            break
    
    if fund_name_row is None:
        print("Could not find 'Fund Name' header")
        return None
    
    print(f"Found 'Fund Name' at row {fund_name_row}")
    
    # Extract funds starting from next row
    row_idx = fund_name_row + 1
    while row_idx < len(df):
        fund_name = df.iloc[row_idx, 0]
        holding = df.iloc[row_idx, 2]  # Holding is in column 2
        
        # Stop if we hit empty rows or another basket
        if pd.isna(fund_name) or fund_name == 'Asset Type':
            break
        
        if pd.notna(holding):
            try:
                holding_pct = float(holding) * 100  # Convert to percentage
                funds.append({
                    'fundName': fund_name,
                    'allocationPercent': round(holding_pct, 2)
                })
            except:
                pass
        
        row_idx += 1
    
    print(f"\nFound {len(funds)} funds:")
    total = sum([f['allocationPercent'] for f in funds])
    for i, fund in enumerate(funds, 1):
        print(f"{i}. {fund['fundName']}: {fund['allocationPercent']}%")
    print(f"\nTotal allocation: {total:.2f}%")
    
    return funds

# Extract SIP Diversified Portfolio (row 76)
sip_diversified = extract_basket_from_row(df, 76, "SIP Diversified Portfolio")

# Extract SIP Aggressive Portfolio (row 94)
sip_aggressive = extract_basket_from_row(df, 94, "SIP_Aggressive_Portfolio")

# Save to JSON
result = {
    'SIP Diversified Portfolio': sip_diversified,
    'SIP_Aggressive_Portfolio': sip_aggressive
}

with open('sip_baskets_data.json', 'w') as f:
    json.dump(result, f, indent=2)

print("\n" + "="*80)
print("Data saved to sip_baskets_data.json")
