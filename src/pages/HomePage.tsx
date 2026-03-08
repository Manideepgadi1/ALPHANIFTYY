import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Target, Shield, Sparkles, Loader, BarChart3, PieChart, Calculator, Briefcase, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { getRandomQuote } from '../utils/investmentQuotes';
import { basketApi, Basket } from '../services/api';
import BasketCard from '../components/BasketCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleViewDetails = (basketId: string) => {
    navigate(`/basket-details/${basketId}`);
  };

  useEffect(() => {
    const fetchBaskets = async () => {
      try {
        setLoading(true);
        const response = await basketApi.getAll();
        if (response.status === 'success' && response.data) {
          // Show specific featured baskets: Premium Aggressive, Conservative Balanced, and Doctor's Premium
          const featuredIds = ['b9', 'b10', 'b16'];
          const featuredBaskets = featuredIds
            .map(id => response.data?.find(b => b.id === id))
            .filter((basket): basket is Basket => basket !== undefined);
          setBaskets(featuredBaskets);
        } else {
          setError(response.message || 'Failed to load baskets');
        }
      } catch (err) {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchBaskets();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Enhanced Design */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-success-50 py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-success rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-main relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full px-4 sm:px-5 py-2 mb-4 sm:mb-6 shadow-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary">India's Smart Investment Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Build Wealth with
              <br />
              <span className="text-primary bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Expert-Curated Portfolios
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Simplify your investment journey with professionally designed mutual fund baskets. 
              Start with as low as ₹500/month and watch your wealth grow.
            </p>

            {/* Featured Quote */}
            <div className="mb-8 sm:mb-10 max-w-3xl mx-auto px-4 sm:px-0">
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-primary-100">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-success p-3 rounded-full shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-center pt-4">
                  <p className="text-lg sm:text-xl md:text-2xl font-medium text-gray-800 italic leading-relaxed mb-3 px-2">
                    "The best time to plant a tree was 20 years ago. The second best time is now."
                  </p>
                  <p className="text-xs sm:text-sm text-primary font-semibold tracking-wide">— START YOUR INVESTMENT JOURNEY TODAY</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4 sm:px-0">
              <Link to="/explore-baskets" className="btn btn-primary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Explore Baskets
              </Link>
              <Link to="/calculators" className="btn btn-outline text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 w-full sm:w-auto justify-center">
                <Calculator className="w-5 h-5" />
                Try Calculators
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-600 px-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                <span>SEBI Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                <span>100% Paperless</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                <span>Expert Curated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Design */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Invest with Alphanifty?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience a smarter way to invest with features designed for your financial success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="card p-6 sm:p-8 text-center group hover:border-2 hover:border-primary transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">Expert Curated Baskets</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Professionally designed portfolios tailored to match your risk profile and investment objectives
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 sm:p-8 text-center group hover:border-2 hover:border-success transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-success-100 to-success-50 rounded-3xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">Real-Time Tracking</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Monitor your portfolio performance with live updates, detailed analytics, and benchmark comparisons
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 sm:p-8 text-center group hover:border-2 hover:border-warning transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-warning-100 to-warning-50 rounded-3xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-warning" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">Smart Risk Management</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Intelligent diversification and automatic rebalancing to optimize your risk-adjusted returns
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-6 sm:p-8 text-center group hover:border-2 hover:border-alert transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-alert-100 to-alert-50 rounded-3xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-alert" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">Hassle-Free Investing</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Simple SIP setup, automated rebalancing, and effortless portfolio management in one place
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - New Addition */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="container-main relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Start Investing in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your journey to financial freedom is just a few clicks away
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-primary to-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="mt-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors duration-300 group-hover:rotate-6 transform">
                    <PieChart className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">Choose Your Basket</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Browse through our expertly curated baskets and select one that aligns with your financial goals and risk appetite
                  </p>
                </div>
              </div>
              {/* Animated Connector Arrow - Desktop Only */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 animate-pulse" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-success">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-success to-success-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="mt-4">
                  <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-success-200 transition-colors duration-300 group-hover:rotate-6 transform">
                    <BarChart3 className="w-8 h-8 text-success group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-success transition-colors duration-300">Set Your Investment</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Decide your investment amount and choose between SIP or lumpsum. Start with as low as ₹500 per month
                  </p>
                </div>
              </div>
              {/* Animated Connector Arrow - Desktop Only */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-success opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 animate-pulse" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-warning">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-warning to-warning-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="mt-4">
                  <div className="w-16 h-16 bg-warning-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-warning-200 transition-colors duration-300 group-hover:rotate-6 transform">
                    <Briefcase className="w-8 h-8 text-warning group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-warning transition-colors duration-300">Track & Grow</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Sit back and watch your portfolio grow. Monitor performance, rebalance when needed, and achieve your goals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Tools Section */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Smart Investment Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to make informed investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Basket Comparison Tool */}
            <Link
              to="/compare-baskets"
              className="group bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl p-6 hover:shadow-lg hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">Compare Baskets</h3>
              <p className="text-gray-600 text-sm mb-4">Compare up to 3 baskets side-by-side to find the perfect fit</p>
              <div className="flex items-center text-blue-600 font-medium text-sm">
                Try Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Risk Profile Quiz */}
            <Link
              to="/risk-quiz"
              className="group bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 rounded-xl p-6 hover:shadow-lg hover:border-purple-400 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600">Risk Profile Quiz</h3>
              <p className="text-gray-600 text-sm mb-4">Discover your investor personality and get personalized recommendations</p>
              <div className="flex items-center text-purple-600 font-medium text-sm">
                Take Quiz <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Portfolio Dashboard */}
            <Link
              to="/portfolio-dashboard"
              className="group bg-gradient-to-br from-green-50 to-white border-2 border-green-100 rounded-xl p-6 hover:shadow-lg hover:border-green-400 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <PieChart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600">Portfolio Dashboard</h3>
              <p className="text-gray-600 text-sm mb-4">Visualize your investments with detailed charts and analytics</p>
              <div className="flex items-center text-green-600 font-medium text-sm">
                View Dashboard <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Educational Hub */}
            <Link
              to="/learn"
              className="group bg-gradient-to-br from-orange-50 to-white border-2 border-orange-100 rounded-xl p-6 hover:shadow-lg hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600">Learning Hub</h3>
              <p className="text-gray-600 text-sm mb-4">Master investing with articles, videos, and expert insights</p>
              <div className="flex items-center text-orange-600 font-medium text-sm">
                Start Learning <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section with Enhanced Design */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container-main px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2 bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent">10+</div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">Curated Baskets</div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Expert portfolios</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-success-50 to-white rounded-2xl border border-success-100">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-success mb-2 bg-gradient-to-r from-success to-success-700 bg-clip-text text-transparent">50+</div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">Mutual Funds</div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Diversified options</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-warning-50 to-white rounded-2xl border border-warning-100">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-warning mb-2 bg-gradient-to-r from-warning to-warning-700 bg-clip-text text-transparent">15%+</div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">Avg. Returns</div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Annualized growth</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-alert-50 to-white rounded-2xl border border-alert-100">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-alert mb-2 bg-gradient-to-r from-alert to-alert-700 bg-clip-text text-transparent">10K+</div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">Happy Investors</div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Growing community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Baskets Section with Enhanced Design */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container-main">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Featured Investment Baskets
              </h2>
              <p className="text-lg text-gray-600">
                Handpicked portfolios designed by financial experts
              </p>
            </div>
            <Link to="/explore-baskets" className="btn btn-primary group">
              View All Baskets
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 px-6">
              <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-gray-600 mb-4">Loading baskets...</p>
              <p className="text-sm text-gray-500 italic max-w-2xl text-center">"{getRandomQuote()}"</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <p className="text-red-600 font-bold text-lg mb-2">Unable to load baskets</p>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {baskets.map((basket) => (
                <BasketCard key={basket.id} basket={basket} onViewDetails={handleViewDetails} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with Enhanced Design */}
      <section className="relative py-24 bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-success rounded-full blur-3xl"></div>
        </div>

        <div className="container-main relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Start Your Investment Journey?
            </h2>
            <p className="text-xl mb-10 text-primary-100 leading-relaxed">
              Join thousands of smart investors building wealth with Alphanifty's expert-curated portfolios. 
              Start with just ₹500 and take the first step toward financial freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" className="btn bg-white text-primary hover:bg-gray-50 text-lg px-10 py-4 shadow-xl hover:shadow-2xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/explore-baskets" className="btn border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-4">
                Explore Baskets
              </Link>
            </div>
            
            {/* Additional Trust Indicator */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-primary-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No Hidden Charges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Withdraw Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Expert Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
