# Sankranti Premium Graph Update

## ✅ What Was Done

### 1. Connected Excel to API
- **Source Excel:** `SankrantiPremiumnewupdated.xlsx` (4,697 data points from 2013-2025)
- **Backend File:** Copied to `backend/data/SankrantiPremium.xlsx`
- **Production:** Uploaded to server at `/root/alphanifty/backend/data/SankrantiPremium.xlsx`

### 2. Graph Data Structure
The Excel contains these columns:
- **Date** - Time series dates
- **Basket NAV** - Sankranti Premium basket performance
- **Nifty 50** - Nifty 50 index for comparison
- **Smart SIP** - Smart SIP performance

### 3. How It Works Now

```
User visits Sankranti Premium basket page
    ↓
Frontend calls: /api/baskets/b16/excel-performance?period=5Y
    ↓
Backend reads: SankrantiPremium.xlsx
    ↓
Returns 61 data points for 5-year chart
    ↓
Graph displays: Basket vs Nifty 50 vs Smart SIP
```

## 📊 Graph Features

### Time Ranges Available:
- **1Y** - Last 1 year (12 monthly points)
- **3Y** - Last 3 years (18 points)
- **5Y** - Last 5 years (61 points)
- **All** - Complete history (4,697 points from 2013)

### Data Shown:
1. **Portfolio Value** (Sankranti Premium basket)
2. **Smart SIP Value** (Smart SIP strategy)
3. **Nifty Value** (Nifty 50 index for comparison)

## 🎯 Latest Performance Data
- **Start Date:** Dec 2020
- **End Date:** Dec 2025
- **Total Growth:** Basket NAV from 263.03 to 751.52 (185.72% growth)
- **Nifty Comparison:** Nifty NAV from 200.49 to 423.93 (111.45% growth)
- **Smart SIP:** From 100 to 313.4 (213.4% growth)

## 🔧 Technical Details

### Files Modified:
1. ✅ `backend/data/SankrantiPremium.xlsx` - New Excel file (LOCAL)
2. ✅ `/root/alphanifty/backend/data/SankrantiPremium.xlsx` - Uploaded to PRODUCTION

### API Endpoint:
```
GET /api/baskets/b16/excel-performance?period={1Y|3Y|5Y|All}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "performance": [
      {
        "date": "2020-12-10",
        "label": "Dec 2020",
        "portfolioValue": 100.0,
        "smartSipValue": 100.0,
        "niftyValue": 100.0,
        "portfolioNAV": 263.03,
        "niftyNAV": 200.49
      },
      ...
    ],
    "period": "5Y",
    "startDate": "2020-12-10",
    "endDate": "2025-12-10"
  }
}
```

## 🚀 Testing Done

### Local Testing:
```bash
✅ Excel file readable: 4,697 rows
✅ API endpoint working: Returns 61 points for 5Y
✅ Graph data structure correct
```

### Production Testing:
```bash
✅ Excel uploaded to server
✅ API endpoint responding: 61 data points
✅ Date range correct: 2020-12-10 to 2025-12-10
```

## 📝 For Your Manager

**When funds change in the Sankranti Premium basket:**

1. Manager updates the Excel: `SankrantiPremiumnewupdated.xlsx`
2. Upload to server:
   ```powershell
   scp "E:\Downloads\SankrantiPremium.xlsx" root@82.25.105.18:/root/alphanifty/backend/data/
   ```
3. Graph updates automatically (no restart needed!)

**The graph shows:**
- Historical performance from 2013 to present
- Comparison with Nifty 50
- Smart SIP strategy performance
- Multiple time ranges (1Y, 3Y, 5Y, All)

## ✅ Result

The Sankranti Premium basket now shows **real Excel-based performance data** on the graph, not mock data. The graph automatically updates when the Excel file is changed and uploaded!

---

**Last Updated:** January 22, 2026
**Status:** ✅ Working in Production
