# 🎨 Alphanifty Visual Design Reference

## Color Palette

### Primary Colors
```
🔵 Primary Blue (#2E89C4)   - Main actions, headers, links
🟢 Success Green (#3BAF4A)  - Positive returns, add buttons
🔴 Danger Red (#DC2626)     - High risk, negative returns
🟡 Warning Yellow (#E8C23A)  - Medium risk indicators
🟠 Alert Orange (#FF6B35)    - Alerts, warnings
```

### Neutral Colors
```
⬜ Gray 50 (#F5F7FA)    - Page background
⬜ Gray 100 (#E5E7EB)   - Card borders
⬜ Gray 500 (#6B7280)   - Secondary text
⬛ Gray 900 (#111827)   - Primary text
⬜ White (#FFFFFF)      - Cards, modals
```

## Component Showcase

### 1. BasketCard Component

```
┌─────────────────────────────────────────────┐
│  [🔷]   Wealth Builder Pro                  │
│  Icon   For Beginner to Intermediate        │
│         Perfect for young investors...      │
│                                             │
│  ┌──────────┬──────────┬──────────┐        │
│  │ Risk     │ Timeline │ Min SIP  │        │
│  │ Medium   │ 5-7 yrs  │ ₹5,000   │        │
│  ├──────────┼──────────┼──────────┤        │
│  │ Returns  │ Risk %   │ Sharpe   │        │
│  │ 3Y: 15.8%│ 12.5%    │ 1.52     │        │
│  │ 5Y: 14.3%│          │          │        │
│  └──────────┴──────────┴──────────┘        │
│                                             │
│  [🔵 View Basket]  [🟢 Add]                │
└─────────────────────────────────────────────┘
```

### 2. Header Component

```
┌─────────────────────────────────────────────────────────┐
│  📈 Alphanifty  |  Home  Explore  Calculators  Funds    │
│                                     🧮  🛒(2)  👤 Login │
└─────────────────────────────────────────────────────────┘
```

### 3. Risk Badges

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 🟢 Low   │  │ 🟡 Medium│  │ 🔴 High  │
└──────────┘  └──────────┘  └──────────┘
 Green bg      Yellow bg     Red bg
