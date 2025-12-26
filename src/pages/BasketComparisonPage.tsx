import { useState } from 'react';
import { ArrowLeft, Plus, X, TrendingUp, Shield, DollarSign, BarChart3, Download } from 'lucide-react';
import { mockBaskets } from '../data/mockData';


interface BasketComparisonPageProps {
  navigateTo: (page: string, basketId?: string) => void;
  user: any | null;
  onShowCalculator?: () => void;
  onShowHelp?: () => void;
}

export function BasketComparisonPage({ navigateTo, user, onShowCalculator, onShowHelp }: BasketComparisonPageProps) {
  const [selectedBaskets, setSelectedBaskets] = useState<any[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const addBasket = (basket: any) => {
    if (selectedBaskets.length < 3 && !selectedBaskets.find((b: any) => b.id === basket.id)) {
      setSelectedBaskets([...selectedBaskets, basket]);
      setShowSelector(false);
    }
  };

  const removeBasket = (basketId: string) => {
    setSelectedBaskets(selectedBaskets.filter((b: any) => b.id !== basketId));
  };

  const availableBaskets = mockBaskets.filter((b: any) => !selectedBaskets.find((sb: any) => sb.id === b.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App-level Header provided in App.tsx; removed local Header usage */}
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#2E89C4] to-[#1B6EA1] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigateTo('basket-list')}
            className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Baskets</span>
          </button>
          
          <h1 className="text-4xl font-bold mb-2">Compare Baskets</h1>
          <p className="text-blue-100">Side-by-side comparison of investment baskets</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Basket Selector */}
        {selectedBaskets.length < 3 && (
          <div className="mb-6">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center space-x-2 bg-[#2E89C4] text-white px-6 py-3 rounded-lg hover:bg-[#1B6EA1] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Basket to Compare</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {selectedBaskets.length}/3
              </span>
            </button>

            {showSelector && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableBaskets.map((basket) => (
                  <button
                    key={basket.id}
                    onClick={() => addBasket(basket)}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-[#2E89C4]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: basket.color }}
                      />
                      <span className="text-xs text-gray-500">{basket.riskPercentage}% Risk</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{basket.name}</h3>
                    <p className="text-sm text-gray-600">{basket.cagr5Y}% CAGR (5Y)</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparison View */}
        {selectedBaskets.length > 0 ? (
          <div className="space-y-6">
            {/* Basket Cards */}
            <div className={`grid grid-cols-1 ${selectedBaskets.length === 2 ? 'md:grid-cols-2' : selectedBaskets.length === 3 ? 'md:grid-cols-3' : ''} gap-6`}>
              {selectedBaskets.map((basket) => (
                <div key={basket.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div 
                    className="h-2"
                    style={{ backgroundColor: basket.color }}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{basket.name}</h2>
                        <p className="text-sm text-gray-600">{basket.ageRange}</p>
                      </div>
                      <button
                        onClick={() => removeBasket(basket.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">Experience Level</span>
                        <span className="font-semibold text-gray-900">{basket.experienceLevel}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 text-sm">Number of Funds</span>
                        <span className="font-semibold text-gray-900">{basket.funds.length}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigateTo('basket-details', basket.id)}
                      className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg transition-colors font-semibold"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics Comparison Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                        Metric
                      </th>
                      {selectedBaskets.map((basket) => (
                        <th key={basket.id} className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                          {basket.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* CAGR 3Y */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-gray-900">CAGR (3 Years)</span>
                      </td>
                      {selectedBaskets.map((basket) => {
                        const isHighest = basket.cagr3Y === Math.max(...selectedBaskets.map(b => b.cagr3Y || 0));
                        return (
                          <td key={basket.id} className={`px-6 py-4 text-center ${isHighest ? 'bg-green-50' : ''}`}>
                            <span className={`font-bold ${isHighest ? 'text-green-600' : 'text-gray-900'}`}>
                              {basket.cagr3Y || 'N/A'}%
                            </span>
                            {isHighest && <span className="ml-2 text-xs text-green-600">★ Best</span>}
                          </td>
                        );
                      })}
                    </tr>

                    {/* CAGR 5Y */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold text-gray-900">CAGR (5 Years)</span>
                      </td>
                      {selectedBaskets.map((basket) => {
                        const isHighest = basket.cagr5Y === Math.max(...selectedBaskets.map(b => b.cagr5Y || 0));
                        return (
                          <td key={basket.id} className={`px-6 py-4 text-center ${isHighest ? 'bg-blue-50' : ''}`}>
                            <span className={`font-bold ${isHighest ? 'text-blue-600' : 'text-gray-900'}`}>
                              {basket.cagr5Y || 'N/A'}%
                            </span>
                            {isHighest && <span className="ml-2 text-xs text-blue-600">★ Best</span>}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Risk Percentage */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold text-gray-900">Risk Level</span>
                      </td>
                      {selectedBaskets.map((basket) => {
                        const isLowest = basket.riskPercentage === Math.min(...selectedBaskets.map(b => b.riskPercentage));
                        return (
                          <td key={basket.id} className={`px-6 py-4 text-center ${isLowest ? 'bg-green-50' : ''}`}>
                            <span className={`font-bold ${isLowest ? 'text-green-600' : 'text-gray-900'}`}>
                              {basket.riskPercentage}%
                            </span>
                            {isLowest && <span className="ml-2 text-xs text-green-600">★ Lowest</span>}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Sharpe Ratio */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-gray-900">Sharpe Ratio</span>
                      </td>
                      {selectedBaskets.map((basket) => {
                        const isHighest = basket.sharpeRatio === Math.max(...selectedBaskets.map(b => b.sharpeRatio || 0));
                        return (
                          <td key={basket.id} className={`px-6 py-4 text-center ${isHighest ? 'bg-purple-50' : ''}`}>
                            <span className={`font-bold ${isHighest ? 'text-purple-600' : 'text-gray-900'}`}>
                              {basket.sharpeRatio || 'N/A'}
                            </span>
                            {isHighest && <span className="ml-2 text-xs text-purple-600">★ Best</span>}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Min Investment */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-gray-900">Min Investment</span>
                      </td>
                      {selectedBaskets.map((basket) => (
                        <td key={basket.id} className="px-6 py-4 text-center">
                          <span className="font-bold text-gray-900">₹{basket.minInvestment.toLocaleString()}</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button className="flex items-center space-x-2 bg-[#E8C23A] text-[#1B263B] px-6 py-3 rounded-lg hover:bg-[#d4b034] transition-colors font-semibold">
                <Download className="w-5 h-5" />
                <span>Export Comparison</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Baskets Selected</h3>
            <p className="text-gray-600 mb-6">Add 2-3 baskets to start comparing their performance and features</p>
            <button
              onClick={() => setShowSelector(true)}
              className="bg-[#2E89C4] text-white px-6 py-3 rounded-lg hover:bg-[#1B6EA1] transition-colors"
            >
              Add Your First Basket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
