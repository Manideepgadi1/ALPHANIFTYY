import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, X, Plus, ArrowRight, CheckCircle, AlertCircle, Download, ArrowLeft } from 'lucide-react';
import { basketApi, Basket } from '../services/api';

const BasketCompareToolPage: React.FC = () => {
  const navigate = useNavigate();
  const [allBaskets, setAllBaskets] = useState<Basket[]>([]);
  const [selectedBaskets, setSelectedBaskets] = useState<Basket[]>([]);
  const [showSelector, setShowSelector] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBaskets();
  }, []);

  const fetchBaskets = async () => {
    try {
      setLoading(true);
      const response = await basketApi.getAll();
      if (response.status === 'success' && response.data) {
        setAllBaskets(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to load baskets');
      }
    } catch (err) {
      console.error('Error fetching baskets:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const addBasket = (basket: Basket) => {
    if (selectedBaskets.length < 3 && !selectedBaskets.find(b => b.id === basket.id)) {
      setSelectedBaskets([...selectedBaskets, basket]);
    }
  };

  const removeBasket = (basketId: string | number) => {
    setSelectedBaskets(selectedBaskets.filter(b => b.id !== basketId));
  };

  const getBestIn = (metric: 'cagr5Y' | 'minInvestment' | 'cagr3Y') => {
    if (selectedBaskets.length === 0) return null;
    
    if (metric === 'minInvestment') {
      return selectedBaskets.reduce((min, b) => 
        (b[metric] || 0) < (min[metric] || 0) ? b : min
      );
    }
    return selectedBaskets.reduce((max, b) => 
      (b[metric] || 0) > (max[metric] || 0) ? b : max
    );
  };

  const getRecommendation = () => {
    if (selectedBaskets.length < 2) return null;
    
    const scores = selectedBaskets.map(basket => {
      let score = 0;
      score += (basket.cagr5Y || 0) * 3;
      score += (basket.cagr3Y || 0) * 2;
      score += (basket.cagr1Y || 0) * 1;
      // Prefer lower minInvestment
      score += (10000 - (basket.minInvestment || 10000)) / 1000;
      return { basket, score };
    });

    return scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container-main">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Basket Comparison Tool</h1>
                <p className="text-gray-600">Compare up to 3 baskets side-by-side</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-primary hover:text-primary-dark hover:bg-primary/5 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Selected Baskets Pills */}
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedBaskets.map(basket => (
              <div key={basket.id} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <span className="font-medium">{basket.name}</span>
                <button onClick={() => removeBasket(basket.id)} className="hover:bg-primary/20 rounded-full p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {selectedBaskets.length < 3 && (
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
                Add Basket ({selectedBaskets.length}/3)
              </button>
            )}
          </div>

          {/* Basket Selector */}
          {showSelector && (
            <div className="border-t pt-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-gray-600 mt-2">Loading baskets...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-800">{error}</p>
                  <button onClick={fetchBaskets} className="mt-2 text-primary font-medium hover:underline">
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 mb-3">Select baskets to compare:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {allBaskets
                      .filter(basket => !selectedBaskets.find(b => b.id === basket.id))
                      .map(basket => (
                        <button
                          key={basket.id}
                          onClick={() => addBasket(basket)}
                          disabled={selectedBaskets.length >= 3}
                          className="text-left p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                        >
                          <div className="font-medium text-gray-900">{basket.name}</div>
                          <div className="text-sm text-gray-600">
                            {basket.cagr5Y ? `${basket.cagr5Y}% CAGR` : 'N/A'} • {basket.risk || basket.riskLevel || 'N/A'} Risk
                          </div>
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedBaskets.length >= 2 ? (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Feature</th>
                      {selectedBaskets.map(basket => (
                        <th key={basket.id} className="px-6 py-4 text-left">
                          <div className="text-sm font-semibold text-gray-900">{basket.name}</div>
                          <div className="text-xs text-gray-500">{basket.risk || basket.riskLevel || 'N/A'} Risk</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-700">5Y CAGR</td>
                      {selectedBaskets.map(basket => (
                        <td key={basket.id} className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {basket.cagr5Y ? `${basket.cagr5Y}%` : 'N/A'}
                            </span>
                            {basket.cagr5Y && getBestIn('cagr5Y')?.id === basket.id && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-700">3Y CAGR</td>
                      {selectedBaskets.map(basket => (
                        <td key={basket.id} className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {basket.cagr3Y ? `${basket.cagr3Y}%` : 'N/A'}
                            </span>
                            {basket.cagr3Y && getBestIn('cagr3Y')?.id === basket.id && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-700">1Y CAGR</td>
                      {selectedBaskets.map(basket => (
                        <td key={basket.id} className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {basket.cagr1Y ? `${basket.cagr1Y}%` : 'N/A'}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-700">Risk Level</td>
                      {selectedBaskets.map(basket => (
                        <td key={basket.id} className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            (basket.risk || basket.riskLevel) === 'Low' ? 'bg-green-100 text-green-700' :
                            (basket.risk || basket.riskLevel) === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {basket.risk || basket.riskLevel || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-700">Min Investment</td>
                      {selectedBaskets.map(basket => (
                        <td key={basket.id} className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{(basket.minInvestment || 0).toLocaleString()}
                            </span>
                            {getBestIn('minInvestment')?.id === basket.id && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-700">Category</td>
                      {selectedBaskets.map(basket => (
                        <td key={basket.id} className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {basket.category || 'General'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-700">Actions</td>
                      {selectedBaskets.map(basket => (
                        <td key={basket.id} className="px-6 py-4">
                          <Link
                            to={`/basket-details/${basket.id}`}
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendation */}
            {getRecommendation() && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Our Recommendation</h3>
                    <p className="text-gray-700 mb-4">
                      Based on our analysis, <strong className="text-primary">{getRecommendation()?.basket.name}</strong> offers the best balance of returns and risk.
                    </p>
                    <Link
                      to={`/basket-details/${getRecommendation()?.basket.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark"
                    >
                      Invest in {getRecommendation()?.basket.name}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select at least 2 baskets to compare</h3>
            <p className="text-gray-600">Choose baskets from the list above to see a detailed comparison</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasketCompareToolPage;
