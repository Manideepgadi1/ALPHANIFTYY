# 📋 Data Requirements for Enhanced Basket Details Page

## Current vs Reference Comparison

### ✅ What We Already Have:
- Basket name, description, color
- Risk level, time horizon, age range
- CAGR metrics (1Y, 3Y, 5Y)
- Sharpe ratio, risk percentage
- Philosophy, rationale, suitable for
- Goals array
- Minimum investment amount

### ❌ What's Missing (From Your Reference Image):

---

## 1️⃣ **ASSET ALLOCATION - Fund Composition**

For each basket, provide the **actual funds** with allocations:

```python
'fundAllocations': [
    {
        'fundId': 'fund-1',
        'fundName': 'HDFC Top 100 Fund',
        'fundCategory': 'Large Cap',
        'allocationPercent': 25,
        'amount': 6250  # Based on ₹25,000 investment
    },
    {
        'fundId': 'fund-2',
        'fundName': 'ICICI Prudential Bluechip Fund',
        'fundCategory': 'Large Cap',
        'allocationPercent': 40,
        'amount': 10000
    },
    {
        'fundId': 'fund-3',
        'fundName': 'Parag Parikh Flexi Cap Fund',
        'fundCategory': 'Flexi Cap',
        'allocationPercent': 20,
        'amount': 5000
    },
    {
        'fundId': 'fund-4',
        'fundName': 'Primus Small Cap Fund',
        'fundCategory': 'Small Cap',
        'allocationPercent': 15,
        'amount': 3750
    }
]
```

---

## 2️⃣ **SECTOR ALLOCATION - Industry Breakdown**

Show which sectors the basket invests in:

```python
'sectorAllocation': [
    {'sector': 'Financial Services', 'percent': 28.0},
    {'sector': 'Information Technology', 'percent': 22.8},
    {'sector': 'Consumer Goods', 'percent': 15.7},
    {'sector': 'Healthcare', 'percent': 12.4},
    {'sector': 'Industrials', 'percent': 10.8},
    {'sector': 'Others', 'percent': 10.3}
]
```

---

## 3️⃣ **TOP HOLDINGS - Individual Stocks**

List the top 5-10 stocks in the portfolio:

```python
'topHoldings': [
    {'stockName': 'HDFC Bank Ltd', 'percent': 4.5, 'sector': 'Financial Services'},
    {'stockName': 'Reliance Industries Ltd', 'percent': 4.8, 'sector': 'Energy'},
    {'stockName': 'Infosys Ltd', 'percent': 4.2, 'sector': 'IT'},
    {'stockName': 'Bharti Airtel Ltd', 'percent': 3.9, 'sector': 'Telecom'},
    {'stockName': 'ICICI Bank Ltd', 'percent': 3.8, 'sector': 'Financial Services'}
]
```

---

## 4️⃣ **INVESTMENT PERFORMANCE - Asset Type Breakdown**

Show performance by asset category:

```python
'investmentPerformance': {
    'largeCap': {'allocation': 60, 'returns1Y': 18.5, 'returns3Y': 15.2},
    'midCap': {'allocation': 30, 'returns1Y': 22.8, 'returns3Y': 17.5},
    'smallCap': {'allocation': 10, 'returns1Y': 28.5, 'returns3Y': 21.2}
}
```

---

## 5️⃣ **HISTORICAL PERFORMANCE DATA**

Month-by-month or year-by-year returns for charts:

```python
'historicalPerformance': {
    'monthly': [
        {'month': 'Jan 2024', 'value': 100000, 'return': 0},
        {'month': 'Feb 2024', 'value': 102500, 'return': 2.5},
        {'month': 'Mar 2024', 'value': 105000, 'return': 5.0},
        # ... more data points
    ],
    'yearly': [
        {'year': '2020', 'return': 15.2},
        {'year': '2021', 'return': 22.8},
        {'year': '2022', 'return': -8.5},
        {'year': '2023', 'return': 18.9},
        {'year': '2024', 'return': 19.5}
    ]
}
```

---

## 6️⃣ **DETAILED SUITABILITY INFORMATION**

More granular investor profile matching:

```python
'investorProfile': {
    'ageGroup': '25-50 years',
    'riskAppetite': 'High',
    'experienceLevel': 'Standard to Expert',
    'investmentHorizon': '7+ years',
    'incomeRequirement': 'No immediate income needed',
    'financialGoals': ['Wealth Creation', 'Child Education', 'Retirement Planning'],
    'idealFor': [
        'Young professionals with stable income',
        'Investors looking for long-term wealth creation',
        'Those comfortable with market volatility'
    ]
}
```

---

## 7️⃣ **REBALANCING STRATEGY - Detailed**

Explain when and how rebalancing happens:

```python
'rebalancingStrategy': {
    'frequency': 'Quarterly',
    'criteria': 'Deviation > 5% from target allocation',
    'process': 'Systematic rebalancing based on market conditions and fund performance',
    'lastRebalanced': '2024-12-01',
    'nextRebalancing': '2025-03-01'
}
```

