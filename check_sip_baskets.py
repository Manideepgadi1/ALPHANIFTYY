import pandas as pd

# Read the Excel file
excel_file = 'ALLBASKETSPORTIFOLIO.xlsx'
df = pd.read_excel(excel_file)

print("All column names in the Excel file:")
print(df.columns.tolist())
print("\n" + "="*80 + "\n")

# Look for columns that might contain "Every Common", "Raising", "SIP", etc.
matching_cols = [col for col in df.columns if any(keyword in str(col).lower() for keyword in ['every', 'common', 'raising', 'india', 'sip', 'balanced', 'aggressive'])]

if matching_cols:
    print(f"Found {len(matching_cols)} potentially matching columns:")
    for col in matching_cols:
        print(f"  - {col}")
else:
    print("No matching columns found for 'Every Common', 'Raising', or 'SIP' baskets")
