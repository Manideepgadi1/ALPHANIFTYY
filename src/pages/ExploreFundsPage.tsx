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

  /* ================= FETCH FUNDS ================= */
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
      } catch {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchFunds();
  }, []);

  /* ================= FILTER + SORT ================= */
  const filteredFunds = funds
    .filter(fund => {
      if (
        searchQuery &&
        !fund.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(fund.amc || fund.fundHouse || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (selectedCategory !== 'All' && fund.category !== selectedCategory) {
        return false;
      }

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore Mutual Funds
          </h1>
          <p className="text-lg text-gray-600">
            Browse and compare from our curated selection of mutual funds
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
              <option value="Equity">Equity</option>
              <option value="Debt">Debt</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            {/* RISK FILTER */}
            <select
              aria-label="Filter by risk level"
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>

            {/* SORT */}
            <select
              aria-label="Sort mutual funds"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
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

        {/* RESULTS COUNT */}
        {!loading && !error && (
          <p className="mb-6 text-gray-600">
            Showing <strong>{filteredFunds.length}</strong> fund
            {filteredFunds.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* FUNDS LIST */}
        {!loading && !error && filteredFunds.length > 0 && (
          <div className="space-y-4">
            {filteredFunds.map(fund => (
              <div key={fund.id} className="card p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* INFO */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {fund.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4" />
                          {fund.fundHouse || fund.amc}
                        </div>
                      </div>
                      <div className="flex gap-1">{renderStars(fund.rating)}</div>
                    </div>

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Metric label="1Y" value={`${fund.returns1Y}%`} />
  <Metric label="3Y" value={`${fund.returns3Y}%`} />
  <Metric label="5Y" value={`${fund.returns5Y}%`} />
  <Metric label="AUM" value={String(fund.aum)} />
</div>

                  </div>

                  {/* ACTIONS */}
                  <div className="flex lg:flex-col gap-3 lg:w-40">
                    <button className="btn btn-primary">View Details</button>
                    <button className="btn btn-success">Invest Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader className="w-12 h-12 text-primary animate-spin" />
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
                setSelectedRisk('All');
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
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENT ================= */
const Metric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-success">{value}</p>
  </div>
);

export default ExploreFundsPage;
