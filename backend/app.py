from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from datetime import datetime, timedelta
import uuid
import pandas as pd
from dateutil.relativedelta import relativedelta
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import app initialization
from init_app import create_app

# Create app with authentication and database
app = create_app()

# Import database models
from models import db, User, Portfolio, Watchlist, Cart

# In-memory storage (will be migrated to database gradually)
cart_storage = {}
user_storage = {}
portfolio_storage = {}

# Cache for MFServiceEnhanced to avoid reloading CSV on every request
_mf_service_cache = None

# Cache for Excel performance data (basket_id -> {period -> data})
_excel_performance_cache = {}

def get_mf_service():
    """Get or create cached MFServiceEnhanced instance"""
    global _mf_service_cache
    if _mf_service_cache is None:
        from mf_service_enhanced import MFServiceEnhanced
        _mf_service_cache = MFServiceEnhanced()
    return _mf_service_cache

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': 'Alphanifty API is running',
        'version': '1.0.0'
    })

# Basket endpoints
@app.route('/api/baskets', methods=['GET'])
def get_baskets():
    """Get all baskets with optional filters - loads from Excel with fallback to mock_data"""
    try:
        # Try to load from Excel first
        from data.excel_loader import excel_loader
        baskets_data = excel_loader.load_baskets_from_excel()
        return jsonify({
            'status': 'success',
            'data': baskets_data,
            'source': 'excel'
        })
    except Exception as e:
        # Fallback to mock_data if Excel fails
        print(f"⚠️ Excel load failed, using mock_data: {str(e)}")
        from data.mock_data import baskets_data
        return jsonify({
            'status': 'success',
            'data': baskets_data,
            'source': 'mock_data'
        })

@app.route('/api/baskets/<basket_id>', methods=['GET'])
def get_basket_details(basket_id):
    """Get detailed information about a specific basket - loads from Excel with fallback"""
    try:
        # Try Excel first
        from data.excel_loader import excel_loader
        baskets_data = excel_loader.load_baskets_from_excel()
    except:
        # Fallback to mock_data
        from data.mock_data import baskets_data
    
    # Handle both string and numeric IDs
    basket = next((b for b in baskets_data if str(b['id']) == str(basket_id)), None)
    
    if not basket:
        return jsonify({
            'status': 'error',
            'message': 'Basket not found'
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': basket
    })

@app.route('/api/baskets/<basket_id>/performance', methods=['GET'])
def get_basket_performance(basket_id):
    """Get performance data for a basket"""
    from data.mock_data import performance_data
    
    # Handle both string and numeric IDs
    perf_key = f'basket-{basket_id}' if not str(basket_id).startswith('basket-') else str(basket_id)
    
    if perf_key not in performance_data:
        return jsonify({
            'status': 'error',
            'message': 'Performance data not found'
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': performance_data[perf_key]
    })

