import pandas as pd

# Check both files
files = ['SankrantiPremium.xlsx', 'SankrantiPremiumnewupdated.xlsx']

for filename in files:
    try:
        df = pd.read_excel(filename)
        df.columns = df.columns.str.strip()
        df['Date'] = pd.to_datetime(df['Date'])
        df = df.sort_values('Date')
        
        print(f"\n{'='*60}")
        print(f"FILE: {filename}")
        print(f"{'='*60}")
        print(f"Total rows: {len(df)}")
        print(f"\nLast 3 rows:")
        print(df.tail(3)[['Date', 'Basket NAV', 'Nifty 50', 'Smart SIP']].to_string())
        
        last = df.iloc[-1]
        print(f"\nLAST DATE: {last['Date']}")
        print(f"Basket NAV: {last['Basket NAV']}")
        print(f"Nifty 50: {last['Nifty 50']}")
        print(f"Smart SIP: {last['Smart SIP']}")
    except Exception as e:
        print(f"\nError reading {filename}: {e}")
