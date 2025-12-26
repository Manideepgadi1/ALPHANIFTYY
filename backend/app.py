from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime, timedelta
import uuid
import pandas as pd
from dateutil.relativedelta import relativedelta

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
    """Get all baskets with optional filters"""
    # TODO: Implement filtering logic
    from data.mock_data import baskets_data
    return jsonify({
        'status': 'success',
        'data': baskets_data
    })

@app.route('/api/baskets/<basket_id>', methods=['GET'])
def get_basket_details(basket_id):
    """Get detailed information about a specific basket"""
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
    
    # Find the basket
    basket = next((b for b in baskets_data if str(b['id']) == str(basket_id)), None)
    
    if not basket:
        return jsonify({
            'status': 'error',
            'message': 'Basket not found'
        }), 404
    
    # Get Excel filename from basket data
    excel_file = basket.get('excelFile')
    
    if not excel_file:
        return jsonify({
            'status': 'error',
            'message': 'No Excel file associated with this basket'
        }), 404
    
    # Read Excel file
    try:
        file_path = os.path.join(os.path.dirname(__file__), excel_file)
        df = pd.read_excel(file_path)
        
        # Convert DATE column to datetime
        df['DATE'] = pd.to_datetime(df['DATE'])
        
        # Sort by date ascending
        df = df.sort_values('DATE')
        
        # Get time period filter (1Y, 3Y, 5Y, 10Y)
        time_period = request.args.get('period', '5Y')
        
        # Calculate cutoff date
        end_date = df['DATE'].max()
        if time_period == '1Y':
            start_date = end_date - relativedelta(years=1)
        elif time_period == '3Y':
            start_date = end_date - relativedelta(years=3)
        elif time_period == '5Y':
            start_date = end_date - relativedelta(years=5)
        elif time_period == '10Y':
            start_date = end_date - relativedelta(years=10)
        else:
            start_date = end_date - relativedelta(years=5)
        
        # Filter data by date range
        filtered_df = df[df['DATE'] >= start_date].copy()
        
        # Sample data points for better visualization
        # For better performance, sample every N days based on time period
        if time_period == '1Y':
            sample_days = 7  # Weekly data for 1 year
        elif time_period == '3Y':
            sample_days = 21  # ~3 weeks for 3 years
        elif time_period == '5Y':
            sample_days = 30  # Monthly for 5 years
        else:  # 10Y
            sample_days = 60  # Bi-monthly for 10 years
        
        # Sample the dataframe
        sampled_df = filtered_df.iloc[::sample_days].copy()
        
        # Normalize to base 100 (starting value = 100)
        if len(sampled_df) > 0:
            first_portfolio = sampled_df['Weightage NAV'].iloc[0]
            first_nifty = sampled_df['NIFTY 50'].iloc[0]
            
            sampled_df['Portfolio_Normalized'] = (sampled_df['Weightage NAV'] / first_portfolio) * 100
            sampled_df['Nifty_Normalized'] = (sampled_df['NIFTY 50'] / first_nifty) * 100
        
        # Format data for frontend
        performance_data = []
        for _, row in sampled_df.iterrows():
            performance_data.append({
                'date': row['DATE'].strftime('%Y-%m-%d'),
                'label': row['DATE'].strftime('%b %Y'),
                'portfolioValue': round(row['Portfolio_Normalized'], 2),
                'niftyValue': round(row['Nifty_Normalized'], 2),
                'portfolioNAV': round(row['Weightage NAV'], 2),
                'niftyNAV': round(row['NIFTY 50'], 2)
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'performance': performance_data,
                'period': time_period,
                'startDate': start_date.strftime('%Y-%m-%d'),
                'endDate': end_date.strftime('%Y-%m-%d')
            }
        })
        
    except FileNotFoundError:
        return jsonify({
            'status': 'error',
            'message': f'Excel file not found: {excel_file}'
        }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error reading Excel file: {str(e)}'
        }), 500

# Fund endpoints
@app.route('/api/funds', methods=['GET'])
def get_funds():
    """Get all funds with optional filters"""
    from data.mock_data import funds_data
    return jsonify({
        'status': 'success',
        'data': funds_data
    })

@app.route('/api/funds/<fund_id>', methods=['GET'])
def get_fund_details(fund_id):
    """Get detailed information about a specific fund"""
    from data.mock_data import funds_data
    # Handle both string and numeric IDs
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
