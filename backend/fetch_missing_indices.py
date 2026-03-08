"""
Fetch missing indices from fundanalyzer.in and merge with local data
This script identifies and adds the 290 missing indices/ETFs to our database
"""
import requests
import json
import pandas as pd
import os

print("=" * 80)
print("FETCHING MISSING INDICES FROM EXTERNAL API")
print("=" * 80)

# Step 1: Fetch all data from external API (10,181 records)
print("\n📥 Step 1: Fetching data from fundanalyzer.in...")
try:
    response = requests.get("https://fundanalyzer.in/testcronpaymaa/testing/eqty", timeout=15)
    external_data = response.json()
    
    if external_data.get('status') == 200 and external_data.get('data'):
        all_external_records = external_data['data']
        print(f"✅ Fetched {len(all_external_records)} records from external API")
    else:
        print("❌ Invalid response from external API")
        exit(1)
except Exception as e:
    print(f"❌ Error fetching external data: {e}")
    exit(1)

# Step 2: Load our current local data (9,891 records)
print("\n📂 Step 2: Loading local CSV data...")
csv_path = os.path.join(os.path.dirname(__file__), '..', 'MF.csv')
if not os.path.exists(csv_path):
    csv_path = 'D:\\VSFintech-Platform\\Latest_Indices_rawdata_31.12.2025.csv'

try:
    local_df = pd.read_csv(csv_path)
    print(f"✅ Loaded {len(local_df)} records from local CSV")
    print(f"   Columns: {list(local_df.columns)}")
except Exception as e:
    print(f"❌ Error loading CSV: {e}")
    exit(1)

# Step 3: Identify missing records
print("\n🔍 Step 3: Identifying missing indices...")

# Create set of existing scheme codes from local data
existing_codes = set(local_df['SCHEMECODE'].astype(str))
print(f"   Local scheme codes: {len(existing_codes)}")

# Find records in external API but not in local data
missing_records = []
for record in all_external_records:
    scheme_code = str(record[0])
    if scheme_code not in existing_codes:
        missing_records.append(record)

print(f"✅ Found {len(missing_records)} missing records")

# Step 4: Analyze missing records to identify indices
print("\n📊 Step 4: Analyzing missing records...")

index_keywords = ['Index', 'Nifty', 'Sensex', 'BSE', 'NSE', 'ETF', 'NASDAQ', 'S&P']
index_records = []
fund_records = []

for record in missing_records:
    fund_name = record[1]
    is_index = any(keyword in fund_name for keyword in index_keywords)
    
    if is_index:
        index_records.append(record)
    else:
        fund_records.append(record)

print(f"   Indices/ETFs: {len(index_records)}")
print(f"   Regular Funds: {len(fund_records)}")

# Display sample indices
print("\n📋 Sample Missing Indices:")
for i, record in enumerate(index_records[:10]):
    print(f"   {i+1}. [{record[0]}] {record[1]}")

# Step 5: Convert missing records to DataFrame format
print("\n🔧 Step 5: Converting external format to local format...")

# External format: [code, name, ?, 1M, 1Y, 3Y, 6M, 5Y, ?, age, category]
# Local format: SCHEMECODE, S_NAME, CATEGORY_CODE, CATEGORY_NAME, _3Rt, std, INCRET

new_records = []
for record in missing_records:
    new_record = {
        'SCHEMECODE': record[0],
        'S_NAME': record[1],
        'CATEGORY_CODE': record[2] if len(record) > 2 else '',
        'CATEGORY_NAME': record[10] if len(record) > 10 else '',
        '_3Rt': record[5] if len(record) > 5 else '',  # 3Y return
        'std': record[6] if len(record) > 6 else '',    # Standard deviation
        'INCRET': record[7] if len(record) > 7 else ''  # 5Y or inception return
    }
    new_records.append(new_record)

new_df = pd.DataFrame(new_records)
print(f"✅ Converted {len(new_df)} records to local format")

# Step 6: Create combined dataset
print("\n🔀 Step 6: Merging datasets...")

combined_df = pd.concat([local_df, new_df], ignore_index=True)
print(f"✅ Combined dataset: {len(combined_df)} total records")
print(f"   Original: {len(local_df)}")
print(f"   Added: {len(new_df)}")
print(f"   Total: {len(combined_df)}")

# Step 7: Save updated CSV
print("\n💾 Step 7: Saving updated CSV...")

output_csv = os.path.join(os.path.dirname(__file__), 'MF_with_indices.csv')
combined_df.to_csv(output_csv, index=False)
print(f"✅ Saved to: {output_csv}")

# Step 8: Generate JSON for mutual_funds.json
print("\n📄 Step 8: Generating mutual_funds.json...")

# Convert to array format for API
json_data = {
    "status": 200,
    "data": []
}

for _, row in combined_df.iterrows():
    json_data["data"].append([
        str(row['SCHEMECODE']),
        str(row['S_NAME']),
        str(row['CATEGORY_CODE']) if pd.notna(row['CATEGORY_CODE']) else '',
        str(row['CATEGORY_NAME']) if pd.notna(row['CATEGORY_NAME']) else '',
        str(row['_3Rt']) if pd.notna(row['_3Rt']) else '',
        str(row['std']) if pd.notna(row['std']) else '',
        str(row['INCRET']) if pd.notna(row['INCRET']) else ''
    ])

# Save JSON
output_json = os.path.join(os.path.dirname(__file__), 'data', 'mutual_funds_with_indices.json')
os.makedirs(os.path.dirname(output_json), exist_ok=True)

with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2)

print(f"✅ Saved to: {output_json}")
print(f"   Total records in JSON: {len(json_data['data'])}")

# Step 9: Summary
print("\n" + "=" * 80)
print("✅ SUMMARY")
print("=" * 80)
print(f"Original records: {len(local_df)}")
print(f"Missing records: {len(new_df)}")
print(f"  - Indices/ETFs: {len(index_records)}")
print(f"  - Regular Funds: {len(fund_records)}")
print(f"Total records: {len(combined_df)}")
print(f"\nFiles created:")
print(f"  1. {output_csv}")
print(f"  2. {output_json}")
print("\n💡 Next steps:")
print("  1. Update app.py to use mutual_funds_with_indices.json")
print("  2. Or point MF.csv path to MF_with_indices.csv")
print("=" * 80)
