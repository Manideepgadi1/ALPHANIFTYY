import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ViewportToggle from './components/ViewportToggle';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ExploreBasketsPage from './pages/ExploreBasketsPage';
import BasketDetailsPage from './pages/BasketDetailsPage';
import SIPCalculatorPage from './pages/SIPCalculatorPage';
import LumpsumCalculatorPage from './pages/LumpsumCalculatorPage';
import GoalCalculatorPage from './pages/GoalCalculatorPage';
import ExploreFundsPage from './pages/ExploreFundsPage';
import MutualFundExplorerPage from './pages/MutualFundExplorerPage';
import FundComparisonPage from './pages/FundComparisonPage';
import FundComparisonWithNormalization from './pages/FundComparisonWithNormalization';
import FundDetailsPage from './pages/FundDetailsPageClean';
import CartPage from './pages/CartPage';
import WatchlistPage from './pages/WatchlistPage';
import SignInPage from './pages/SignInPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserProfilePage from './pages/UserProfilePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import CalculatorHubPage from './pages/CalculatorHubPage';
import FinancialCalculatorsPage from './pages/FinancialCalculatorsPage';
import NotFoundPage from './pages/NotFoundPage';
import MyBasketsPage from './pages/MyBasketsPage';
import PortfolioSummaryPage from './pages/PortfolioSummaryPage';
import TransactionPage from './pages/TransactionPage';
import HelpFAQPage from './pages/HelpFAQPage';
import InvestmentGuidePage from './pages/InvestmentGuidePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import BasketCompareToolPage from './pages/BasketCompareToolPage';
import RiskProfileQuizPage from './pages/RiskProfileQuizPage';
import PortfolioDashboardPage from './pages/PortfolioDashboardPage';
import EducationalHubPage from './pages/EducationalHubPage';
// import PMSScreenerPage from './pages/PMSScreenerPage';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router 
          basename={import.meta.env.BASE_URL}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
        <ScrollToTop />
        <ViewportToggle />
        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-1">
            <Routes>
              {/* Home - allows guest or authenticated */}
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              
              {/* Baskets - Browse allows guest, Details require auth */}
              <Route path="/explore-baskets" element={
                <ProtectedRoute>
                  <ExploreBasketsPage />
                </ProtectedRoute>
              } />
              <Route path="/basket-details/:id" element={
                <ProtectedRoute requireAuth={true}>
                  <BasketDetailsPage />
                </ProtectedRoute>
              } />

              {/* Calculators - allow guest */}
              <Route path="/calculators" element={
                <ProtectedRoute>
                  <CalculatorHubPage />
                </ProtectedRoute>
              } />
              <Route path="/calculators/sip" element={
                <ProtectedRoute>
                  <SIPCalculatorPage />
                </ProtectedRoute>
              } />
              <Route path="/calculators/lumpsum" element={
                <ProtectedRoute>
                  <LumpsumCalculatorPage />
                </ProtectedRoute>
              } />
              <Route path="/calculators/goal" element={
                <ProtectedRoute>
                  <GoalCalculatorPage />
                </ProtectedRoute>
              } />
              <Route path="/financial-calculators" element={
                <ProtectedRoute>
                  <FinancialCalculatorsPage />
                </ProtectedRoute>
              } />

              {/* Funds - REQUIRE FULL AUTH (not guest) */}
              <Route path="/explore-funds" element={
                <ProtectedRoute requireAuth={true}>
                  <ExploreFundsPage />
                </ProtectedRoute>
              } />
              <Route path="/fund-explorer" element={
                <ProtectedRoute requireAuth={true}>
                  <MutualFundExplorerPage />
                </ProtectedRoute>
              } />
              <Route path="/fund-comparison" element={
                <ProtectedRoute requireAuth={true}>
                  <FundComparisonPage />
                </ProtectedRoute>
              } />
              <Route path="/fund-comparison-normalized" element={
                <ProtectedRoute requireAuth={true}>
                  <FundComparisonWithNormalization />
                </ProtectedRoute>
              } />
              <Route path="/fund/:id" element={
                <ProtectedRoute requireAuth={true}>
                  <FundDetailsPage />
                </ProtectedRoute>
              } />

              {/* Cart & Watchlist - REQUIRE FULL AUTH */}
              <Route path="/cart" element={
                <ProtectedRoute requireAuth={true}>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/watchlist" element={
                <ProtectedRoute requireAuth={true}>
                  <WatchlistPage />
                </ProtectedRoute>
              } />
              
              {/* Auth Pages - Public */}
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              
              {/* User Pages - REQUIRE FULL AUTH */}
              <Route path="/profile" element={
                <ProtectedRoute requireAuth={true}>
                  <UserProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute requireAuth={true}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute requireAuth={true}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              {/* User Portfolio - REQUIRE FULL AUTH */}
              <Route path="/my-baskets" element={
                <ProtectedRoute requireAuth={true}>
                  <MyBasketsPage />
                </ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute requireAuth={true}>
                  <PortfolioSummaryPage />
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute requireAuth={true}>
                  <TransactionPage />
                </ProtectedRoute>
              } />
              
              {/* Resource Pages - allow guest */}
              <Route path="/help-faq" element={
                <ProtectedRoute>
                  <HelpFAQPage />
                </ProtectedRoute>
              } />
              <Route path="/investment-guide" element={
                <ProtectedRoute>
                  <InvestmentGuidePage />
                </ProtectedRoute>
              } />
              <Route path="/privacy-policy" element={
                <ProtectedRoute>
                  <PrivacyPolicyPage />
                </ProtectedRoute>
              } />
              <Route path="/terms" element={
                <ProtectedRoute>
                  <TermsPage />
                </ProtectedRoute>
              } />
              
              {/* New Features - allow guest */}
              <Route path="/compare-baskets" element={
                <ProtectedRoute>
                  <BasketCompareToolPage />
                </ProtectedRoute>
              } />
              <Route path="/risk-quiz" element={
                <ProtectedRoute>
                  <RiskProfileQuizPage />
                </ProtectedRoute>
              } />
              <Route path="/portfolio-dashboard" element={
                <ProtectedRoute requireAuth={true}>
                  <PortfolioDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/learn" element={
                <ProtectedRoute>
                  <EducationalHubPage />
                </ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </CartProvider>
    </AuthProvider>
  );
};

export default App;