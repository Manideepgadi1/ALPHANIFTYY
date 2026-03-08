# 🏗️ Mutual Fund Explorer - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MUTUAL FUND EXPLORER PAGE                    │
│                  (MutualFundExplorerPage.tsx)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  AMC Selector   │  │   Category   │  │  Search Input    │  │
│  │   Dropdown      │  │   Dropdown   │  │   with Icon      │  │
│  └────────┬────────┘  └──────┬───────┘  └────────┬─────────┘  │
│           │                  │                    │             │
│           └──────────────────┴────────────────────┘             │
│                              │                                  │
│                    ┌─────────▼──────────┐                      │
│                    │   Filter Logic     │                      │
│                    │  (useEffect hooks) │                      │
│                    └─────────┬──────────┘                      │
│                              │                                  │
│           ┌──────────────────┴─────────────────┐               │
│           │                                    │               │
│  ┌────────▼────────┐                  ┌───────▼────────┐      │
│  │  Fund Cards     │                  │   Pagination   │      │
│  │  (Grid Layout)  │                  │   Controls     │      │
│  └────────┬────────┘                  └────────────────┘      │
│           │                                                    │
│           │ onClick                                            │
│           ▼                                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              FUND DETAILS MODAL                        │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  • Returns (1M, 3M, 6M, 1Y, 3Y, 5Y)                    │  │
│  │  • Risk Metrics (Sharpe, Beta, Std Dev)                │  │
│  │  • Top 10 Holdings Table                               │  │
│  │  • Asset Allocation                                     │  │
│  │  • [Add to Cart] [View Full Analysis]                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                           │
├─────────────────────────────────────────────────────────────────┤
│  • amcList              → List of all AMCs                      │
│  • selectedAMC          → Currently selected AMC                │
│  • categories           → Available categories for AMC          │
│  • selectedCategory     → Currently selected category           │
│  • schemes              → All schemes for selection             │
│  • filteredSchemes      → Schemes after search filter           │
│  • searchTerm           → User's search input                   │
│  • currentPage          → Pagination state                      │
│  • loading              → Loading state for API calls           │
│  • selectedFund         → Fund details for modal                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Accord MF API                             │   │
│  │  https://mf.accordwebservices.com/MF                   │   │
│  │  Token: aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📡 Endpoints:                                                  │
│  ┌─────────────────────────────────────────────────┐           │
│  │ 1. GetFunds                                     │           │
│  │    → Returns: List of all AMCs                  │           │
│  │    → Used: On page mount                        │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │ 2. GetCategory                                  │           │
│  │    → Input: AMC_CODE                            │           │
│  │    → Returns: Categories for that AMC           │           │
│  │    → Used: When AMC changes                     │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │ 3. GetScheme                                    │           │
│  │    → Input: AMC_CODE + CATEGORY_CODE            │           │
│  │    → Returns: List of schemes                   │           │
│  │    → Used: When category changes                │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │ 4. GetFundFactsheet                             │           │
│  │    → Input: SCHEME_CODE                         │           │
│  │    → Returns: Complete fund details             │           │
│  │    → Used: When user clicks a fund              │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │ 5. fundanalyzer.in/allcodes (Alternative)       │           │
│  │    → Returns: All schemes across AMCs           │           │
│  │    → Used: When "All Categories" selected       │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CART INTEGRATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────┐            │
│  │          CartContext (Existing)                │            │
│  │  Location: src/context/CartContext             │            │
│  └────────────────────────────────────────────────┘            │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────────────┐            │
│  │  addItem({                                     │            │
│  │    id: fundCode,                               │            │
│  │    name: fundName,                             │            │
│  │    type: 'fund',                               │            │
│  │    amount: minInvestment,                      │            │
│  │    nav: currentNAV,                            │            │
│  │    quantity: 1                                 │            │
│  │  })                                            │            │
│  └────────────────────────────────────────────────┘            │
│                       │                                         │
│                       ▼                                         │
│  ┌────────────────────────────────────────────────┐            │
│  │  Header Cart Icon                              │            │
│  │  • Updates count badge                         │            │
│  │  • Links to /cart page                         │            │
│  └────────────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
USER ACTION                     STATE UPDATE                  UI RENDER
────────────                    ────────────                  ─────────

