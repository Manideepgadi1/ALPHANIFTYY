"""
Check AMFI and other public APIs for NAV data
"""
import requests
import pandas as pd
from io import StringIO

print("=" * 70)
print("CHECKING PUBLIC NAV DATA SOURCES")
print("=" * 70)

# 1. AMFI NAV Data (Public, Free)
print("\n1. AMFI NAV DATA:")
print("-" * 70)
amfi_url = "https://www.amfiindia.com/spages/NAVAll.txt"
try:
    print(f"   Fetching: {amfi_url}")
    r = requests.get(amfi_url, timeout=30)
    if r.status_code == 200:
        # Parse the text file
        lines = r.text.strip().split('\n')
        print(f"   ✓ Status: {r.status_code}")
        print(f"   ✓ Total lines: {len(lines)}")
        print(f"\n   First 20 lines:")
        for i, line in enumerate(lines[:20]):
            print(f"      {i+1}: {line[:80]}")
        
        # Try to parse NAV data
        nav_records = []
        current_amc = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if line.startswith('Scheme Code'):
                continue
            if ';' not in line:
                current_amc = line
                continue
            
            parts = line.split(';')
            if len(parts) >= 5:
                nav_records.append({
                    'scheme_code': parts[0],
                    'isin_div': parts[1] if len(parts) > 1 else '',
                    'isin_growth': parts[2] if len(parts) > 2 else '',
                    'scheme_name': parts[3] if len(parts) > 3 else '',
                    'nav': parts[4] if len(parts) > 4 else '',
                    'date': parts[5] if len(parts) > 5 else '',
                    'amc': current_amc
                })
        
        print(f"\n   ✓ Parsed {len(nav_records)} NAV records")
        if nav_records:
            print(f"\n   Sample records:")
            for rec in nav_records[:3]:
                print(f"      Code: {rec['scheme_code']}, NAV: {rec['nav']}, Date: {rec['date']}")
                print(f"      Name: {rec['scheme_name'][:60]}")
                print()
            
            # Save sample
            df = pd.DataFrame(nav_records)
            df.to_excel('../amfi_nav_sample.xlsx', index=False)
            print(f"   ✓ Saved sample to amfi_nav_sample.xlsx")
    else:
        print(f"   ✗ Status: {r.status_code}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# 2. MFApi (Unofficial but popular)
print("\n2. MFAPI (Unofficial Public API):")
print("-" * 70)
mfapi_url = "https://api.mfapi.in/mf"
try:
    print(f"   Fetching: {mfapi_url}")
    r = requests.get(mfapi_url, timeout=30)
    if r.status_code == 200:
        schemes = r.json()
        print(f"   ✓ Status: {r.status_code}")
        print(f"   ✓ Total schemes: {len(schemes)}")
        print(f"\n   Sample schemes:")
        for s in schemes[:5]:
            print(f"      {s['schemeCode']}: {s['schemeName'][:60]}")
        
        # Test getting NAV for one scheme
        test_code = schemes[0]['schemeCode']
        nav_url = f"https://api.mfapi.in/mf/{test_code}"
        r2 = requests.get(nav_url, timeout=30)
        if r2.status_code == 200:
            data = r2.json()
            print(f"\n   Testing NAV fetch for scheme {test_code}:")
            print(f"      Scheme: {data['meta']['scheme_name'][:60]}")
            print(f"      Fund House: {data['meta']['fund_house']}")
            if 'data' in data and len(data['data']) > 0:
                print(f"      NAV Records: {len(data['data'])}")
                print(f"      Latest NAV: {data['data'][0]['nav']} (Date: {data['data'][0]['date']})")
                print(f"      Oldest NAV: {data['data'][-1]['nav']} (Date: {data['data'][-1]['date']})")
    else:
        print(f"   ✗ Status: {r.status_code}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# 3. RapidAPI MF endpoint (may require key)
print("\n3. OTHER SOURCES:")
print("-" * 70)
print("   • MFCentral: Requires login (not free API)")
print("   • Direct AMC APIs: Each AMC has different format")
print("   • NSE/BSE: Historical NAV data available")

print("\n" + "=" * 70)
