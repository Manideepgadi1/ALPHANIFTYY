"""
Excel Data Loader for Alphanifty
Loads basket data from Excel file with caching mechanism
"""

import pandas as pd
from datetime import datetime
import os
import json

class ExcelDataLoader:
    def __init__(self, excel_path, cache_duration=120):
        """
        Initialize Excel Data Loader
        
        Args:
            excel_path: Path to the Excel file
            cache_duration: Cache duration in seconds (default: 120 = 2 minutes)
        """
        self.excel_path = excel_path
        self.cache_duration = cache_duration
        self.last_modified = None
        self.cached_baskets = None
        self.cached_funds = None
        
    def is_cache_valid(self):
        """Check if cache is still valid"""
        if not self.cached_baskets or not self.last_modified:
            return False
        
        current_time = datetime.now()
        time_diff = (current_time - self.last_modified).total_seconds()
        
        return time_diff < self.cache_duration
    
    def load_baskets_from_excel(self):
        """Load basket data from Excel file"""
        
        # Check cache first
        if self.is_cache_valid():
            print(f"🔄 Using cached data (age: {(datetime.now() - self.last_modified).total_seconds():.0f}s)")
            return self.cached_baskets
        
        print(f"📖 Loading fresh data from Excel: {self.excel_path}")
        
        try:
            # Read all sheets
            df_baskets = pd.read_excel(self.excel_path, sheet_name='Baskets')
            df_fund_allocations = pd.read_excel(self.excel_path, sheet_name='FundAllocations')
            df_sector_allocations = pd.read_excel(self.excel_path, sheet_name='SectorAllocations')
            df_top_holdings = pd.read_excel(self.excel_path, sheet_name='TopHoldings')
            
            baskets = []
            
            # Process each basket
            for _, basket_row in df_baskets.iterrows():
                basket_id = basket_row['BasketID']
                
                # Get fund allocations for this basket
                basket_funds = df_fund_allocations[df_fund_allocations['BasketID'] == basket_id]
                fund_allocations = [
                    {
                        'fundId': row['FundID'],
                        'fundName': row['FundName'],
                        'allocationPercent': float(row['AllocationPercent']),
                        'category': row['Category']
                    }
                    for _, row in basket_funds.iterrows()
                ]
                
                # Get sector allocations
                basket_sectors = df_sector_allocations[df_sector_allocations['BasketID'] == basket_id]
                sector_allocations = [
                    {
                        'sector': row['SectorName'],
                        'percent': float(row['Percent'])
                    }
                    for _, row in basket_sectors.iterrows()
                ]
                
                # Get top holdings
                basket_holdings = df_top_holdings[df_top_holdings['BasketID'] == basket_id]
                top_holdings = [
                    {
                        'stockName': row['StockName'],
                        'percent': float(row['Percent']),
                        'sector': row['Sector'],
                        'type': row['Type']
                    }
                    for _, row in basket_holdings.iterrows()
                ]
                
                # Parse goals (pipe-separated)
                goals_str = basket_row.get('Goals', '')
                goals = goals_str.split('|') if pd.notna(goals_str) and goals_str else []
                
                # Build basket object
                basket = {
                    'id': basket_id,
                    'name': basket_row['Name'],
                    'color': basket_row['Color'],
                    'description': basket_row['Description'],
                    'ageRange': basket_row['AgeRange'],
                    'riskLevel': basket_row['RiskLevel'],
                    'minInvestment': int(basket_row['MinInvestment']),
                    'timeHorizon': basket_row['TimeHorizon'],
                    'cagr1Y': float(basket_row['CAGR1Y']),
                    'cagr3Y': float(basket_row['CAGR3Y']),
                    'cagr5Y': float(basket_row['CAGR5Y']),
                    'riskPercentage': float(basket_row['RiskPercentage']),
                    'sharpeRatio': float(basket_row['SharpeRatio']),
                    'experienceLevel': basket_row['ExperienceLevel'],
                    'goals': goals,
                    'excelFile': basket_row.get('ExcelFileName', ''),
                    'philosophy': basket_row.get('Philosophy', ''),
                    'rebalancingFrequency': basket_row.get('RebalancingFrequency', 'Quarterly'),
                    'funds': [f['fundId'] for f in fund_allocations],
                    'fundAllocations': fund_allocations,
                    'sectorAllocation': sector_allocations,
                    'topHoldings': top_holdings
                }
                
                baskets.append(basket)
            
            # Update cache
            self.cached_baskets = baskets
            self.last_modified = datetime.now()
            
            print(f"✅ Loaded {len(baskets)} baskets from Excel")
            return baskets
            
        except FileNotFoundError:
            print(f"❌ Excel file not found: {self.excel_path}")
            raise
        except Exception as e:
            print(f"❌ Error loading Excel: {str(e)}")
            raise
    
    def load_funds_from_excel(self):
        """Load fund data from Excel file"""
        
        # Check cache
        if self.is_cache_valid() and self.cached_funds:
            return self.cached_funds
        
        try:
            df_funds = pd.read_excel(self.excel_path, sheet_name='Funds')
            
            funds = []
            for _, row in df_funds.iterrows():
                fund = {
                    'id': row['FundID'],
                    'name': row['Name'],
                    'category': row['Category'],
                    'nav': float(row['NAV']),
                    'returns1Y': float(row['Returns1Y']),
                    'returns3Y': float(row['Returns3Y']),
                    'returns5Y': float(row['Returns5Y']),
                    'expenseRatio': float(row['ExpenseRatio']),
                    'aum': f"₹{int(row['AUM'])} Cr",
                    'risk': row['Risk'],
                    'rating': int(row['Rating'])
                }
                funds.append(fund)
            
            self.cached_funds = funds
            print(f"✅ Loaded {len(funds)} funds from Excel")
            return funds
            
        except Exception as e:
            print(f"❌ Error loading funds: {str(e)}")
            raise
    
    def reload_cache(self):
        """Force reload the cache"""
        self.last_modified = None
        self.cached_baskets = None
        self.cached_funds = None
        return self.load_baskets_from_excel()

# Create global instance
EXCEL_PATH = os.path.join(os.path.dirname(__file__), 'AlphaniftyMasterData.xlsx')
excel_loader = ExcelDataLoader(EXCEL_PATH, cache_duration=120)  # 2 minutes cache
