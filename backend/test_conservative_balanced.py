"""Test Conservative Balanced basket"""
import sys
sys.path.insert(0, '.')
from app import app

with app.test_client() as client:
    response = client.get('/api/baskets/b10/excel-performance?period=All')
    data = response.get_json()
    
    if data['status'] == 'success':
        perf = data['data']['performance']
        print(f"✅ Conservative Balanced Basket (b10)")
        print(f"Total data points: {len(perf)}")
        
        print(f"\n📊 Last 3 data points:")
        for p in perf[-3:]:
            print(f"  {p['label']:15} | Date: {p['date']} | NAV: {p['portfolioNAV']:.2f}")
        
        last = perf[-1]
        print(f"\n🎯 LAST DATA:")
        print(f"   Date: {last['date']}")
        print(f"   Basket NAV: {last['portfolioNAV']}")
        
        if last['date'] == '2026-01-21' and abs(last['portfolioNAV'] - 266.21) < 1:
            print("\n✅ CORRECT! Using Conservative Premium.xlsx")
        else:
            print(f"\n❌ WRONG! Expected 2026-01-21 with NAV ~266.21")
    else:
        print(f"❌ Error: {data}")
