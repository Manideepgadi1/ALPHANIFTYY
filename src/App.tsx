import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ExploreBasketsPage from './pages/ExploreBasketsPage';
import BasketDetailsPage from './pages/BasketDetailsPage';
import SIPCalculatorPage from './pages/SIPCalculatorPage';
import LumpsumCalculatorPage from './pages/LumpsumCalculatorPage';
import GoalCalculatorPage from './pages/GoalCalculatorPage';
import ExploreFundsPage from './pages/ExploreFundsPage';
import CartPage from './pages/CartPage';
import SignInPage from './pages/SignInPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CalculatorHubPage from './pages/CalculatorHubPage';
import NotFoundPage from './pages/NotFoundPage';
import MyBasketsPage from './pages/MyBasketsPage';
import PortfolioSummaryPage from './pages/PortfolioSummaryPage';
import TransactionPage from './pages/TransactionPage';
import HelpFAQPage from './pages/HelpFAQPage';

import { CartProvider } from './context/CartContext';

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore-baskets" element={<ExploreBasketsPage />} />
              <Route path="/basket-details/:id" element={<BasketDetailsPage />} />

              {/* Calculators */}
              <Route path="/calculators" element={<CalculatorHubPage />} />
              <Route path="/calculators/sip" element={<SIPCalculatorPage />} />
              <Route path="/calculators/lumpsum" element={<LumpsumCalculatorPage />} />
              <Route path="/calculators/goal" element={<GoalCalculatorPage />} />

              {/* Funds */}
              <Route path="/explore-funds" element={<ExploreFundsPage />} />

              {/* Cart & Auth */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* User Portfolio */}
              <Route path="/my-baskets" element={<MyBasketsPage />} />
              <Route path="/portfolio" element={<PortfolioSummaryPage />} />
              <Route path="/transactions" element={<TransactionPage />} />
              <Route path="/help" element={<HelpFAQPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;