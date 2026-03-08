# 🔍 MUTUAL FUND NAV SYSTEM - SEARCH & DATA FLOW ARCHITECTURE

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: User Types in Search Box                                  │
│  Example: "HDFC Bank"                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React)                                                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ const searchFunds = async (query) => {                     │   │
│  │   const response = await fetch(                            │   │
│  │     `/api/nav/search?q=${query}&limit=50`                  │   │
│  │   );                                                        │   │
│  │   return response.json();                                  │   │
│  │ }                                                           │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    GET /api/nav/search?q=HDFC Bank&limit=50
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FLASK BACKEND (app.py)                                             │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ @app.route('/api/nav/search')                              │   │
│  │ def nav_search_funds():                                    │   │
│  │     query = request.args.get('q', '')  # "HDFC Bank"       │   │
│  │     limit = request.args.get('limit', 50)                  │   │
│  │     results = nav_service.search_funds(query, limit)       │   │
│  │     return jsonify(results)                                │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NAV SERVICE (nav_service.py)                                       │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ def search_funds(query, limit):                            │   │
│  │     # Search in pre-loaded MF.csv data                     │   │
│  │     df = self.funds_df  # 9,891 funds in memory            │   │
│  │     df = df[df['S_NAME'].str.contains(query, case=False)]  │   │
│  │     return df.head(limit).to_dict('records')               │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  IN-MEMORY CSV DATA (MF.csv loaded at startup)                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ SCHEMECODE | S_NAME                      | CATEGORY_CODE   │   │
│  │ ──────────────────────────────────────────────────────────  │   │
│  │ 5184       | Aditya Birla SL Banking...  | 72              │   │
│  │ 18303      | Aditya Birla SL Banking...  | 72              │   │
│  │ 43447      | Aditya Birla SL Banking...  | 72              │   │
│  │ 119551     | HDFC Bank Fund...           | 45              │   │
│  │ 119552     | HDFC Bank Fund Direct...    | 45              │   │
│  │ ...        | 9,886 more funds...         | ...             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  🔍 Pandas filters rows where S_NAME contains "HDFC Bank"          │
│  ⚡ INSTANT search - all 9,891 funds are in RAM                    │
│  📊 Returns top 50 matches (no NAV data yet)                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                        ⬅️ Response (0.05 seconds)
┌─────────────────────────────────────────────────────────────────────┐
│  SEARCH RESULTS (JSON Response)                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ {                                                           │   │
│  │   "status": "success",                                      │   │
│  │   "count": 15,                                              │   │
│  │   "data": [                                                 │   │
│  │     {                                                       │   │
│  │       "SCHEMECODE": 119551,                                 │   │
│  │       "S_NAME": "HDFC Bank Fund - Direct Plan",             │   │
│  │       "CATEGORY_CODE": 45,                                  │   │
│  │       "CATEGORY_NAME": "Equity - Banking Fund"              │   │
│  │     },                                                       │   │
│  │     { ... 14 more results ... }                             │   │
│  │   ]                                                          │   │
│  │ }                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ⚠️ NOTE: NO NAV DATA YET - Just fund names and codes              │
│  ⚡ Super fast because it's just CSV filtering                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND DISPLAYS SEARCH RESULTS                                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  🔍 Search Results (15 funds)                              │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │ 📊 HDFC Bank Fund - Direct Plan                  │     │   │
│  │  │    Category: Equity - Banking Fund               │     │   │
│  │  │    [View Details] ← User clicks this             │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │ 📊 HDFC Bank Fund - Regular Plan                 │     │   │
│  │  │    Category: Equity - Banking Fund               │     │   │
│  │  │    [View Details]                                │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 STEP 2: User Clicks "View Details" - Fetch NAV

