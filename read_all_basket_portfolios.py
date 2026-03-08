import pandas as pd
import os
import json

print("="*100)
print("READING ALL INDIVIDUAL BASKET EXCEL FILES")
print("="*100)

backend_path = 'd:/VSFintech-Platform/Alphanifty/backend'
excel_files = [
    'Aggressive Basket.xlsx',
    'Balance, conservative, shankrati.xlsx',
    'Balanced Basket.xlsx',
    'CONSERVATIVE BASKET.xlsx',
    'Dusshera basket.xlsx',
    'Every common India basket.xlsx',
    'Greate India Basket.xlsx',
    'Raising_India.xlsx',
    'Sankrathi_Basket.xlsx',
    'White Basket.xlsx',
    'Yellow basket.xlsx'
]

all_basket_portfolios = {}

for excel_file in excel_files:
    file_path = os.path.join(backend_path, excel_file)
    if not os.path.exists(file_path):
        print(f"\n⚠️  File not found: {excel_file}")
        continue
    
    basket_name = excel_file.replace('.xlsx', '').replace('_', ' ').title()
    
    print(f"\n{'='*100}")
    print(f"📂 Reading: {excel_file}")
    print(f"   Basket Name: {basket_name}")
    print("-"*100)
    
    try:
        # Try to read the Excel file
        xl = pd.ExcelFile(file_path)
        sheet_name = xl.sheet_names[0]
        print(f"   Sheet: {sheet_name}")
        
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        print(f"   Shape: {df.shape}")
        print(f"   Columns: {list(df.columns)[:5]}...")
        
        # Try to find fund data
        # Common patterns: Fund Name, Fund, Scheme Name, etc.
        fund_col = None
        allocation_col = None
        
        for col in df.columns:
            col_lower = str(col).lower()
            if 'fund' in col_lower or 'scheme' in col_lower or 'name' in col_lower:
                if fund_col is None:
                    fund_col = col
            if 'holding' in col_lower or 'weight' in col_lower or 'allocation' in col_lower or '%' in col_lower:
                allocation_col = col
        
        print(f"   Fund Column: {fund_col}")
        print(f"   Allocation Column: {allocation_col}")
        
        if fund_col:
            funds = []
            for idx, row in df.iterrows():
                fund_name = str(row[fund_col]).strip()
                
                # Skip headers, empty, or invalid entries
                if fund_name == 'nan' or fund_name == '' or 'Fund' in fund_name or len(fund_name) < 3:
                    continue
                
                allocation = None
                if allocation_col:
                    try:
                        alloc_val = row[allocation_col]
                        if pd.notna(alloc_val):
                            allocation = float(alloc_val)
                            # If less than 1, assume it's decimal (convert to %)
                            if allocation < 1:
                                allocation = allocation * 100
                    except:
                        pass
                
                if allocation and allocation > 0:
                    funds.append({
                        'name': fund_name,
                        'allocation': round(allocation, 2)
                    })
            
            if funds:
                total = sum(f['allocation'] for f in funds)
                all_basket_portfolios[basket_name] = {
                    'excel_file': excel_file,
                    'funds': funds,
                    'fund_count': len(funds),
                    'total_allocation': round(total, 2)
                }
                print(f"\n   ✅ SUCCESS: {len(funds)} funds extracted")
                print(f"   Total Allocation: {total:.2f}%")
                print(f"\n   Top 5 Holdings:")
                for i, fund in enumerate(sorted(funds, key=lambda x: x['allocation'], reverse=True)[:5], 1):
                    print(f"      {i}. {fund['name'][:60]}: {fund['allocation']}%")
            else:
                print(f"   ⚠️  No valid fund data found")
                # Print sample data for debugging
                print(f"\n   Sample data (first 3 rows):")
                print(df.head(3))
        else:
            print(f"   ⚠️  Could not identify fund column")
            print(f"\n   Sample data (first 3 rows):")
            print(df.head(3))
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")

print(f"\n\n{'='*100}")
print("SUMMARY OF ALL BASKETS")
print("="*100)

for basket_name, data in sorted(all_basket_portfolios.items()):
    print(f"\n📊 {basket_name}")
    print(f"   File: {data['excel_file']}")
    print(f"   Funds: {data['fund_count']}")
    print(f"   Total: {data['total_allocation']}%")

print(f"\n\nTotal baskets with portfolio data: {len(all_basket_portfolios)}")

# Save to JSON
output_file = 'all_baskets_portfolios.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_basket_portfolios, f, indent=2, ensure_ascii=False)

print(f"\n✓ All portfolio data saved to: {output_file}")