[Select AMC] 
      │
      ├──► fetchAMCList()
      │         │
      │         ├──► API: GetFunds
      │         │
      │         └──► setAmcList([...])
      │                    │
      │                    └──► <select> renders options
      │
      └──► fetchCategories(amcCode)
                │
                ├──► API: GetCategory
                │
                └──► setCategories([...])
                           │
                           └──► <select> renders categories

[Select Category]
      │
      └──► fetchSchemes(amc, category)
                │
                ├──► API: GetScheme
                │
                └──► setSchemes([...])
                           │
                           └──► <FundCard /> components render

[Type in Search]
      │
      └──► setSearchTerm(value)
                │
                ├──► useEffect filters schemes
                │
                └──► setFilteredSchemes([...])
                           │
                           └──► Cards re-render with filtered data

[Click Fund Card]
      │
      └──► fetchFundDetails(code, name)
                │
                ├──► API: GetFundFactsheet
                │
                └──► setSelectedFund({...})
                           │
                           └──► <FundDetailsModal /> opens

[Click Add to Cart]
      │
      └──► addItem({...})
                │
                ├──► CartContext updates
                │
                ├──► Header count increments
                │
                └──► Alert shows success

[Click Pagination]
      │
      └──► setCurrentPage(newPage)
                │
                └──► Slice schemes array
                           │
                           └──► Cards re-render new page
```

---

## 🧩 Component Hierarchy

```
MutualFundExplorerPage
├── Hero Section
│   └── Title + Subtitle
│
├── Filters Section (Sticky)
│   ├── AMC Selector
│   ├── Category Selector
│   ├── Search Input
│   └── Results Count
│
├── Main Content
│   ├── Loading State
│   │   └── Loader Component
│   │
│   ├── Empty State
│   │   └── Info Icon + Message
│   │
│   └── Fund Cards Grid
│       ├── FundCard (×20 per page)
│       │   ├── Fund Name
│       │   ├── AMC Name
│       │   ├── Category Badge
│       │   └── View Details Button
│       │
│       └── Pagination Controls
│           ├── Previous Button
│           ├── Page Counter
│           └── Next Button
│
└── Fund Details Modal (Conditional)
    ├── Modal Backdrop
    └── Modal Content
        ├── Header
        │   ├── Fund Name
        │   ├── Risk Badge
        │   ├── NAV, AUM
        │   └── Close Button
        │
        ├── Quick Stats Grid
        │   └── StatCard (×4)
        │       ├── Label
        │       ├── Value
        │       └── Trend Icon
        │
        ├── Returns Section
        │   └── ReturnCell (×6)
        │       ├── Period Label
        │       └── Return Value
        │
        ├── Risk Metrics Section
        │   └── MetricCell (×5)
        │       ├── Metric Name
        │       └── Metric Value
        │
        ├── Holdings Table
        │   └── Table Rows (×10)
        │       ├── Company Name
        │       ├── Holding %
        │       └── Market Value
        │
        └── Action Buttons
            ├── Add to Cart Button
            └── View Full Analysis Link
```

---

## 🔄 Lifecycle & Hooks

```javascript
// 1. Component Mount
useEffect(() => {
  fetchAMCList();  // Get all AMCs
}, []);

// 2. AMC Selection Change
useEffect(() => {
  if (selectedAMC) {
    fetchCategories(selectedAMC);  // Get categories for AMC
  }
}, [selectedAMC]);

// 3. Category Selection Change
useEffect(() => {
  if (selectedAMC && selectedCategory) {
    if (selectedCategory === 'all') {
      fetchAllSchemes();  // Alternative API
    } else {
      fetchSchemes(selectedAMC, selectedCategory);  // Get schemes
    }
  }
}, [selectedAMC, selectedCategory]);

