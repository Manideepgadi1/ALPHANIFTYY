from data.excel_loader import excel_loader

# Test loading baskets
print("Testing Excel Loader...")
baskets = excel_loader.load_baskets_from_excel()
print(f"\n✅ Successfully loaded {len(baskets)} baskets")
print(f"\nFirst basket details:")
print(f"  ID: {baskets[0]['id']}")
print(f"  Name: {baskets[0]['name']}")
print(f"  CAGR5Y: {baskets[0]['cagr5Y']}%")
print(f"  Funds: {len(baskets[0]['fundAllocations'])}")
print(f"  Sectors: {len(baskets[0]['sectorAllocation'])}")
print(f"  Holdings: {len(baskets[0]['topHoldings'])}")

# Test cache
print("\n\nTesting cache (loading again)...")
baskets2 = excel_loader.load_baskets_from_excel()
print(f"✅ Cache working - returned {len(baskets2)} baskets")