@app.route('/api/baskets/<basket_id>/excel-performance', methods=['GET'])
def get_basket_excel_performance(basket_id):
    """Get performance data from Excel file for a basket"""
    from data.mock_data import baskets_data
    import numpy as np
    
    # Get time period filter (1Y, 3Y, 5Y, 10Y)
    time_period = request.args.get('period', '5Y')
    
    # Check cache first
    global _excel_performance_cache
    cache_key = f"{basket_id}_{time_period}"
    if cache_key in _excel_performance_cache:
        return jsonify(_excel_performance_cache[cache_key])
    
    # Find the basket
    basket = next((b for b in baskets_data if str(b['id']) == str(basket_id)), None)
    
    if not basket:
        return jsonify({
            'status': 'error',
            'message': 'Basket not found'
        }), 404
    
    # Get Excel filename from basket data
    excel_file = basket.get('excelFile')
    
    # If no Excel file, generate mock performance data
    if not excel_file:
        # Generate mock performance data based on basket CAGR
        cagr = basket.get('cagr5Y', 12) / 100
        
        # Determine date range
        if time_period == '1Y':
            years = 1
            num_points = 12
        elif time_period == '3Y':
            years = 3
            num_points = 18
        elif time_period == '5Y':
            years = 5
            num_points = 20
        else:  # 10Y
            years = 10
            num_points = 30
        
        # Generate dates
        end_date = datetime.now()
        dates = [end_date - timedelta(days=int(years * 365 * i / num_points)) for i in range(num_points, 0, -1)]
        
        # Generate performance values with some volatility
        performance_data = []
        portfolio_value = 100
        nifty_value = 100
        nifty_cagr = 0.12  # Assume 12% for Nifty
        
        for i, date in enumerate(dates):
            # Add some random volatility
            portfolio_growth = (1 + cagr) ** (i / num_points * years)
            nifty_growth = (1 + nifty_cagr) ** (i / num_points * years)
            
            # Add some random noise
            portfolio_volatility = np.random.normal(0, 0.02)
            nifty_volatility = np.random.normal(0, 0.015)
            
            portfolio_value_current = 100 * portfolio_growth * (1 + portfolio_volatility)
            nifty_value_current = 100 * nifty_growth * (1 + nifty_volatility)
            
            # Smart SIP = 1.5x for mock baskets (simple multiplier)
            smart_sip_value = portfolio_value_current * 1.5
            
            performance_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'label': date.strftime('%b %Y'),
                'portfolioValue': round(portfolio_value_current, 2),
                'smartSipValue': round(smart_sip_value, 2),
                'niftyValue': round(nifty_value_current, 2),
                'portfolioNAV': round(portfolio_value_current * 10, 2),
                'niftyNAV': round(nifty_value_current * 100, 2)
            })
        
        result = {
            'status': 'success',
            'data': {
                'performance': performance_data,
                'period': time_period,
                'startDate': dates[0].strftime('%Y-%m-%d'),
                'endDate': dates[-1].strftime('%Y-%m-%d')
            }
        }
        # Cache the result
        _excel_performance_cache[cache_key] = result
        return jsonify(result)
    
    # Read Excel file
    try:
        file_path = os.path.join(os.path.dirname(__file__), 'data', excel_file)
        df = pd.read_excel(file_path)
        
        # Handle different column names (strip spaces from column names first)
        df.columns = df.columns.str.strip()
        
        # Detect date column - check various patterns
        date_col = None
        for col in ['NAV Date', 'Dates', 'Date', 'DATE', 'date']:
            if col in df.columns:
                date_col = col
                break
        if date_col is None:
            date_col = 'Date'  # fallback
        
        # Find Basket NAV column - check for various patterns
        basket_col = None
        for col in df.columns:
            if 'Basket NAV' in col or 'BASKET' in col:
                basket_col = col
                break
        if basket_col is None:
            basket_col = 'Weightage NAV'
        
        nifty_col = 'Nifty 50' if 'Nifty 50' in df.columns else 'Nifty50' if 'Nifty50' in df.columns else 'NIFTY 50' if 'NIFTY 50' in df.columns else 'NIFTY'
        smart_sip_col = 'Smart SIP' if 'Smart SIP' in df.columns else 'SMART SIP' if 'SMART SIP' in df.columns else None
        
        # Check for unnamed columns that might be Smart SIP data
        if smart_sip_col is None:
            unnamed_cols = [col for col in df.columns if 'Unnamed' in str(col)]
            if len(unnamed_cols) > 0:
                smart_sip_col = unnamed_cols[0]
        
        # Debug: Print detected columns
        print(f"DEBUG - Excel file: {excel_file}")
        print(f"DEBUG - Columns: {df.columns.tolist()}")
        print(f"DEBUG - Detected: date_col={date_col}, basket_col={basket_col}, nifty_col={nifty_col}, smart_sip_col={smart_sip_col}")
        
        # Convert date column to datetime
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Sort by date ascending
        df = df.sort_values(date_col)
        
        # Get time period filter (1M, 6M, YTD, 1Y, 3Y, 5Y, All)
        time_period = request.args.get('period', '1Y')
        
        # Calculate cutoff date
        end_date = df[date_col].max()
        if time_period == '1M':
            start_date = end_date - relativedelta(months=1)
        elif time_period == '6M':
            start_date = end_date - relativedelta(months=6)
        elif time_period == 'YTD':
            start_date = pd.Timestamp(end_date.year, 1, 1)
        elif time_period == '1Y':
            start_date = end_date - relativedelta(years=1)
        elif time_period == '3Y':
            start_date = end_date - relativedelta(years=3)
        elif time_period == '5Y':
            start_date = end_date - relativedelta(years=5)
        elif time_period == 'All' or time_period == '10Y':
            start_date = df[date_col].min()
        else:
            start_date = end_date - relativedelta(years=1)
        
        # Filter data by date range
        filtered_df = df[df[date_col] >= start_date].copy()
        
        # Sample data points for better visualization
        # For better performance, sample every N days based on time period
        # Special handling for Premium Conservative (b18) and Premium BALANCED (b17)
        if basket_id in ['b17', 'b18']:
            # More granular sampling for these specific baskets
            if time_period == '1M':
                sample_days = 1  # Daily data for 1 month
            elif time_period == '6M':
                sample_days = 1  # Daily for 6 months
            elif time_period == 'YTD':
                sample_days = 1  # Daily for YTD
            elif time_period == '1Y':
                sample_days = 1  # Daily for 1 year
            elif time_period == '3Y':
                sample_days = 1  # Daily for 3 years
            elif time_period == '5Y':
                sample_days = 1  # Daily for 5 years
            else:  # All/10Y
                sample_days = 1  # Daily for all data (no sampling)
        else:
            # Default sampling for other baskets
            if time_period == '1M':
                sample_days = 1  # Daily data for 1 month
            elif time_period == '6M':
                sample_days = 2  # Every 2 days for 6 months (~ 90 points)
            elif time_period == 'YTD':
                sample_days = 3  # Every 3 days for YTD
            elif time_period == '1Y':
                sample_days = 5  # Every 5 days for 1 year (~ 73 points)
            elif time_period == '3Y':
                sample_days = 15  # Every 15 days for 3 years (~ 73 points)
            elif time_period == '5Y':
                sample_days = 25  # Every 25 days for 5 years (~ 73 points)
            else:  # All/10Y
                sample_days = 30  # Monthly for All years
        
        # Sample the dataframe - ALWAYS include first row
        if sample_days == 1:
            sampled_df = filtered_df.copy()
        else:
            # Include first row, sample middle rows, and ALWAYS include last row
            sampled_indices = [0] + list(range(sample_days, len(filtered_df), sample_days))
            # Add last index if not already included
            if sampled_indices[-1] != len(filtered_df) - 1:
                sampled_indices.append(len(filtered_df) - 1)
            sampled_df = filtered_df.iloc[sampled_indices].copy()
        
        # CRITICAL: Normalize to base 100 at the START of the selected period
        # This ensures the graph always starts at 100 regardless of time period
        if len(sampled_df) > 0:
            first_basket = sampled_df[basket_col].iloc[0]
            first_nifty = sampled_df[nifty_col].iloc[0]
            
            sampled_df['Portfolio_Normalized'] = (sampled_df[basket_col] / first_basket) * 100
            sampled_df['Nifty_Normalized'] = (sampled_df[nifty_col] / first_nifty) * 100
            
            # Normalize Smart SIP if column exists
            if smart_sip_col and smart_sip_col in sampled_df.columns:
                # Check if smart SIP column has valid data
                first_smart_sip = sampled_df[smart_sip_col].iloc[0]
                if pd.notna(first_smart_sip) and first_smart_sip > 0:
                    sampled_df['SmartSIP_Normalized'] = (sampled_df[smart_sip_col] / first_smart_sip) * 100
                else:
                    # Find first non-null value as base
                    first_valid_idx = sampled_df[smart_sip_col].first_valid_index()
                    if first_valid_idx is not None:
                        first_smart_sip = sampled_df.loc[first_valid_idx, smart_sip_col]
                        sampled_df['SmartSIP_Normalized'] = (sampled_df[smart_sip_col] / first_smart_sip) * 100
        
        # Format data for frontend with better date labels based on time period
        performance_data = []
        for _, row in sampled_df.iterrows():
            # Format label based on time period for better readability
            if time_period == '1M':
                label = row[date_col].strftime('%d %b')  # "15 Jan"
            elif time_period == '6M':
                label = row[date_col].strftime('%d %b')  # "15 Jan"
            elif time_period in ['YTD', '1Y']:
                label = row[date_col].strftime('%b %Y')  # "Jan 2025"
            elif time_period in ['3Y', '5Y']:
                label = row[date_col].strftime('%b %Y')  # "Jan 2025"
            else:  # All/10Y
                label = row[date_col].strftime('%b %Y')  # "Jan 2025"
            
            data_point = {
                'date': row[date_col].strftime('%Y-%m-%d'),
                'label': label,
                'portfolioValue': round(row['Portfolio_Normalized'], 2),
                'niftyValue': round(row['Nifty_Normalized'], 2),
                'portfolioNAV': round(row[basket_col], 2),
                'niftyNAV': round(row[nifty_col], 2)
            }
            
            # Add Smart SIP if available
            if 'SmartSIP_Normalized' in sampled_df.columns:
                data_point['smartSipValue'] = round(row['SmartSIP_Normalized'], 2)
            
            performance_data.append(data_point)
        
        result = {
            'status': 'success',
            'data': {
                'performance': performance_data,
                'period': time_period,
                'startDate': start_date.strftime('%Y-%m-%d'),
                'endDate': end_date.strftime('%Y-%m-%d')
            }
        }
        # Cache the result
        _excel_performance_cache[cache_key] = result
        return jsonify(result)
        
    except (FileNotFoundError, OSError, IOError) as e:
        # File not found - fall back to mock data generation
        import numpy as np
        
        cagr = basket.get('cagr5Y', 12) / 100
        
        # Determine date range
        if time_period == '1Y':
            years = 1
            num_points = 12
        elif time_period == '3Y':
            years = 3
            num_points = 18
        elif time_period == '5Y':
            years = 5
            num_points = 20
        else:  # 10Y
            years = 10
            num_points = 30
        
        # Generate dates
        end_date = datetime.now()
        dates = [end_date - timedelta(days=int(years * 365 * i / num_points)) for i in range(num_points, 0, -1)]
        
        # Generate performance values with some volatility
        performance_data = []
        nifty_cagr = 0.12  # Assume 12% for Nifty
        
        for i, date in enumerate(dates):
            portfolio_growth = (1 + cagr) ** (i / num_points * years)
            nifty_growth = (1 + nifty_cagr) ** (i / num_points * years)
            
            # Add some random noise
            portfolio_volatility = np.random.normal(0, 0.02)
            nifty_volatility = np.random.normal(0, 0.015)
            
            portfolio_value_current = 100 * portfolio_growth * (1 + portfolio_volatility)
            nifty_value_current = 100 * nifty_growth * (1 + nifty_volatility)
            
            # Smart SIP = 1.5x for mock baskets
            smart_sip_value = portfolio_value_current * 1.5
            
            performance_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'label': date.strftime('%b %Y'),
                'portfolioValue': round(portfolio_value_current, 2),
                'smartSipValue': round(smart_sip_value, 2),
                'niftyValue': round(nifty_value_current, 2),
                'portfolioNAV': round(portfolio_value_current * 10, 2),
                'niftyNAV': round(nifty_value_current * 100, 2)
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'performance': performance_data,
                'period': time_period,
                'startDate': dates[0].strftime('%Y-%m-%d'),
                'endDate': dates[-1].strftime('%Y-%m-%d')
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error reading Excel file: {str(e)}'
        }), 500

