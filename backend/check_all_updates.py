import pandas as pd

files = [
    ('SankrantiPremiumnewupdated.xlsx', 'b16', 'Sankranti Premium'),
    ('Aggressive Premium.xlsx', 'b9', 'Premium Aggressive'),
    ('Everycommonindiaupdated.xlsx', 'b12', 'Every Common India'),
    ('the great india basket.xlsx', 'b14', 'Great India Basket')
]

for filename, basket_id, basket_name in files:
    try:
        df = pd.read_excel(f'D:/VSFintech-Platform/Alphanifty/{filename}')
        print(f'\n📊 {basket_name} ({basket_id}):')
        print(f'   File: {filename}')
        print(f'   Rows: {len(df)}')
        print(f'   Columns: {list(df.columns)}')
        print(f'   Last date: {df.iloc[-1, 0]} | NAV: {df.iloc[-1, 1]:.2f}')
    except Exception as e:
        print(f'\n❌ {basket_name} ({basket_id}): Error - {str(e)}')
