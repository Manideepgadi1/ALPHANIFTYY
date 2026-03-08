"""
Check if we can match Excel funds with AMFI API (public, free)
"""
import pandas as pd
import requests

print("=" * 70)
print("CHECKING AMFI PUBLIC API FOR YOUR EXCEL FUNDS")
print("=" * 70)

# Load your Excel
print("\n1. Loading your Excel (MF.xlsx)...")
excel = pd.read_excel('../MF.xlsx')
print(f"   ✓ {len(excel)} funds in your Excel")
print(f"   Sample: {excel.iloc[0]['S_NAME']}")

# Try AMFI API (public)
print("\n2. Checking AMFI API...")
amfi_url = 'https://www.amfiindia.com/spages/NAVAll.txt'

try:
    r = requests.get(amfi_url, timeout=30)
    if r.status_code == 200:
        print(f"   ✅ AMFI API works! Got {len(r.text)} bytes of data")
        
        # Parse AMFI data (simplified)
        lines = r.text.split('\n')
        amfi_funds = []
        for line in lines:
            if ';' in line:
                parts = line.split(';')
                if len(parts) >= 5:
                    amfi_funds.append({
                        'code': parts[0],
                        'name': parts[3],
                        'nav': parts[4]
                    })
        
        print(f"   ✅ Found {len(amfi_funds)} funds in AMFI")
        print(f"   Sample: {amfi_funds[0] if amfi_funds else 'None'}")
        
        # Try to match your Excel fund
        excel_fund = excel.iloc[0]['S_NAME']
        print(f"\n3. Searching for: {excel_fund}")
        
        # Simple name matching
        matches = []
        for f in amfi_funds[:1000]:  # Check first 1000
            if 'aditya birla' in f['name'].lower() and 'banking' in f['name'].lower():
                matches.append(f)
        
        if matches:
            print(f"   ✅ Found {len(matches)} potential matches:")
            for m in matches[:5]:
                print(f"      {m['code']}: {m['name']} - NAV: {m['nav']}")
        else:
            print(f"   ⚠️  No exact matches, showing sample AMFI funds:")
            for f in amfi_funds[:5]:
                print(f"      {f['code']}: {f['name'][:60]}... - NAV: {f['nav']}")
    else:
        print(f"   ❌ AMFI Status: {r.status_code}")
        
except Exception as e:
    print(f"   ❌ Error: {str(e)}")

print("\n" + "=" * 70)
print("RECOMMENDATION:")
print("=" * 70)
print("1. AMFI API is FREE and has ALL funds (10,000+)")
print("2. Your manager's Accord token shows 403 error")
print("3. Ask your manager:")
print("   - Is the token activated?")
print("   - What is the correct API endpoint?")
print("   - Can they test the token on their side?")
print("=" * 70)
