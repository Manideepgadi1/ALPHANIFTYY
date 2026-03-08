import requests

# Test the Excel performance endpoint with different time periods
basket_id = 'b16'
time_periods = ['1M', '6M', 'YTD', '1Y', '3Y', '5Y', 'All']

print('Testing Sankrathi Basket Performance API with Normalization\n')
print('='*70)

for period in time_periods:
    try:
        url = f'http://127.0.0.1:5000/api/baskets/{basket_id}/excel-performance?period={period}'
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'success':
                performance = data['data']['performance']
                if performance:
                    first_point = performance[0]
                    last_point = performance[-1]
                    
                    print(f'\n{period} Period:')
                    print(f'  Data points: {len(performance)}')
                    print(f'  First point (normalized): Portfolio={first_point["portfolioValue"]}, Nifty={first_point["niftyValue"]}')
                    print(f'  Last point (normalized): Portfolio={last_point["portfolioValue"]}, Nifty={last_point["niftyValue"]}')
                    print(f'  Date range: {first_point["date"]} to {last_point["date"]}')
                    
                    # Check if normalization is correct (should start at 100)
                    if abs(first_point["portfolioValue"] - 100) < 0.1 and abs(first_point["niftyValue"] - 100) < 0.1:
                        print(f'  ✓ Normalization OK - Both start at 100')
                    else:
                        print(f'  ✗ Normalization FAILED - Not starting at 100!')
                else:
                    print(f'\n{period} Period: No data')
        else:
            print(f'\n{period} Period: HTTP Error {response.status_code}')
    except requests.exceptions.ConnectionError:
        print(f'\n{period} Period: Backend not running')
        break
    except Exception as e:
        print(f'\n{period} Period: Error - {e}')

print('\n' + '='*70)
