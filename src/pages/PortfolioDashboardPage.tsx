import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Download, Eye, ArrowLeft } from 'lucide-react';

interface PortfolioData {
  totalValue: number;
  totalGain: number;
  gainPercentage: number;
  invested: number;
  baskets: {
    name: string;
    value: number;
    invested: number;
    gain: number;
    gainPercentage: number;
    allocation: number;
  }[];
  performanceHistory: {
    date: string;
    value: number;
    nifty: number;
  }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const PortfolioDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 525000,
    totalGain: 75000,
    gainPercentage: 16.67,
    invested: 450000,
    baskets: [
      { name: 'Premium Aggressive', value: 185000, invested: 150000, gain: 35000, gainPercentage: 23.33, allocation: 35.24 },
      { name: 'Every Common India', value: 130000, invested: 120000, gain: 10000, gainPercentage: 8.33, allocation: 24.76 },
      { name: 'The Great India', value: 110000, invested: 100000, gain: 10000, gainPercentage: 10.00, allocation: 20.95 },
      { name: 'Balanced Premium', value: 65000, invested: 50000, gain: 15000, gainPercentage: 30.00, allocation: 12.38 },
      { name: 'Conservative Premium', value: 35000, invested: 30000, gain: 5000, gainPercentage: 16.67, allocation: 6.67 },
    ],
    performanceHistory: [
      { date: 'Jan', value: 450000, nifty: 450000 },
      { date: 'Feb', value: 462000, nifty: 454500 },
      { date: 'Mar', value: 478000, nifty: 463500 },
      { date: 'Apr', value: 485000, nifty: 468000 },
      { date: 'May', value: 495000, nifty: 477000 },
      { date: 'Jun', value: 515000, nifty: 481500 },
      { date: 'Jul', value: 525000, nifty: 490500 },
    ],
  });

  const pieData = portfolioData.baskets.map(basket => ({
    name: basket.name,
    value: basket.value,
    allocation: basket.allocation,
  }));

  const barData = portfolioData.baskets.map(basket => ({
    name: basket.name.split(' ')[0],
    invested: basket.invested,
    current: basket.value,
  }));

  const isPositiveGain = portfolioData.totalGain >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Dashboard</h1>
            <p className="text-gray-600">Track your investments and performance</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <Link to="/my-baskets" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
              <Eye className="w-4 h-4" />
              My Baskets
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Value</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">₹{portfolioData.totalValue.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Current Portfolio Value</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Invested</span>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">₹{portfolioData.invested.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Capital Deployed</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Gain/Loss</span>
              {isPositiveGain ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className={`text-3xl font-bold ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(portfolioData.totalGain).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {isPositiveGain ? 'Profit' : 'Loss'}: {portfolioData.gainPercentage}%
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm">Returns</span>
              <TrendingUp className="w-5 h-5 text-blue-100" />
            </div>
            <div className="text-3xl font-bold">+{portfolioData.gainPercentage}%</div>
            <div className="text-sm text-blue-100 mt-1">Overall Performance</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Asset Allocation Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Asset Allocation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name.split(' ')[0]}: ${entry.allocation.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Basket Performance Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basket Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="invested" fill="#9CA3AF" name="Invested" />
                <Bar dataKey="current" fill="#3B82F6" name="Current Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Performance Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio vs Nifty 50</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={portfolioData.performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} name="Your Portfolio" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="nifty" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Nifty 50 Benchmark" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Basket Details Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Basket Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Basket Name</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Invested</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Current Value</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Gain/Loss</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Returns</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolioData.baskets.map((basket, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium text-gray-900">{basket.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">₹{basket.invested.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">₹{basket.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={basket.gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {basket.gain >= 0 ? '+' : ''}₹{basket.gain.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${basket.gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {basket.gainPercentage >= 0 ? '+' : ''}{basket.gainPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">{basket.allocation.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboardPage;
