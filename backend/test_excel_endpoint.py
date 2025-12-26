import requests
import json

# Test the Excel performance endpoint
url = "http://127.0.0.1:5000/api/baskets/b14/excel-performance?period=5Y"

try:
    response = requests.get(url)
    data = response.json()
    
    print("Status Code:", response.status_code)
    print("\nResponse Status:", data.get('status'))
    
    if data.get('status') == 'success':
        perf_data = data['data']['performance']
        print(f"\nTotal data points: {len(perf_data)}")
        print(f"Period: {data['data']['period']}")
        print(f"Date range: {data['data']['startDate']} to {data['data']['endDate']}")
        print("\nFirst 3 data points:")
        for i, point in enumerate(perf_data[:3]):
            print(f"  {i+1}. Date: {point['date']}, Portfolio: {point['portfolioValue']}, Nifty: {point['niftyValue']}")
        print("\nLast 3 data points:")
        for i, point in enumerate(perf_data[-3:]):
            print(f"  {len(perf_data)-2+i}. Date: {point['date']}, Portfolio: {point['portfolioValue']}, Nifty: {point['niftyValue']}")
    else:
        print("\nError:", data.get('message'))
        
except Exception as e:
    print("Error:", str(e))