# Fund endpoints
@app.route('/api/funds', methods=['GET'])
def get_funds():
    """Get all funds with pagination support"""
    import json
    
    # Get query parameters
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    search = request.args.get('search', '').lower()
    category = request.args.get('category', '').lower()
    
    # Load data from local file
    local_file = os.path.join(os.path.dirname(__file__), 'data', 'mutual_funds.json')
    
    try:
        with open(local_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        all_funds = data.get('data', [])
        
        # Data is array of arrays: [scheme_code, name, amc_id, category, return, risk, aum]
        # Apply search filter
        if search:
            all_funds = [
                f for f in all_funds
                if (len(f) > 1 and search in f[1].lower()) or (len(f) > 3 and search in f[3].lower())
            ]
        
        # Apply category filter
        if category:
            all_funds = [
                f for f in all_funds
                if len(f) > 3 and category in f[3].lower()
            ]
        
        # Calculate pagination
        total = len(all_funds)
        total_pages = (total + limit - 1) // limit  # Ceiling division
        start = (page - 1) * limit
        end = start + limit
        
        # Get paginated funds
        paginated_funds = all_funds[start:end]
        
        # Transform to frontend format - data is [code, name, amc, category, ...]
        formatted_funds = []
        for fund in paginated_funds:
            if len(fund) >= 4:  # Ensure minimum fields exist
                formatted_funds.append({
                    'id': fund[0],
                    'scheme_code': fund[0],
                    'name': fund[1],
                    'amc': fund[2] if len(fund) > 2 else '',
                    'category': fund[3] if len(fund) > 3 else '',
                    'nav': fund[4] if len(fund) > 4 else '',
                    'returns1Y': fund[4] if len(fund) > 4 else '',
                    'returns3Y': fund[5] if len(fund) > 5 else '',
                    'returns5Y': fund[6] if len(fund) > 6 else '',
                    'fundHouse': fund[2] if len(fund) > 2 else '',
                    'risk': 'Medium'  # Default value
                })
        
        return jsonify({
            'status': 'success',
            'data': formatted_funds,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'totalPages': total_pages
            }
        })
        
    except Exception as e:
        print(f"❌ Error loading funds: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Failed to load funds: {str(e)}',
            'data': []
        }), 500

