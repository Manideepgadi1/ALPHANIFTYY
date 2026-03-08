import pandas as pd

df = pd.read_excel('SankrantiPremiumnewupdated.xlsx')
df.columns = df.columns.str.strip()
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date')

print('LAST ROW IN YOUR ORIGINAL EXCEL FILE:')
last = df.iloc[-1]
print(f'Date: {last["Date"]}')
print(f'Basket NAV: {last["Basket NAV"]}')
print(f'Nifty 50: {last["Nifty 50"]}')
print(f'Smart SIP: {last["Smart SIP"]}')

print('\nNOVEMBER 10, 2025 DATA:')
nov10 = df[df['Date'] == '2025-11-10']
if len(nov10) > 0:
    row = nov10.iloc[0]
    print(f'Date: {row["Date"]}')
    print(f'Basket NAV: {row["Basket NAV"]}')
    print(f'Nifty 50: {row["Nifty 50"]}')
    print(f'Smart SIP: {row["Smart SIP"]}')
else:
    print('NOT FOUND')
