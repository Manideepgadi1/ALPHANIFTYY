"""
Enhanced Accord MF API Integration
Complete implementation of all Accord API endpoints for rich mutual fund data
Token: aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz
"""
import requests
from typing import Dict, List, Optional
import time

class AccordMFEnhanced:
    """Enhanced Accord MF API with all endpoints and caching"""
    
    def __init__(self, token: str = "aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz"):
        self.base_url = "https://mf.accordwebservices.com/MF"
        self.token = token
        self.cache = {}
        self.cache_duration = 3600  # 1 hour cache
    
    def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make API request with error handling and caching"""
        if params is None:
            params = {}
        params['token'] = self.token
        
        # Create cache key
        cache_key = f"{endpoint}_{str(params)}"
        
        # Check cache
        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if time.time() - cached_time < self.cache_duration:
                return cached_data
        
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Cache the response
            self.cache[cache_key] = (time.time(), data)
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"API Error: {str(e)}")
            return {'error': str(e)}
    
    # ========== FUND DISCOVERY APIs ==========
    
    def get_all_amcs(self) -> List[Dict]:
        """
        Get list of all AMC (Asset Management Companies)
        Returns: [{'amc_code': '...', 'Fund': 'AMC Name'}, ...]
        """
        result = self._make_request('GetFunds')
        return result.get('Table', []) if isinstance(result, dict) else []
    
    def get_categories_by_amc(self, fund_code: str) -> List[Dict]:
        """
        Get all categories for a specific AMC
        Returns: [{'classcode': '...', 'className': 'Category Name'}, ...]
        """
        result = self._make_request('GetCategory', {'Fund': fund_code})
        return result.get('Table', []) if isinstance(result, dict) else []
    
    def get_schemes_by_category(self, fund_code: str, category_code: str) -> List[Dict]:
        """
        Get all schemes in a category for an AMC
        Returns: [{'SCHEMECODE': '...', 'S_NAME': 'Scheme Name'}, ...]
        """
        result = self._make_request('GetScheme', {
            'Fund': fund_code,
            'Category': category_code
        })
        return result.get('Table', []) if isinstance(result, dict) else []
    
    # ========== SCHEME DETAILS APIs ==========
    
    def get_scheme_isin(self, scheme_code: str, option: str = '') -> List[Dict]:
        """
        Get ISIN code for a scheme
        Returns: [{'SCHEMECODE', 'S_NAME', 'ISIN', 'SERIES'}]
        """
        result = self._make_request('Get_SchemeISINDetails', {
            'schemecode': scheme_code,
            'option': option
        })
        return result.get('Table', []) if isinstance(result, dict) else []
    
    def get_fund_factsheet(self, scheme_code: str) -> Dict:
        """
        Get complete fund factsheet with ALL data:
        - snapshot_summary: Basic info, NAV, returns, AUM, expense ratio, fund managers, etc.
        - ratios: PE, Beta, Sharpe, Jensen Alpha, Turnover, Duration, YTM
        - asset_allocation: Asset distribution
        - sector_allocation: Sector-wise holdings
        - holdings: Top holdings with company names
        - market_cap: Market cap distribution (equity funds)
        - credit_rating: Credit rating distribution (debt funds)
        """
        result = self._make_request('GetFundFactsheet', {'SchemeCode': scheme_code})
        
        if isinstance(result, dict) and 'snapshot_summary' in result:
            return {
                'snapshot_summary': result.get('snapshot_summary', []),
                'ratios': result.get('ratios', []),
                'asset_allocation': result.get('asset_allocation', []),
                'sector_allocation': result.get('sector_allocation', []),
                'holdings': result.get('holdings', []),
                'market_cap': result.get('market_cap', []),
                'credit_rating': result.get('credit_rating', [])
            }
        return {}
    
    def get_fund_benchmark_returns(self, scheme_code: str) -> Dict:
        """
        Get fund and benchmark performance comparison
        Returns: {
            'scheme_returns': {'1WEEKRET', '1MONTHRET', '3MONTHRET', '6MONTHRET', '1YRRET', '3YEARRET', '5YEARRET'},
            'benchmark_returns': {'INDEX_CODE', 'SYMBOL', '1WEEKRET', ...}
        }
        """
        result = self._make_request('GetFundBenchmarkReturns', {'SchemeCode': scheme_code})
        
        if isinstance(result, dict) and 'Table' in result:
            tables = result.get('Table', [])
            return {
                'scheme_returns': tables[0] if len(tables) > 0 else {},
                'benchmark_returns': tables[1] if len(tables) > 1 else {}
            }
        return {'scheme_returns': {}, 'benchmark_returns': {}}
    
    def get_peer_comparison(self, category_code: str) -> List[Dict]:
        """
        Get peer comparison for all schemes in a category
        Returns: [{'Amc_code', 'Schemecode', 'S_Name', 'NAVRS', 'IncDate', '1WEEKRET', '1MONTHRET', ...}, ...]
        """
        result = self._make_request('GetSchemePeerComparison', {'CategoryCode': category_code})
        return result.get('Table', []) if isinstance(result, dict) else []
    
    def get_nav_chart_data(self, scheme_code: str, period: str = '1Y') -> List[Dict]:
        """
        Get historical NAV data for charting
        Args:
            scheme_code: Scheme code
            period: '3M', '6M', '1Y', '3Y', '5Y', 'SI' (Since Inception)
        Returns: [{'NAV': '154.32', 'Date': '2025-01-23'}, ...]
        """
        result = self._make_request('GetNAVChartData', {
            'schemecode': scheme_code,
            'period': period
        })
        return result.get('Table', []) if isinstance(result, dict) else []
    
    # ========== HELPER METHODS ==========
    
    def get_enriched_fund_data(self, scheme_code: str) -> Dict:
        """
        Get ALL available data for a fund in one call
        This combines factsheet, benchmark returns, and ISIN
        """
        print(f"📊 Fetching enriched data for scheme {scheme_code}...")
        
        # Get factsheet (contains most data)
        factsheet = self.get_fund_factsheet(scheme_code)
        
        # Get benchmark comparison
        benchmark = self.get_fund_benchmark_returns(scheme_code)
        
        # Get ISIN
        isin_data = self.get_scheme_isin(scheme_code)
        
        # Combine all data
        if factsheet and 'snapshot_summary' in factsheet and len(factsheet['snapshot_summary']) > 0:
            summary = factsheet['snapshot_summary'][0]
            
            return {
                # Basic Info
                'scheme_code': summary.get('SCHEMECODE', scheme_code),
                'scheme_name': summary.get('S_NAME', ''),
                'category_code': summary.get('CATEGORY_CODE', ''),
                'category_name': summary.get('CATEGORY_NAME', ''),
                'asset_type': summary.get('ASSET_TYPE', ''),
                
                # NAV Info
                'nav': summary.get('NAVRS', ''),
                'nav_date': summary.get('NAVDATE', ''),
                'net_change': summary.get('NETCHANGE', ''),
                'percent_change': summary.get('PER_CHANGE', ''),
                
                # Fund Details
                'inception_date': summary.get('INCEPT_DATE', ''),
                'fund_manager_1': summary.get('FUND_MGR1', ''),
                'fund_manager_2': summary.get('FUND_MGR2', ''),
                'fund_manager_3': summary.get('FUND_MGR3', ''),
                'objective': summary.get('OBJECTIVE', ''),
                'benchmark': summary.get('BENCHMARK', ''),
                
                # Investment Details
                'min_investment': summary.get('MININVT', ''),
                'sip_min_investment': summary.get('SIPMININVEST', ''),
                'lock_in_period': summary.get('LOCK_IN_PERIOD', ''),
                'exit_load': summary.get('EXIT_LOAD', ''),
                'exit_remarks': summary.get('EXIT_REMARKS', ''),
                
                # Performance Metrics
                'aum': summary.get('AUM', ''),
                'expense_ratio': summary.get('EXPENSE_RATIO', ''),
                'risk_type': summary.get('RISKTYPE', ''),
                
                # Returns
                'return_1month': summary.get('1MONTHRET', ''),
                'return_3month': summary.get('3MONTHRET', ''),
                'return_6month': summary.get('6MONTHRET', ''),
                'return_1year': summary.get('1YRRET', ''),
                'return_3year': summary.get('3YEARRET', ''),
                'return_5year': summary.get('5YEARRET', ''),
                
                # Ratios
                'ratios': factsheet.get('ratios', []),
                
                # Allocations
                'asset_allocation': factsheet.get('asset_allocation', []),
                'sector_allocation': factsheet.get('sector_allocation', []),
                
                # Holdings
                'holdings': factsheet.get('holdings', []),
                'market_cap': factsheet.get('market_cap', []),
                'credit_rating': factsheet.get('credit_rating', []),
                
                # Benchmark Comparison
                'benchmark_returns': benchmark.get('benchmark_returns', {}),
                
                # ISIN
                'isin': isin_data[0].get('ISIN', '') if isin_data else ''
            }
        
        return {}


# Test function
if __name__ == '__main__':
    api = AccordMFEnhanced()
    
    print("\n🔍 Testing Enhanced Accord API...\n")
    
    # Test 1: Get all AMCs
    print("1️⃣ Getting all AMCs...")
    amcs = api.get_all_amcs()
    print(f"✅ Found {len(amcs)} AMCs")
    if amcs:
        print(f"   First AMC: {amcs[0]}")
    
    # Test 2: Get enriched data for a fund
    print("\n2️⃣ Getting enriched data for scheme 5184...")
    data = api.get_enriched_fund_data('5184')
    if data:
        print(f"✅ Scheme: {data.get('scheme_name', 'N/A')}")
        print(f"✅ NAV: ₹{data.get('nav', 'N/A')}")
        print(f"✅ AUM: {data.get('aum', 'N/A')}")
        print(f"✅ Expense Ratio: {data.get('expense_ratio', 'N/A')}")
        print(f"✅ Fund Manager: {data.get('fund_manager_1', 'N/A')}")
        print(f"✅ 1Y Return: {data.get('return_1year', 'N/A')}%")
        print(f"✅ 3Y Return: {data.get('return_3year', 'N/A')}%")
        print(f"✅ Risk Type: {data.get('risk_type', 'N/A')}")
        print(f"✅ Holdings: {len(data.get('holdings', []))} companies")
        print(f"✅ ISIN: {data.get('isin', 'N/A')}")
    
    print("\n✅ All tests completed!")
