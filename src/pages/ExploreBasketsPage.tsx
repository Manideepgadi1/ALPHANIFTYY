import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { refreshCart } = useCart();

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
        const res = await cartApi.add({ userId: 'guest', basketId: basketId, investmentType: 'SIP', amount: 5000 });
        if (res.status === 'success') {
          alert('Basket added to cart!');
          await refreshCart();
        } else {
          alert(res.message || 'Failed to add to cart');
        }
      } catch (e) {
        alert('Failed to add to cart');
      }
    })();
  };

  // Filter and sort baskets
  const filteredBaskets = baskets
    .filter(basket => {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore Investment Baskets
          </h1>
          <p className="text-lg text-gray-600">
            Discover expertly curated mutual fund portfolios designed for your goals
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search baskets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
            >
              <Filter className="w-5 h-5" />
              Filters
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

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({})}
                    className="btn btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
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
          <div className="flex justify-center items-center py-20">
            <Loader className="w-12 h-12 text-primary animate-spin" />
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
