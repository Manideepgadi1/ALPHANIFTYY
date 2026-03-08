from data.excel_loader import excel_loader

baskets = excel_loader.load_baskets_from_excel()
print(f'\n✅ Loaded {len(baskets)} baskets from AlphaniftyMasterData.xlsx\n')
for basket in baskets:
    num_funds = len(basket.get('fundAllocations', []))
    print(f'  • {basket["id"]}: {basket["name"]} ({num_funds} funds)')
