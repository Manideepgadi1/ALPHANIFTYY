import pandas as pd
from dateutil.relativedelta import relativedelta
from datetime import datetime
import os

# Read the Excel file
file_path = os.path.join(os.path.dirname(__file__), 'Sankrathi_Basket.xlsx')
df = pd.read_excel(file_path)

# Print column names
print('Column names:', df.columns.tolist())
print('Total rows:', len(df))
print('\nFirst 5 rows:')
print(df.head())

# Test normalization logic for 1Y period
date_col = 'Dates'
basket_col = 'Basket NAV'
nifty_col = 'Nifty 50'

# Convert date column to datetime
df[date_col] = pd.to_datetime(df[date_col])

# Sort by date ascending
df = df.sort_values(date_col)

# Get 1Y data
end_date = df[date_col].max()
start_date = end_date - relativedelta(years=1)

# Filter data
filtered_df = df[df[date_col] >= start_date].copy()

print(f'\n1Y Period filtered data:')
print(f'  Rows: {len(filtered_df)}')
print(f'  Date range: {filtered_df[date_col].min()} to {filtered_df[date_col].max()}')

# Sample the dataframe (weekly for 1Y)
sample_days = 7
sampled_df = filtered_df.iloc[::sample_days].copy()

print(f'\nSampled data (every {sample_days} days):')
print(f'  Rows: {len(sampled_df)}')

# Normalize to base 100 at the START of the selected period
if len(sampled_df) > 0:
    first_basket = sampled_df[basket_col].iloc[0]
    first_nifty = sampled_df[nifty_col].iloc[0]
    
    print(f'\nFirst values:')
    print(f'  Basket NAV: {first_basket}')
    print(f'  Nifty 50: {first_nifty}')
    
    sampled_df['Portfolio_Normalized'] = (sampled_df[basket_col] / first_basket) * 100
    sampled_df['Nifty_Normalized'] = (sampled_df[nifty_col] / first_nifty) * 100
    
    print(f'\nNormalized values (first point):')
    print(f'  Portfolio: {sampled_df["Portfolio_Normalized"].iloc[0]}')
    print(f'  Nifty: {sampled_df["Nifty_Normalized"].iloc[0]}')
    
    print(f'\nNormalized values (last point):')
    print(f'  Portfolio: {sampled_df["Portfolio_Normalized"].iloc[-1]}')
    print(f'  Nifty: {sampled_df["Nifty_Normalized"].iloc[-1]}')
    
    # Check if normalization worked
    if abs(sampled_df['Portfolio_Normalized'].iloc[0] - 100) < 0.1:
        print('\n✓ Normalization successful - Portfolio starts at 100')
    else:
        print('\n✗ Normalization failed - Portfolio does not start at 100')
    
    if abs(sampled_df['Nifty_Normalized'].iloc[0] - 100) < 0.1:
        print('✓ Normalization successful - Nifty starts at 100')
    else:
        print('✗ Normalization failed - Nifty does not start at 100')