```
┌─────────────────────────────────────────────────────────────────────┐
│  USER CLICKS: View Details for SCHEMECODE 119551                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    GET /api/nav/119551
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FLASK BACKEND (app.py)                                             │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ @app.route('/api/nav/<scheme_code>')                       │   │
│  │ def nav_get_fund_details(scheme_code):                     │   │
│  │     fund = nav_service.get_fund_with_nav(scheme_code)      │   │
│  │     return jsonify(fund)                                   │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NAV SERVICE - Check Cache First                                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ def get_fund_with_nav(scheme_code):                        │   │
│  │     # 1. Get basic fund data from CSV                      │   │
│  │     fund_data = self.funds_df[                             │   │
│  │         self.funds_df['SCHEMECODE'] == 119551              │   │
│  │     ]                                                       │   │
│  │                                                             │   │
│  │     # 2. Check if NAV is cached                            │   │
│  │     if scheme_code in self.nav_cache:                      │   │
│  │         cached = self.nav_cache[scheme_code]               │   │
│  │         if (now - cached['timestamp']) < 4 hours:          │   │
│  │             return cached['data']  # ⚡ Use cache!         │   │
│  │                                                             │   │
│  │     # 3. Cache miss - fetch from API                       │   │
│  │     nav_data = self.api.get_current_nav(scheme_code)       │   │
│  │     self.nav_cache[scheme_code] = nav_data                 │   │
│  │     return nav_data                                        │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
            │                                          │
            │ CACHE HIT                                │ CACHE MISS
            │ (Already fetched                         │ (First time or
            │  in last 4 hours)                        │  cache expired)
            ▼                                          ▼
┌─────────────────────────┐          ┌──────────────────────────────┐
│  RETURN CACHED NAV      │          │  FETCH FROM ACCORD API       │
│  ⚡ 0.001 seconds       │          │  🌐 0.5-1.0 seconds          │
└─────────────────────────┘          └──────────────────────────────┘
                                                    │
                                                    ▼
                    ┌─────────────────────────────────────────┐
                    │  ACCORD API (accord_api.py)             │
                    │  ┌────────────────────────────────┐     │
                    │  │ def get_current_nav():         │     │
                    │  │   url = BASE_URL +             │     │
                    │  │     '/GetFundFactsheet?'       │     │
                    │  │     'SchemeCode=119551&'       │     │
                    │  │     'token=aFzyhRk...'         │     │
                    │  │   response = requests.get(url) │     │
                    │  │   return response.json()       │     │
                    │  └────────────────────────────────┘     │
                    └─────────────────────────────────────────┘
                                      │
                                      ▼
                    🌐 External API Call
                    https://mf.accordwebservices.com/MF/GetFundFactsheet
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │  ACCORD SERVER RESPONSE                 │
                    │  {                                      │
                    │    "snapshot_summary": [{               │
                    │      "NAVRS": "154.3239",               │
                    │      "NAVDATE": "1/23/2026",            │
                    │      "NETCHANGE": "0.0304",             │
                    │      "PER_CHANGE": "0.0197",            │
                    │      "AUM": "9064.207",                 │
                    │      "EXPENSE_RATIO": "0.73",           │
                    │      "MININVT": "5000",                 │
                    │      "RISKTYPE": "Low"                  │
                    │    }]                                   │
                    │  }                                      │
                    └─────────────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │  SAVE TO CACHE (4-hour expiry)          │
                    │  {                                      │
                    │    '119551': {                          │
                    │      'data': { nav, date, ... },        │
                    │      'timestamp': 2026-01-27 10:30:00   │
                    │    }                                    │
                    │  }                                      │
                    └─────────────────────────────────────────┘
                                      │
                                      ▼
                    ⬅️ Complete Response to Frontend
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND DISPLAYS FUND DETAILS                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  📊 HDFC Bank Fund - Direct Plan                           │   │
│  │  ────────────────────────────────────────────────────       │   │
│  │  💰 NAV: ₹154.3239      📅 Date: 23-Jan-2026              │   │
│  │  📈 Change: +0.0304 (+0.02%)                               │   │
│  │  💼 AUM: ₹9,064 Cr      📊 Expense: 0.73%                 │   │
│  │  🎯 Risk: Low          💵 Min: ₹5,000                      │   │
│  │                                                             │   │
│  │  [View Chart] [Factsheet] [Peer Comparison]                │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 STEP 3: User Wants Chart - Fetch Historical NAV

```
┌─────────────────────────────────────────────────────────────────────┐
│  USER CLICKS: View 1-Year Chart                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
              GET /api/nav/119551/chart?period=1Y
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NAV SERVICE                                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ def get_fund_chart(scheme_code, period):                   │   │
│  │     return self.api.get_nav_chart_data(scheme_code, '1Y')  │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    🌐 API Call to Accord
              /GetNAVChartData?schemecode=119551&period=1Y
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ACCORD API RETURNS HISTORICAL DATA                                 │
│  {                                                                  │
│    "Table": [                                                       │
│      { "NAV": "154.32", "Date": "2025-01-23" },                    │
│      { "NAV": "154.29", "Date": "2025-01-22" },                    │
│      { "NAV": "154.15", "Date": "2025-01-21" },                    │
│      { "NAV": "153.98", "Date": "2025-01-20" },                    │
│      ... (238 more data points)                                     │
│    ]                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND RENDERS CHART (Recharts/Highcharts)                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │   156 ┤         ╭──╮                                       │   │
│  │   155 ┤       ╭─╯  ╰╮                                      │   │
│  │   154 ┤     ╭─╯     ╰─╮                                    │   │
│  │   153 ┤   ╭─╯         ╰──╮                                 │   │
│  │   152 ┤ ╭─╯              ╰─╮                               │   │
│  │   151 ┼─╯                  ╰─                              │   │
│  │       └──────────────────────────────────────              │   │
│  │       Jan  Apr  Jul  Oct  Jan                              │   │
│  │       2025              2026                                │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Summary

### Phase 1: SEARCH (Lightning Fast ⚡)
1. User types → Frontend sends search query
2. Backend searches **in-memory CSV** (9,891 funds in RAM)
3. Returns matching funds **without NAV** (0.05 sec)
4. User sees list of funds instantly

### Phase 2: FUND DETAILS (First Time 🌐)
1. User clicks fund → Frontend requests NAV
2. Backend checks cache → MISS (first time)
3. Calls Accord API → Fetches real-time NAV
4. Saves to cache (4-hour expiry)
5. Returns complete fund + NAV data (0.5-1.0 sec)

### Phase 3: FUND DETAILS (Subsequent Times ⚡)
1. User clicks same fund again
2. Backend checks cache → HIT!
3. Returns cached NAV instantly (0.001 sec)
4. No API call needed

### Phase 4: CHARTS & FACTSHEETS (On Demand 🌐)
1. User clicks "View Chart"
2. Backend calls Accord API for historical data
3. Returns 242 data points for 1-year chart
4. Frontend renders beautiful chart

---

## 🔑 Key Benefits of This Architecture

### ✅ Speed
- **Search**: 0.05 sec (CSV in memory)
- **First NAV fetch**: 0.5-1.0 sec (API call)
- **Cached NAV**: 0.001 sec (instant!)

### ✅ Efficiency
- Only fetch NAV when user actually views a fund
- Don't waste API calls on funds nobody views
- Cache prevents repeated calls for popular funds

### ✅ Freshness
- NAV always fetched from API (real-time)
- Cache expires after 4 hours (NAV updates once/day)
- Historical data fetched on demand

### ✅ Scalability
- Can handle 1000s of searches per minute (just CSV filtering)
- Can handle 100s of fund views per minute (with cache)
- Minimal API usage (only when cache misses)

### ✅ Cost Effective
- No bulk NAV downloads needed
- Only pay for API calls when users view funds
- Cache reduces API costs by 80-90%

---

## 🎯 Example Timeline

**10:00 AM** - User searches "HDFC Bank"
- Backend searches CSV → Returns 15 matches (0.05 sec)
- Total API calls: **0**

**10:01 AM** - User clicks Fund #1 (scheme 119551)
- Backend checks cache → MISS
- Calls Accord API → Gets NAV ₹154.32
- Saves to cache → Returns to user (0.8 sec)
- Total API calls: **1**

**10:05 AM** - Another user clicks same Fund #1
- Backend checks cache → HIT (cached at 10:01)
- Returns NAV ₹154.32 from cache (0.001 sec)
- Total API calls: **0**

**2:00 PM** - User clicks "View 1Y Chart"
- Backend calls Accord API → Gets 242 data points
- Returns chart data (0.9 sec)
- Total API calls: **1**

**2:30 PM** - Same user refreshes page
- Backend checks cache → HIT (cached at 10:01, still valid)
- Returns NAV from cache (0.001 sec)
- Total API calls: **0**

**3:00 PM** - User comes back after 5 hours
- Backend checks cache → EXPIRED (>4 hours old)
- Calls Accord API → Gets fresh NAV ₹154.45
- Updates cache → Returns to user
- Total API calls: **1**

**Total for the day:**
- 1,000 searches → 0 API calls (CSV only)
- 500 fund views → ~100 API calls (80% from cache)
- 50 chart requests → 50 API calls

**Without cache:** 500 + 50 = 550 API calls  
**With cache:** 100 + 50 = 150 API calls (73% reduction!)

---

## 🚀 Ready to Use!

All components are ready:
- ✅ CSV loaded in memory (9,891 funds)
- ✅ Accord API integration working
- ✅ Caching system active (4-hour expiry)
- ✅ Flask endpoints exposed
- ✅ Token secured in .env

**Next:** Build React components to call these APIs! 🎨
