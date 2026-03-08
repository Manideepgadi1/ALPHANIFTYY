"""
Test Accord API integration with actual fund data
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from accord_api import accord_api
import pandas as pd

# Test with sample scheme code from Excel
print("=" * 60)
print("ACCORD API TEST")
print("=" * 60)

# Read Excel to get a sample SCHEMECODE
excel_file = os.path.join(os.path.dirname(__file__), 'MF.xlsx')
df = pd.read_excel(excel_file)
sample_code = str(df.iloc[0]['SCHEMECODE'])  # First fund
sample_name = df.iloc[0]['S_NAME']

print(f"\n📊 Testing with: {sample_name}")
print(f"   SCHEMECODE: {sample_code}")

# Test 1: Get Fund Factsheet
print("\n1️⃣  Testing Fund Factsheet...")
try:
    factsheet = accord_api.get_fund_factsheet(sample_code)
    if 'error' in factsheet:
        print(f"   ❌ Error: {factsheet['error']}")
    else:
        print("   ✅ Factsheet received!")
        if isinstance(factsheet, dict):
            print(f"   Tables found: {list(factsheet.keys())}")
except Exception as e:
    print(f"   ❌ Exception: {str(e)}")

# Test 2: Get NAV Chart Data
print("\n2️⃣  Testing NAV Chart Data (1 Year)...")
try:
    nav_data = accord_api.get_nav_chart_data(sample_code, '1Y')
    if 'error' in nav_data:
        print(f"   ❌ Error: {nav_data['error']}")
    else:
        print("   ✅ NAV data received!")
        if isinstance(nav_data, list) and len(nav_data) > 0:
            print(f"   Data points: {len(nav_data)}")
            print(f"   Sample: {nav_data[0]}")
except Exception as e:
    print(f"   ❌ Exception: {str(e)}")

# Test 3: Get Benchmark Returns
print("\n3️⃣  Testing Fund vs Benchmark Returns...")
try:
    returns = accord_api.get_fund_benchmark_returns(sample_code)
    if 'error' in returns:
        print(f"   ❌ Error: {returns['error']}")
    else:
        print("   ✅ Returns data received!")
        if isinstance(returns, dict):
            print(f"   Tables: {list(returns.keys())}")
except Exception as e:
    print(f"   ❌ Exception: {str(e)}")

# Test 4: Get Peer Comparison
sample_category = str(df.iloc[0]['CATEGORY_CODE'])
print(f"\n4️⃣  Testing Peer Comparison (Category: {sample_category})...")
try:
    peers = accord_api.get_peer_comparison(sample_category)
    if 'error' in peers:
        print(f"   ❌ Error: {peers['error']}")
    else:
        print("   ✅ Peer data received!")
        if isinstance(peers, list):
            print(f"   Total peers: {len(peers)}")
except Exception as e:
    print(f"   ❌ Exception: {str(e)}")

# Test 5: Get ISIN
print(f"\n5️⃣  Testing ISIN Code...")
try:
    isin = accord_api.get_scheme_isin(sample_code)
    if 'error' in isin:
        print(f"   ❌ Error: {isin['error']}")
    else:
        print("   ✅ ISIN data received!")
        print(f"   Data: {isin}")
except Exception as e:
    print(f"   ❌ Exception: {str(e)}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
print("\n💡 Next Steps:")
print("   1. Add ACCORD_API_TOKEN to .env file")
print("   2. Run this script again to verify API access")
print("   3. Check response structure to match with UI")