@app.route('/api/mutual-funds/all', methods=['GET'])
def get_all_mutual_funds():
    """Proxy endpoint to fetch all mutual funds from external API with CSV fallback"""
    try:
        # Try external API first
        response = requests.get('https://fundanalyzer.in/testcronpaymaa/testing/allcodes', timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        print(f"⚠️ External API failed: {str(e)}, falling back to CSV data...")
        
        # Fallback to CSV data
        try:
            service = get_mf_service()
            # Get all funds from CSV (without pagination)
            result = service.search_funds(limit=10000, offset=0)
            
            # Transform to match external API format
            formatted_data = []
            for fund in result['funds']:
                formatted_data.append([
                    fund.get('scheme_code', ''),
                    fund.get('name', ''),
                    fund.get('amc', ''),
                    fund.get('category', '')
                ])
            
            return jsonify({
                'status': 'success',
                'data': formatted_data,
                'source': 'csv_fallback',
                'message': 'Loaded from local CSV data'
            })
        except Exception as csv_error:
            print(f"❌ CSV fallback also failed: {str(csv_error)}")
            return jsonify({
                'status': 'error',
                'message': 'Unable to load fund data from any source',
                'data': []
            }), 200  # Return 200 instead of 500 to prevent frontend errors

@app.route('/api/funds/old/<fund_id>', methods=['GET'])
def get_fund_details_old(fund_id):
    """Get detailed information about a specific fund - uses mutual funds data"""
    import json
    
    # Try to load from local mutual funds file first
    local_file = os.path.join(os.path.dirname(__file__), 'data', 'mutual_funds.json')
    
    if os.path.exists(local_file):
        try:
            with open(local_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Search for fund by ID in the data array
            if 'data' in data and isinstance(data['data'], list):
                for fund in data['data']:
                    if len(fund) >= 7 and str(fund[0]) == str(fund_id):
                        # Extract AMC (full company name)
                        fund_name = fund[1]
                        amc_match = fund_name.split('-')[0].strip() if '-' in fund_name else fund_name.split('(')[0].strip()
                        
                        fund_details = {
                            'id': fund[0],
                            'name': fund[1],
                            'amc': amc_match,
                            'fundHouse': amc_match,
                            'category': fund[3] if fund[3] else 'Other',
                            'age': fund[2],
                            'nav': 100,
                            'returns1Y': float(fund[4]) if fund[4] else 0,
                            'returns3Y': float(fund[5]) if fund[5] else 0,
                            'returns5Y': float(fund[6]) if fund[6] else 0,
                            'expenseRatio': 1.5,
                            'aum': '₹1,000 Cr',
                            'risk': 'Medium',
                            'rating': 4
                        }
                        
                        return jsonify({
                            'status': 'success',
                            'data': fund_details
                        })
        except Exception as e:
            print(f"Error loading fund details: {str(e)}")
    
    # Fallback to mock_data
    from data.mock_data import funds_data
    fund = next((f for f in funds_data if str(f['id']) == str(fund_id)), None)
    
    if not fund:
        return jsonify({
            'status': 'error',
            'message': 'Fund not found'
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': fund
    })

# Calculator endpoints - Using calculator_service for accurate calculations
@app.route('/api/calculators/sip', methods=['POST'])
def calculate_sip():
    """
    Calculate SIP returns using verified financial formulas
    
    Request Body:
        - monthlyInvestment: Monthly investment amount
        - annualReturn: Expected annual return percentage
        - years: Investment period in years
    """
    try:
        from calculator_service import sip_calculator
        data = request.get_json()
        
        monthly_investment = float(data.get('monthlyInvestment', 0))
        annual_return = float(data.get('annualReturn', 12))
        years = int(data.get('years', 5))
        
        # Validate inputs
        if monthly_investment <= 0:
            return jsonify({
                'status': 'error',
                'message': 'Monthly investment must be greater than 0'
            }), 400
        
        if years <= 0 or years > 50:
            return jsonify({
                'status': 'error',
                'message': 'Years must be between 1 and 50'
            }), 400
        
        # Calculate using service
        result = sip_calculator(monthly_investment, annual_return, years)
        
        return jsonify({
            'status': 'success',
            'data': result
        })
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        print(f"SIP calculation error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to calculate SIP returns'
        }), 500

@app.route('/api/calculators/lumpsum', methods=['POST'])
def calculate_lumpsum():
    """
    Calculate lumpsum returns using compound interest formula
    
    Request Body:
        - principal: One-time investment amount
        - annualReturn: Expected annual return percentage
        - years: Investment period in years
    """
    try:
        from calculator_service import lumpsum_calculator
        data = request.get_json()
        
        principal = float(data.get('principal', 0))
        annual_return = float(data.get('annualReturn', 12))
        years = int(data.get('years', 5))
        
        # Validate inputs
        if principal <= 0:
            return jsonify({
                'status': 'error',
                'message': 'Principal amount must be greater than 0'
            }), 400
        
        if years <= 0 or years > 50:
            return jsonify({
                'status': 'error',
                'message': 'Years must be between 1 and 50'
            }), 400
        
        # Calculate using service
        result = lumpsum_calculator(principal, annual_return, years)
        
        return jsonify({
            'status': 'success',
            'data': result
        })
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        print(f"Lumpsum calculation error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to calculate lumpsum returns'
        }), 500

