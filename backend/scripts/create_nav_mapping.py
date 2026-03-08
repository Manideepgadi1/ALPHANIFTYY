"""
Create mapping between Excel SCHEMECODE and AMFI schemeCode for NAV data
"""
import pandas as pd
import requests
import json
from fuzzywuzzy import fuzz
import os

def fetch_amfi_schemes():
    """Fetch all AMFI schemes"""
    print("Fetching AMFI schemes...")
    url = 'https://api.mfapi.in/mf'
    response = requests.get(url, timeout=30)
    schemes = response.json()
    print(f"✓ Fetched {len(schemes)} AMFI schemes")
    return schemes

def normalize_name(name):
    """Normalize fund name for matching"""
    name = str(name).upper()
    # Remove common variations
    name = name.replace('ADITYA BIRLA SL', 'ADITYA BIRLA SUN LIFE')
    name = name.replace('(G)', 'GROWTH')
    name = name.replace('(IDCW)', 'DIVIDEND')
    name = name.replace('(M-IDCW)', 'MONTHLY DIVIDEND')
    name = name.replace('(Q-IDCW)', 'QUARTERLY DIVIDEND')
    name = name.replace('-DIRECT PLAN', 'DIRECT')
    name = name.replace('DIRECT PLAN', 'DIRECT')
    # Remove special characters
    for char in ['(', ')', '-', '_']:
        name = name.replace(char, ' ')
    # Remove extra spaces
    name = ' '.join(name.split())
    return name

def create_mapping():
    """Create mapping between Excel and AMFI codes"""
    # Read Excel file
    excel_file = os.path.join(os.path.dirname(__file__), '..', '..', 'MF.xlsx')
    print(f"\nReading Excel file: {excel_file}")
    df = pd.read_excel(excel_file)
    print(f"✓ Loaded {len(df)} funds from Excel")
    
    # Fetch AMFI schemes
    amfi_schemes = fetch_amfi_schemes()
    
    # Create normalized lookup
    amfi_lookup = {}
    for scheme in amfi_schemes:
        norm_name = normalize_name(scheme['schemeName'])
        amfi_lookup[norm_name] = scheme['schemeCode']
    
    # Match funds
    mapping = []
    matched = 0
    unmatched = []
    
    print("\nMatching funds...")
    for idx, row in df.iterrows():
        excel_code = row['SCHEMECODE']
        excel_name = row['S_NAME']
        norm_excel = normalize_name(excel_name)
        
        # Try exact match first
        if norm_excel in amfi_lookup:
            amfi_code = amfi_lookup[norm_excel]
            mapping.append({
                'excel_code': excel_code,
                'excel_name': excel_name,
                'amfi_code': amfi_code,
                'match_score': 100
            })
            matched += 1
        else:
            # Try fuzzy matching
            best_match = None
            best_score = 0
            
            for amfi_name, amfi_code in amfi_lookup.items():
                score = fuzz.token_set_ratio(norm_excel, amfi_name)
                if score > best_score and score >= 85:
                    best_score = score
                    best_match = (amfi_code, amfi_name)
            
            if best_match:
                mapping.append({
                    'excel_code': excel_code,
                    'excel_name': excel_name,
                    'amfi_code': best_match[0],
                    'match_score': best_score
                })
                matched += 1
            else:
                unmatched.append({
                    'excel_code': excel_code,
                    'excel_name': excel_name
                })
        
        if (idx + 1) % 1000 == 0:
            print(f"  Processed {idx + 1}/{len(df)} funds...")
    
    # Save mapping
    mapping_df = pd.DataFrame(mapping)
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'nav_code_mapping.json')
    mapping_df.to_json(output_file, orient='records', indent=2)
    
    print(f"\n✓ Mapping complete!")
    print(f"  Matched: {matched}/{len(df)} ({matched/len(df)*100:.1f}%)")
    print(f"  Unmatched: {len(unmatched)}")
    print(f"  Saved to: {output_file}")
    
    # Save unmatched for review
    if unmatched:
        unmatched_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'unmatched_funds.json')
        pd.DataFrame(unmatched).to_json(unmatched_file, orient='records', indent=2)
        print(f"  Unmatched funds saved to: {unmatched_file}")
    
    return mapping_df

if __name__ == '__main__':
    create_mapping()
