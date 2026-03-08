import pandas as pd

# Read the Excel file
excel_file = 'ALLBASKETSPORTIFOLIO.xlsx'
df = pd.read_excel(excel_file)

print("Extracting all basket names from the Excel file...\n")
print("="*80)

# The Excel has baskets in horizontal layout
# First row should contain basket names
# Let's check the first few rows to understand structure

print("\nFirst 3 rows of data:")
print(df.head(3))
print("\n" + "="*80)

# Get all column values that look like basket names (not "Unnamed")
basket_names = []
for col in df.columns:
    if not col.startswith('Unnamed:'):
        basket_names.append(col)

print(f"\nFound {len(basket_names)} baskets:")
for i, name in enumerate(basket_names, 1):
    print(f"{i}. {name}")
    
# Now let's look at each basket's data
print("\n" + "="*80)
print("\nDetailed basket information:\n")

for basket_name in basket_names:
    # Find the column index
    col_idx = df.columns.get_loc(basket_name)
    
    print(f"\n{'='*60}")
    print(f"BASKET: {basket_name}")
    print('='*60)
    
    # The next column should be the holdings
    if col_idx + 1 < len(df.columns):
        holding_col = df.columns[col_idx + 1]
        
        # Get fund names and holdings
        funds_data = []
        for idx, row in df.iterrows():
            fund_name = row[basket_name]
            holding = row[holding_col]
            
            if pd.notna(fund_name) and pd.notna(holding):
                if fund_name not in ['Fund Name', 'Holding', '']:
                    try:
                        holding_pct = float(holding)
                        funds_data.append((fund_name, holding_pct))
                    except:
                        pass
        
        if funds_data:
            print(f"\nNumber of funds: {len(funds_data)}")
            total_allocation = sum([h for _, h in funds_data])
            print(f"Total allocation: {total_allocation:.2f}%\n")
            
            print("Fund Allocations:")
            for i, (fund, holding) in enumerate(funds_data, 1):
                print(f"{i}. {fund}: {holding:.2f}%")
        else:
            print("No fund data found")
