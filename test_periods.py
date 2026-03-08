import requests
import json

url = "http://82.25.105.18:5000/api/baskets/b16/excel-performance"

periods = ['1M', '6M', 'YTD', '1Y', '3Y', '5Y', 'All']

for period in periods:
    try:
        response = requests.get(f"{url}?period={period}")
        data = response.json()
        
        if data['status'] == 'success':
            perf = data['data']['performance']
            first = perf[0]
            print(f"\n=== {period} ===")
            print(f"Start Date: {data['data']['startDate']}")
            print(f"First Point: {first['date']}")
            print(f"Portfolio: {first['portfolioValue']}")
            print(f"Smart SIP: {first.get('smartSipValue', 'N/A')}")
            print(f"Nifty: {first['niftyValue']}")
    except Exception as e:
        print(f"Error for {period}: {e}")
