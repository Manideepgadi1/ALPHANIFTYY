from excel_loader import ExcelDataLoader

# Test loading from NEW Excel with 8 baskets
loader = ExcelDataLoader('AlphaniftyMasterData_NEW.xlsx', cache_duration=120)
baskets = loader.load_baskets_from_excel()

print(f'✅ Loaded {len(baskets)} baskets from NEW Excel\n')
for basket in baskets:
    print(f'  • {basket["id"]}: {basket["name"]} (CAGR 5Y: {basket["cagr5Y"]}%)')
