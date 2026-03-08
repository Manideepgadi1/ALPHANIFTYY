"""Test Every Common India basket graph data"""
import sys
sys.path.insert(0, '.')
from app import app

with app.test_client() as client:
    response = client.get('/api/baskets/b12/excel-performance?period=All')
    data = response.get_json()
    
    if data['status'] == 'success':
        perf = data['data']['performance']
        print(f"✅ Every Common India basket (b12)")
        print(f"Total data points: {len(perf)}")
        print(f"\n📊 First 3 data points:")
        for p in perf[:3]:
            print(f"  {p['label']:15} | Date: {p['date']} | NAV: {p['portfolioNAV']:.2f}")
        
        print(f"\n📊 Last 3 data points:")
        for p in perf[-3:]:
            print(f"  {p['label']:15} | Date: {p['date']} | NAV: {p['portfolioNAV']:.2f}")
        
        last = perf[-1]
        print(f"\n🎯 LAST DATA POINT:")
        print(f"   Date: {last['date']}")
        print(f"   Label: {last['label']}")
        print(f"   Basket NAV: {last['portfolioNAV']}")
        print(f"   Nifty NAV: {last['niftyNAV']}")
        print(f"   Smart SIP: {last['smartSipValue']}")
        
        if last['date'] == '2026-01-21' and last['portfolioNAV'] == 941.88:
            print("\n✅ CORRECT! Using Everycommonindiaupdated.xlsx")
        else:
            print(f"\n❌ ERROR: Expected date 2026-01-21 with NAV 941.88")
    else:
        print(f"❌ Error: {data}")
