import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomQuote } from '../utils/investmentQuotes';
import { Search, Filter, SlidersHorizontal, Loader } from 'lucide-react';
import BasketCard from '../components/BasketCard';
import { basketApi, Basket, cartApi } from '../services/api';
import useCart from '../context/CartContext';
import { FilterOptions, SortOption } from '../types';

const ExploreBasketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'cagr5Y', direction: 'desc' });
  const [hideWithoutExcel, setHideWithoutExcel] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('hideWithoutExcel');
    return saved === 'true';
  });
  const { refreshCart } = useCart();

  // Save hideWithoutExcel to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hideWithoutExcel', String(hideWithoutExcel));
  }, [hideWithoutExcel]);

  useEffect(() => {
    const fetchBaskets = async () => {
      try {
        setLoading(true);
        const response = await basketApi.getAll();
        if (response.status === 'success' && response.data) {
          setBaskets(response.data);
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

  const handleViewDetails = (basketId: string) => {
    // Navigate to basket details page
    navigate(`/basket-details/${basketId}`);
  };

  const handleAddToCart = (basketId: string) => {
    (async () => {
      try {
        // Find the basket to get its minimum investment amount
        const basket = baskets.find(b => String(b.id) === basketId);
        const amount = basket?.minInvestment || 5000;
        
        // Create new cart item
        const newItem = {
          id: Date.now(),
          basketId: basketId,
          quantity: 1,
          investmentType: 'SIP' as const,
          amount: amount
        };
        
        // Save to localStorage immediately (optimistic update)
        const currentCart = JSON.parse(localStorage.getItem('alphanifty_cart') || '[]');
        localStorage.setItem('alphanifty_cart', JSON.stringify([...currentCart, newItem]));
        
        // Update context
        refreshCart();
        
        // Dispatch event to update header counter
        window.dispatchEvent(new Event('cart-updated'));
        
        // Then do the API call in the background
        const res = await cartApi.add({ userId: 'guest', basketId: basketId, investmentType: 'SIP', amount });
        if (res.status === 'success') {
          await refreshCart();
          window.dispatchEvent(new Event('cart-updated'));
        }
      } catch (e) {
        // Silently fail - item was added optimistically
        console.error('Failed to sync cart:', e);
      }
    })();
  };

  // Filter and sort baskets
  const filteredBaskets = baskets
    .filter(basket => {
      // Hide baskets without Excel files AND Yellow/White/Dusshera baskets if toggle is enabled
      if (hideWithoutExcel) {
        // Hide baskets without excelFile property
        if (!basket.excelFile) {
          return false;
        }
        // Also hide Yellow Basket (b4), White Basket (b11), and Dusshera Basket (b15) specifically
        if (basket.id === 'b4' || basket.id === 'b11' || basket.id === 'b15' || 
            basket.name === 'Yellow Basket' || basket.name === 'White Basket' || 
            basket.name === 'Dusshera Basket') {
          return false;
        }
      }
      
      // Search filter
      if (searchQuery && !basket.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Risk level filter
      if (filters.riskLevel && filters.riskLevel.length > 0) {
        const basketRisk = basket.riskLevel || basket.risk || 'Medium';
        if (!filters.riskLevel.includes(basketRisk as 'Low' | 'Medium' | 'High')) {
          return false;
        }
      }
      
      // Min investment filter
      if (filters.minInvestment && basket.minInvestment < filters.minInvestment) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      const aValue = (a as any)[sortBy.field] as number || 0;
      const bValue = (b as any)[sortBy.field] as number || 0;
      return sortBy.direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 py-12">
      <div className="container-main">
        {/* Header with Enhanced Design */}
        <div className="mb-8 sm:mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 rounded-full px-4 py-2 mb-3 sm:mb-4">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Investment Baskets</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Explore Our <span className="text-primary">Curated Baskets</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Discover professionally designed mutual fund portfolios tailored to match your financial goals and risk appetite
          </p>
        </div>

        {/* Search and Filter Bar with Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            {/* Search with Better Styling */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for baskets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>

            {/* Filter Button with Better Design */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} px-4 sm:px-6 transition-all flex items-center justify-center gap-2 whitespace-nowrap`}
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {(filters.riskLevel?.length || filters.minInvestment) && (
                <span className="ml-2 bg-success text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {(filters.riskLevel?.length || 0) + (filters.minInvestment ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
<select
  aria-label="Sort baskets"
  value={`${sortBy.field}-${sortBy.direction}`}
  onChange={(e) => {
    const [field, direction] = e.target.value.split('-');
    setSortBy({
      field: field as SortOption['field'],
      direction: direction as 'asc' | 'desc',
    });
  }}
  className="btn btn-secondary"
>

              <option value="cagr5Y-desc">5Y Returns (High to Low)</option>
              <option value="cagr5Y-asc">5Y Returns (Low to High)</option>
              <option value="cagr3Y-desc">3Y Returns (High to Low)</option>
              <option value="cagr3Y-asc">3Y Returns (Low to High)</option>
              <option value="averageReturn-desc">Average Returns (High to Low)</option>
              <option value="averageReturn-asc">Average Returns (Low to High)</option>
              <option value="minInvestment-asc">Min Investment (Low to High)</option>
              <option value="minInvestment-desc">Min Investment (High to Low)</option>
              <option value="sharpeRatio-desc">Sharpe Ratio (High to Low)</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Risk Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Low', 'Medium', 'High'].map((risk) => (
                      <button
                        key={risk}
                        onClick={() => {
                          const currentRiskLevels = filters.riskLevel || [];
                          const newRiskLevels = currentRiskLevels.includes(risk as any)
                            ? currentRiskLevels.filter(r => r !== risk)
                            : [...currentRiskLevels, risk as any];
                          setFilters({ ...filters, riskLevel: newRiskLevels });
                        }}
                        className={`px-4 py-2 rounded-lg border ${
                          filters.riskLevel?.includes(risk as any)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {risk}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min Investment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Investment
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={filters.minInvestment || ''}
                    onChange={(e) => setFilters({ ...filters, minInvestment: Number(e.target.value) })}
                    className="input"
                  />
                </div>

                {/* Hide Baskets without Excel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Options
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideWithoutExcel}
                      onChange={(e) => setHideWithoutExcel(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Hide baskets without reports</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setFilters({});
                    setHideWithoutExcel(false);
                  }}
                  className="btn btn-secondary"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredBaskets.length}</span> basket{filteredBaskets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 px-6">
            <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-600 mb-4">Loading baskets...</p>
            <p className="text-sm text-gray-500 italic max-w-2xl text-center">"{getRandomQuote()}"</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">Unable to load baskets</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        ) : filteredBaskets.length === 0 ? (
          <div className="text-center py-16">
            <SlidersHorizontal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No baskets found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({});
                setHideWithoutExcel(false);
              }}
              className="btn btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBaskets.map((basket) => (
              <BasketCard
                key={basket.id}
                basket={basket}
                onViewDetails={handleViewDetails}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreBasketsPage;
