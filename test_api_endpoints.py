#!/usr/bin/env python3
"""Test all basket API endpoints to check which graphs are working"""

import urllib.request
import json
import sys

base_url = "http://127.0.0.1:5000"

# All baskets
all_baskets = [
    ('b1', 'Orange Basket'),
    ('b2', 'Blue Basket'),
    ('b3', 'Green Basket'),
    ('b4', 'Yellow Basket'),
    ('b6', 'Retirement Basket'),
    ('b7', 'Child Education Basket'),
    ('b8', 'Dream Home Basket'),
    ('b9', 'Aggressive Hybrid Basket'),
    ('b10', 'Conservative Balanced Basket'),
    ('b11', 'White Basket'),
    ('b12', 'Every Common India Basket'),
    ('b13', 'Raising India Basket'),
    ('b14', 'The Great India Basket'),
    ('b15', 'Dusshera Basket'),
    ('b16', 'Sankrathi Basket'),
]

print("\n" + "="*90)
print("TESTING BASKET PERFORMANCE API ENDPOINTS")
print("="*90)
print(f"\nBase URL: {base_url}")
print(f"Endpoint: /api/baskets/<id>/excel-performance?period=1Y")
print("\n" + "-"*90)

working = []
failing = []

for basket_id, basket_name in all_baskets:
    url = f"{base_url}/api/baskets/{basket_id}/excel-performance?period=1Y"
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                if data.get('status') == 'success':
                    perf_data = data.get('data', {}).get('performance', [])
                    if len(perf_data) > 0:
                        first_point = perf_data[0]
                        last_point = perf_data[-1]
                        print(f"✓ {basket_id:4} | {basket_name:35} | {len(perf_data):3} points | {first_point.get('date')} to {last_point.get('date')}")
                        working.append(basket_id)
                    else:
                        print(f"✗ {basket_id:4} | {basket_name:35} | NO DATA (empty array)")
                        failing.append((basket_id, 'Empty data array'))
                else:
                    msg = data.get('message', 'Unknown error')
                    print(f"✗ {basket_id:4} | {basket_name:35} | ERROR: {msg}")
                    failing.append((basket_id, msg))
            else:
                print(f"✗ {basket_id:4} | {basket_name:35} | HTTP {response.status}")
                failing.append((basket_id, f'HTTP {response.status}'))
    except urllib.error.URLError as e:
        if "Connection refused" in str(e):
            print(f"\n✗ ERROR: Backend server not running on {base_url}")
            print("  Please start the backend server first:")
            print("  cd D:\\VSFintech-Platform\\Alphanifty\\backend")
            print("  python app.py")
            sys.exit(1)
        else:
            print(f"✗ {basket_id:4} | {basket_name:35} | Connection error: {str(e)[:40]}")
            failing.append((basket_id, str(e)))
    except Exception as e:
        print(f"✗ {basket_id:4} | {basket_name:35} | Exception: {str(e)[:40]}")
        failing.append((basket_id, str(e)))

print("\n" + "="*90)
print("SUMMARY:")
print(f"  Working (graphs visible): {len(working)}/{len(all_baskets)}")
print(f"  Failing (graphs NOT visible): {len(failing)}/{len(all_baskets)}")

if working:
    print(f"\n✓ Working basket IDs: {', '.join(working)}")

if failing:
    print(f"\n✗ Failing baskets:")
    for bid, reason in failing:
        print(f"  - {bid}: {reason[:60]}")

print("="*90 + "\n")

# Exit with error code if any baskets are failing
sys.exit(1 if failing else 0)
