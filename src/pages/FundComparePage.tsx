import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, ArrowLeft, Plus, X, Filter, Download } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? 'http://localhost:5000/api'
    : 'https://app.vsfintech.in/alphanifty/api'
);

interface Fund {
  code: string;
  name: string;
  age: string;
  category: string;
  amc: string;
  returns1Y: string;
  returns3Y: string;
  returns5Y: string;
}

const FundComparePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allFunds, setAllFunds] = useState<Fund[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<Fund[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<Fund[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [amcFilter, setAmcFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('5Y');
  const [showFundSelector, setShowFundSelector] = useState(false);

  // Fetch funds from API
  useEffect(() => {
    const fetchFunds = async () => {
      try {
        console.log('Fetching funds from backend...');
        const response = await fetch(`${API_BASE_URL}/mutual-funds`);
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);
        console.log('Has data?', result.data ? `Yes, ${result.data.length} items` : 'No');
        
        if ((result.status === 'success' || result.status === 200) && result.data) {
          const funds: Fund[] = result.data.map((item: any[]) => {
            const fundName = item[1];
            // Extract AMC name (everything before first '(' or before plan type keywords)
            const amcMatch = fundName.match(/^(.+?)(?:\s*\(|(?:\s+-\s+(?:Reg|Direct|Plan|Fund)))/);
            const amc = amcMatch ? amcMatch[1].trim() : fundName.split(' ').slice(0, 3).join(' ');
            
            return {
              code: item[0],
              name: fundName,
              age: item[2],
              category: item[3],
              amc: amc,
              returns1Y: item[4],
              returns3Y: item[5],
              returns5Y: item[6]
            };
          });
          
          console.log('Mapped funds:', funds.length);
          setAllFunds(funds);
          setFilteredFunds(funds);
          
          // Load initial fund from URL params
          const initialFundId = searchParams.get('funds');
          if (initialFundId && funds.length > 0) {
            const initialFund = funds.find(f => f.code === initialFundId);
            if (initialFund) {
              setSelectedFunds([initialFund]);
            }
          }
        } else {
          console.error('Invalid response format:', result);
        }
      } catch (error) {
        console.error('Error fetching funds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunds();
  }, [searchParams]);

  // Filter funds based on search and category
  useEffect(() => {
    let filtered = allFunds;

    if (searchTerm) {
      filtered = filtered.filter(fund =>
        fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fund.code.includes(searchTerm)
      );
    }

    if (categoryFilter && categoryFilter !== 'All') {
      filtered = filtered.filter(fund => fund.category === categoryFilter);
    }

    if (amcFilter && amcFilter !== 'All') {
      filtered = filtered.filter(fund => fund.amc === amcFilter);
    }

    setFilteredFunds(filtered);
  }, [searchTerm, categoryFilter, amcFilter, allFunds]);

  // Get unique categories and AMCs
  const categories = ['All', ...Array.from(new Set(allFunds.map(f => f.category))).sort()];
  const amcs = ['All', ...Array.from(new Set(allFunds.map(f => f.amc))).filter(amc => amc).sort()];

  // Add fund to comparison
  const addFund = (fund: Fund) => {
    if (selectedFunds.length < 5 && !selectedFunds.find(f => f.code === fund.code)) {
      setSelectedFunds([...selectedFunds, fund]);
    }
  };

  // Remove fund from comparison
  const removeFund = (code: string) => {
    setSelectedFunds(selectedFunds.filter(f => f.code !== code));
  };

  // Generate normalized chart data (all start from 100)
  const generateChartData = () => {
    if (selectedFunds.length === 0) return [];

    const periods: { [key: string]: number } = {
      '6M': 0.5,
      '1Y': 1,
      '2Y': 2,
      '3Y': 3,
      '5Y': 5,
      '7Y': 7,
      '10Y': 10
    };

    const years = periods[timePeriod];
    const dataPoints = Math.min(Math.floor(years * 12), 120); // Monthly data points
    const data = [];

    // Benchmark (Nifty 50) returns - approximate historical data
    const nifty50Returns: { [key: string]: number } = {
      '6M': 8,
      '1Y': 12,
      '2Y': 13,
      '3Y': 14,
      '5Y': 15,
      '7Y': 13,
      '10Y': 12
    };

    const benchmarkReturn = nifty50Returns[timePeriod] || 12;

    for (let i = 0; i <= dataPoints; i++) {
      const point: any = {
        month: `Month ${i}`,
        monthIndex: i
      };

      // Calculate average return of selected funds
      let totalReturn = 0;
      let validFunds = 0;

      selectedFunds.forEach(fund => {
        let annualReturn = 0;
        if (years >= 5) {
          annualReturn = parseFloat(fund.returns5Y) || 0;
        } else if (years >= 3) {
          annualReturn = parseFloat(fund.returns3Y) || 0;
        } else {
          annualReturn = parseFloat(fund.returns1Y) || 0;
        }
        
        if (annualReturn > 0) {
          totalReturn += annualReturn;
          validFunds++;
        }
      });

      const avgReturn = validFunds > 0 ? totalReturn / validFunds : 0;

      // Calculate basket value (average of all selected funds)
      const basketMonthlyRate = avgReturn / 100 / 12;
      const basketValue = 100 * Math.pow(1 + basketMonthlyRate, i);
      point['basket'] = parseFloat(basketValue.toFixed(2));

      // Calculate Nifty 50 benchmark value
      const benchmarkMonthlyRate = benchmarkReturn / 100 / 12;
      const benchmarkValue = 100 * Math.pow(1 + benchmarkMonthlyRate, i);
      point['nifty50'] = parseFloat(benchmarkValue.toFixed(2));

      data.push(point);
    }

    return data;
  };

  const chartData = generateChartData();

  // Colors for different funds
  const colors = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                Fund Comparison Tool
              </h1>
              <p className="mt-2 text-blue-100">
                Compare up to 5 mutual funds with interactive charts
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Total Funds Available</div>
              <div className="text-3xl font-bold">{allFunds.length.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selected Funds Summary */}
        {selectedFunds.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Selected Funds ({selectedFunds.length}/5)
              </h2>
              <button
                onClick={() => setShowFundSelector(!showFundSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add More Funds
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFunds.map((fund, index) => (
                <div
                  key={fund.code}
                  className="relative p-4 border-2 rounded-lg"
                  style={{ borderColor: colors[index] }}
                >
                  <button
                    onClick={() => removeFund(fund.code)}
                    className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                  <div className="pr-8">
                    <div
                      className="w-3 h-3 rounded-full mb-2"
                      style={{ backgroundColor: colors[index] }}
                    />
                    <h3 className="font-semibold text-sm text-gray-900 mb-2">
                      {fund.name}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-500">1Y</div>
                        <div className="font-semibold text-green-600">{fund.returns1Y}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">3Y</div>
                        <div className="font-semibold text-green-600">{fund.returns3Y}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">5Y</div>
                        <div className="font-semibold text-green-600">{fund.returns5Y}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Section */}
        {selectedFunds.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Normalized Performance (Base 100)
              </h2>
              <div className="flex gap-2">
                {['6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      timePeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="monthIndex"
                    label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    label={{ value: 'Value (Base 100)', angle: -90, position: 'insideLeft' }}
                    stroke="#6b7280" 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelFormatter={(value) => `Month ${value}`}
                    formatter={(value: any, name: any) => {
                      if (name === 'nifty50') {
                        return [`${value.toFixed(2)}`, 'Nifty 50 (Benchmark)'];
                      } else if (name === 'basket') {
                        return [`${value.toFixed(2)}`, 'My Basket'];
                      }
                      return [`${value.toFixed(2)}`, name];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === 'nifty50') return 'Nifty 50 (Benchmark)';
                      if (value === 'basket') return 'My Basket';
                      return value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="basket"
                    name="My Basket"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nifty50"
                    name="Nifty 50 (Benchmark)"
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> The blue line shows your basket (average of selected funds) vs the red dashed line showing Nifty 50 benchmark.
                Both start from base value of 100 for easy comparison. The chart shows relative performance over the selected time period.
              </p>
            </div>
          </div>
        )}

        {/* Fund Selector */}
        {(showFundSelector || selectedFunds.length === 0) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedFunds.length === 0 ? 'Select Funds to Compare' : 'Add More Funds'}
              </h2>
              {selectedFunds.length > 0 && (
                <button
                  onClick={() => setShowFundSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AMC</label>
                <select
                  value={amcFilter}
                  onChange={(e) => setAmcFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {amcs.map((amc) => (
                    <option key={amc} value={amc}>
                      {amc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Fund List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading funds...</p>
                </div>
              ) : filteredFunds.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No funds found matching your criteria</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFunds.slice(0, 100).map((fund) => {
                    const isSelected = selectedFunds.find(f => f.code === fund.code);
                    const canAdd = selectedFunds.length < 5;

                    return (
                      <div
                        key={fund.code}
                        className={`p-4 border rounded-lg transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{fund.name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                Code: {fund.code}
                              </span>
                              <span>{fund.category}</span>
                              <span>{fund.age} months old</span>
                            </div>
                            <div className="flex gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-gray-500">1Y: </span>
                                <span className="font-semibold text-green-600">
                                  {fund.returns1Y}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">3Y: </span>
                                <span className="font-semibold text-green-600">
                                  {fund.returns3Y}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">5Y: </span>
                                <span className="font-semibold text-green-600">
                                  {fund.returns5Y}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => isSelected ? removeFund(fund.code) : addFund(fund)}
                            disabled={!isSelected && !canAdd}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              isSelected
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : canAdd
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isSelected ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundComparePage;
