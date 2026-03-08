"""
Generate complete scheme_mapping.json for all funds
Maps Accord scheme codes to MFAPI scheme codes
"""
import pandas as pd
import requests
import json
import time
from pathlib import Path

# Configuration
CSV_PATH = Path(__file__).parent.parent / 'MF.csv'
MAPPING_FILE = Path(__file__).parent / 'scheme_mapping.json'
MFAPI_SEARCH_URL = 'https://api.mfapi.in/mf/search'

def search_mfapi(fund_name):
    """Search MFAPI for a fund and return best match"""
    try:
        # Extract search terms (remove plan types, options)
        search_terms = fund_name
        for word in ['(G)', '(IDCW)', '(M-IDCW)', '(Q-IDCW)', '-Direct', '-Regular', 
                     'Direct Plan', 'Regular Plan', 'Plan']:
            search_terms = search_terms.replace(word, '')
        
        # Use first 4 words for search
        search_terms = ' '.join(search_terms.split()[:4]).strip()
        
        if not search_terms:
            return None
        
        # Search MFAPI
        response = requests.get(f"{MFAPI_SEARCH_URL}?q={requests.utils.quote(search_terms)}", timeout=10)
        results = response.json()
        
        if not results:
            return None
        
        # Determine plan type and option
        plan_type = 'Direct' if 'Direct' in fund_name else 'Regular'
        option_type = 'Growth' if '(G)' in fund_name else 'IDCW'
        
        # Find best match
        for item in results:
            scheme_name = item.get('schemeName', '')
            if plan_type in scheme_name and option_type in scheme_name:
                return item.get('schemeCode')
        
        # If no exact match, return first result
        return results[0].get('schemeCode')
        
    except Exception as e:
        print(f"   ❌ Error searching for {fund_name[:50]}: {str(e)}")
        return None

def generate_mappings():
    """Generate mappings for all funds"""
    print("🔍 Loading funds from CSV...")
    
    # Load existing mappings
    existing_mappings = {}
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE, 'r') as f:
            existing_mappings = json.load(f)
        print(f"✅ Loaded {len(existing_mappings)} existing mappings")
    
    # Load funds from CSV
    df = pd.read_csv(CSV_PATH)
    total_funds = len(df)
    print(f"✅ Loaded {total_funds} funds from CSV\n")
    
    # Generate mappings
    new_mappings = {}
    success_count = 0
    fail_count = 0
    skipped_count = 0
    
    print("🚀 Starting mapping generation...\n")
    
    for idx, row in df.iterrows():
        scheme_code = str(row['SCHEMECODE'])
        fund_name = row['S_NAME']
        
        # Skip if already mapped
        if scheme_code in existing_mappings:
            new_mappings[scheme_code] = existing_mappings[scheme_code]
            skipped_count += 1
            continue
        
        print(f"[{idx+1}/{total_funds}] {fund_name[:60]}")
        
        # Search MFAPI
        mfapi_code = search_mfapi(fund_name)
        
        if mfapi_code:
            new_mappings[scheme_code] = mfapi_code
            success_count += 1
            print(f"   ✅ Mapped: {scheme_code} → {mfapi_code}")
        else:
            fail_count += 1
            print(f"   ❌ Not found")
        
        # Rate limiting
        time.sleep(0.5)
        
        # Save every 50 mappings
        if (idx + 1) % 50 == 0:
            with open(MAPPING_FILE, 'w') as f:
                json.dump(new_mappings, f, indent=2)
            print(f"\n💾 Saved {len(new_mappings)} mappings\n")
    
    # Final save
    with open(MAPPING_FILE, 'w') as f:
        json.dump(new_mappings, f, indent=2)
    
    print("\n" + "="*60)
    print("📊 MAPPING GENERATION COMPLETE")
    print("="*60)
    print(f"✅ Successfully mapped: {success_count}")
    print(f"⏭️  Skipped (already mapped): {skipped_count}")
    print(f"❌ Failed to map: {fail_count}")
    print(f"📝 Total mappings: {len(new_mappings)}")
    print(f"💾 Saved to: {MAPPING_FILE}")
    print("="*60)

if __name__ == '__main__':
    generate_mappings()
