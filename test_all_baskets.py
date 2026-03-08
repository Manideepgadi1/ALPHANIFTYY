#!/usr/bin/env python3
"""Test all basket API endpoints"""

import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from data.mock_data import baskets_data

print("\n" + "="*80)
print("BASKET CONFIGURATION ANALYSIS")
print("="*80)

# Group baskets
with_excel = []
without_excel = []
excel_missing = []

backend_dir = os.path.join(os.path.dirname(__file__), 'backend')

for basket in baskets_data:
    bid = basket['id']
    name = basket['name']
    excel_file = basket.get('excelFile')
    
    if excel_file:
        file_path = os.path.join(backend_dir, excel_file)
        exists = os.path.exists(file_path)
        
        if exists:
            with_excel.append((bid, name, excel_file))
        else:
            excel_missing.append((bid, name, excel_file))
    else:
        without_excel.append((bid, name))

# Print results
print(f"\n✓ BASKETS WITH WORKING EXCEL FILES ({len(with_excel)}):")
print("-" * 80)
for bid, name, excel in with_excel:
    print(f"  {bid:4} | {name:40} | {excel}")

print(f"\n⚠ BASKETS WITHOUT EXCEL (will use mock data) ({len(without_excel)}):")
print("-" * 80)
for bid, name in without_excel:
    print(f"  {bid:4} | {name}")

if excel_missing:
    print(f"\n✗ BASKETS WITH MISSING EXCEL FILES ({len(excel_missing)}):")
    print("-" * 80)
    for bid, name, excel in excel_missing:
        print(f"  {bid:4} | {name:40} | {excel}")

# Summary
print("\n" + "="*80)
print("SUMMARY:")
print(f"  Total baskets: {len(baskets_data)}")
print(f"  Working with Excel: {len(with_excel)}")
print(f"  Using mock data: {len(without_excel)}")
print(f"  Missing Excel files: {len(excel_missing)}")
print("="*80)

# Check if baskets using same Excel file
print("\nBASKETS SHARING SAME EXCEL FILES:")
print("-" * 80)
excel_usage = {}
for bid, name, excel in with_excel:
    if excel not in excel_usage:
        excel_usage[excel] = []
    excel_usage[excel].append((bid, name))

for excel_file, baskets in excel_usage.items():
    if len(baskets) > 1:
        print(f"\n  {excel_file}:")
        for bid, name in baskets:
            print(f"    - {bid}: {name}")

print("\n" + "="*80 + "\n")
