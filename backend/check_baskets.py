import sys
sys.path.insert(0, ".")
from data.mock_data import baskets_data
print(f"Total: {len(baskets_data)}")
for b in baskets_data[-3:]:
    print(f"{b.get('id')}: {b.get('name')}")
b16 = [b for b in baskets_data if b.get("id") == "b16"]
print(f"b16 found: {len(b16) > 0}")
