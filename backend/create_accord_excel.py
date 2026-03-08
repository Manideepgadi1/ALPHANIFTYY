"""
Create Excel file with Accord API scheme data
"""
import requests
import pandas as pd
import json

print("=" * 60)
print("CREATING ACCORD SCHEMES EXCEL")
print("=" * 60)

# Fetch Accord Scheme_master
print("\n1. Fetching schemes from Accord API...")
url = 'https://contentapi.accordwebservices.com/RawData/GetRawDataJSON?filename=Scheme_master&date=30092022&section=MFMaster&sub=&token=fMqHkvwLKoN6rTyt_j7F3HNgnvhBtWWE'
r = requests.get(url, timeout=30)
schemes = r.json()['Table']
print(f"   ✓ Got {len(schemes)} schemes")

# Create DataFrame
print("\n2. Creating DataFrame...")
df = pd.DataFrame(schemes)
print(f"   ✓ Columns: {list(df.columns)}")
print(f"   ✓ Total rows: {len(df)}")

# Save to Excel
excel_path = '../accord_schemes.xlsx'
print(f"\n3. Saving to {excel_path}...")
df.to_excel(excel_path, index=False)
print(f"   ✓ Saved successfully")

# Display sample
print("\n4. Sample data:")
print("-" * 60)
print(df.head(10).to_string(index=False))

print("\n" + "=" * 60)
print("✓ DONE! Use accord_schemes.xlsx for fund lookup")
print("=" * 60)
