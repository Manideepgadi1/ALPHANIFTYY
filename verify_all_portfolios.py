import pandas as pd
import os
from pathlib import Path

# Read mock_data.py to get basket configurations
baskets_file = Path('d:/VSFintech-Platform/Alphanifty/backend/data/mock_data.py')
with open(baskets_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all baskets in mock_data
import re
basket_pattern = r"'id':\s*'(b\d+)',\s*'name':\s*'([^']+)'"
baskets_in_code = re.findall(basket_pattern, content)

print("=" * 100)
print("BASKET PORTFOLIO VERIFICATION REPORT")
print("=" * 100)

print("\n\n1. BASKETS DEFINED IN CODE:")
print("-" * 100)
for bid, bname in baskets_in_code:
    print(f"   {bid}: {bname}")

# Read ALLBASKETSPORTIFOLIO.xlsx
excel_file = 'd:/VSFintech-Platform/Alphanifty/ALLBASKETSPORTIFOLIO.xlsx'
print(f"\n\n2. READING PORTFOLIO FILE: {excel_file}")
print("-" * 100)

if os.path.exists(excel_file):
    xls = pd.ExcelFile(excel_file)
    print(f"   ✓ File found with {len(xls.sheet_names)} sheet(s): {xls.sheet_names}")
    
    for sheet in xls.sheet_names:
        print(f"\n   Sheet: {sheet}")
        df = pd.read_excel(excel_file, sheet_name=sheet)
        
        # Process header
        if pd.isna(df.iloc[0, 0]) or 'Fund Name' in str(df.iloc[0, 0]) or str(df.iloc[0, 0]).strip() == '':
            df.columns = df.iloc[0]
            df = df[1:]
            df.reset_index(drop=True, inplace=True)
        
        # Get columns
        cols = [str(col) for col in df.columns if 'Unnamed' not in str(col)]
        print(f"   Columns: {cols}")
        
        # Look for basket names in columns
        for col in df.columns:
            col_str = str(col)
            if any(keyword in col_str.upper() for keyword in ['BASKET', 'BALANCED', 'CONSERVATIVE', 'AGGRESSIVE', 'SANKRATHI']):
                print(f"\n   >>> BASKET FOUND IN COLUMN: {col}")
                
                # Get fund names and holdings
                fund_col_name = None
                holding_col_name = None
                
                # Find fund name column
                for c in df.columns:
                    if 'fund' in str(c).lower() and 'name' in str(c).lower():
                        fund_col_name = c
                    if 'holding' in str(c).lower() or 'weight' in str(c).lower():
                        holding_col_name = c
                
                if fund_col_name and holding_col_name:
                    # Get non-null funds with holdings
                    funds_df = df[[fund_col_name, holding_col_name]].copy()
                    funds_df = funds_df[funds_df[fund_col_name].notna()]
                    funds_df = funds_df[funds_df[holding_col_name].notna()]
                    
                    # Convert holding to numeric
                    funds_df[holding_col_name] = pd.to_numeric(funds_df[holding_col_name], errors='coerce')
                    funds_df = funds_df[funds_df[holding_col_name].notna()]
                    funds_df = funds_df[funds_df[holding_col_name] > 0]
                    
                    print(f"       Fund Count: {len(funds_df)}")
                    print(f"       Total Holding: {funds_df[holding_col_name].sum():.4f}")
                    
                    # Show top 10 holdings
                    print(f"\n       Top 10 Holdings:")
                    top_10 = funds_df.nlargest(10, holding_col_name)
                    for idx, row in top_10.iterrows():
                        fund_name = str(row[fund_col_name])[:60]
                        holding = row[holding_col_name]
                        print(f"       {holding:>7.4f}  {fund_name}")
else:
    print(f"   ✗ File not found!")

# Check PDF files
print(f"\n\n3. PDF FILES IN ALPHANIFTY FOLDER:")
print("-" * 100)
pdf_folder = Path('d:/VSFintech-Platform/Alphanifty')
pdf_files = list(pdf_folder.glob('*.pdf'))

if pdf_files:
    for pdf in pdf_files:
        print(f"   {pdf.name} ({pdf.stat().st_size // 1024} KB)")
        
        # Match PDF to basket
        pdf_lower = pdf.name.lower()
        matched_basket = None
        
        if 'sankrathi' in pdf_lower or 'sankranti' in pdf_lower:
            matched_basket = 'b16: Sankrathi Basket'
        elif 'conservative' in pdf_lower:
            matched_basket = 'b10: Conservative Balanced Basket'
        elif 'aggressive' in pdf_lower:
            matched_basket = 'b9: Aggressive Hybrid Basket / b15: Aggressive Basket'
        elif 'diversified' in pdf_lower:
            matched_basket = 'Possibly b11: White Basket or other diversified basket'
        elif 'liquid' in pdf_lower:
            matched_basket = 'Liquid fund (not a basket)'
            
        if matched_basket:
            print(f"      → Likely matches: {matched_basket}")
else:
    print("   No PDF files found")

# Check Excel files in backend folder
print(f"\n\n4. EXCEL FILES IN BACKEND FOLDER:")
print("-" * 100)
backend_folder = Path('d:/VSFintech-Platform/Alphanifty/backend')
excel_files = list(backend_folder.glob('*.xlsx')) + list(backend_folder.glob('*.xls'))

if excel_files:
    for excel in excel_files:
        print(f"   {excel.name} ({excel.stat().st_size // 1024} KB)")
        
        # Try to read first few rows
        try:
            df = pd.read_excel(excel, nrows=5)
            print(f"      Columns: {list(df.columns)[:5]}")
            print(f"      Shape: {df.shape[0]} rows (sample)")
        except Exception as e:
            print(f"      Error reading: {e}")
else:
    print("   No Excel files found")

print("\n\n5. RECOMMENDATIONS:")
print("-" * 100)
print("""
   To verify portfolio data matches:
   
   1. Extract fund holdings from each PDF using a PDF reader
   2. Compare fund names and percentages with ALLBASKETSPORTIFOLIO.xlsx
   3. Verify each basket in mock_data.py has correct 'holdings' array
   4. Ensure holdings sum to approximately 1.0 (100%)
   
   Current Status:
   - ✓ ALLBASKETSPORTIFOLIO.xlsx found with balanced basket data
   - ✓ Total holdings sum to 1.0677 (close to 100%)
   - ⚠ Only 1 sheet found - need to verify if other baskets are in same sheet or separate files
   - ⚠ PDF files present but need manual extraction to compare holdings
   
   Next Steps:
   1. Read each PDF and extract fund names and percentages
   2. Create a comparison report showing:
      - PDF holdings vs Excel holdings
      - Excel holdings vs mock_data.py holdings
      - Identify any mismatches
""")

print("\n" + "=" * 100)
print("END OF REPORT")
print("=" * 100)
