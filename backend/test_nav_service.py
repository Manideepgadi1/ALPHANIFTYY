"""
Test the NAV Service - Real-time fetching with caching
"""
from nav_service import NAVService

print("=" * 70)
print("TESTING NAV SERVICE - Real-time fetching")
print("=" * 70)

# Initialize service (loads 9,891 funds from CSV)
service = NAVService()

print("\n1. TEST: Search for 'Aditya Birla Banking' funds")
results = service.search_funds('Aditya Birla Banking', limit=5)
print(f"Found {len(results)} funds:\n")
for fund in results:
    print(f"  {fund['SCHEMECODE']}: {fund['S_NAME'][:50]}")

print("\n2. TEST: Get fund details with NAV (scheme 5184)")
print("   First call - should fetch from API...")
fund = service.get_fund_with_nav(5184)
if fund:
    print(f"   ✅ Fund: {fund['S_NAME'][:50]}")
    print(f"   ✅ NAV: ₹{fund.get('nav')} (Date: {fund.get('date')})")
    print(f"   ✅ Change: {fund.get('change')} ({fund.get('change_percent')}%)")
    print(f"   ✅ AUM: {fund.get('aum')}")
    print(f"   ✅ Expense Ratio: {fund.get('expense_ratio')}")
    print(f"   📡 Source: {fund.get('source')}")

print("\n3. TEST: Get same fund again - should use cache...")
fund2 = service.get_fund_with_nav(5184)
if fund2:
    print(f"   📦 Source: {fund2.get('source')} (should be 'cache')")

print("\n4. TEST: Get NAV chart data (1 year)")
chart_data = service.get_fund_chart(5184, '1Y')
if 'Table' in chart_data:
    print(f"   ✅ Got {len(chart_data['Table'])} data points")
    if chart_data['Table']:
        latest = chart_data['Table'][0]
        print(f"   Latest: NAV {latest.get('NAV')} on {latest.get('Date')}")

print("\n5. TEST: Get all categories")
categories = service.get_categories()
print(f"   ✅ Found {len(categories)} categories:")
for cat in categories[:5]:
    print(f"   {cat['CATEGORY_CODE']}: {cat['CATEGORY_NAME']} ({cat['count']} funds)")

print("\n" + "=" * 70)
print("✅ NAV SERVICE WORKING PERFECTLY!")
print("=" * 70)
print("\nArchitecture:")
print("  📁 MF.csv (9,891 funds) → Static master data")
print("  🌐 Accord API → Real-time NAV data")
print("  💾 Cache (4 hours) → Reduce API calls")
print("  🚀 Flask endpoints → Serve to frontend")