---

## 8️⃣ **RISK METRICS - Detailed**

Additional risk indicators:

```python
'riskMetrics': {
    'volatility': 15.8,  # Standard deviation
    'beta': 1.05,  # Market correlation
    'sharpeRatio': 1.78,
    'sortinoRatio': 2.15,
    'maxDrawdown': -18.5,  # Maximum loss from peak
    'valueAtRisk': -12.3  # 95% confidence level
}
```

---

## 9️⃣ **RETURN COMPARISON TABLE**

Show what ₹10,000 SIP becomes:

```python
'returnProjections': {
    'sipAmount': 10000,
    'projections': [
        {'period': '1 Year', 'invested': 120000, 'returns': 12500, 'totalValue': 132500, 'cagr': 19.5},
        {'period': '3 Years', 'invested': 360000, 'returns': 85000, 'totalValue': 445000, 'cagr': 16.8},
        {'period': '5 Years', 'invested': 600000, 'returns': 220000, 'totalValue': 820000, 'cagr': 15.2},
        {'period': '10 Years', 'invested': 1200000, 'returns': 890000, 'totalValue': 2090000, 'cagr': 14.5}
    ]
}
```

---

## 🔟 **TAX IMPLICATIONS**

Tax information for investors:

```python
'taxDetails': {
    'equityTaxation': {
        'shortTerm': 'Less than 1 year: 15% on gains',
        'longTerm': 'More than 1 year: 10% on gains > ₹1 Lakh'
    },
    'debtTaxation': {
        'shortTerm': 'Less than 3 years: As per income slab',
        'longTerm': 'More than 3 years: 20% with indexation'
    }
}
```

---

## 📊 **COMPLETE DATA STRUCTURE EXAMPLE**

Here's the complete structure for ONE basket:

```python
{
    # ===== EXISTING DATA (Already have) =====
    'id': 'b1',
    'name': 'Orange Basket',
    'color': '#FF6B35',
    'description': 'Aggressive growth portfolio for wealth creation',
    'riskLevel': 'High',
    'minInvestment': 25000,
    'timeHorizon': '7+ years',
    'cagr1Y': 19.5,
    'cagr3Y': 16.8,
    'cagr5Y': 15.2,
    'sharpeRatio': 1.78,
    'riskPercentage': 18.5,
    'philosophy': '...',
    'rationale': '...',
    'suitableFor': '...',
    'rebalancingFrequency': 'Quarterly',
    
    # ===== NEW DATA NEEDED =====
    'fundAllocations': [...],  # See #1
    'sectorAllocation': [...],  # See #2
    'topHoldings': [...],  # See #3
    'investmentPerformance': {...},  # See #4
    'historicalPerformance': {...},  # See #5
    'investorProfile': {...},  # See #6
    'rebalancingStrategy': {...},  # See #7
    'riskMetrics': {...},  # See #8
    'returnProjections': {...},  # See #9
    'taxDetails': {...}  # See #10
}
```

---

## 📋 **QUICK CHECKLIST - What to Provide Me**

For EACH of your 14 baskets, please provide:

### ✅ Essential (Must Have):
1. **Fund Allocations** - Which funds + percentages
2. **Sector Allocation** - Which sectors + percentages
3. **Top Holdings** - Top 5-10 stocks + percentages
4. **Historical Returns** - At least 12 months of data

### 🔄 Important (Should Have):
5. **Risk Metrics** - Volatility, beta, max drawdown
6. **Return Projections** - SIP projections for 1Y/3Y/5Y/10Y
7. **Investor Profile Details** - Detailed suitability criteria

### 🎯 Optional (Nice to Have):
8. **Rebalancing Details** - Last rebalanced date, criteria
9. **Tax Information** - If specific to basket
10. **Additional Notes** - Any special features

---

## 🎯 **EASIEST WAY TO PROVIDE DATA**

### Option 1: Excel File (Recommended)
Create an Excel with these sheets:
- **Baskets** (basic info)
- **FundAllocations** (basket_id, fund_id, allocation%)
- **SectorAllocations** (basket_id, sector, %)
- **TopHoldings** (basket_id, stock, %)
- **HistoricalReturns** (basket_id, month, return%)

### Option 2: JSON File
Provide a structured JSON file with all the data

### Option 3: Google Sheet
Share a Google Sheet with organized data

---

## 📞 **NEXT STEPS**

1. **Choose a format** (Excel/JSON/Google Sheet)
2. **Start with 1-2 baskets** as a sample
3. **I'll implement the enhanced UI** to display all this data
4. **Then you can provide data for remaining baskets**

Would you like me to:
1. Create an **Excel template** for you to fill?
2. Create a **sample JSON structure** with dummy data?
3. Show you how to **extract this from your existing Excel files**?

Let me know which approach works best for you! 🚀
