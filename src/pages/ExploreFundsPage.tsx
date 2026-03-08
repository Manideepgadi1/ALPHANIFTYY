import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Building2, Award, Loader, ChevronLeft, ChevronRight, BookmarkPlus, TrendingUp, TrendingDown, Info, X, BarChart3, PieChart, Users, DollarSign, Calendar, Shield, Target, Zap, Activity, Lock, AlertCircle, Lightbulb, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fundApi, Fund as ApiFund, PaginatedResponse } from '../services/api';
import InvestModal from '../components/InvestModal';
import { getRandomQuote } from '../utils/investmentQuotes';

const ITEMS_PER_PAGE = 20;

// Extended Fund Details Interface (from enhanced API)
interface FundDetails extends ApiFund {
  scheme_code?: string;
  scheme_name?: string;
  nav_date?: string;
  fund_manager_1?: string;
  fund_manager_2?: string;
  fund_manager_3?: string;
  objective?: string;
  benchmark?: string;
  min_investment?: string | number;
  sip_min_investment?: string;
  lock_in_period?: string;
  exit_load?: string;
  inception_date?: string;
  return_1month?: string | number;
  return_3month?: string | number;
  return_6month?: string | number;
  return_1year?: string | number;
  return_3year?: string | number;
  return_5year?: string | number;
  ratios?: Array<{
    BETAR?: string;
    SHARPR?: string;
    STANDARDR?: string;
    YTM?: string;
    Average_Maturity?: string;
  }>;
  holdings?: Array<{
    Compname?: string;
    HoldPer?: string;
    Instrument?: string;
    MKTVAL?: string;
  }>;
  asset_allocation?: Array<{
    Asset?: string;
    Percentage?: string;
  }>;
  sector_allocation?: Array<{
    Sector?: string;
    Percentage?: string;
  }>;
  isin?: string;
}

/* ================= HELPER FUNCTIONS ================= */
const formatNumber = (value: string | number | undefined, decimals: number = 2): string => {
  if (value === undefined || value === null || value === '') return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 'N/A' : num.toFixed(decimals);
};

/* ================= HELPER COMPONENTS ================= */
const Metric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-success">{value}</p>
  </div>
);