@app.route('/api/calculators/goal', methods=['POST'])
def calculate_goal():
    """
    Calculate required monthly SIP to achieve a financial goal
    
    Request Body:
        - targetAmount: Target amount to achieve
        - years: Time period to achieve the goal
        - annualReturn: Expected annual return percentage
        - existingInvestment: Already invested amount (optional)
    """
    try:
        from calculator_service import goal_calculator
        data = request.get_json()
        
        target_amount = float(data.get('targetAmount', 0))
        years = int(data.get('years', 10))
        annual_return = float(data.get('annualReturn', 12))
        existing_investment = float(data.get('existingInvestment', 0))
        
        # Validate inputs
        if target_amount <= 0:
            return jsonify({
                'status': 'error',
                'message': 'Target amount must be greater than 0'
            }), 400
        
        if years <= 0 or years > 50:
            return jsonify({
                'status': 'error',
                'message': 'Years must be between 1 and 50'
            }), 400
        
        # Calculate using service
        result = goal_calculator(target_amount, years, annual_return, existing_investment)
        
        return jsonify({
            'status': 'success',
            'data': result
        })
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        print(f"Goal calculation error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to calculate goal-based investment'
        }), 500

# Cart endpoints
@app.route('/api/cart', methods=['GET'])
def get_cart():
    """Get cart items for a user"""
    user_id = request.args.get('userId', 'guest')
    cart = cart_storage.get(user_id, [])
    return jsonify({
        'status': 'success',
        'data': cart
    })

@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    """Add item to cart"""
    data = request.get_json()
    user_id = data.get('userId', 'guest')
    
    if user_id not in cart_storage:
        cart_storage[user_id] = []
    
    cart_item = {
        'id': str(uuid.uuid4()),
        'basketId': data.get('basketId'),
        'investmentType': data.get('investmentType', 'SIP'),
        'amount': data.get('amount', 5000),
        'frequency': data.get('frequency', 'Monthly'),
        'addedAt': datetime.now().isoformat()
    }
    
    cart_storage[user_id].append(cart_item)
    
    return jsonify({
        'status': 'success',
        'data': cart_item,
        'message': 'Item added to cart'
    })

@app.route('/api/cart/<item_id>', methods=['PUT'])
def update_cart_item(item_id):
    """Update cart item"""
    data = request.get_json()
    user_id = data.get('userId', 'guest')
    
    if user_id in cart_storage:
        for item in cart_storage[user_id]:
            if item['id'] == item_id:
                item['amount'] = data.get('amount', item['amount'])
                item['investmentType'] = data.get('investmentType', item['investmentType'])
                item['frequency'] = data.get('frequency', item.get('frequency'))
                
                return jsonify({
                    'status': 'success',
                    'data': item,
                    'message': 'Cart item updated'
                })
    
    return jsonify({
        'status': 'error',
        'message': 'Cart item not found'
    }), 404

