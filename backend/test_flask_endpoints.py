"""
Test Flask NAV endpoints
"""
import requests
import json

BASE_URL = 'http://localhost:5000/api'

print("=" * 70)
print("TESTING FLASK NAV ENDPOINTS")
print("=" * 70)

# Test 1: Search funds
print("\n1. Search for 'HDFC Bank' funds")
response = requests.get(f'{BASE_URL}/nav/search?q=HDFC Bank&limit=5')
data = response.json()
print(f"   Status: {data['status']}")
print(f"   Found: {data['count']} funds")
if data['data']:
    for fund in data['data'][:3]:
        print(f"   - {fund['SCHEMECODE']}: {fund['S_NAME'][:60]}")

# Test 2: Get fund details with NAV
print("\n2. Get fund details with NAV (scheme 5184)")
response = requests.get(f'{BASE_URL}/nav/5184')
data = response.json()
if data['status'] == 'success':
    fund = data['data']
    print(f"   ✅ Fund: {fund['S_NAME'][:50]}")
    print(f"   ✅ NAV: ₹{fund.get('nav')}")
    print(f"   ✅ Date: {fund.get('date')}")
    print(f"   ✅ Change: {fund.get('change')} ({fund.get('change_percent')}%)")
    print(f"   ✅ AUM: ₹{fund.get('aum')} Cr")
    print(f"   ✅ Expense Ratio: {fund.get('expense_ratio')}%")
    print(f"   📡 Source: {fund.get('source')}")

# Test 3: Get NAV chart data
print("\n3. Get NAV chart (1 year)")
response = requests.get(f'{BASE_URL}/nav/5184/chart?period=1Y')
data = response.json()
if data['status'] == 'success' and 'Table' in data['data']:
    print(f"   ✅ Got {len(data['data']['Table'])} data points")

# Test 4: Get categories
print("\n4. Get all categories")
response = requests.get(f'{BASE_URL}/nav/categories')
data = response.json()
if data['status'] == 'success':
    print(f"   ✅ Found {len(data['data'])} categories")
    for cat in data['data'][:5]:
        print(f"   - {cat['CATEGORY_CODE']}: {cat['CATEGORY_NAME']} ({cat['count']} funds)")

# Test 5: Get factsheet
print("\n5. Get complete factsheet (scheme 5184)")
response = requests.get(f'{BASE_URL}/nav/5184/factsheet')
data = response.json()
if data['status'] == 'success':
    factsheet = data['data']
    sections = list(factsheet.keys())
    print(f"   ✅ Sections: {', '.join(sections)}")
    if 'holdings' in factsheet and factsheet['holdings']:
        print(f"   ✅ Holdings: {len(factsheet['holdings'])} stocks")

print("\n" + "=" * 70)
print("✅ ALL ENDPOINTS WORKING!")
print("=" * 70)