const MetricCard = ({ 
  label, 
  value, 
  icon, 
  trend 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: 'up' | 'down' 
}) => (
  <div>
    <div className="flex items-center gap-1 mb-1">
      {icon}
      <p className="text-xs text-gray-500">{label}</p>
    </div>
    <div className="flex items-center gap-2">
      <p className={`text-lg font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {value}
      </p>
      {trend === 'up' ? (
        <TrendingUp className="w-4 h-4 text-green-600" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-600" />
      )}
    </div>
  </div>
);

const DetailMetric = ({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: string; 
  color: string 
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    green: 'bg-green-50 text-green-900 border-green-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    orange: 'bg-orange-50 text-orange-900 border-orange-200',
    pink: 'bg-pink-50 text-pink-900 border-pink-200',
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  };
  
  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color] || colorClasses.blue}`}>
      <p className="text-xs opacity-75 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const ExploreFundsPage: React.FC = () => {
  const navigate = useNavigate();
  const [funds, setFunds] = useState<ApiFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalFunds, setTotalFunds] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal state for detailed view
  const [selectedFund, setSelectedFund] = useState<FundDetails | null>(null);
  const [fundDetailsLoading, setFundDetailsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [investFund, setInvestFund] = useState<FundDetails | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAMC, setSelectedAMC] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= FETCH FUND DETAILS (when clicked) ================= */
  const fetchFundDetails = async (fundId: string | number) => {
    try {
      setFundDetailsLoading(true);
      setShowModal(true);
      
      console.log('🔍 Fetching detailed data for fund:', fundId);
      
      // Call the enhanced API endpoint
      const response = await fundApi.getById(fundId);
      
      if (response.status === 'success' && response.data) {
        console.log('✅ Received complete fund data:', response.data);
        setSelectedFund(response.data as FundDetails);
      } else {
        console.error('❌ Failed to fetch fund details:', response.message);
      }
    } catch (err) {
      console.error('❌ Error fetching fund details:', err);
    } finally {
      setFundDetailsLoading(false);
    }
  };

  /* ================= FETCH FUNDS WITH PAGINATION ================= */
  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true);
        const response = await fundApi.getAll({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchQuery,
          category: selectedCategory !== 'All' ? selectedCategory : ''
        }) as PaginatedResponse<ApiFund[]>;
        
        if (response.status === 'success' && response.data) {
          setFunds(response.data);
          
          // Set pagination info from response
          if (response.pagination) {
            setTotalFunds(response.pagination.total);
            setTotalPages(response.pagination.totalPages);
          }
        } else {
          setError(response.message || 'Failed to load funds');
        }
      } catch {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchFunds();
  }, [currentPage, searchQuery, selectedCategory]);

  /* ================= GET UNIQUE CATEGORIES & AMCs (load once on mount) ================= */
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allAMCs, setAllAMCs] = useState<string[]>([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  
  useEffect(() => {
    // Load all available categories and AMCs once on component mount
    const loadFilters = async () => {
      try {
        // Get a larger sample to build comprehensive filter list (but not all 9891)
        const response = await fundApi.getAll({ limit: 100 }) as PaginatedResponse<ApiFund[]>;
        
        if (response.status === 'success' && response.data) {
          const categories = new Set<string>();
          const amcs = new Set<string>();
          
          response.data.forEach(fund => {
            if (fund.category) {
              const mainCategory = fund.category.split('-')[0].trim();
              categories.add(mainCategory);
            }
            const amc = fund.fundHouse || fund.amc;
            if (amc) {
              amcs.add(amc);
            }
          });
          
          setAllCategories(Array.from(categories).sort());
          setAllAMCs(Array.from(amcs).sort());
          setFiltersLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };

    if (!filtersLoaded) {
      loadFilters();
    }
  }, [filtersLoaded]);

  /* ================= FILTER (client-side AMC filtering for current page) ================= */
  const filteredFunds = funds
    .filter(fund => {
      if (selectedAMC !== 'All' && fund.fundHouse !== selectedAMC && fund.amc !== selectedAMC) {
        return false;
      }
      return true;
    });

  /* ================= NO PAGINATION SLICE NEEDED ================= */
  const paginatedFunds = filteredFunds;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedAMC]);

  /* ================= HELPERS ================= */
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-warning fill-warning' : 'text-gray-300'
        }`}
      />
    ));

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-success-50 py-12">
      <div className="container-main">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-success-100 rounded-full px-5 py-2 mb-4">
            <Building2 className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-success">Mutual Funds Explorer</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Discover <span className="text-success">Mutual Funds</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse and compare from our curated selection of top-performing mutual funds across categories
          </p>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* SEARCH */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                aria-label="Search mutual funds"
                type="text"
                placeholder="Search funds or AMC..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* CATEGORY FILTER */}
            <select
              aria-label="Filter by fund category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="All">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* AMC FILTER */}
            <select
              aria-label="Filter by AMC/Fund House"
              value={selectedAMC}
              onChange={e => setSelectedAMC(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="All">All AMCs</option>
              {allAMCs.map(amc => (
                <option key={amc} value={amc}>{amc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS COUNT */}
        {!loading && !error && (
          <p className="mb-6 text-gray-600">
            Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalFunds)}</strong> of <strong>{totalFunds}</strong> fund{filteredFunds.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* FUNDS LIST */}
        {!loading && !error && paginatedFunds.length > 0 && (
          <>
            <div className="space-y-4">
              {paginatedFunds.map(fund => (
                <div 
                  key={fund.id} 
                  className="card p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer border-2 border-transparent hover:border-primary-200"
                  onClick={() => {
                    console.log('🔍 Clicked fund:', fund.id, 'Name:', fund.name);
                    if (fund.id) {
                      navigate(`/fund/${fund.id}`);
                    } else {
                      console.error('❌ Fund ID is undefined!', fund);
                    }
                  }}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* INFO */}
                    <div className="flex-1">
                      <div className="flex justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                              {fund.name}
                            </h3>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-success-100 text-success">
                              {fund.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">{fund.fundHouse || fund.amc}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              <span className={`font-semibold ${
                                fund.risk === 'Low' ? 'text-green-600' :
                                fund.risk === 'Medium' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {fund.risk} Risk
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              <span>NAV: ₹{fund.nav}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-1">{renderStars(fund.rating)}</div>
                          <span className="text-sm text-gray-500">Rating</span>
                        </div>
                      </div>

                      {/* Enhanced Metrics Grid - Only showing accurate CSV data */}
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <MetricCard 
                          label="3Y Return" 
                          value={`${formatNumber(fund.returns3Y, 2)}%`} 
                          icon={<TrendingUp className="w-4 h-4" />}
                          trend={fund.returns3Y > 0 ? 'up' : 'down'}
                        />
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Since Inception
                          </p>
                          <p className={`text-lg font-semibold ${fund.returns5Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatNumber(fund.returns5Y, 2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            Std Deviation
                          </p>
                          <p className="text-lg font-semibold text-gray-700">
                            {fund.std_deviation ? formatNumber(fund.std_deviation, 2) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700">Click for Manager Details</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
                          <PieChart className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700">View Portfolio Holdings</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">Inception & History</span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex lg:flex-col gap-3 lg:w-48">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart with optimistic update
                          const cartItem = {
                            id: Date.now(),
                            basketId: fund.id,
                            quantity: 1,
                            investmentType: 'Lumpsum' as const,
                            amount: 5000
                          };
                          const existing = JSON.parse(localStorage.getItem('alphanifty_cart') || '[]');
                          localStorage.setItem('alphanifty_cart', JSON.stringify([...existing, cartItem]));
                          // Dispatch event to update header counter
                          window.dispatchEvent(new Event('cart-updated'));
                          navigate('/cart');
                        }}
                        className="btn btn-success flex items-center justify-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchFundDetails(fund.id);
                        }}
                        className="btn btn-primary flex items-center justify-center gap-2"
                      >
                        <Info className="w-4 h-4" />
                        Details
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const watchlistId = `fund_${fund.id}`;
                          const saved = localStorage.getItem('alphanifty_watchlist');
                          const watchlist = saved ? JSON.parse(saved) : [];
                          const index = watchlist.indexOf(watchlistId);
                          if (index > -1) {
                            watchlist.splice(index, 1);
                          } else {
                            watchlist.push(watchlistId);
                          }
                          localStorage.setItem('alphanifty_watchlist', JSON.stringify(watchlist));
                          // Trigger re-render by updating state and dispatching events
                          window.dispatchEvent(new Event('watchlist-updated'));
                          window.dispatchEvent(new StorageEvent('storage', { key: 'alphanifty_watchlist' }));
                        }}
                        className="btn btn-outline flex items-center justify-center gap-2" 
                        title="Add to Watchlist"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        Watchlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-white border border-gray-200 hover:border-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="text-center max-w-2xl mx-auto px-4">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">Loading mutual funds...</p>
              <p className="text-sm text-gray-500 italic">"{getRandomQuote()}"</p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredFunds.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No funds found</h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedAMC('All');
              }}
              className="btn btn-primary mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* INFO */}
        {!loading && (
          <div className="mt-12 card p-6 bg-primary-50 border border-primary-100">
            <div className="flex gap-4">
              <Award className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Why Choose Our Curated Funds?
                </h3>
                <p className="text-gray-700">
                  Funds are selected based on consistency, low costs, and
                  strong fund management.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DETAILED FUND MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header - Sticky */}
              <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 truncate">
                    {selectedFund?.name || selectedFund?.scheme_name || 'Fund Details'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span className="truncate">{selectedFund?.fundHouse || selectedFund?.amc || 'N/A'}</span>
                    </div>
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
                      {selectedFund?.category}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto flex-1">
                {fundDetailsLoading ? (
                  <div className="flex flex-col justify-center items-center py-16">
                    <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-gray-600">Loading fund details...</p>
                  </div>
                ) : selectedFund ? (
                  <div className="p-6 space-y-6">
                    {/* KEY METRICS - 4 COLUMN GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                        <p className="text-xs text-green-700 font-semibold mb-1">Current NAV</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-900">₹{formatNumber(selectedFund.nav, 2)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold mb-1">AUM</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-900 truncate">{selectedFund.aum}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                        <p className="text-xs text-purple-700 font-semibold mb-1">Expense Ratio</p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-900">{formatNumber(selectedFund.expenseRatio, 2)}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                        <p className="text-xs text-orange-700 font-semibold mb-1">Risk Level</p>
                        <p className="text-lg sm:text-2xl font-bold text-orange-900">{selectedFund.risk}</p>
                      </div>
                    </div>

                    {/* INVESTMENT OBJECTIVE */}
                    {selectedFund.objective && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
                        <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Investment Objective
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedFund.objective}</p>
                      </div>
                    )}

                    {/* RETURNS - 6 CARDS */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        Performance Returns
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {[
                          { label: '1M', value: selectedFund.return_1month, color: 'blue' },
                          { label: '3M', value: selectedFund.return_3month, color: 'green' },
                          { label: '6M', value: selectedFund.return_6month, color: 'purple' },
                          { label: '1Y', value: selectedFund.return_1year || selectedFund.returns1Y, color: 'orange' },
                          { label: '3Y', value: selectedFund.return_3year || selectedFund.returns3Y, color: 'pink' },
                          { label: '5Y', value: selectedFund.return_5year || selectedFund.returns5Y, color: 'indigo' }
                        ].map((item, idx) => {
                          const colors = {
                            blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
                            green: 'from-green-50 to-green-100 border-green-200 text-green-900',
                            purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900',
                            orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900',
                            pink: 'from-pink-50 to-pink-100 border-pink-200 text-pink-900',
                            indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900'
                          };
                          return (
                            <div key={idx} className={`bg-gradient-to-br ${colors[item.color as keyof typeof colors]} p-3 rounded-lg border text-center`}>
                              <p className="text-xs font-semibold opacity-75 mb-1">{item.label}</p>
                              <p className="text-sm sm:text-base font-bold">{formatNumber(item.value, 2)}%</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* FUND MANAGERS */}
                    {(selectedFund.fund_manager_1 || selectedFund.fund_manager_2 || selectedFund.fund_manager_3) && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          Fund Management Team
                        </h3>
                        <div className="space-y-2">
                          {[selectedFund.fund_manager_1, selectedFund.fund_manager_2, selectedFund.fund_manager_3].filter(Boolean).map((manager, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {idx + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{manager}</p>
                                <p className="text-xs text-gray-500">
                                  {idx === 0 ? 'Primary Manager' : 'Co-Manager'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INVESTMENT DETAILS - 4 COLUMNS */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Investment Details
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <p className="text-xs text-green-700 font-semibold mb-1">Min Investment</p>
                          <p className="text-lg font-bold text-green-900">₹{selectedFund.min_investment || '5,000'}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <p className="text-xs text-blue-700 font-semibold mb-1">Min SIP</p>
                          <p className="text-lg font-bold text-blue-900">₹{selectedFund.sip_min_investment || '500'}</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <p className="text-xs text-yellow-700 font-semibold mb-1">Lock-in Period</p>
                          <p className="text-lg font-bold text-yellow-900">{selectedFund.lock_in_period || 'None'}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                          <p className="text-xs text-red-700 font-semibold mb-1">Exit Load</p>
                          <p className="text-lg font-bold text-red-900">{selectedFund.exit_load || 'Nil'}</p>
                        </div>
                      </div>
                    </div>

                    {/* TOP 10 HOLDINGS */}
                    {selectedFund.holdings && selectedFund.holdings.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-primary" />
                          Top 10 Holdings
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedFund.holdings.slice(0, 10).map((holding, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{holding.Compname}</p>
                                <p className="text-xs text-gray-500">{holding.Instrument || 'Equity'}</p>
                              </div>
                              <div className="text-right ml-2 flex-shrink-0">
                                <p className="font-bold text-primary">{parseFloat(holding.HoldPer || '0').toFixed(2)}%</p>
                              </div>
                            </div>
                          ))}
                          {selectedFund.holdings.length > 10 && (
                            <p className="text-center text-xs text-gray-500 pt-2">
                              +{selectedFund.holdings.length - 10} more holdings
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-16">
                    <p className="text-gray-600">No fund data available</p>
                  </div>
                )}
              </div>

              {/* Modal Footer - Sticky */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (selectedFund) {
                      setInvestFund(selectedFund);
                      setInvestModalOpen(true);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Invest Now
                </button>
                {selectedFund?.id ? (
                  <Link
                    to={`/fund/${selectedFund.id}`}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition text-center"
                  >
                    View Complete Details →
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed text-center"
                  >
                    Fund ID Not Available
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invest Modal */}
        {investFund && (
          <InvestModal
            isOpen={investModalOpen}
            onClose={() => {
              setInvestModalOpen(false);
              setInvestFund(null);
            }}
            fundName={investFund.scheme_name || investFund.name || 'Fund'}
            fundId={investFund.id || investFund.scheme_code || ''}
            currentNAV={parseFloat(String(investFund.nav || '100'))}
            minSIP={investFund.sip_min_investment || '500'}
            minInvestment={investFund.min_investment || '5000'}
          />
        )}
      </div>
    </div>
  );
};

export default ExploreFundsPage;
