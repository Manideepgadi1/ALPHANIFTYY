# Mutual Fund NAV & Details Implementation Guide

## 📋 Overview
Implementation of mutual fund exploration with NAV tracking, performance charts, portfolio analysis, and peer comparison using Accord Fintech API.

## 🔄 Data Flow

```
Excel (MF.xlsx) → SCHEMECODE → Accord API → NAV + Details → Display Charts
```

### Step-by-Step Process:
1. **Excel Lookup**: Find fund by name/code in `MF.xlsx`
2. **Get SCHEMECODE**: Extract the unique scheme code
3. **API Call**: Use SCHEMECODE to fetch data from Accord API
4. **Transform Data**: Convert API response to UI format
5. **Display**: Show charts, tables, and metrics

## 📊 Excel Structure (MF.xlsx)

| Column | Description |
|--------|-------------|
| SCHEMECODE | Unique fund identifier (used for API calls) |
| S_NAME | Fund name |
| CATEGORY_CODE | Category identifier |
| CATEGORY_NAME | Category name (Equity, Debt, etc.) |
| AUM | Assets Under Management |
| EXPENSE_RATIO | Fund expense ratio |
| INCRET | Inception return % |
| BETAR | Beta ratio |
| _3Rt | 3-year return % |
| std | Standard deviation |
| _5Rt | 5-year return % |
| SHARPR | Sharpe ratio |
| TREYNOR | Treynor ratio |
| Jenson | Jensen Alpha |
| AGE | Fund age |

## 🔌 API Endpoints Created

### Backend Routes (Flask)

1. **GET /api/funds/:fundId/nav-chart?period=1Y**
   - Fetch NAV historical data
   - Periods: 3M, 6M, 1Y, 3Y, 5Y, SI
   - Returns: `[{NAVDATE, ADJNAVRS}, ...]`

2. **GET /api/funds/:fundId/factsheet**
   - Complete fund details
   - Returns: Overview, ratios, allocations, holdings

3. **GET /api/funds/:fundId/benchmark-returns**
   - Fund vs Benchmark performance
   - Returns: Scheme returns + Index returns

4. **GET /api/funds/peer-comparison/:categoryCode**
   - Compare similar funds
   - Returns: List of peers with metrics

5. **GET /api/funds/:fundId/isin**
   - Get ISIN code
   - Returns: ISIN details

## 🎨 UI Components to Build

### 1. Overview Tab
```
- NAV Growth Chart (Line chart)
- Key Metrics Cards (NAV, Change %, Date)
- Timeline selector (1m, 3m, 6m, YTD, 1y, All)
```

### 2. Return Tab  
```
- Historical Performance Chart
- Fund vs Benchmark comparison
- Returns table (1W, 1M, 3M, 6M, 1Y, 3Y, 5Y)
```

### 3. Portfolio Tab
```
- Asset Allocation (Pie/Bar chart)
  * Equity %
  * Debt %
  * Cash %
- Concentration Metrics
  * No. of stocks
  * Top 10 stocks %
  * Top 5 stocks %
  * Top 3 sectors %
- Sector Allocation (Bar chart)
- Top 10 Holdings (Table)
```

### 4. Peer Comparison Tab
```
- Comparison Table with columns:
  * Fund Name
  * Age
  * AUM
  * Inception Return %
  * STD %
  * 3Y Return %
  * 5Y Return %
  * Sharpe %
  * Expense Ratio %
  * Add to Cart button
- Checkbox to select funds
- "Add to Graph" button for multi-fund comparison
```

## 📦 Files Created

### Backend
- ✅ `backend/accord_api.py` - Accord API wrapper class
- ✅ `backend/test_accord_api.py` - API testing script
- ✅ `backend/app.py` - Added 5 new endpoints

### Frontend (To be created)
- ⏳ `src/pages/FundDetailsPage.tsx` - Main fund details page (update existing)
- ⏳ `src/components/FundNavChart.tsx` - NAV chart component
- ⏳ `src/components/FundReturnsChart.tsx` - Returns comparison chart
- ⏳ `src/components/FundPortfolio.tsx` - Portfolio breakdown
- ⏳ `src/components/FundPeerComparison.tsx` - Peer table
- ⏳ `src/services/fundDetailsApi.ts` - API service

## 🔐 Environment Setup

Create `.env` file in `backend/` folder:
```bash
ACCORD_API_TOKEN=your_actual_token_here
```

**Ask your manager for the Accord API token!**

## 🧪 Testing Steps

### 1. Test API Connection
```bash
cd D:/VSFintech-Platform/Alphanifty/backend
python test_accord_api.py
```

Expected output:
- ✅ Factsheet data
- ✅ NAV chart data  
- ✅ Benchmark returns
- ✅ Peer comparison
- ✅ ISIN code

### 2. Test Backend Endpoints
```bash
# Start Flask server
python app.py

# Test in browser or Postman:
http://localhost:5000/api/funds/18304/nav-chart?period=1Y
http://localhost:5000/api/funds/18304/factsheet
http://localhost:5000/api/funds/18304/benchmark-returns
```

## 📈 Next Steps

1. **Get API Token** from your manager
2. **Add to .env** file
3. **Run test_accord_api.py** to verify data structure
4. **Build Frontend Components** based on actual API responses
5. **Integrate with existing FundDetailsPage**

## 🎯 Matching Your Screenshots

### Overview Chart (Image 1)
- Source: `/api/funds/:id/nav-chart?period=1Y`
- Chart Library: Recharts or Highcharts
- X-axis: Dates
- Y-axis: NAV value

### Returns Chart (Image 2)
- Source: `/api/funds/:id/benchmark-returns`
- Show Fund line vs Benchmark line
- Different colors for each

### Portfolio Tab (Image 3)
- Asset Allocation: Pie chart from factsheet data
- Aggregates: Display metrics
- Use factsheet `asset_allocation` table

### Sector & Holdings (Image 4)
- Sector chart from `sector_allocation`
- Holdings table from `holdings`

### Peer Comparison (Image 5)
- Source: `/api/funds/peer-comparison/:categoryCode`
- Sortable table
- Add to cart functionality
- Checkboxes for multi-select

## 🐛 Troubleshooting

**If API returns errors:**
1. Check token is valid
2. Verify SCHEMECODE exists
3. Check internet connection
4. Review API response in test script

**If data is empty:**
1. Try different SCHEMECODE
2. Check period parameter (3M, 6M, 1Y, etc.)
3. Verify fund has historical data

## 📞 Support

Contact Accord Fintech support if:
- Token not working
- API returning errors
- Missing data fields
- Need additional endpoints
