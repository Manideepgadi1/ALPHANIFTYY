"""
Enhanced Mutual Fund Service
Combines MF.csv data with Accord API for comprehensive fund information
"""
import pandas as pd
import json
from typing import List, Dict, Optional
from accord_mf_enhanced import AccordMFEnhanced
from amc_factsheet_urls import extract_fund_house_from_name
import os

class MFServiceEnhanced:
    """Service to combine CSV data with Accord API"""
    
    def __init__(self, csv_path: str = None):
        if csv_path is None:
            # Try multiple possible paths (prefer MF_with_indices.csv with 10,197 records including indices)
            possible_paths = [
                os.path.join(os.path.dirname(__file__), 'MF_with_indices.csv'),  # PRIORITY: Extended dataset with indices
                os.path.join(os.path.dirname(__file__), '..', 'MF_with_indices.csv'),
                os.path.join(os.path.dirname(__file__), '..', 'MF.csv'),
                os.path.join(os.path.dirname(__file__), '..', '..', 'Latest_Indices_rawdata_31.12.2025.csv'),
                os.path.join(os.path.dirname(__file__), '..', '..', 'MF.csv'),
                'D:\\VSFintech-Platform\\Alphanifty\\MF.csv',
                'D:\\VSFintech-Platform\\Latest_Indices_rawdata_31.12.2025.csv'
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    csv_path = path
                    print(f"📁 Found CSV at: {csv_path}")
                    break
            
            if csv_path is None:
                print("❌ Could not find CSV file in any expected location")
                csv_path = possible_paths[0]  # Use first path as default
        
        self.csv_path = csv_path
        self.api = AccordMFEnhanced()
        self.df = None
        self.load_csv()
    
    def load_csv(self):
        """Load MF.csv data"""
        try:
            self.df = pd.read_csv(self.csv_path)
            print(f"✅ Loaded {len(self.df)} funds from CSV")
        except Exception as e:
            print(f"❌ Error loading CSV: {e}")
            self.df = pd.DataFrame()
    
    def search_funds(self, 
                    search_term: str = '', 
                    category: str = '', 
                    risk_type: str = '',
                    min_return_3y: float = None,
                    max_expense_ratio: float = None,
                    min_aum: float = None,
                    limit: int = 20,
                    offset: int = 0) -> Dict:
        """
        Search funds with filters
        Returns: {
            'funds': [...],
            'total': count,
            'page': current_page,
            'total_pages': total_pages
        }
        """
        if self.df is None or len(self.df) == 0:
            return {'funds': [], 'total': 0, 'page': 1, 'total_pages': 0}
        
        filtered_df = self.df.copy()
        
        # Filter out invalid entries (those without numeric SCHEMECODE)
        # This removes placeholder index entries like "triNiftyIt", "triNiftyFinancialServices", etc.
        filtered_df = filtered_df[pd.to_numeric(filtered_df['SCHEMECODE'], errors='coerce').notna()]
        
        # Apply search filter with better matching
        if search_term:
            # Split search term into words for better matching
            search_words = search_term.lower().split()
            
            # Create a mask that checks if ALL search words appear in the fund name
            mask = pd.Series([True] * len(filtered_df))
            for word in search_words:
                mask = mask & filtered_df['S_NAME'].str.lower().str.contains(word, na=False)
            
            filtered_df = filtered_df[mask]
        
        # Apply category filter
        if category:
            filtered_df = filtered_df[
                filtered_df['CATEGORY_NAME'].str.contains(category, case=False, na=False)
            ]
        
        # Apply 3Y return filter
        if min_return_3y is not None:
            filtered_df = filtered_df[filtered_df['_3Rt'] >= min_return_3y]
        
        total_count = len(filtered_df)
        total_pages = (total_count + limit - 1) // limit
        current_page = (offset // limit) + 1
        
        # Get paginated results
        paginated_df = filtered_df.iloc[offset:offset + limit]
        
        # Convert to list of dicts with basic info
        funds = []
        for _, row in paginated_df.iterrows():
            fund_house = row['S_NAME'].split('-')[0].strip() if '-' in row['S_NAME'] else row['S_NAME'].split('(')[0].strip()
            fund = {
                'id': str(row['SCHEMECODE']),  # Frontend expects 'id' field
                'scheme_code': str(row['SCHEMECODE']),
                'name': row['S_NAME'],  # Frontend expects 'name'
                'scheme_name': row['S_NAME'],
                'category': row['CATEGORY_NAME'],  # Frontend expects 'category'
                'category_code': str(row['CATEGORY_CODE']),
                'category_name': row['CATEGORY_NAME'],
                'amc': fund_house,
                'fundHouse': fund_house,
                'nav': 100,  # Placeholder for list view
                'returns1Y': float(row['_3Rt']) if pd.notna(row['_3Rt']) else 0,
                'returns3Y': float(row['_3Rt']) if pd.notna(row['_3Rt']) else 0,
                'returns5Y': float(row['INCRET']) if pd.notna(row['INCRET']) else 0,
                'expenseRatio': 1.0,  # Placeholder
                'aum': '₹1,000 Cr',  # Placeholder
                'risk': 'Medium',  # Placeholder
                'rating': 4,  # Placeholder
                'return_3year': float(row['_3Rt']) if pd.notna(row['_3Rt']) else None,
                'std_deviation': float(row['std']) if pd.notna(row['std']) else None,
                'inception_return': float(row['INCRET']) if pd.notna(row['INCRET']) else None,
                'factsheet_url': 'https://www.amfiindia.com/online-center/download-factsheets'  # AMFI official factsheets
            }
            funds.append(fund)
        
        return {
            'funds': funds,
            'total': total_count,
            'page': current_page,
            'total_pages': total_pages,
            'limit': limit
        }
    
    def get_fund_details(self, scheme_code: str) -> Dict:
        """
        Get complete fund details by combining CSV + Accord API
        Falls back to API-only if fund not in CSV
        """
        # Get basic info from CSV
        csv_data = self.df[self.df['SCHEMECODE'] == int(scheme_code)]
        
        if len(csv_data) == 0:
            # FALLBACK: Fund not in CSV, fetch directly from Accord API
            print(f"⚠️ Fund {scheme_code} not in CSV, fetching from Accord API only")
            api_data = self.api.get_enriched_fund_data(scheme_code)
            if api_data:
                return api_data  # Return API data directly
            else:
                return {'error': f'Fund {scheme_code} not found in CSV or API'}
        
        csv_row = csv_data.iloc[0]
        fund_house = extract_fund_house_from_name(csv_row['S_NAME']) or csv_row['S_NAME'].split('-')[0].strip()
        
        # Get enriched data from Accord API
        api_data = self.api.get_enriched_fund_data(scheme_code)
        
        if not api_data:
            # Return CSV data if API fails
            return {
                'id': str(csv_row['SCHEMECODE']),  # Ensure id field exists
                'scheme_code': str(csv_row['SCHEMECODE']),
                'scheme_name': csv_row['S_NAME'],
                'name': csv_row['S_NAME'],  # Add name field
                'category_code': str(csv_row['CATEGORY_CODE']),
                'category_name': csv_row['CATEGORY_NAME'],
                'category': csv_row['CATEGORY_NAME'],  # Add category field
                'return_3year': float(csv_row['_3Rt']) if pd.notna(csv_row['_3Rt']) else None,
                'std_deviation': float(csv_row['std']) if pd.notna(csv_row['std']) else None,
                'inception_return': float(csv_row['INCRET']) if pd.notna(csv_row['INCRET']) else None,
                'factsheet_url': 'https://www.amfiindia.com/online-center/download-factsheets',
                'source': 'csv_only'
            }
        
        # Merge CSV + API data (API data takes precedence)
        # Ensure critical fields are always present
        result = {
            'id': str(csv_row['SCHEMECODE']),  # Always set ID from scheme_code
            'scheme_code': str(csv_row['SCHEMECODE']),
            **api_data,
            'csv_return_3year': float(csv_row['_3Rt']) if pd.notna(csv_row['_3Rt']) else None,
            'csv_std_deviation': float(csv_row['std']) if pd.notna(csv_row['std']) else None,
            'csv_inception_return': float(csv_row['INCRET']) if pd.notna(csv_row['INCRET']) else None,
            'factsheet_url': 'https://www.amfiindia.com/online-center/download-factsheets',
            'source': 'csv_and_api'
        }
        
        # Ensure name and category fields exist
        if 'name' not in result or not result['name']:
            result['name'] = result.get('scheme_name') or csv_row['S_NAME']
        if 'category' not in result or not result['category']:
            result['category'] = result.get('category_name') or csv_row['CATEGORY_NAME']
        
        return result
    
    def get_fund_nav_history(self, scheme_code: str, period: str = '1Y') -> List[Dict]:
        """
        Get NAV history for charting
        """
        return self.api.get_nav_chart_data(scheme_code, period)
    
    def get_category_comparison(self, category_code: str) -> List[Dict]:
        """
        Get peer comparison for a category
        """
        return self.api.get_peer_comparison(category_code)
    
    def get_available_categories(self) -> List[Dict]:
        """
        Get all unique categories from CSV
        """
        if self.df is None or len(self.df) == 0:
            return []
        
        categories = self.df[['CATEGORY_CODE', 'CATEGORY_NAME']].drop_duplicates()
        return [
            {'code': str(row['CATEGORY_CODE']), 'name': row['CATEGORY_NAME']}
            for _, row in categories.iterrows()
        ]
    
    def get_statistics(self) -> Dict:
        """
        Get overall statistics
        """
        if self.df is None or len(self.df) == 0:
            return {}
        
        return {
            'total_funds': len(self.df),
            'total_categories': self.df['CATEGORY_NAME'].nunique(),
            'avg_3year_return': float(self.df['_3Rt'].mean()) if '_3Rt' in self.df.columns else None,
            'median_3year_return': float(self.df['_3Rt'].median()) if '_3Rt' in self.df.columns else None,
            'avg_std_deviation': float(self.df['std'].mean()) if 'std' in self.df.columns else None
        }


# Test the service
if __name__ == '__main__':
    print("\n🔍 Testing MF Service Enhanced...\n")
    
    service = MFServiceEnhanced()
    
    # Test 1: Search funds
    print("1️⃣ Searching for 'Axis' funds...")
    results = service.search_funds(search_term='Axis', limit=5)
    print(f"✅ Found {results['total']} funds")
    for fund in results['funds'][:3]:
        print(f"   - {fund['scheme_name']} ({fund['category_name']})")
    
    # Test 2: Get fund details
    print("\n2️⃣ Getting details for scheme 5184...")
    details = service.get_fund_details('5184')
    if 'error' not in details:
        print(f"✅ Scheme: {details.get('scheme_name', 'N/A')}")
        print(f"✅ NAV: ₹{details.get('nav', 'N/A')}")
        print(f"✅ AUM: {details.get('aum', 'N/A')}")
        print(f"✅ Expense Ratio: {details.get('expense_ratio', 'N/A')}")
        print(f"✅ Fund Manager: {details.get('fund_manager_1', 'N/A')}")
        print(f"✅ 3Y Return (CSV): {details.get('csv_return_3year', 'N/A')}%")
        print(f"✅ 3Y Return (API): {details.get('return_3year', 'N/A')}%")
    
    # Test 3: Get statistics
    print("\n3️⃣ Getting statistics...")
    stats = service.get_statistics()
    print(f"✅ Total Funds: {stats.get('total_funds', 0)}")
    print(f"✅ Total Categories: {stats.get('total_categories', 0)}")
    print(f"✅ Avg 3Y Return: {stats.get('avg_3year_return', 0):.2f}%")
    
    print("\n✅ All tests completed!")
