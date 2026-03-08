# Fund Comparison with Benchmark - Normalization Flow

## How Graph Normalization Works (Base 100)

```
┌─────────────────────────────────────────────────────────────────────┐
│                  FUND COMPARISON FLOW DIAGRAM                        │
└─────────────────────────────────────────────────────────────────────┘

Step 1: DATA LOADING
════════════════════
┌──────────────────┐      ┌──────────────────┐
│   Fund NAV Data  │      │ Nifty 50 Data    │
│   (API Accord)   │      │   (N50.xlsx)     │
└────────┬─────────┘      └─────────┬────────┘
         │                          │
         │                          │
         ▼                          ▼
   ┌──────────────┐          ┌──────────────┐
   │ Fund History │          │ Benchmark    │
   │ Date | NAV   │          │ Date | Value │
   ├──────────────┤          ├──────────────┤
   │ 2023-01-01   │          │ 2023-01-01   │
   │   15.50      │          │  18,000      │
   │ 2023-01-02   │          │ 2023-01-02   │
   │   15.75      │          │  18,100      │
   │ 2023-01-03   │          │ 2023-01-03   │
   │   16.00      │          │  18,200      │
   │    ...       │          │    ...       │
   └──────────────┘          └──────────────┘


Step 2: FIND COMMON START DATE
═══════════════════════════════
┌────────────────────────────────────────────────────────────┐
│  Find first date where BOTH fund AND benchmark have data   │
└────────────────────────────────────────────────────────────┘
         │
         ▼
   ┌───────────────────┐
   │  BASE DATE FOUND  │
   │   2023-01-01     │
   │                   │
   │  Fund NAV: 15.50  │
   │  Nifty: 18,000    │
   └───────────────────┘


Step 3: NORMALIZE TO BASE 100
══════════════════════════════
Formula: Indexed Value = (Current Value / Base Value) × 100

For Fund:
─────────
Date         NAV    Calculation              Indexed
2023-01-01  15.50  (15.50 / 15.50) × 100  =  100.00  ← BASE
2023-01-02  15.75  (15.75 / 15.50) × 100  =  101.61
2023-01-03  16.00  (16.00 / 15.50) × 100  =  103.23
2023-01-04  16.50  (16.50 / 15.50) × 100  =  106.45

For Nifty 50:
─────────────
Date          Value   Calculation                 Indexed
2023-01-01   18,000  (18,000 / 18,000) × 100  =  100.00  ← BASE
2023-01-02   18,100  (18,100 / 18,000) × 100  =  100.56
2023-01-03   18,200  (18,200 / 18,000) × 100  =  101.11
2023-01-04   18,500  (18,500 / 18,000) × 100  =  102.78


Step 4: CHART RENDERING
════════════════════════
┌────────────────────────────────────────────────────────────────┐
│                    FUND VS BENCHMARK                           │
│                                                                │
│ Indexed Value (Base 100)                                      │
│  110 ┼                           ╱─────  Fund Portfolio       │
│      │                      ╱───╱                             │
│  105 ┼                 ╱───╱                                  │
│      │            ╱───╱                                       │
│  100 ┼═══════════○═══════════  Nifty 50 (Benchmark)          │
│      │           ↑             ╱                              │
│   95 ┼     Both start at 100  ╱                               │
│      │                       ╱                                │
│      └───────┬────────┬────────┬────────→ Time               │
│           Jan-01   Jan-15   Feb-01   Feb-15                  │
│                                                                │
│  Legend:                                                      │
│  ━━━━━  Fund Portfolio (Blue)                                │
│  ╍╍╍╍╍  Nifty 50 Benchmark (Gray Dashed)                    │
└────────────────────────────────────────────────────────────────┘


Step 5: INTERPRETATION
══════════════════════
┌────────────────────────────────────────────────────────────────┐
│  Reading the Chart:                                           │
│                                                                │
│  • Both lines START at 100 (same baseline)                    │
│  • If fund line is ABOVE benchmark → Outperforming            │
│  • If fund line is BELOW benchmark → Underperforming          │
│  • Vertical distance = Relative performance difference        │
│                                                                │
│  Example at Feb-15:                                           │
│  • Fund: 110 → +10% return since start                       │
│  • Nifty: 102 → +2% return since start                       │
│  • Fund outperformed by: 110 - 102 = 8 points (8%)           │
└────────────────────────────────────────────────────────────────┘
```

## Real Example

### Scenario: Comparing Axis Bluechip Fund with Nifty 50

```
Initial Values (Jan 1, 2023):
├─ Axis Bluechip NAV: ₹45.50
└─ Nifty 50 Value: 18,100

After 1 Year (Jan 1, 2024):
├─ Axis Bluechip NAV: ₹52.00
└─ Nifty 50 Value: 21,000

WITHOUT Normalization (Raw Values):
────────────────────────────────────
Chart would show:
• Axis Bluechip: 45.50 → 52.00 (hard to interpret scale)
• Nifty 50: 18,100 → 21,000 (completely different scale!)
❌ Cannot visually compare - different Y-axis scales

WITH Normalization (Base 100):
────────────────────────────────
Chart shows:
• Axis Bluechip: 100 → 114.29 (+14.29%)
• Nifty 50: 100 → 116.02 (+16.02%)
✅ Easy to see: Nifty 50 slightly outperformed by 1.73%

Calculation:
• Axis: (52.00 / 45.50) × 100 = 114.29
• Nifty: (21,000 / 18,100) × 100 = 116.02
```

## Code Flow

