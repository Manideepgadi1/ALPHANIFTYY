"""Test improved date labels for different time periods"""
import sys
sys.path.insert(0, '.')
from app import app
import json

periods = ['1M', '6M', '1Y', '3Y', '5Y', 'All']

for period in periods:
    with app.test_client() as client:
        response = client.get(f'/api/baskets/b16/excel-performance?period={period}')
        data = response.get_json()
        
        if data['status'] == 'success':
            perf = data['data']['performance']
            print(f"\n{'='*60}")
            print(f"⏰ Time Period: {period}")
            print(f"{'='*60}")
            print(f"📊 Total data points: {len(perf)}")
            print(f"\n🎯 First 3 data points:")
            for p in perf[:3]:
                print(f"   {p['label']:15} | Date: {p['date']} | NAV: {p['portfolioNAV']:.2f}")
            print(f"\n🎯 Last 3 data points:")
            for p in perf[-3:]:
                print(f"   {p['label']:15} | Date: {p['date']} | NAV: {p['portfolioNAV']:.2f}")
