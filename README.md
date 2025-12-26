# 🚀 Alphanifty Investment Platform

A modern, full-stack investment platform for discovering, analyzing, and investing in curated mutual fund baskets.

## 📋 Project Overview

Alphanifty is a comprehensive investment platform built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Python Flask REST API
- **Design**: Modern, responsive UI with custom design system

## ✅ Phase 1 - COMPLETED

Phase 1 has been successfully completed with the following deliverables:

### ✨ Features Implemented

1. **Project Structure**
   - ✅ Vite + React + TypeScript setup
   - ✅ Tailwind CSS with custom design system
   - ✅ Flask backend with CORS enabled
   - ✅ Clean folder structure and architecture

2. **Design System**
   - ✅ Custom color palette (Primary, Success, Danger, Warning, Alert)
   - ✅ Typography system
   - ✅ Component styles (buttons, cards, badges, inputs)
   - ✅ Responsive breakpoints

3. **Core Components**
   - ✅ Header with navigation and cart badge
   - ✅ Footer with links and contact info
   - ✅ BasketCard with exact design specifications
   - ✅ Responsive mobile menu

4. **Pages**
   - ✅ Home Page with hero section and features
   - ✅ Explore Baskets Page with filtering and sorting
   - ✅ Basic routing setup with React Router

5. **Mock Data**
   - ✅ 6 sample investment baskets
   - ✅ 5 sample mutual funds
   - ✅ Performance data structure
   - ✅ TypeScript interfaces

6. **Backend API**
   - ✅ Flask server setup
   - ✅ Basket endpoints (GET /api/baskets, GET /api/baskets/:id)
   - ✅ Fund endpoints (GET /api/funds, GET /api/funds/:id)
   - ✅ Calculator endpoints (SIP, Lumpsum, Goal)
   - ✅ Performance data endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   ```

3. **Activate virtual environment**
   
   Windows:
   ```bash
   .venv\Scripts\activate
   ```
   
   Mac/Linux:
   ```bash
   source .venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run Flask server**
   ```bash
   python app.py
   ```

6. **Backend will be available at**
   ```
   http://localhost:5000
   ```

## 📁 Project Structure

```
Alphanifty/
├── backend/
│   ├── data/
│   │   └── mock_data.py          # Mock data for API
│   ├── app.py                     # Flask application
│   ├── requirements.txt           # Python dependencies
│   └── .env.example              # Environment variables template
│
├── src/
│   ├── components/
│   │   ├── Header.tsx            # Navigation header
│   │   ├── Footer.tsx            # Footer component
│   │   └── BasketCard.tsx        # Investment basket card
│   │
│   ├── pages/
│   │   ├── HomePage.tsx          # Landing page
│   │   └── ExploreBasketsPage.tsx # Basket listing
│   │
│   ├── data/
│   │   └── mockData.ts           # Frontend mock data
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   │
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎨 Design System

### Colors

```css
Primary Blue:   #2E89C4
Success Green:  #3BAF4A
Danger Red:     #DC2626
Warning Yellow: #E8C23A
Alert Orange:   #FF6B35
```

### Component Classes

```css
.btn               - Base button
.btn-primary       - Primary action button
.btn-success       - Success/add button
.btn-secondary     - Secondary button
.card              - Card container
.badge             - Badge/pill
.badge-low         - Low risk badge
.badge-medium      - Medium risk badge
.badge-high        - High risk badge
.input             - Form input
```

## 🔌 API Endpoints

### Baskets
- `GET /api/baskets` - Get all baskets
- `GET /api/baskets/:id` - Get basket details
- `GET /api/baskets/:id/performance` - Get performance data

### Funds
- `GET /api/funds` - Get all funds
- `GET /api/funds/:id` - Get fund details

### Calculators
- `POST /api/calculators/sip` - Calculate SIP returns
- `POST /api/calculators/lumpsum` - Calculate lumpsum returns
- `POST /api/calculators/goal` - Calculate goal-based investment

## 🧪 Testing the Application

1. **Start both frontend and backend servers**

2. **Test the following features:**
   - ✅ Navigate to homepage (http://localhost:3000)
   - ✅ Click "Explore Baskets" button
   - ✅ View all 6 sample baskets
   - ✅ Use search to filter baskets
   - ✅ Apply risk level filters
   - ✅ Sort baskets by different criteria
   - ✅ Click "View Basket" (placeholder page)
   - ✅ Click "Add" button (shows alert)
   - ✅ Check responsive design on mobile

3. **Test API endpoints:**
   ```bash
   # Get all baskets
   curl http://localhost:5000/api/baskets
   
   # Get basket details
   curl http://localhost:5000/api/baskets/basket-1
   
   # Calculate SIP
   curl -X POST http://localhost:5000/api/calculators/sip \
     -H "Content-Type: application/json" \
     -d '{"monthlyInvestment": 5000, "annualReturn": 12, "years": 10}'
   ```

## 📦 Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
python app.py    # Start Flask server
```

## 🎯 Next Steps (Phase 2)

The following features are planned for Phase 2:

1. **Basket Details Page**
   - Performance charts
   - Fund composition table
   - Investment philosophy section
   - Add to cart functionality

2. **Calculator Pages**
   - SIP Calculator with charts
   - Lumpsum Calculator
   - Goal-based Calculator

3. **Fund Explorer**
   - Advanced filtering
   - Fund comparison
   - Detailed fund pages

4. **Authentication**
   - User registration
   - Login/logout
   - Session management

5. **Shopping Cart**
   - Add/remove baskets
   - Edit investment amounts
   - Checkout flow

6. **User Dashboard**
   - Portfolio overview
   - Holdings tracking
   - Transaction history

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Chart.js** - Data visualization
- **Axios** - HTTP client

### Backend
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin support
- **Pandas** - Data processing
- **NumPy** - Calculations

## 📝 Notes

- All components are fully responsive (mobile, tablet, desktop)
- TypeScript strict mode is enabled
- Design follows the specified color system and spacing
- BasketCard component matches exact design specifications
- Mock data includes realistic investment metrics

## 🤝 Contributing

This is a development project. For Phase 2 implementation, refer to the comprehensive project prompt for detailed requirements.

## 📄 License

This project is part of the Alphanifty Investment Platform development.

---

**Status**: Phase 1 Complete ✅  
**Version**: 1.0.0  
**Last Updated**: December 24, 2025

## 🎉 Success!

Phase 1 is complete and the foundation is ready. You can now:
1. Browse the homepage
2. Explore investment baskets
3. Filter and sort baskets
4. See the responsive design in action

Ready to move to Phase 2? Let's build the Basket Details page next! 🚀