### Backend: `/api/mf/nifty50-history`
```python
# app.py
def get_nifty50_history():
    # 1. Read N50.xlsx
    excel_path = 'Alphanifty/N50.xlsx'
    df = pd.read_excel(excel_path)
    
    # 2. Extract DATE and NIFTY 50 columns
    nifty_data = df[['DATE', 'NIFTY 50']].copy()
    
    # 3. Format dates as YYYY-MM-DD strings
    formatted_date = date_obj.strftime('%Y-%m-%d')
    
    # 4. Return JSON
    return jsonify({'Table': history})
```

### Frontend: `FundComparisonPage.tsx`
```typescript
// 1. Load benchmark data
const loadBenchmarkData = async () => {
  const response = await fetch('/api/mf/nifty50-history');
  const niftyApiResponse = await response.json();
  setBenchmarkData(niftyApiResponse.Table);
};

// 2. Find common start date
let actualStartDate = sampledDates.find(date => 
  allFundsHaveData(date) && benchmarkHasData(date)
);

// 3. Get base values at start date
const baseDate = sampledDates[0];
const fundBaseNav = fundNavMap.get(baseDate);
const benchmarkBaseValue = benchmarkMap.get(baseDate);

// 4. Calculate indexed values
const fundIndexed = sampledDates.map(date => {
  const nav = fundNavMap.get(date);
  return (nav / fundBaseNav) * 100;
});

const benchmarkIndexed = sampledDates.map(date => {
  const value = benchmarkMap.get(date);
  return (value / benchmarkBaseValue) * 100;
});

// 5. Render chart with both datasets
Chart.render({
  datasets: [
    { label: 'Portfolio', data: fundIndexed, color: 'blue' },
    { label: 'Nifty 50', data: benchmarkIndexed, color: 'gray', dashed: true }
  ]
});
```

## Benefits of Normalization

```
┌─────────────────────────────────────────────────────────────────┐
│ ✅ ADVANTAGES OF BASE 100 NORMALIZATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Visual Comparison                                           │
│     • Same Y-axis scale for all assets                          │
│     • Easy to spot outperformance/underperformance              │
│     • Trade-weighted aggregation for multiple funds             │
│                                                                  │
│  2. Percentage Returns                                          │
│     • Indexed at 110 = +10% return                              │
│     • Indexed at 95 = -5% return                                │
│     • Direct conversion: (Indexed - 100) = Return %             │
│                                                                  │
│  3. Fair Comparison                                             │
│     • Removes absolute price differences                        │
│     • Focuses on relative performance                           │
│     • Universal starting point (100) for all assets             │
│                                                                  │
│  4. Multi-Fund Aggregation                                      │
│     • Average indexed values across selected funds              │
│     • Portfolio-level performance vs benchmark                  │
│     • Weighted or simple average (currently simple)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     SYSTEM ARCHITECTURE                             │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  User Browser   │
│   (React App)   │
└────────┬────────┘
         │
         │ GET /fund-comparison?funds=123,456,789
         ▼
┌─────────────────────────────────────────────┐
│        FundComparisonPage.tsx               │
│                                             │
│  • Parse fund codes from URL                │
│  • Render comparison UI                     │
│  • Handle period filters                    │
│  • Show chart + CSV export                  │
└─────┬─────────────────────────┬─────────────┘
      │                         │
      │ Fund NAV Data           │ Benchmark Data
      │                         │
      ▼                         ▼
┌─────────────────┐      ┌─────────────────────┐
│ /api/funds/     │      │ /api/mf/            │
│ {code}/         │      │ nifty50-history     │
│ nav-history     │      │                     │
└────────┬────────┘      └──────────┬──────────┘
         │                          │
         │ Flask Backend            │
         │                          │
         ▼                          ▼
┌─────────────────┐          ┌─────────────┐
│ Accord MF API   │          │  N50.xlsx   │
│ (External)      │          │  (Local)    │
└─────────────────┘          └─────────────┘

┌────────────────────────────────────────────┐
│  Data Transformation & Normalization       │
│  (Frontend - FundComparisonPage.tsx)       │
│                                            │
│  1. Align dates (find common start)        │
│  2. Get base values at start date          │
│  3. Calculate indexed values (÷ base × 100)│
│  4. Generate chart datasets                │
│  5. Render Chart.js visualization          │
└────────────────────────────────────────────┘
```

## Quick Reference

### File Locations
```
VSFintech-Platform/
├── Alphanifty/
│   ├── N50.xlsx                          ← Nifty 50 benchmark data
│   ├── backend/
│   │   └── app.py                        ← Line 1388: nifty50-history endpoint
│   └── src/
│       └── pages/
│           └── FundComparisonPage.tsx    ← Main comparison UI
```

### API Endpoints
```
GET /api/funds/{code}/nav-history        → Fund NAV time series
GET /api/mf/nifty50-history              → Nifty 50 from N50.xlsx
```

### Key Variables
```typescript
fundsData[]             // Array of selected funds with NAV history
benchmarkData[]         // Nifty 50 historical data
baseDate                // First date where all assets have data
fundIndexedValues[]     // Normalized fund values (base 100)
benchmarkIndexed[]      // Normalized Nifty 50 values (base 100)
```

---

## Testing Checklist

```
□ Backend starts without errors
□ N50.xlsx loads successfully (check terminal logs)
□ Fund Explorer page loads
□ Can select multiple funds
□ Compare button works
□ Chart renders with two lines (fund + benchmark)
□ Both lines start at 100
□ Benchmark appears as dashed gray line
□ Y-axis label shows "Indexed Value (Base 100)"
□ Tooltip shows correct percentages
□ Period filters work (1m, 3m, 6m, 1y, 3y, all)
□ CSV export downloads with indexed values
□ Zoom and pan work correctly
```

---

**✅ READY TO USE!**

Your fund comparison feature now uses N50.xlsx as the benchmark source and displays normalized graphs with both portfolio and Nifty 50 starting at 100.