```

### 4. Button Styles

```
Primary:    [🔵 View Basket]
Success:    [🟢 Add to Cart]
Secondary:  [⬜ Cancel]
Outline:    [⭕ Learn More]
```

## Page Layouts

### Home Page Structure

```
┌─────────────────────────────────────┐
│           HEADER                    │
├─────────────────────────────────────┤
│                                     │
│        HERO SECTION                 │
│    "Invest Smarter with            │
│     Curated Baskets"               │
│   [Explore] [Calculators]          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     WHY CHOOSE ALPHANIFTY?         │
│   [Card] [Card] [Card] [Card]      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         STATISTICS                  │
│   10+    50+    15%+   10K+        │
│  Baskets Funds Returns Investors   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│      CALL TO ACTION                │
│   "Ready to Start Your             │
│    Investment Journey?"            │
│      [Get Started Free]            │
│                                     │
├─────────────────────────────────────┤
│           FOOTER                    │
└─────────────────────────────────────┘
```

### Explore Baskets Page Structure

```
┌─────────────────────────────────────┐
│           HEADER                    │
├─────────────────────────────────────┤
│                                     │
│   Explore Investment Baskets        │
│   ────────────────────────         │
│                                     │
│   [🔍 Search...] [Filters] [Sort]  │
│                                     │
│   Showing 6 baskets                │
│                                     │
│   ┌──────┐ ┌──────┐ ┌──────┐      │
│   │Basket│ │Basket│ │Basket│      │
│   │ Card │ │ Card │ │ Card │      │
│   └──────┘ └──────┘ └──────┘      │
│                                     │
│   ┌──────┐ ┌──────┐ ┌──────┐      │
│   │Basket│ │Basket│ │Basket│      │
│   │ Card │ │ Card │ │ Card │      │
│   └──────┘ └──────┘ └──────┘      │
│                                     │
├─────────────────────────────────────┤
│           FOOTER                    │
└─────────────────────────────────────┘
```

## Responsive Breakpoints

### Desktop (> 1024px)
```
┌────────┬────────┬────────┐
│ Card 1 │ Card 2 │ Card 3 │
├────────┼────────┼────────┤
│ Card 4 │ Card 5 │ Card 6 │
└────────┴────────┴────────┘
```

### Tablet (768px - 1024px)
```
┌────────┬────────┐
│ Card 1 │ Card 2 │
├────────┼────────┤
│ Card 3 │ Card 4 │
├────────┼────────┤
│ Card 5 │ Card 6 │
└────────┴────────┘
```

### Mobile (< 768px)
```
┌────────┐
│ Card 1 │
├────────┤
│ Card 2 │
├────────┤
│ Card 3 │
├────────┤
│ Card 4 │
├────────┤
│ Card 5 │
├────────┤
│ Card 6 │
└────────┘
```

## Typography Scale

```
Heading 1: 60px / 3.75rem  (Hero)
Heading 2: 48px / 3rem     (Section titles)
Heading 3: 32px / 2rem     (Card titles)
Heading 4: 24px / 1.5rem   (Subheadings)
Body:      16px / 1rem     (Regular text)
Small:     14px / 0.875rem (Labels)
Tiny:      12px / 0.75rem  (Captions)
```

## Spacing System

```
xs:  0.25rem  (4px)   - Small gaps
sm:  0.5rem   (8px)   - Tight spacing
md:  1rem     (16px)  - Component gaps
lg:  1.5rem   (24px)  - Card padding
xl:  2rem     (32px)  - Section spacing
2xl: 3rem     (48px)  - Large sections
```

## Icon System (Lucide React)

### Navigation
- 📈 TrendingUp - Logo
- 🏠 Home - Homepage
- 📊 Layers - Baskets
- 🧮 Calculator - Tools
- 💰 DollarSign - Money
- 👤 User - Profile
- 🛒 ShoppingCart - Cart

### Metrics
- ⚠️ AlertCircle - Risk
- ⏰ Clock - Timeline
- 📈 TrendingUp - Returns
- 📊 Activity - Risk %
- 📉 BarChart3 - Sharpe Ratio
- 👁️ Eye - View

### Actions
- ➕ Plus - Add
- ✏️ Edit - Modify
- 🗑️ Trash - Delete
- 🔍 Search - Search
- 🔽 Filter - Filter
- ⚙️ Settings - Config

## Shadow System

```
Card:       shadow-md (subtle elevation)
Hover:      shadow-lg (prominent on interaction)
Button:     shadow-sm (minimal depth)
Modal:      shadow-xl (strong separation)
```

## Border Radius

```
Small:   0.5rem   (8px)   - Badges
Medium:  0.75rem  (12px)  - Buttons
Large:   1rem     (16px)  - Cards
XLarge:  1.5rem   (24px)  - Icon boxes
Round:   9999px           - Circular
```

## Sample Basket Data

```json
{
  "name": "Wealth Builder Pro",
  "color": "#2E89C4",
  "riskLevel": "Medium",
  "minInvestment": 5000,
  "timeHorizon": "5-7 years",
  "cagr3Y": 15.8,
  "cagr5Y": 14.3,
  "riskPercentage": 12.5,
  "sharpeRatio": 1.52
}
```

## Animation Guidelines

- **Hover transitions**: 200ms ease
- **Button press**: Scale 0.98
- **Card hover**: Lift with shadow increase
- **Menu open**: Slide from top (300ms)
- **Modal**: Fade in (200ms)

## Accessibility

- ✅ Semantic HTML (header, nav, main, footer)
- ✅ ARIA labels on icons and buttons
- ✅ Keyboard navigation support
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Focus indicators visible
- ✅ Alt text for images

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

**Design System Version**: 1.0.0  
**Last Updated**: December 24, 2025  
**Framework**: Tailwind CSS 3.4  
**Icons**: Lucide React 0.294
