import pandas as pd

file = 'Balance, conservative, shankrati.xlsx'
xl = pd.ExcelFile(file)
print('Sheets:', xl.sheet_names)

for sheet in xl.sheet_names:
    df = pd.read_excel(file, sheet_name=sheet)
    print(f'\n=== {sheet} ===')
    print('Columns:', df.columns.tolist())
    print('Shape:', df.shape)
    print('First 5 rows:')
    print(df.head(5))
