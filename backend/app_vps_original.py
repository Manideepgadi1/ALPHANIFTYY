from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime, timedelta
import uuid
import pandas as pd
from dateutil.relativedelta import relativedelta
import requests

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['DEBUG'] = True

# In-memory storage (replace with database in production)
cart_storage = {}
user_storage = {}
portfolio_storage = {}

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
    
    # Find the basket
    basket = next((b for b in baskets_data if str(b['id']) == str(basket_id)), None)
    
    if not basket:
        return jsonify({
            'status': 'error',
            'message': 'Basket not found'
        }), 404
    
    # Get time period filter (1Y, 3Y, 5Y, 10Y)
    time_period = request.args.get('period', '5Y')
    
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
        
        return jsonify({
            'status': 'success',
            'data': {
                'performance': performance_data,
                'period': time_period,
                'startDate': dates[0].strftime('%Y-%m-%d'),
                'endDate': dates[-1].strftime('%Y-%m-%d')
            }
        })
    
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
        # Special handling for Conservative Premium (b18) and BALANCED Premium (b17)
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
        
        return jsonify({
            'status': 'success',
            'data': {
                'performance': performance_data,
                'period': time_period,
                'startDate': start_date.strftime('%Y-%m-%d'),
                'endDate': end_date.strftime('%Y-%m-%d')
            }
        })
        
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
    """Get all funds with optional filters - returns mutual funds data"""
    import json
    
    # Try to load from local mutual funds file first
    local_file = os.path.join(os.path.dirname(__file__), 'data', 'mutual_funds.json')
    
    if os.path.exists(local_file):
        try:
            with open(local_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Transform the data to match Fund interface
            if 'data' in data and isinstance(data['data'], list):
                transformed_funds = []
                for fund in data['data']:
                    if len(fund) >= 7:  # Ensure we have all required fields
                        # Extract AMC (full company name)
                        fund_name = fund[1]
                        amc_match = fund_name.split('-')[0].strip() if '-' in fund_name else fund_name.split('(')[0].strip()
                        
                        transformed_funds.append({
                            'id': fund[0],  # code
                            'name': fund[1],  # name
                            'amc': amc_match,
                            'fundHouse': amc_match,
                            'category': fund[3] if fund[3] else 'Other',  # category
                            'age': fund[2],  # age
                            'nav': 100,  # placeholder
                            'returns1Y': float(fund[4]) if fund[4] else 0,
                            'returns3Y': float(fund[5]) if fund[5] else 0,
                            'returns5Y': float(fund[6]) if fund[6] else 0,
                            'expenseRatio': 1.5,  # placeholder
                            'aum': '₹1,000 Cr',  # placeholder
                            'risk': 'Medium',  # placeholder
                            'rating': 4  # placeholder
                        })
                
                return jsonify({
                    'status': 'success',
                    'data': transformed_funds
                })
        except Exception as e:
            print(f"Error loading mutual funds: {str(e)}")
    
    # Fallback to mock_data if mutual funds file doesn't exist
    from data.mock_data import funds_data
    return jsonify({
        'status': 'success',
        'data': funds_data
    })

@app.route('/api/mutual-funds/all', methods=['GET'])
def get_all_mutual_funds():
    """Proxy endpoint to fetch all mutual funds from external API"""
    try:
        response = requests.get('https://fundanalyzer.in/testcronpaymaa/testing/allcodes', timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to fetch mutual funds: {str(e)}',
            'data': []
        }), 500

@app.route('/api/funds/<fund_id>', methods=['GET'])
def get_fund_details(fund_id):
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

# Calculator endpoints
@app.route('/api/calculators/sip', methods=['POST'])
def calculate_sip():
    """Calculate SIP returns"""
    data = request.get_json()
    
    monthly_investment = float(data.get('monthlyInvestment', 0))
    annual_return = float(data.get('annualReturn', 12))
    years = int(data.get('years', 5))
    
    # Calculate SIP returns
    monthly_rate = annual_return / 12 / 100
    months = years * 12
    
    # Future Value formula for SIP
    if monthly_rate > 0:
        future_value = monthly_investment * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)
    else:
        future_value = monthly_investment * months
    
    invested_amount = monthly_investment * months
    estimated_returns = future_value - invested_amount
    
    return jsonify({
        'status': 'success',
        'data': {
            'investedAmount': round(invested_amount, 2),
            'estimatedReturns': round(estimated_returns, 2),
            'totalValue': round(future_value, 2)
        }
    })

@app.route('/api/calculators/lumpsum', methods=['POST'])
def calculate_lumpsum():
    """Calculate lumpsum returns"""
    data = request.get_json()
    
    principal = float(data.get('principal', 0))
    annual_return = float(data.get('annualReturn', 12))
    years = int(data.get('years', 5))
    
    # Future Value formula for lumpsum
    future_value = principal * ((1 + annual_return / 100) ** years)
    estimated_returns = future_value - principal
    
    return jsonify({
        'status': 'success',
        'data': {
            'investedAmount': round(principal, 2),
            'estimatedReturns': round(estimated_returns, 2),
            'totalValue': round(future_value, 2)
        }
    })

@app.route('/api/calculators/goal', methods=['POST'])
def calculate_goal():
    """Calculate goal-based investment"""
    data = request.get_json()
    
    target_amount = float(data.get('targetAmount', 0))
    years = int(data.get('years', 10))
    annual_return = float(data.get('annualReturn', 12))
    existing_investment = float(data.get('existingInvestment', 0))
    
    # Calculate future value of existing investment
    future_value_existing = existing_investment * ((1 + annual_return / 100) ** years)
    
    # Remaining amount needed
    remaining_amount = target_amount - future_value_existing
    
    if remaining_amount <= 0:
        return jsonify({
            'status': 'success',
            'data': {
                'requiredMonthlySIP': 0,
                'message': 'Your existing investment is sufficient to meet the goal'
            }
        })
    
    # Calculate required monthly SIP
    monthly_rate = annual_return / 12 / 100
    months = years * 12
    
    if monthly_rate > 0:
        required_sip = remaining_amount * monthly_rate / (((1 + monthly_rate) ** months - 1) * (1 + monthly_rate))
    else:
        required_sip = remaining_amount / months
    
    return jsonify({
        'status': 'success',
        'data': {
            'requiredMonthlySIP': round(required_sip, 2),
            'targetAmount': target_amount,
            'years': years,
            'existingInvestment': existing_investment,
            'futureValueOfExisting': round(future_value_existing, 2),
            'additionalRequired': round(remaining_amount, 2)
        }
    })

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
    """Get all mutual funds data - serves from local file if available, otherwise fetches from API"""
    import json
    
    # Try to load from local file first
    local_file = os.path.join(os.path.dirname(__file__), 'data', 'mutual_funds.json')
    
    if os.path.exists(local_file):
        try:
            with open(local_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print("✓ Serving mutual funds from local file")
            return jsonify(data)
        except Exception as e:
            print(f"Error loading local file: {str(e)}")
    
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
