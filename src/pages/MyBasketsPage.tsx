import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp, Package, Filter, Search, Layers } from 'lucide-react';
import { basketApi, Basket } from '../services/api';

const MyBasketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const riskLevels = ['All', 'Low', 'Medium', 'High'];

  useEffect(() => {
    const fetchBaskets = async () => {
      try {
        const response = await basketApi.getAll();
        if (response.status === 'success' && response.data) {
          setBaskets(response.data);
        }
      } catch (error) {
        console.error('Error fetching baskets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBaskets();
  }, []);

  const filteredBaskets = baskets.filter(basket => {
    const matchesSearch = basket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         basket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'All' || basket.risk === riskFilter || basket.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Baskets</h1>
            <p className="text-gray-600">Your personalized investment baskets</p>
          </div>
          <button
            onClick={() => navigate('/explore-baskets')}
            className="mt-4 sm:mt-0 btn btn-success flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Explore More
          </button>
        </div>

        <div className="card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Filter Baskets</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search baskets..."
                className="input w-full pl-10"
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="input w-full"
            >
              {riskLevels.map(risk => (
                <option key={risk} value={risk}>
                  {risk === 'All' ? 'All Risk Levels' : `Risk: ${risk}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Loading baskets...</p>
          </div>
        ) : filteredBaskets.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">No Baskets Found</h2>
            <p className="text-gray-600 mb-8">Start exploring our curated baskets</p>
            <button
              onClick={() => navigate('/explore-baskets')}
              className="btn btn-success inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Explore Baskets
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredBaskets.length} of {baskets.length} baskets
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBaskets.map((basket) => (
                <div key={basket.id} className="card hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: basket.color || '#2E89C4' }}
                    >
                      <Layers className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-2">{basket.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{basket.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Funds</p>
                        <p className="text-lg font-bold">{basket.funds.length}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Risk</p>
                        <p className="text-sm font-semibold">{basket.risk || 'Medium'}</p>
                      </div>
                    </div>

                    {basket.cagr3Y && (
                      <div className="bg-gradient-to-r from-success-50 to-primary-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">3Y CAGR</p>
                            <p className="text-lg font-bold text-success">{basket.cagr3Y}%</p>
                          </div>
                          <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <span className="text-sm text-gray-600">Min. Investment</span>
                      <span className="text-lg font-bold">₹{basket.minInvestment.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/basket-details/${basket.id}`)}
                      className="btn btn-primary w-full"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBasketsPage;
