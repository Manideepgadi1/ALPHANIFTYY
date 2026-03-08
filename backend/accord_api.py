"""
Accord MF API Integration - Real-time mutual fund data
Following the official Accord MF API documentation
Base URL: https://mf.accordwebservices.com/MF
"""
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class AccordMFAPI:
    """
    Wrapper for Accord MF API - fetches real-time mutual fund data
    All endpoints require scheme code and token
    """
    
    def __init__(self):
        self.base_url = "https://mf.accordwebservices.com/MF"
        self.token = os.getenv('ACCORD_API_TOKEN')
        if not self.token:
            raise ValueError("ACCORD_API_TOKEN not found in .env file")
    
    def _make_request(self, endpoint, params):
        """Internal method to make API requests with error handling"""
        params['token'] = self.token
        url = f"{self.base_url}/{endpoint}"
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            return {'error': 'Request timeout'}
        except requests.exceptions.RequestException as e:
            return {'error': str(e)}
    
    def get_scheme_isin(self, scheme_code, option=''):
        """
        Get ISIN code for a scheme
        Args:
            scheme_code: Scheme code (e.g., 5184)
            option: Optional parameter (default: empty)
        Returns:
            {'Table': [{'SCHEMECODE', 'S_NAME', 'ISIN', 'SERIES'}]}
        """
        return self._make_request('Get_SchemeISINDetails', {
            'schemecode': scheme_code,
            'option': option
        })
    
    def get_fund_factsheet(self, scheme_code):
        """
        Get complete fund factsheet - NAV, returns, ratios, holdings, allocations
        Args:
            scheme_code: Scheme code (e.g., 5184)
        Returns:
            {
                'snapshot_summary': [{'NAVRS', 'NAVDATE', 'NETCHANGE', 'PER_CHANGE', 'AUM', etc.}],
                'ratios': [...],
                'asset_allocation': [...],
                'sector_allocation': [...],
                'holdings': [...],
                'credit_rating': [...]
            }
        """
        return self._make_request('GetFundFactsheet', {
            'SchemeCode': scheme_code
        })
    
    def get_nav_chart_data(self, scheme_code, period='1Y'):
        """
        Get historical NAV chart data
        Args:
            scheme_code: Scheme code (e.g., 5184)
            period: '3M', '6M', '1Y', '3Y', '5Y', 'SI' (Since Inception)
        Returns:
            {'Table': [{'NAV', 'Date'}]}
        """
        return self._make_request('GetNAVChartData', {
            'schemecode': scheme_code,
            'period': period
        })
    
    def get_fund_benchmark_returns(self, scheme_code, period='1Y'):
        """
        Get fund vs benchmark performance comparison
        Args:
            scheme_code: Scheme code (e.g., 5184)
            period: '3M', '6M', '1Y', '3Y', '5Y', 'SI'
        Returns:
            Comparison data with fund and benchmark returns
        """
        return self._make_request('GetFundBenchmarkReturns', {
            'schemecode': scheme_code,
            'period': period
        })
    
    def get_scheme_peer_comparison(self, category_code):
        """
        Get peer comparison for schemes in same category
        Args:
            category_code: Category code (e.g., 72 for Banking & PSU)
        Returns:
            List of schemes in category with performance metrics
        """
        return self._make_request('GetSchemePeerComparison', {
            'categorycode': category_code
        })
    
    def get_current_nav(self, scheme_code):
        """
        Quick method to get just the current NAV value and date
        Args:
            scheme_code: Scheme code
        Returns:
            {'nav': float, 'date': string, 'change': float, 'change_percent': float}
            or None if error
        """
        data = self.get_fund_factsheet(scheme_code)
        
        if 'error' in data:
            return None
        
        if 'snapshot_summary' in data and data['snapshot_summary']:
            summary = data['snapshot_summary'][0]
            return {
                'nav': summary.get('NAVRS'),
                'date': summary.get('NAVDATE'),
                'change': summary.get('NETCHANGE'),
                'change_percent': summary.get('PER_CHANGE'),
                'aum': summary.get('AUM'),
                'expense_ratio': summary.get('EXPENSE_RATIO'),
                'min_investment': summary.get('MININVT'),
                'sip_min_investment': summary.get('SIPMININVEST'),
                'risk_type': summary.get('RISKTYPE')
            }
        
        return None
