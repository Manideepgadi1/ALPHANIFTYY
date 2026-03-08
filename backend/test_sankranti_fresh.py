"""Test Sankranti Premium with fresh data load"""
import sys
sys.path.insert(0, '.')
from app import app
import json

# Force fresh request
with app.test_client() as client:
    response = client.get('/api/baskets/b16/excel-performance?period=All')
    data = response.get_json()
    
    if data['status'] == 'success':
        perf = data['data']['performance']
        print(f"✅ Total data points: {len(perf)}")
        print(f"\n📊 Last 3 data points:")
        for p in perf[-3:]:
            print(f"  Date: {p['date']} | Label: {p['label']} | Basket NAV: {p['portfolioNAV']:.2f}")
        
        last = perf[-1]
        print(f"\n🎯 LAST DATA POINT:")
        print(f"   Date: {last['date']}")
        print(f"   Month: {last['label']}")
        print(f"   Basket NAV: {last['portfolioNAV']}")
        print(f"   Nifty NAV: {last['niftyNAV']}")
        print(f"   Smart SIP: {last['smartSipValue']}")
        
        # Check if it matches expected (November 10, 2025)
        if 'Nov 2025' in last['label'] and last['portfolioNAV'] == 759.76:
            print("\n✅ CORRECT! Data matches November 10, 2025")
        else:
            print(f"\n❌ WRONG! Expected Nov 2025 with NAV 759.76")
    else:
        print(f"❌ Error: {data}")