// 4. Search Term Change
useEffect(() => {
  if (!searchTerm.trim()) {
    setFilteredSchemes(schemes);  // Show all
  } else {
    const filtered = schemes.filter(s => 
      s.S_NAME.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSchemes(filtered);
  }
  setCurrentPage(1);  // Reset to page 1
}, [searchTerm, schemes]);
```

---

## 🗄️ Type Definitions

```typescript
// Fund AMC Interface
interface FundAMC {
  AMC_CODE: string;    // "001"
  FUND: string;        // "HDFC Mutual Fund"
}

// Fund Category Interface
interface FundCategory {
  classcode: string;   // "EQ_LC"
  className: string;   // "Equity - Large Cap"
}

// Fund Scheme Interface
interface FundScheme {
  SCHEMECODE: string;  // "5184"
  S_NAME: string;      // "HDFC Bluechip Fund - Regular Plan - Growth"
  AMC_NAME?: string;   // "HDFC Mutual Fund" (added after fetch)
  CATEGORY?: string;   // "Equity - Large Cap" (added after fetch)
}

// Fund Factsheet Interface (Partial)
interface FundFactsheet {
  snapshot_summary: Array<{
    S_NAME: string;           // Fund name
    NAVRS: string;            // Net Asset Value
    NAVDATE: string;          // NAV date
    AUM: string;              // Assets Under Management
    EXPENSE_RATIO: string;    // Expense ratio
    INCRET: string;           // Inception return
    RISKTYPE: string;         // Risk level
    '1MONTHRET': string;      // 1 month return
    // ... more fields
  }>;
  ratios?: Array<{
    SHARPR: string;           // Sharpe ratio
    STANDARDR: string;        // Standard deviation
    BETAR: string;            // Beta
    SORTINO: string;          // Sortino ratio
    TREYNOR: string;          // Treynor ratio
  }>;
  holdings?: Array<{
    Compname: string;         // Company name
    HoldPer: string;          // Holding percentage
    MKTVAL: string;           // Market value
  }>;
}
```

---

## 🎨 Styling Architecture

```
Tailwind Config (tailwind.config.js)
├── Colors
│   ├── primary: #2E89C4  → Blue
│   ├── success: #3BAF4A  → Green
│   ├── danger: #DC2626   → Red
│   └── warning: #E8C23A  → Yellow
│
├── Components (index.css)
│   ├── .btn              → Base button
│   ├── .btn-primary      → Blue gradient
│   ├── .btn-outline      → Bordered
│   ├── .card             → White card with shadow
│   ├── .badge            → Small label
│   └── .input            → Form input
│
└── Utilities
    ├── .container-main   → Max-width container
    ├── .text-balance     → Text wrapping
    └── Custom animations
```

---

## 🚀 Performance Optimizations

```
1. Pagination
   ┌────────────────────────┐
   │  Only render 20 items  │
   │  per page (not all)    │
   └────────────────────────┘
           │
           ▼
   [Better Initial Load]

2. Conditional Fetching
   ┌────────────────────────┐
   │  Only fetch when       │
   │  dependencies change   │
   └────────────────────────┘
           │
           ▼
   [Fewer API Calls]

3. Filtered Rendering
   ┌────────────────────────┐
   │  Filter before render  │
   │  (not after)           │
   └────────────────────────┘
           │
           ▼
   [Faster Re-renders]

4. Loading States
   ┌────────────────────────┐
   │  Show spinner during   │
   │  API calls             │
   └────────────────────────┘
           │
           ▼
   [Better UX]
```

---

## 🔐 Error Handling Strategy

```
API Call
   │
   ├─► try
   │     │
   │     ├─► fetch(url)
   │     │     │
   │     │     ├─► Success (200)
   │     │     │     │
   │     │     │     └─► setState(data)
   │     │     │           │
   │     │     │           └─► Render UI
   │     │     │
   │     │     └─► Error (4xx/5xx)
   │     │           │
   │     │           └─► catch block
   │     │
   │     └─► response.json()
   │           │
   │           └─► Parse data
   │
   └─► catch
         │
         ├─► console.error(error)
         │
         ├─► Show user message
         │
         └─► setLoading(false)
```

---

## 🔗 Integration Points

```
┌─────────────────────────────────────────────┐
│         Mutual Fund Explorer Page           │
└─────────────────────────────────────────────┘
              │         │         │
              │         │         │
    ┌─────────┘         │         └─────────┐
    │                   │                   │
    ▼                   ▼                   ▼
┌────────┐      ┌──────────────┐     ┌──────────┐
│  Cart  │      │  Accord API  │     │  Router  │
│Context │      │   External   │     │  Routes  │
└────────┘      └──────────────┘     └──────────┘
    │                   │                   │
    ▼                   ▼                   ▼
┌────────┐      ┌──────────────┐     ┌──────────┐
│ Header │      │   Backend    │     │  Other   │
│  Cart  │      │   (Future)   │     │  Pages   │
│  Icon  │      │              │     │          │
└────────┘      └──────────────┘     └──────────┘
    │
    ▼
┌────────┐
│  Cart  │
│  Page  │
└────────┘
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Type safety with TypeScript
- ✅ Efficient state management
- ✅ Optimized performance
- ✅ Easy maintenance and extensibility
