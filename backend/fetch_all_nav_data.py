"""
Complete NAV Data Fetcher for all funds in MF.csv
Following the Accord MF API documentation
"""
import pandas as pd
import requests
import time
import json
from datetime import datetime

# Configuration
TOKEN = 'aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz'
BASE_URL = 'https://mf.accordwebservices.com/MF'
BATCH_SIZE = 100  # Process in batches to save progress
DELAY = 0.1  # Delay between API calls (100ms)

print("=" * 70)
print("COMPLETE NAV DATA FETCHER")
print("=" * 70)

# Load CSV
print("\n1. Loading MF.csv...")
df = pd.read_csv('../MF.csv')
print(f"   ✓ Loaded {len(df)} schemes")

# Add columns for NAV data
df['ISIN'] = ''
df['NAV'] = ''
df['NAV_DATE'] = ''
df['NAV_CHANGE'] = ''
df['NAV_CHANGE_PERCENT'] = ''
df['AUM'] = ''
df['EXPENSE_RATIO'] = ''
df['MIN_INVESTMENT'] = ''
df['SIP_MIN_INVESTMENT'] = ''
df['RISK_TYPE'] = ''

print(f"\n2. Fetching NAV data for {len(df)} schemes...")
print("   (This will take some time...)")

success_count = 0
error_count = 0

for idx, row in df.iterrows():
    scheme_code = row['SCHEMECODE']
    
    # Progress indicator
    if (idx + 1) % 100 == 0:
        print(f"   Progress: {idx + 1}/{len(df)} ({success_count} success, {error_count} errors)")
    
    try:
        # Get Fund Factsheet (includes NAV, ISIN, and all other data)
        url = f'{BASE_URL}/GetFundFactsheet?SchemeCode={scheme_code}&token={TOKEN}'
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract snapshot summary (has NAV and basic info)
            if 'snapshot_summary' in data and data['snapshot_summary']:
                summary = data['snapshot_summary'][0]
                
                df.at[idx, 'NAV'] = summary.get('NAVRS', '')
                df.at[idx, 'NAV_DATE'] = summary.get('NAVDATE', '')
                df.at[idx, 'NAV_CHANGE'] = summary.get('NETCHANGE', '')
                df.at[idx, 'NAV_CHANGE_PERCENT'] = summary.get('PER_CHANGE', '')
                df.at[idx, 'AUM'] = summary.get('AUM', '')
                df.at[idx, 'EXPENSE_RATIO'] = summary.get('EXPENSE_RATIO', '')
                df.at[idx, 'MIN_INVESTMENT'] = summary.get('MININVT', '')
                df.at[idx, 'SIP_MIN_INVESTMENT'] = summary.get('SIPMININVEST', '')
                df.at[idx, 'RISK_TYPE'] = summary.get('RISKTYPE', '')
            
            success_count += 1
        else:
            error_count += 1
            
        # Delay between requests
        time.sleep(DELAY)
        
        # Save progress every 500 records
        if (idx + 1) % 500 == 0:
            temp_filename = f'../MF_with_NAV_progress_{idx + 1}.csv'
            df.to_csv(temp_filename, index=False)
            print(f"   ✓ Progress saved to {temp_filename}")
            
    except Exception as e:
        error_count += 1
        if (idx + 1) % 100 == 0:
            print(f"   Error on scheme {scheme_code}: {str(e)[:50]}")

# Save final file
output_file = '../MF_with_NAV_complete.csv'
df.to_csv(output_file, index=False)

print("\n" + "=" * 70)
print("COMPLETE!")
print("=" * 70)
print(f"✅ Successfully fetched: {success_count} schemes")
print(f"❌ Errors: {error_count} schemes")
print(f"📁 Saved to: {output_file}")
print(f"📊 Total schemes: {len(df)}")
print("\nSample data:")
print(df[['SCHEMECODE', 'S_NAME', 'NAV', 'NAV_DATE']].head(5))
print("=" * 70)
