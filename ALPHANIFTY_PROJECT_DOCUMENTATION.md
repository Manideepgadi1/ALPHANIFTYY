# 📚 Alphanifty Investment Platform - Complete Project Documentation

**Last Updated**: February 8, 2026  
**Project Version**: 1.0.0  
**Status**: Production Ready ✅

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [Frontend Documentation](#frontend-documentation)
6. [Backend Documentation](#backend-documentation)
7. [API Reference](#api-reference)
8. [Features & Functionality](#features--functionality)
9. [Data Models](#data-models)
10. [Deployment Guide](#deployment-guide)
11. [Development Workflow](#development-workflow)
12. [Troubleshooting](#troubleshooting)
13. [Contact & Support](#contact--support)

---

## 🎯 Project Overview

### What is Alphanifty?

**Alphanifty** is a comprehensive, full-stack investment platform designed to help users discover, analyze, and invest in curated mutual fund baskets. It combines modern web technologies with financial data integration to provide an intuitive investment experience.

### Key Objectives

- 📊 **Portfolio Management**: Allow users to create and manage investment portfolios
- 🔍 **Discovery**: Help users explore and compare mutual fund baskets
- 💰 **Calculation**: Provide powerful financial calculators (SIP, Lumpsum, Goal-based)
- 📈 **Analysis**: Display detailed performance metrics and analytics
- 🎓 **Education**: Offer investment guidance and educational resources
- 🛒 **Cart Management**: Enable users to build and manage investment carts

### Who is it For?

- Individual investors seeking curated investment options
- Users interested in systematic investment plans (SIP)
- Goal-based investors
- Portfolio analysts and researchers

### Live Deployment

- **Production URL**: [http://vsfintech.in/alphanifty/](http://vsfintech.in/alphanifty/)
- **API Endpoint**: [http://vsfintech.in/alphanifty/api/](http://vsfintech.in/alphanifty/api/)
- **GitHub Repository**: [https://github.com/Manideepgadi1/ALPHANIFTYY](https://github.com/Manideepgadi1/ALPHANIFTYY)

---

## 🏗️ Architecture & Technology Stack

### Frontend Architecture

```
Frontend Layer (React 18 + TypeScript)
    ↓
State Management (React Context API)
    ↓
Services Layer (API Calls, Data Processing)
    ↓
Components (Reusable UI Components)
    ↓
Design System (Tailwind CSS + Custom Styles)
```

### Backend Architecture

```
Flask REST API
    ↓
Business Logic Layer (Services, Utilities)
    ↓
Data Access Layer (Excel Loader, Database)
    ↓
External APIs (ACCORD, MF Service)
    ↓
Cache Layer (In-memory & Excel Performance Cache)
```

### Technology Stack

#### Frontend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.2.0 |
| Language | TypeScript | 5.2.2 |
| Build Tool | Vite | 5.0.8 |
| Styling | Tailwind CSS | 3.4.0 |
| UI Icons | Lucide React | 0.294.0 |
| Routing | React Router | 6.21.0 |
| Charts | Chart.js + Recharts | 4.4.1 |
| HTTP Client | Axios | 1.6.2 |

#### Backend Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Flask | 3.0.0 |
| Language | Python | 3.9+ |
| CORS | Flask-CORS | 4.0.0 |
| Data Processing | Pandas | 2.1.4 |
| Numerical | NumPy | 1.26.2 |
| Excel | openpyxl | 3.1.2 |
| Config | python-dotenv | 1.0.0 |

#### Deployment Stack
| Component | Technology |
|-----------|-----------|
| Web Server | Nginx |
| Process Manager | PM2 |
| Server OS | Linux (Ubuntu/Debian) |
| Port (Frontend) | 3000 (Dev), 80 (Prod) |
| Port (Backend) | 5000 |

---

## 📁 Project Structure

### Directory Layout

```
Alphanifty/
├── src/                                # Frontend React Application
│   ├── App.tsx                        # Main application component
│   ├── main.tsx                       # Entry point
│   ├── index.css                      # Global styles
│   ├── vite-env.d.ts                  # Vite environment types
│   ├── components/                    # Reusable components
│   │   ├── BasketCard.tsx            # Basket card component
│   │   ├── Header.tsx                # Navigation header
│   │   ├── Footer.tsx                # Footer
│   │   ├── InvestModal.tsx           # Investment modal
│   │   ├── ScrollToTop.tsx           # Scroll to top button
│   │   └── ViewportToggle.tsx        # Viewport debug tool
│   ├── pages/                         # Page components
│   │   ├── HomePage.tsx              # Home page
│   │   ├── ExploreBasketsPage.tsx    # Basket exploration
│   │   ├── BasketDetailsPage.tsx     # Basket details
│   │   ├── SIPCalculatorPage.tsx     # SIP calculator
│   │   ├── LumpsumCalculatorPage.tsx # Lumpsum calculator
│   │   ├── GoalCalculatorPage.tsx    # Goal calculator
│   │   ├── FundDetailsPageClean.tsx  # Fund details
│   │   ├── CartPage.tsx              # Shopping cart
│   │   ├── WatchlistPage.tsx         # Watchlist
│   │   ├── PortfolioDashboardPage.tsx # Portfolio overview
│   │   ├── SignInPage.tsx            # Authentication
│   │   ├── RegisterPage.tsx          # Registration
│   │   ├── HelpFAQPage.tsx           # FAQ
│   │   └── PrivacyPolicyPage.tsx     # Legal pages
│   ├── services/                      # API services
│   │   └── api.ts                    # API client
│   ├── context/                       # React Context
│   │   └── CartContext.tsx           # Cart state management
│   ├── types/                         # TypeScript interfaces
│   ├── utils/                         # Utility functions
│   └── data/                          # Data files
├── backend/                            # Flask Backend
│   ├── app.py                        # Main Flask application
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example env file
│   ├── data/                         # Data layer
│   │   ├── mock_data.py             # Sample data
│   │   ├── excel_loader.py          # Excel data loading
│   │   ├── performance_data.py      # Performance metrics
│   │   └── *.xlsx                   # Excel basket files
│   ├── scripts/                      # Utility scripts
│   ├── tech_docs/                   # Technical documentation
│   ├── mf_service_enhanced.py       # MF API service
│   ├── accord_api.py                # ACCORD API integration
│   └── [various test files]         # Testing scripts
├── public/                            # Static assets
├── dist/                              # Build output
├── index.html                         # Main HTML
├── package.json                       # Frontend dependencies
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS config
├── postcss.config.js                  # PostCSS config
├── .eslintrc.cjs                      # ESLint config
├── README.md                          # Project readme
├── DEPLOYMENT_SUMMARY.md              # Deployment guide
├── DEPLOYMENT_CHECKLIST.md            # Deployment checklist
├── DESIGN_GUIDE.md                    # Design system docs
├── ARCHITECTURE-DIAGRAM.md            # Architecture docs
├── QUICK-START-TESTING.md             # Testing guide
└── nginx-path-based.conf              # Nginx configuration
```

### Key Directories Explained

#### `/src` - Frontend Application
- **Components**: Reusable React components with TypeScript
- **Pages**: Full page components for each route
- **Services**: API client and data fetching logic
- **Context**: Global state management using React Context
- **Types**: TypeScript interfaces and type definitions
- **Utils**: Helper functions and utilities

#### `/backend` - Flask API Server
- **Main App**: `app.py` - Express all API endpoints
- **Data Layer**: Loads data from Excel files and provides mock data
- **Services**: Integration with external APIs (ACCORD, MF APIs)
- **Scripts**: Utility scripts for data processing and testing

#### `/public` - Static Assets
- Images (logos, banners)
- Favicons
- Static content

---

## 🚀 Installation & Setup

### Prerequisites

Before setting up the project, ensure you have:

```bash
# Node.js and npm (Frontend)
node --version  # Should be 18+
npm --version   # Should be 8+

# Python (Backend)
python --version  # Should be 3.9+

# Git
git --version
```

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/Manideepgadi1/ALPHANIFTYY.git
cd Alphanifty

# Or if working locally
cd d:\VSFintech-Platform\Alphanifty
```

### Step 2: Frontend Setup

```bash
# Install dependencies
npm install

# Verify installation
npm list react react-dom react-router-dom

# Copy environment file (if needed)
cp .env.example .env

# Start development server
npm run dev

# Output: http://localhost:5173/
```

### Step 3: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.\.venv\Scripts\Activate.ps1
# On Linux/Mac:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start Flask server
python app.py

# Output: http://localhost:5000
```

### Step 4: Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Step 5: Build for Production

```bash
# Frontend build
npm run build

# Output: dist/ folder
# dist/index.html - Main entry point
# dist/assets/ - Compiled JS and CSS

# Verify build
npm run preview
```

---

## 💻 Frontend Documentation

### React Application Structure

#### Main App Component (`App.tsx`)

```typescript
- Wraps entire app with CartProvider for state management
- Configures React Router with path-based routing
- Sets basename for /alphanifty/ path in production
- Includes common components (Header, Footer, ScrollToTop)
- Defines all routes and page components
```

#### Key Pages

| Page | Route | Purpose |
|------|-------|---------|
| HomePage | `/` | Landing page with featured baskets |
| ExploreBasketsPage | `/explore` | Browse and filter all baskets |
| BasketDetailsPage | `/basket-details/:id` | Detailed basket information |
| SIPCalculatorPage | `/calculator/sip` | SIP calculation tool |
| LumpsumCalculatorPage | `/calculator/lumpsum` | Lumpsum investment calculator |
| GoalCalculatorPage | `/calculator/goal` | Goal-based planning |
| CartPage | `/cart` | Shopping cart management |
| WatchlistPage | `/watchlist` | Saved favorites |
| PortfolioDashboardPage | `/portfolio` | Portfolio overview |

#### Component Hierarchy

```
App
├── Header
│   ├── Navigation Menu
│   └── Cart Badge
├── Routes
│   ├── HomePage
│   ├── ExploreBasketsPage
│   │   └── BasketCard (multiple)
│   ├── BasketDetailsPage
│   ├── SIPCalculatorPage
│   ├── LumpsumCalculatorPage
│   ├── GoalCalculatorPage
│   ├── CartPage
│   ├── PortfolioDashboardPage
│   └── [Other Pages]
└── Footer
```

### State Management

#### CartContext

Manages shopping cart state globally:

```typescript
Interface CartItem {
  id: string
  name: string
  amount: number
  investmentType: 'SIP' | 'Lumpsum'
  sipAmount?: number
  sipDuration?: number
  quantity: number
}

Functions:
- addToCart(item)
- removeFromCart(itemId)
- updateQuantity(itemId, quantity)
- clearCart()
- getCartTotal()
```

### Component Examples

#### BasketCard Component

Displays individual basket with:
- Basket image/icon
- Name and category
- Risk level indicator
- Returns metrics
- Quick action buttons
- Add to cart functionality

#### Header Component

Features:
- Navigation menu (Home, Explore, Calculators, etc.)
- Mobile responsive hamburger menu
- Cart badge with item count
- User account menu
- Search functionality (optional)

### Styling System

#### Design System (Tailwind CSS)

**Color Palette:**
```css
Primary Colors:
- primary-50, primary-100, ..., primary-900
- Base: #4F46E5 (Indigo)

Secondary Colors:
- success: #10B981 (Green)
- danger: #EF4444 (Red)
- warning: #F97316 (Orange)
- alert: #06B6D4 (Cyan)
```

**Typography:**
```css
Headings: h1-h6 with responsive sizes
Body: text-base, text-sm, text-xs
Fonts: Inter, system fonts
```

**Spacing & Breakpoints:**
```
Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
Uses Tailwind's responsive prefixes: sm:, md:, lg:, etc.
```

### Services & API Integration

#### API Client (`services/api.ts`)

```typescript
basketApi.getAll()              // Get all baskets
basketApi.getById(id)           // Get specific basket
basketApi.getPerformance(id)    // Get basket performance
basketApi.search(query)         // Search baskets

fundApi.getAll()                // Get all funds
fundApi.getById(id)             // Get fund details

calculatorApi.calculateSIP()    // SIP calculation
calculatorApi.calculateLumpsum()// Lumpsum calculation
calculatorApi.calculateGoal()   // Goal calculation
```

### Building & Deployment

#### Development Build
```bash
npm run dev
# Vite dev server with HMR
# Source maps enabled
# Fast refresh on file changes
```

#### Production Build
```bash
npm run build
# Optimized bundle
# Tree-shaked code
# Minified assets
# Source maps (optional)
```

---

## 🔧 Backend Documentation

### Flask Application Overview

The backend is built on Python Flask and provides REST API endpoints for the frontend to consume.

### Configuration

#### Environment Variables (`.env`)

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
DEBUG=True

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://vsfintech.in

# External APIs
ACCORD_API_KEY=your-api-key
ACCORD_API_BASE_URL=https://api.accordsoftware.com

# Database (if applicable)
DATABASE_URL=sqlite:///alphanifty.db

# File Paths
EXCEL_DATA_PATH=./data/
```

### Core Features

#### 1. Basket Management
- Load baskets from Excel files
- Filter and search capabilities
- Performance data aggregation
- Basket comparison

#### 2. Fund Management
- Fund listing and search
- Detailed fund information
- NAV (Net Asset Value) tracking
- Fund comparison

#### 3. Financial Calculators
- **SIP Calculator**: Calculate returns from systematic investments
- **Lumpsum Calculator**: One-time investment returns
- **Goal Calculator**: Reach savings goals through investments

#### 4. Performance Analytics
- Calculate returns for various periods
- CAGR (Compound Annual Growth Rate)
- Performance comparison
- Risk metrics

#### 5. User Management (Backend Ready)
- User registration and authentication
- Profile management
- Preferences and settings
- Transaction history

#### 6. Cart & Portfolio
- Add/remove items from cart
- Save portfolios
- Portfolio tracking
- Investment recommendations

### Main Application File (`app.py`)

**Configuration:**
```python
Flask app = Flask(__name__)
CORS enabled for all routes
Secret key configured from environment
Debug mode configurable
```

**Key Routes:**
```
GET  /api/health                 - Health check
GET  /api/baskets                - List all baskets
GET  /api/baskets/<id>           - Get basket details
GET  /api/baskets/<id>/performance - Get performance data
GET  /api/funds                  - List all funds
POST /api/cart/add               - Add to cart
GET  /api/Calculator/sip         - SIP calculation
```

### Data Layer

#### Mock Data (`data/mock_data.py`)

Provides sample data structure:
- 6 sample baskets
- 5 sample funds
- Performance metrics
- User portfolios

#### Excel Loader (`data/excel_loader.py`)

```python
class ExcelLoader:
    load_baskets_from_excel()      # Load from Excel
    get_basket_performance()       # Get performance data
    get_fund_info()               # Get fund details
    validate_data()               # Data validation
```

#### Performance Data

Performance metrics include:
- 1-month returns
- 3-month returns
- 6-month returns
- 1-year returns
- 3-year returns
- 5-year returns
- Since inception

### External API Integration

#### ACCORD MF API

```python
accord_api.py - Integration with ACCORD API
- Get latest NAV data
- Fund information
- Historical data
- Error handling and caching
```

#### MF Service Enhanced

```python
mf_service_enhanced.py
- Load fund data from CSV
- Calculate performance metrics
- Fuzzy matching for fund names
- Data normalization
```

### Error Handling

Standard response format:
```json
{
  "status": "error|success",
  "message": "Description",
  "data": {},
  "timestamp": "2026-02-08T10:30:00Z"
}
```

### Caching Strategy

1. **In-Memory Cache**: MFServiceEnhanced instance cached globally
2. **Excel Performance Cache**: Basket performance data cached
3. **TTL Cache**: Automatic refresh for external API data

---

## 📡 API Reference

### Base URL
```
Development: http://localhost:5000/api
Production: http://vsfintech.in/alphanifty/api
```

### Response Format

All APIs return JSON with standard format:

```json
{
  "status": "success|error",
  "data": {},
  "message": "Description",
  "code": 200|400|404|500
}
```

### Basket Endpoints

#### Get All Baskets
```
GET /api/baskets
Query Parameters:
  - category: Filter by category
  - riskLevel: Filter by risk (low, medium, high)
  - sort: Sort by (name, returns, date)
  - order: asc|desc

Response:
{
  "status": "success",
  "data": [
    {
      "id": "b1",
      "name": "Aggressive Premium",
      "category": "Aggressive",
      "riskLevel": "high",
      "minInvestment": 1000,
      "description": "...",
      "funds": [...],
      "performance": {...}
    }
  ]
}
```

#### Get Basket Details
```
GET /api/baskets/:basketId

Response:
{
  "status": "success",
  "data": {
    "id": "b1",
    "name": "...",
    "description": "...",
    "funds": [
      {
        "id": "f1",
        "name": "Fund Name",
        "percentage": 25
      }
    ],
    "performance": {...},
    "riskProfile": {...}
  }
}
```

#### Get Basket Performance
```
GET /api/baskets/:basketId/performance
Query Parameters:
  - period: 1m|3m|6m|1y|3y|5y|inception

Response:
{
  "status": "success",
  "data": {
    "returns": 15.5,
    "cagr": 12.3,
    "volatility": 8.2,
    "sharpeRatio": 1.5,
    "maxDrawdown": -10.2
  }
}
```

### Fund Endpoints

#### Get All Funds
```
GET /api/funds
Query Parameters:
  - category: Filter by category
  - riskLevel: Filter by risk
  - search: Search by name or ISIN

Response:
{
  "status": "success",
  "data": [
    {
      "id": "f1",
      "name": "Fund Name",
      "category": "Equity",
      "nav": 125.50,
      "returns1Y": 12.5,
      "rating": 5
    }
  ]
}
```

#### Get Fund Details
```
GET /api/funds/:fundId

Response:
{
  "status": "success",
  "data": {
    "id": "f1",
    "name": "...",
    "isin": "...",
    "category": "...",
    "nav": 125.50,
    "expense_ratio": 0.5,
    "performance": {...},
    "holdings": [...]
  }
}
```

### Calculator Endpoints

#### SIP Calculator
```
POST /api/calculator/sip
Body:
{
  "monthlyAmount": 10000,
  "durationMonths": 60,
  "expectedReturn": 12,
  "stepUpPercentage": 5
}

Response:
{
  "status": "success",
  "data": {
    "investedAmount": 600000,
    "estimatedReturns": 187500,
    "totalAmount": 787500,
    "breakdown": [
      {
        "month": 1,
        "investment": 10000,
        "value": 10000
      }
    ]
  }
}
```

#### Lumpsum Calculator
```
POST /api/calculator/lumpsum
Body:
{
  "amount": 500000,
  "durationYears": 5,
  "expectedReturn": 12
}

Response:
{
  "status": "success",
  "data": {
    "investedAmount": 500000,
    "estimatedReturns": 97500,
    "totalAmount": 597500,
    "yoy": [...]
  }
}
```

#### Goal Calculator
```
POST /api/calculator/goal
Body:
{
  "goalAmount": 1000000,
  "yearsToGoal": 10,
  "lumpsum": 100000,
  "monthlyAmount": 5000,
  "expectedReturn": 12
}

Response:
{
  "status": "success",
  "data": {
    "goalAmount": 1000000,
    "investedAmount": 700000,
    "estimatedAmount": 950000,
    "shortfall": 50000,
    "achievable": false
  }
}
```

### Cart Endpoints

#### Get Cart
```
GET /api/cart

Response:
{
  "status": "success",
  "data": {
    "items": [...],
    "total": 100000,
    "count": 3
  }
}
```

#### Add to Cart
```
POST /api/cart/add
Body:
{
  "basketId": "b1",
  "amount": 50000,
  "investmentType": "Lumpsum|SIP",
  "sipAmount": 10000,
  "sipDuration": 60
}

Response:
{
  "status": "success",
  "message": "Added to cart"
}
```

#### Remove from Cart
```
DELETE /api/cart/remove/:itemId

Response:
{
  "status": "success"
}
```

---

## ✨ Features & Functionality

### Core Features

#### 1. Home Page
- **Hero Section**: Welcome message with call-to-action
- **Featured Baskets**: Display 3 top baskets
- **Feature Highlights**: 6 key features of platform
- **Testimonials**: User success stories
- **FAQ Section**: Common questions
- **Call-to-Action**: Encourage exploration

#### 2. Basket Exploration
- **Browse All Baskets**: Grid/list view
- **Filtering**: By category, risk level, returns
- **Sorting**: By name, returns, date, popularity
- **Search**: Quick search functionality
- **Basket Cards**: Show key metrics at a glance
- **Quick Add**: Add to cart from list view

#### 3. Basket Details
- **Comprehensive Information**: Full basket overview
- **Holdings**: Fund composition with percentages
- **Performance Charts**: Visual representation of returns
- **Performance Metrics**: CAGR, volatility, Sharpe ratio
- **Risk Profile**: Visual risk indicator
- **Investment Options**: Lumpsum or SIP
- **Similar Baskets**: Recommendations

#### 4. Financial Calculators
- **SIP Calculator**:
  - Monthly investment amount
  - Duration in years/months
  - Expected return rate
  - Step-up percentage
  - View year-by-year breakdown
  
- **Lumpsum Calculator**:
  - One-time investment amount
  - Investment duration
  - Expected return rate
  - View growth projection
  
- **Goal Calculator**:
  - Define financial goal
  - Target amount and timeframe
  - Lumpsum + monthly contribution
  - See if goal is achievable
  - Recommendation for adjustments

#### 5. Fund Exploration
- **Browse Funds**: Search and filter
- **Fund Details**: Complete information
- **Performance History**: Historical data
- **Compare Funds**: Side-by-side comparison
- **NAV Tracking**: Latest NAV values
- **Fund Categories**: Equity, Debt, Hybrid, Liquid

#### 6. Cart Management
- **Shopping Cart**: Keep track of selections
- **Cart Items**: View selected baskets and amounts
- **Update Quantities**: Modify amounts
- **Remove Items**: Delete from cart
- **Cart Summary**: Total investment
- **Checkout**: (Ready for later implementation)

#### 7. Watchlist
- **Save Favorites**: Bookmark baskets and funds
- **Quick Access**: View saved items
- **Comparison**: Compare watchlist items
- **Notifications**: (Ready for price changes)

#### 8. Portfolio Dashboard
- **Portfolio Overview**: Current holdings
- **Performance Summary**: Returns and metrics
- **Asset Allocation**: Visual breakdown
- **Goals Progress**: Track goal achievements
- **Recent Activity**: Transaction history
- **Recommendations**: Personalized suggestions

#### 9. Educational Resources
- **Investment Guide**: Learning materials
- **FAQs**: Common questions answered
- **Glossary**: Financial terms explained
- **Blog Articles**: Market insights
- **Video Tutorials**: (Ready for integration)

#### 10. User Account (Ready for Implementation)
- **Sign In**: User authentication
- **Registration**: Create account
- **Profile Management**: Edit user information
- **Preferences**: Customize experience
- **Account Settings**: Security and privacy

---

## 📊 Data Models

### Basket Model

```typescript
Interface Basket {
  id: string
  name: string
  shortName?: string
  description: string
  category: string  // e.g., "Aggressive", "Balanced", "Conservative"
  riskLevel: "low" | "medium" | "high"
  minInvestment: number
  estimatedFees: number
  funds: Fund[]  // Array of funds in basket
  performance: Performance
  riskProfile: RiskProfile
  createdDate: string
  lastUpdated: string
  createdBy?: string
  isActive: boolean
  badges?: string[]  // e.g., ["Popular", "Top Performer"]
}
```

### Fund Model

```typescript
Interface Fund {
  id: string
  name: string
  isin: string  // International Securities Identification Number
  category: string  // Equity, Debt, Hybrid, Liquid
  subcategory?: string
  amc: string  // Asset Management Company
  nav: number  // Net Asset Value
  expenseRatio: number  // Management fees
  performance: {
    oneMonth?: number
    threeMonth?: number
    sixMonth?: number
    oneYear?: number
    threeYear?: number
    fiveYear?: number
    sinceInception?: number
  }
  riskMetrics: {
    beta?: number
    volatility?: number
    sharpeRatio?: number
  }
  holdings?: {
    name: string
    percentage: number
  }[]
  rating?: number  // 1-5
  aum?: number  // Assets Under Management
}
```

### Cart Item Model

```typescript
Interface CartItem {
  id: string
  basketId: string
  basketName: string
  amount: number
  investmentType: "SIP" | "Lumpsum"
  sipAmount?: number
  sipDuration?: number  // in months
  quantity: number
  addedDate: string
}
```

### Performance Model

```typescript
Interface Performance {
  oneMonth?: number
  threeMonth?: number
  sixMonth?: number
  oneYear?: number
  threeYear?: number
  fiveYear?: number
  sinceInception?: number
  cagr?: number
  volatility?: number
  sharpeRatio?: number
  sortinoRatio?: number
  maxDrawdown?: number
  beta?: number
}
```

### User Model (Backend Ready)

```typescript
Interface User {
  id: string
  email: string
  name: string
  password?: string  // Hashed
  phone?: string
  status: "active" | "inactive" | "suspended"
  createdDate: string
  lastLogin?: string
  preferences: UserPreferences
  kyc?: KYC
  portfolio?: Portfolio[]
}
```

---

## 🚀 Deployment Guide

### Deployment Overview

The Alphanifty platform is designed for seamless deployment on a VPS alongside other projects.

### Deployment Architecture

```
Internet
    ↓
Nginx (Web Server, Load Balancer)
    ├── /alphanifty/          → React Frontend (Port 3000)
    ├── /alphanifty/api/      → Flask Backend (Port 5000)
    └── [Other Projects]
    ↓
Process Manager (PM2)
    ├── React Dev Server
    └── Flask App
    ↓
System Files
    ├── Excel Data
    ├── Cache Files
    └── Logs
```

### Pre-Deployment Checklist

- ✅ Code pushed to GitHub repository
- ✅ Environment variables configured
- ✅ Nginx configuration prepared
- ✅ Frontend built for production
- ✅ Backend dependencies installed
- ✅ Database (if applicable) initialized
- ✅ SSL certificate obtained (if HTTPS)
- ✅ DNS records configured

### Step-by-Step Deployment

#### Step 1: SSH into VPS

```bash
ssh username@your-vps-ip
# Enter password when prompted
```

#### Step 2: Clone Repository

```bash
cd /var/www
git clone https://github.com/Manideepgadi1/ALPHANIFTYY.git alphanifty
cd alphanifty
```

#### Step 3: Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
```

#### Step 4: Configure Environment

```bash
# Frontend (if needed)
cp .env.example .env

# Backend
cd backend
cp .env.example .env
# Edit .env with production values
nano .env
```

#### Step 5: Build Frontend

```bash
npm run build
# Output: dist/ folder
```

#### Step 6: Install PM2

```bash
npm install -g pm2
```

#### Step 7: Configure PM2 Ecosystem

Create `pm2-ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'alphanifty-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/alphanifty',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'alphanifty-backend',
      script: 'python',
      args: 'app.py',
      cwd: '/var/www/alphanifty/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        FLASK_ENV: 'production'
      }
    }
  ]
};
```

Start with PM2:
```bash
pm2 start pm2-ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 8: Configure Nginx

Edit `/etc/nginx/sites-available/default`:

```nginx
upstream alphanifty_frontend {
  server localhost:3000;
}

upstream alphanifty_backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name vsfintech.in;

  location /alphanifty/ {
    proxy_pass http://alphanifty_frontend/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /alphanifty/api/ {
    proxy_pass http://alphanifty_backend/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 9: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Test endpoints
curl http://localhost:3000/alphanifty/
curl http://localhost:5000/api/health
```

#### Step 10: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d vsfintech.in

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## 👨‍💻 Development Workflow

### Local Development Setup

#### Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
source .venv/bin/activate  # or .\.venv\Scripts\activate on Windows
python app.py
# Starts Flask on http://localhost:5000
```

**Access Application:**
- Frontend: http://localhost:3000 or http://localhost:5173
- API: http://localhost:5000/api

### Version Control Workflow

#### Branch Strategy

```
main (Production)
  ↓
develop (Development)
  ↓
feature/* (Feature branches)
```

#### Creating a Feature

```bash
# Create feature branch
git checkout -b feature/basket-comparison

# Make changes and commit
git add .
git commit -m "Add basket comparison feature"

# Push to GitHub
git push origin feature/basket-comparison

# Create Pull Request on GitHub
```

#### Merging to Production

```bash
# Switch to main
git checkout main

# Merge develop
git merge develop

# Tag release
git tag -a v1.1.0 -m "Release 1.1.0"

# Push to GitHub
git push origin main --tags
```

### Testing Workflow

#### Frontend Testing

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type checking
npx tsc --noEmit
```

#### Backend Testing

```bash
cd backend

# Run tests
python -m pytest

# Check code quality
python -m pylint app.py

# Run specific test
python -m pytest test_api.py -v
```

### Building & Deployment

#### Development Build
```bash
npm run dev
```

#### Production Build
```bash
npm run build
npm run preview
```

#### Deploy to Production
```bash
# Push to GitHub
git push origin main

# On VPS
cd /var/www/alphanifty
git pull origin main

# Rebuild
npm run build

# Restart services
pm2 restart alphanifty-frontend
pm2 restart alphanifty-backend
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Frontend Issues

**Problem**: Port 3000/5173 already in use
```bash
# On Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Linux
lsof -i :3000
kill -9 <PID>
```

**Problem**: Node modules not found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Vite build errors
```bash
# Clear Vite cache
rm -rf .vite
npm run build
```

**Problem**: CORS errors
```
Check backend is running on http://localhost:5000
Check CORS_ORIGINS in backend .env
Verify request URLs match exactly
```

#### Backend Issues

**Problem**: Flask not starting
```bash
# Check Python version
python --version  # Should be 3.9+

# Check dependencies
pip install -r requirements.txt

# Run in verbose mode
python -u app.py
```

**Problem**: Excel file not found
```bash
# Check Excel files exist in backend/data/
ls backend/data/*.xlsx

# Verify path in excel_loader.py
# Update if necessary
```

**Problem**: Module import errors
```bash
# Activate virtual environment
source .venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

#### Deployment Issues

**Problem**: Nginx 502 Bad Gateway
```bash
# Check if backend is running
ps aux | grep flask

# Check Nginx connection
sudo tail -f /var/log/nginx/error.log

# Verify Flask is listening
netstat -tulpn | grep 5000
```

**Problem**: PM2 not auto-starting
```bash
# Check PM2 startup
pm2 startup
pm2 save

# Verify configuration
pm2 show alphanifty-frontend
pm2 show alphanifty-backend
```

**Problem**: Excel data not loading
```bash
# Check file permissions
chmod 644 backend/data/*.xlsx

# Check Excel file format
python -c "import openpyxl; wb = openpyxl.load_workbook('file.xlsx')"
```

### Debug Mode

#### Enable Debug Logging

**Frontend:**
```typescript
// In services/api.ts
const DEBUG = true;
if (DEBUG) console.log('API Call:', url, params);
```

**Backend:**
```python
# In app.py
app.config['DEBUG'] = True
logging.basicConfig(level=logging.DEBUG)
```

### Performance Optimization

#### Frontend Optimization
- Use React DevTools Profiler
- Enable code splitting for routes
- Cache API responses
- Optimize images and assets

#### Backend Optimization
- Cache Excel data in memory
- Use connection pooling for databases
- Implement pagination for large datasets
- Add query result caching

---

## 📞 Contact & Support

### Project Information

- **Project Name**: Alphanifty Investment Platform
- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: February 8, 2026

### Repository

- **GitHub**: [https://github.com/Manideepgadi1/ALPHANIFTYY](https://github.com/Manideepgadi1/ALPHANIFTYY)
- **Live Site**: [http://vsfintech.in/alphanifty/](http://vsfintech.in/alphanifty/)

### Support Resources

- **README.md**: Quick start guide
- **DEPLOYMENT_GUIDE.md**: Detailed deployment steps
- **DESIGN_GUIDE.md**: Design system documentation
- **QUICK-START-TESTING.md**: Testing procedures
- **API-DOCUMENTATION.md**: Detailed API reference

### Getting Help

1. **Check Documentation**: Review relevant markdown files
2. **Search Issues**: Look in GitHub issues for similar problems
3. **Create Issue**: File a new issue with details
4. **Check Logs**: Review server logs for errors
5. **Debug Mode**: Enable debug logging for troubleshooting

### Key Contact Points

- **Frontend Issues**: Check `src/` directory and console logs
- **Backend Issues**: Check `backend/app.py` and Flask logs
- **Deployment Issues**: See DEPLOYMENT_GUIDE.md
- **Data Issues**: Check `backend/data/` files and excel_loader.py

### Contributing

If you want to contribute:

1. Fork the repository
2. Create feature branch (`feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request on GitHub

---

## 📋 Additional Resources

### Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project overview and quick start |
| DEPLOYMENT_SUMMARY.md | Quick deployment guide |
| DEPLOYMENT_GUIDE.md | Comprehensive deployment steps |
| DEPLOYMENT_CHECKLIST.md | Pre-deployment checklist |
| DESIGN_GUIDE.md | Design system and components |
| ARCHITECTURE-DIAGRAM.md | Architecture visualization |
| QUICK-START-TESTING.md | Testing guide |

### External Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-08 | Initial production release |
| | | - Full basket exploration |
| | | - Financial calculators |
| | | - Cart management |
| | | - Performance analytics |
| | | - User authentication ready |

---

**Document Generated**: February 8, 2026  
**Last Updated**: February 8, 2026  
**Status**: Complete & Production Ready ✅

---

*This documentation serves as the comprehensive reference guide for the Alphanifty Investment Platform project. Keep this document in a safe location for future reference and sharing.*
