import pandas as pd
import json

# Try to read the Sankrathi basket file
files_to_try = [
    'Sankrathi_Basket.csv (1).xlsx',
    'Sankrathi_Basket.csv.xlsx',
    'Sankrathi_Basket (1).csv',
    'Sankrathi_Basket.csv'
]

for file in files_to_try:
    try:
        print(f"Trying to read: {file}")
        df = pd.read_excel(file)
        print(f"\nSuccessfully read: {file}\n")
        print("="*80)
        print("File structure:")
        print(df.head(20))
        print("\n" + "="*80)
        
        # Look for fund names and holdings
        if 'Fund Name' in df.columns or 'fund name' in df.columns.str.lower().tolist():
            print("\nExtracting fund data...")
            
            # Find the column names
            fund_col = None
            holding_col = None
            
            for col in df.columns:
                if 'fund' in str(col).lower() and 'name' in str(col).lower():
                    fund_col = col
                if 'holding' in str(col).lower() or 'allocation' in str(col).lower() or 'percent' in str(col).lower():
                    holding_col = col
            
            if fund_col and holding_col:
                funds = []
                for idx, row in df.iterrows():
                    fund_name = row[fund_col]
                    holding = row[holding_col]
                    
                    if pd.notna(fund_name) and pd.notna(holding):
                        try:
                            holding_pct = float(holding) * 100 if float(holding) < 1 else float(holding)
                            funds.append({
                                'fundName': fund_name,
                                'allocationPercent': round(holding_pct, 2)
                            })
                        except:
                            pass
                
                print(f"\nFound {len(funds)} funds:")
                total = sum([f['allocationPercent'] for f in funds])
                for i, fund in enumerate(funds, 1):
                    print(f"{i}. {fund['fundName']}: {fund['allocationPercent']}%")
                print(f"\nTotal allocation: {total:.2f}%")
                
                # Save to JSON
                with open('sankrathi_new_data.json', 'w') as f:
                    json.dump(funds, f, indent=2)
                print("\nData saved to sankrathi_new_data.json")
        break
    except Exception as e:
        print(f"Could not read {file}: {e}\n")