@app.route('/api/cart/<item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    """Remove item from cart"""
    user_id = request.args.get('userId', 'guest')
    
    if user_id in cart_storage:
        cart_storage[user_id] = [item for item in cart_storage[user_id] if item['id'] != item_id]
        
        return jsonify({
            'status': 'success',
            'message': 'Item removed from cart'
        })
    
    return jsonify({
        'status': 'error',
        'message': 'Cart not found'
    }), 404

@app.route('/api/cart/clear', methods=['POST'])
def clear_cart():
    """Clear all items from cart"""
    data = request.get_json()
    user_id = data.get('userId', 'guest')
    
    if user_id in cart_storage:
        cart_storage[user_id] = []
    
    return jsonify({
        'status': 'success',
        'message': 'Cart cleared'
    })

# User/Portfolio endpoints
@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """Get user portfolio"""
    user_id = request.args.get('userId', 'demo-user')
    
    # Mock portfolio data
    portfolio = {
        'totalValue': 525000,
        'invested': 450000,
        'returns': 75000,
        'returnsPercent': 16.67,
        'holdings': [
            {
                'basketId': 1,
                'basketName': 'Blue-chip Elite',
                'invested': 120000,
                'current': 145000,
                'returns': 25000,
                'returnsPercent': 20.83
            },
            {
                'basketId': 3,
                'basketName': 'Tech Innovators',
                'invested': 100000,
                'current': 118000,
                'returns': 18000,
                'returnsPercent': 18.00
            },
            {
                'basketId': 2,
                'basketName': 'Dividend Champions',
                'invested': 80000,
                'current': 92000,
                'returns': 12000,
                'returnsPercent': 15.00
            },
            {
                'basketId': 6,
                'basketName': 'Green Energy',
                'invested': 150000,
                'current': 170000,
                'returns': 20000,
                'returnsPercent': 13.33
            }
        ],
        'sips': [
            {
                'basketId': 1,
                'basketName': 'Blue-chip Elite',
                'amount': 10000,
                'frequency': 'Monthly',
                'nextDate': (datetime.now() + timedelta(days=8)).strftime('%Y-%m-%d'),
                'status': 'Active'
            },
            {
                'basketId': 3,
                'basketName': 'Tech Innovators',
                'amount': 5000,
                'frequency': 'Monthly',
                'nextDate': (datetime.now() + timedelta(days=12)).strftime('%Y-%m-%d'),
                'status': 'Active'
            }
        ],
        'transactions': [
            {
                'date': datetime.now().strftime('%Y-%m-%d'),
                'type': 'SIP',
                'basketName': 'Blue-chip Elite',
                'amount': 10000,
                'status': 'Completed'
            },
            {
                'date': (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
                'type': 'Buy',
                'basketName': 'Green Energy',
                'amount': 50000,
                'status': 'Completed'
            }
        ],
        'performance': {
            'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            'values': [450000, 455000, 465000, 472000, 485000, 490000, 498000, 505000, 510000, 515000, 520000, 525000]
        }
    }
    
    return jsonify({
        'status': 'success',
        'data': portfolio
    })

# Mutual Funds API endpoint (proxy to external API or serve from local data)
@app.route('/api/mutual-funds', methods=['GET'])
def get_mutual_funds():
    """Get all mutual funds data - serves from OLD local file (9,891 records)"""
    import json
    
    # Use ONLY the old file without indices (9,891 records - ORIGINAL API)
    local_file = os.path.join(os.path.dirname(__file__), 'data', 'mutual_funds.json')
    
    # Serve old file only
    if os.path.exists(local_file):
        try:
            with open(local_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"✓ Serving {len(data.get('data', []))} mutual funds from OLD API (mutual_funds.json)")
            return jsonify(data)
        except Exception as e:
            print(f"Error loading old file: {str(e)}")
    
    # If local file doesn't exist, fetch from external API
    try:
        import requests
        print("Fetching mutual funds from external API...")
        response = requests.get('https://fundanalyzer.in/testcronpaymaa/testing/allcodes', timeout=10)
        data = response.json()
        return jsonify(data)
    except Exception as e:
        print(f"External API failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Unable to fetch funds data. Please run scripts/fetch_and_save_funds.py to download data locally.'
        }), 500

# Search endpoint
@app.route('/api/search', methods=['GET'])
def search():
    """Search across baskets and funds"""
    query = request.args.get('q', '').lower()
    from data.mock_data import baskets_data, funds_data
    
    matching_baskets = [b for b in baskets_data if query in b['name'].lower() or query in b.get('description', '').lower()]
    matching_funds = [f for f in funds_data if query in f['name'].lower() or query in f.get('amc', '').lower()]
    
    return jsonify({
        'status': 'success',
        'data': {
            'baskets': matching_baskets,
            'funds': matching_funds
        }
    })

# ============================================
# MUTUAL FUND NAV & DETAILS ENDPOINTS (Accord API)
# ============================================

@app.route('/api/funds/<fund_id>/nav-chart', methods=['GET'])
def get_fund_nav_chart(fund_id):
    """Get NAV chart data for a fund with optional period"""
    from accord_api import AccordMFAPI
    accord_api = AccordMFAPI()
    
    period = request.args.get('period', '1Y')  # 3M, 6M, 1Y, 3Y, 5Y, SI
    
    try:
        data = accord_api.get_nav_chart_data(fund_id, period)
        
        # Transform response to match frontend expectations
        if 'Table' in data:
            transformed_data = {
                'Table': [{
                    'NAV': str(row.get('ADJNAVRS', row.get('NAV', ''))),
                    'Date': row.get('NAVDATE', row.get('Date', ''))
                } for row in data['Table']]
            }
            return jsonify({
                'status': 'success',
                'data': transformed_data
            })
        
        return jsonify({
            'status': 'success',
            'data': data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/<fund_id>/factsheet', methods=['GET'])
def get_fund_factsheet(fund_id):
    """Get complete fund factsheet including overview, returns, portfolio, etc."""
    from accord_api import AccordMFAPI
    accord_api = AccordMFAPI()
    
    try:
        data = accord_api.get_fund_factsheet(fund_id)
        return jsonify({
            'status': 'success',
            'data': data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/<fund_id>/benchmark-returns', methods=['GET'])
def get_fund_benchmark_returns(fund_id):
    """Get fund vs benchmark performance comparison"""
    from accord_api import AccordMFAPI
    accord_api = AccordMFAPI()
    
    try:
        data = accord_api.get_fund_benchmark_returns(fund_id)
        return jsonify({
            'status': 'success',
            'data': data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/peer-comparison/<category_code>', methods=['GET'])
def get_peer_comparison(category_code):
    """Get peer comparison for funds in same category"""
    from accord_api import AccordMFAPI
    accord_api = AccordMFAPI()
    
    try:
        data = accord_api.get_scheme_peer_comparison(category_code)
        return jsonify({
            'status': 'success',
            'data': data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/<fund_id>/isin', methods=['GET'])
def get_fund_isin(fund_id):
    """Get ISIN code for a fund"""
    from accord_api import AccordMFAPI
    accord_api = AccordMFAPI()
    
    try:
        data = accord_api.get_scheme_isin(fund_id)
        return jsonify({
            'status': 'success',
            'data': data
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# =============================================================================
# MUTUAL FUND NAV ENDPOINTS - Real-time data from Accord API
# =============================================================================

# ============================================
# ENHANCED MUTUAL FUND ENDPOINTS (MF Service Enhanced)
# ============================================

@app.route('/api/funds/<fund_id>', methods=['GET'])
def get_fund_details_enhanced(fund_id):
    """Get complete fund details with ALL Accord API data"""
    try:
        service = get_mf_service()
        details = service.get_fund_details(fund_id)
        
        if 'error' in details:
            return jsonify({
                'status': 'error',
                'message': details['error']
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': details
        })
    except Exception as e:
        print(f"❌ Error fetching fund details: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/<fund_id>/nav-history', methods=['GET'])
def get_fund_nav_history_enhanced(fund_id):
    """Get NAV history for a fund (Enhanced endpoint with period support)"""
    period = request.args.get('period', '1Y')  # 3M, 6M, 1Y, 3Y, 5Y, SI
    
    try:
        # Try service first (checks local data)
        service = get_mf_service()
        data = service.get_fund_nav_history(fund_id, period)
        
        # Transform to match frontend expectations (needs Table property)
        if isinstance(data, list):
            transformed_data = {
                'Table': [{
                    'NAV': str(item.get('ADJNAVRS', item.get('NAV', ''))),
                    'Date': item.get('NAVDATE', item.get('Date', ''))
                } for item in data]
            }
            return jsonify({
                'status': 'success',
                'data': transformed_data,
                'period': period
            })
        
        return jsonify({
            'status': 'success',
            'data': data,
            'period': period
        })
    except Exception as e:
        print(f"❌ Error fetching NAV history: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/batch-nav-history', methods=['POST'])
def get_batch_nav_history():
    """Get NAV history for multiple funds at once (BATCH ENDPOINT for performance)"""
    try:
        data = request.get_json()
        fund_codes = data.get('fund_codes', [])
        period = data.get('period', 'SI')
        
        if not fund_codes or not isinstance(fund_codes, list):
            return jsonify({
                'status': 'error',
                'message': 'fund_codes array is required'
            }), 400
        
        print(f"📊 Batch NAV history request for {len(fund_codes)} funds (period: {period})")
        
        service = get_mf_service()
        results = {}
        errors = {}
        
        # Fetch all funds (with basic error handling per fund)
        for code in fund_codes:
            try:
                nav_data = service.get_fund_nav_history(code, period)
                results[code] = nav_data
                print(f"  ✓ {code}: {len(nav_data)} records")
            except Exception as e:
                print(f"  ✗ {code}: {str(e)}")
                errors[code] = str(e)
                results[code] = []  # Return empty array for failed funds
        
        response = {
            'status': 'success',
            'data': results,
            'period': period,
            'summary': {
                'requested': len(fund_codes),
                'successful': len([k for k, v in results.items() if len(v) > 0]),
                'failed': len(errors)
            }
        }
        
        if errors:
            response['errors'] = errors
        
        print(f"✅ Batch request complete: {response['summary']}")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Batch endpoint error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/categories', methods=['GET'])
def get_available_categories():
    """Get all available fund categories from CSV"""
    try:
        service = get_mf_service()
        categories = service.get_available_categories()
        
        return jsonify({
            'status': 'success',
            'data': categories
        })
    except Exception as e:
        print(f"❌ Error fetching categories: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/statistics', methods=['GET'])
def get_fund_statistics():
    """Get overall fund statistics"""
    from mf_service_enhanced import MFServiceEnhanced
    
    try:
        service = MFServiceEnhanced()
        stats = service.get_statistics()
        
        return jsonify({
            'status': 'success',
            'data': stats
        })
    except Exception as e:
        print(f"❌ Error fetching statistics: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/funds/category-comparison/<category_code>', methods=['GET'])
def get_category_comparison_enhanced(category_code):
    """Get peer comparison for a category (Enhanced endpoint)"""
    from mf_service_enhanced import MFServiceEnhanced
    
    try:
        service = MFServiceEnhanced()
        data = service.get_category_comparison(category_code)
        
        return jsonify({
            'status': 'success',
            'data': data
        })
    except Exception as e:
        print(f"❌ Error fetching category comparison: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Mutual Fund API Proxy Endpoints (to avoid CORS issues)
ACCORD_API_BASE = 'https://mf.accordwebservices.com/MF'
ACCORD_API_TOKEN = 'aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz'

@app.route('/api/mf/funds', methods=['GET'])
def get_mf_funds():
    """Get funds with search and filter support - proxies to /api/funds"""
    try:
        # Get query parameters
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        limit = request.args.get('limit', '20')
        page = request.args.get('page', '1')
        
        # Build query string
        params = []
        if search:
            params.append(f'search={search}')
        if category:
            params.append(f'category={category}')
        if limit:
            params.append(f'limit={limit}')
        if page:
            params.append(f'page={page}')
        
        query_string = '&'.join(params) if params else ''
        
        # Call the existing /api/funds endpoint
        mf_service = get_mf_service()
        
        # Parse params
        search_term = search
        category_filter = category
        limit_val = int(limit)
        page_val = int(page)
        
        # Get all funds
        all_funds = mf_service.get_all_funds()
        
        # Filter by search
        if search_term:
            search_lower = search_term.lower()
            all_funds = [
                f for f in all_funds
                if search_lower in f.get('name', '').lower()
                or search_lower in f.get('fundHouse', '').lower()
                or search_lower in f.get('amc', '').lower()
            ]
        
        # Filter by category
        if category_filter:
            category_lower = category_filter.lower()
            all_funds = [
                f for f in all_funds
                if f.get('category', '').lower().startswith(category_lower)
            ]
        
        # Paginate
        start = (page_val - 1) * limit_val
        end = start + limit_val
        funds = all_funds[start:end]
        
        return jsonify({
            'status': 'success',
            'data': funds,
            'pagination': {
                'page': page_val,
                'limit': limit_val,
                'total': len(all_funds)
            }
        })
        
    except Exception as e:
        print(f"❌ Error in get_mf_funds: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/mf/factsheet/<scheme_code>', methods=['GET'])
def proxy_fund_factsheet(scheme_code):
    """Proxy endpoint for fund factsheet"""
    try:
        url = f"{ACCORD_API_BASE}/GetFundFactsheet?SchemeCode={scheme_code}&token={ACCORD_API_TOKEN}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mf/amcs', methods=['GET'])
def proxy_get_funds():
    """Proxy endpoint for GetFunds (AMC list)"""
    try:
        url = f"{ACCORD_API_BASE}/GetFunds?token={ACCORD_API_TOKEN}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mf/categories', methods=['GET'])
def proxy_get_category():
    """Proxy endpoint for GetCategory"""
    try:
        fund_code = request.args.get('fund', '')
        url = f"{ACCORD_API_BASE}/GetCategory?Fund={fund_code}&token={ACCORD_API_TOKEN}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mf/schemes', methods=['GET'])
def proxy_get_scheme():
    """Proxy endpoint for GetScheme"""
    try:
        fund_code = request.args.get('fund', '')
        category_code = request.args.get('category', '')
        url = f"{ACCORD_API_BASE}/GetScheme?Fund={fund_code}&Category={category_code}&token={ACCORD_API_TOKEN}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mf/nav-history/<scheme_code>', methods=['GET'])
def proxy_nav_history(scheme_code):
    """Proxy endpoint for NAV history - maps Accord codes to MFAPI codes"""
    try:
        # Load mapping file
        mapping_file = os.path.join(os.path.dirname(__file__), 'scheme_mapping.json')
        try:
            with open(mapping_file, 'r') as f:
                scheme_mapping = json.load(f)
        except:
            scheme_mapping = {}
        
        # Check if we have a cached mapping
        if scheme_code in scheme_mapping:
            mfapi_code = scheme_mapping[scheme_code]
            print(f"✅ Using cached mapping: {scheme_code} → {mfapi_code}")
        else:
            # Get fund name from Accord
            factsheet_url = f"{ACCORD_API_BASE}/GetFundFactsheet?SchemeCode={scheme_code}&token={ACCORD_API_TOKEN}"
            factsheet_response = requests.get(factsheet_url, timeout=10)
            factsheet_data = factsheet_response.json()
            
            fund_name = None
            if factsheet_data.get('Table') and len(factsheet_data['Table']) > 0:
                fund_name = factsheet_data['Table'][0].get('SCHEME_NAME') or factsheet_data['Table'][0].get('S_NAME')
            
            if not fund_name:
                print(f"❌ Could not get fund name for scheme {scheme_code}")
                return jsonify({'Table': []})
            
            print(f"🔍 Searching for: {fund_name}")
            
            # Extract search terms
            search_terms = fund_name
            for word in ['(G)', '(IDCW)', '(M-IDCW)', '(Q-IDCW)', '-Direct', '-Regular', 'Direct', 'Regular', 'Plan']:
                search_terms = search_terms.replace(word, '')
            search_terms = ' '.join(search_terms.split()[:4])  # First 4 words
            
            # Search MFAPI
            search_url = f"https://api.mfapi.in/mf/search?q={requests.utils.quote(search_terms)}"
            search_response = requests.get(search_url, timeout=10)
            search_data = search_response.json()
            
            if not search_data:
                print(f"❌ No results for: {search_terms}")
                return jsonify({'Table': []})
            
            # Find best match
            plan_type = 'Direct' if 'Direct' in fund_name else 'Regular'
            option_type = 'Growth' if '(G)' in fund_name else 'IDCW'
            
            mfapi_code = None
            for item in search_data:
                sn = item.get('schemeName', '')
                if plan_type in sn and option_type in sn:
                    mfapi_code = item.get('schemeCode')
                    print(f"✅ Found: {mfapi_code} - {sn}")
                    break
            
            if not mfapi_code and search_data:
                mfapi_code = search_data[0].get('schemeCode')
                print(f"⚠️ Using first result: {mfapi_code}")
            
            if not mfapi_code:
                print(f"❌ No MFAPI code found")
                return jsonify({'Table': []})
            
            # Save mapping for next time
            scheme_mapping[scheme_code] = mfapi_code
            try:
                with open(mapping_file, 'w') as f:
                    json.dump(scheme_mapping, f, indent=2)
                print(f"💾 Saved mapping: {scheme_code} → {mfapi_code}")
            except Exception as e:
                print(f"⚠️ Could not save mapping: {e}")
        
        # Fetch NAV data from MFAPI
        nav_url = f"https://api.mfapi.in/mf/{mfapi_code}"
        print(f"🔍 Fetching NAV: {nav_url}")
        nav_response = requests.get(nav_url, timeout=10)
        data = nav_response.json()
        
        # Transform data
        if data.get('status') == 'SUCCESS' and data.get('data'):
            nav_data = []
            for item in data['data']:
                try:
                    date_parts = item['date'].split('-')
                    if len(date_parts) == 3:
                        formatted_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"
                        nav_data.append({
                            'NAVDATE': formatted_date,
                            'NAVRS': float(item['nav'])
                        })
                except:
                    continue
            
            if nav_data:
                print(f"✅ Returning {len(nav_data)} NAV records")
                return jsonify({'Table': nav_data})
        
        print(f"❌ No NAV data available")
        return jsonify({'Table': []})
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'Table': []})

@app.route('/api/mf/nifty50-history', methods=['GET'])
def get_nifty50_history():
    """
    Endpoint for Nifty 50 historical data
    Uses UTI Nifty 50 Index Fund-Reg(G) as benchmark - Scheme Code: 3641
    This provides accurate, up-to-date Nifty 50 tracking data via Accord MF API
    """
    try:
        scheme_code = '3641'  # UTI Nifty 50 Index Fund-Reg(G)
        print(f"📈 Fetching Nifty 50 benchmark data from UTI Nifty 50 Index Fund (scheme: {scheme_code})")
        
        # Use the same Accord MF service that other fund endpoints use
        service = get_mf_service()
        accord_data = service.api.get_nav_chart_data(scheme_code, period='SI')
        
        print(f"  📊 Accord MF API returned {len(accord_data)} records")
        
        # Convert Accord MF format to frontend expected format
        history = []
        for item in accord_data:
            try:
                date_str = item.get('NAVDATE', '')
                nav_str = item.get('ADJNAVRS', '')
                
                if date_str and nav_str:
                    # Parse date (format: "M/D/YYYY 12:00:00 AM")
                    date_obj = datetime.strptime(date_str, '%m/%d/%Y %I:%M:%S %p')
                    formatted_date = date_obj.strftime('%Y-%m-%d')
                    
                    history.append({
                        'NAVDATE': formatted_date,
                        'NAVRS': float(nav_str)
                    })
            except Exception as e:
                print(f"  ⚠️ Skipping row with date {date_str}: {e}")
                continue
        
        # Sort by date (oldest first) for proper chart rendering
        history.sort(key=lambda x: x['NAVDATE'])
        
        print(f"  ✅ Loaded {len(history)} data points for Nifty 50 benchmark")
        if history:
            print(f"  📅 Date range: {history[0]['NAVDATE']} to {history[-1]['NAVDATE']}")
            print(f"  💰 NAV range: {history[0]['NAVRS']:.2f} to {history[-1]['NAVRS']:.2f}")
        
        return jsonify({'Table': history})
        
    except Exception as e:
        print(f"❌ Error loading Nifty 50 data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/amcs', methods=['GET'])
def get_amcs():
    """Alias for /api/mf/amcs - Get AMC list"""
    return proxy_get_funds()

@app.route('/api/factsheet/<scheme_code>', methods=['GET'])
def get_factsheet_alias(scheme_code):
    """Alias endpoint for /api/funds/{scheme_code}/factsheet"""
    return get_fund_factsheet(scheme_code)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

