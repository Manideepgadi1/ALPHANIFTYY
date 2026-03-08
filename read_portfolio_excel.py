import pandas as pd

# Read all sheets from ALLBASKETSPORTIFOLIO.xlsx
excel_file = 'd:/VSFintech-Platform/Alphanifty/ALLBASKETSPORTIFOLIO.xlsx'
xls = pd.ExcelFile(excel_file)

print("="*80)
print("READING ALLBASKETSPORTIFOLIO.xlsx")
print("="*80)
print(f"\nAll sheets: {xls.sheet_names}\n")

for sheet in xls.sheet_names:
    print(f"\n{'='*80}")
    print(f"SHEET: {sheet}")
    print(f"{'='*80}")
    
    df = pd.read_excel(excel_file, sheet_name=sheet)
    print(f"\nShape: {df.shape}")
    print(f"\nColumns: {list(df.columns)}")
    
    # Skip empty first row if exists
    if pd.isna(df.iloc[0, 0]) or 'Fund Name' in str(df.iloc[0, 0]):
        print(f"\nFirst row looks like header: {df.iloc[0, 0]}")
        # Set the first row as column names
        df.columns = df.iloc[0]
        df = df[1:]
        df.reset_index(drop=True, inplace=True)
    
    print(f"\nFirst 15 rows:")
    print(df.head(15))
    
    # Check for holdings column
    holding_cols = [col for col in df.columns if 'holding' in str(col).lower() or 'weight' in str(col).lower()]
    print(f"\nHolding columns found: {holding_cols}")
    
    # Sum up holdings if found
    if holding_cols:
        for col in holding_cols:
            try:
                # Convert to numeric, errors='coerce' will make non-numeric values NaN
                numeric_col = pd.to_numeric(df[col], errors='coerce')
                total = numeric_col.sum()
                valid_count = numeric_col.notna().sum()
                print(f"Total {col}: {total:.4f} (from {valid_count} valid entries)")
            except Exception as e:
                print(f"Error processing {col}: {e}")

print("\n" + "="*80)
print("COMPLETE")
print("="*80)
