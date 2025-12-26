import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Building2, Award, Loader } from 'lucide-react';
import { fundApi, Fund as ApiFund } from '../services/api';

const ExploreFundsPage: React.FC = () => {
  const [funds, setFunds] = useState<ApiFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('returns5Y-desc');

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true);
        const response = await fundApi.getAll();
        if (response.status === 'success' && response.data) {
          setFunds(response.data);
        } else {
          setError(response.message || 'Failed to load funds');
        }
      } catch (err) {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchFunds();
  }, []);

  // Filter and sort funds
  const filteredFunds = funds
    .filter(fund => {
      // Search filter
      if (searchQuery && !fund.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(fund.amc || fund.fundHouse || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== 'All' && fund.category !== selectedCategory) {
        return false;
      }
      
      // Risk filter
      if (selectedRisk !== 'All' && fund.risk !== selectedRisk) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      const [field, direction] = sortBy.split('-');
      const aValue = a[field as keyof ApiFund] as number;
      const bValue = b[field as keyof ApiFund] as number;
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-warning fill-warning' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore Mutual Funds
          </h1>
          <p className="text-lg text-gray-600">
            Browse and compare from our curated selection of mutual funds
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search funds or AMC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Equity">Equity</option>
              <option value="Debt">Debt</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="returns5Y-desc">5Y Returns (High to Low)</option>
              <option value="returns5Y-asc">5Y Returns (Low to High)</option>
              <option value="returns3Y-desc">3Y Returns (High to Low)</option>
              <option value="returns1Y-desc">1Y Returns (High to Low)</option>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="aum-desc">AUM (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredFunds.length}</span> fund{filteredFunds.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Funds List */}
        {!loading && !error && filteredFunds.length > 0 && (
          <div className="space-y-4">
            {filteredFunds.map((fund) => (
              <div key={fund.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Fund Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {fund.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm">{fund.fundHouse || fund.amc}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="badge bg-primary-50 text-primary-700">
                            {fund.category}
                          </span>
                          {fund.subCategory && (
                            <span className="badge bg-gray-100 text-gray-700">
                              {fund.subCategory}
                            </span>
                          )}
                          <span className={`badge ${
                            fund.risk.toLowerCase().includes('low') ? 'badge-low' :
                            fund.risk.toLowerCase().includes('high') ? 'badge-high' : 'badge-medium'
                          }`}>
                            {fund.risk} Risk
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(fund.rating)}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">1Y Returns</div>
                        <div className="text-lg font-semibold text-success">{fund.returns1Y}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">3Y Returns</div>
                        <div className="text-lg font-semibold text-success">{fund.returns3Y}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">5Y Returns</div>
                        <div className="text-lg font-semibold text-success">{fund.returns5Y}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">AUM</div>
                        <div className="text-lg font-semibold text-gray-900">{fund.aum}</div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">NAV:</span>
                        <span className="ml-2 font-semibold text-gray-900">₹{fund.nav}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Exp Ratio:</span>
                        <span className="ml-2 font-semibold text-gray-900">{fund.expenseRatio}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Min Inv:</span>
                        <span className="ml-2 font-semibold text-gray-900">₹{(fund.minInvestment || 5000).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sharpe:</span>
                        <span className="ml-2 font-semibold text-gray-900">{fund.sharpeRatio || fund.sharpe || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col gap-3 lg:w-40">
                    <button className="btn btn-primary flex-1 lg:flex-none">
                      View Details
                    </button>
                    <button className="btn btn-success flex-1 lg:flex-none">
                      Invest Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}
        
        {!loading && error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">Unable to load funds</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        )}
        
        {!loading && !error && filteredFunds.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No funds found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedRisk('All');
              }}
              className="btn btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Info Section - Always visible */}
        {!loading && (
          <div className="mt-12 card p-6 bg-primary-50 border border-primary-100">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Why Choose Our Curated Funds?
              </h3>
              <p className="text-gray-700 mb-4">
                All funds in our platform are carefully selected based on consistent performance, 
                strong fund management, and investor-friendly practices.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Performance Track Record</h4>
                  <p className="text-gray-600">Minimum 3-year consistent returns</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Low Expense Ratios</h4>
                  <p className="text-gray-600">Cost-effective fund management</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Experienced Fund Managers</h4>
                  <p className="text-gray-600">Proven expertise and track record</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ExploreFundsPage;
