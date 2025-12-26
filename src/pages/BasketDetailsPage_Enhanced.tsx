import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  ShoppingCart,
  ArrowLeft,
  Info,
  Target,
  Loader,
  TrendingUp,
  Clock,
  Shield,
  Users,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { basketApi, Basket as ApiBasket } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FundAllocation {
  fundId: string;
  fundName: string;
  allocationPercent: number;
  category: string;
}

const BasketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [basket, setBasket] = useState<ApiBasket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
  const [investmentType, setInvestmentType] = useState<'SIP' | 'Lumpsum'>('SIP');
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y' | '10Y'>('5Y');

  useEffect(() => {
    if (!id) return;

    const fetchBasket = async () => {
      try {
        setLoading(true);
        const res = await basketApi.getById(id);
        if (res.status === 'success' && res.data) {
          setBasket(res.data);
        } else {
          setError(res.message || 'Basket not found');
        }
      } catch {
        setError('Unable to load basket details');
      } finally {
        setLoading(false);
      }
    };

    fetchBasket();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!basket || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/explore-baskets')} className="btn btn-primary">
            Back to Baskets
          </button>
        </div>
      </div>
    );
  }

  const fundAllocations = (basket as any).fundAllocations as FundAllocation[] | undefined;

  /* ================= PERFORMANCE CHART ================= */
  const chartData = {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    datasets: [
      {
        label: basket.name,
        data: [100, 105, 108, 112, 118, 125],
        borderColor: basket.color || '#2E89C4',
        backgroundColor: `${basket.color || '#2E89C4'}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleFont: { size: 14, weight: 700 as const },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: '#f0f0f0' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  /* ================= ALLOCATION PIE CHART ================= */
  const pieData = {
    labels: fundAllocations?.map((f) => f.category) || ['Fund 1', 'Fund 2', 'Fund 3'],
    datasets: [
      {
        data: fundAllocations?.map((f) => f.allocationPercent) || [40, 35, 25],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: { size: 12 },
        },
      },
    },
  };

  /* ================= CALCULATIONS ================= */
  const calculateReturns = () => {
    const years = timeRange === '1Y' ? 1 : timeRange === '3Y' ? 3 : timeRange === '5Y' ? 5 : 10;
    const cagr =
      timeRange === '1Y'
        ? basket.cagr1Y || 15
        : timeRange === '3Y'
        ? basket.cagr3Y || 14
        : basket.cagr5Y || 13;

    if (investmentType === 'SIP') {
      const monthlyReturn = cagr / 100 / 12;
      const months = years * 12;
      const futureValue =
        investmentAmount *
        (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn));
      const invested = investmentAmount * months;
      const returns = futureValue - invested;

      return { invested, returns, totalValue: futureValue, cagr };
    } else {
      const futureValue = investmentAmount * Math.pow(1 + cagr / 100, years);
      const returns = futureValue - investmentAmount;

      return { invested: investmentAmount, returns, totalValue: futureValue, cagr };
    }
  };

  const projection = calculateReturns();

  const handleAddToCart = () => {
    alert(`Added ₹${investmentAmount.toLocaleString('en-IN')} (${investmentType}) to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        {/* Back Button */}
        <button
          onClick={() => navigate('/explore-baskets')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Baskets
        </button>

        {/* Header Card */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: basket.color }}
            >
              <Layers className="w-12 h-12 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{basket.name}</h1>
              <p className="text-gray-600 mb-4">{basket.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{basket.timeHorizon || '5+ years'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Risk: {basket.riskLevel || 'Medium'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {(basket as any).ageRange || 'All ages'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {(basket as any).rebalancingFrequency || 'Quarterly'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 text-center min-w-[180px]">
              <p className="text-sm text-gray-600 mb-1">Min Investment</p>
              <p className="text-2xl font-bold text-primary">
                ₹{basket.minInvestment.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-sm text-gray-600 mb-1">1Y CAGR</p>
            <p className="text-2xl font-bold text-success">{basket.cagr1Y || 0}%</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 mb-1">3Y CAGR</p>
            <p className="text-2xl font-bold text-success">{basket.cagr3Y || 0}%</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 mb-1">5Y CAGR</p>
            <p className="text-2xl font-bold text-success">{basket.cagr5Y || 0}%</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 mb-1">Sharpe Ratio</p>
            <p className="text-2xl font-bold text-primary">{basket.sharpeRatio || 'N/A'}</p>
          </div>
        </div>

        {/* Fund Allocation */}
        {fundAllocations && fundAllocations.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Fund Allocation</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                      Fund Name
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                      Allocation
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fundAllocations.map((fund, idx) => {
                    const amount = (investmentAmount * fund.allocationPercent) / 100;
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm text-gray-900">{fund.fundName}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                            {fund.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-sm font-semibold text-primary">
                          {fund.allocationPercent}%
                        </td>
                        <td className="py-3 px-2 text-right text-sm font-semibold text-gray-900">
                          ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Asset Allocation Pie */}
          {fundAllocations && fundAllocations.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Asset Allocation</h3>
              </div>
              <div className="h-64">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          )}

          {/* Performance Chart */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="text-lg font-bold">Performance Trend</h3>
            </div>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Calculator Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Investment Calculator</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Investment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInvestmentType('SIP')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    investmentType === 'SIP'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  SIP (Monthly)
                </button>
                <button
                  onClick={() => setInvestmentType('Lumpsum')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    investmentType === 'Lumpsum'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lumpsum
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {investmentType === 'SIP' ? 'Monthly Amount' : 'Investment Amount'}
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="input w-full"
                min={basket.minInvestment}
                step={1000}
              />
            </div>
          </div>

          {/* Time Range Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <div className="flex gap-2">
              {(['1Y', '3Y', '5Y', '10Y'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === period
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Projection Results */}
          <div className="bg-gradient-to-r from-success-50 to-primary-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Invested Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{projection.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Expected Returns</p>
                <p className="text-2xl font-bold text-success">
                  +₹{projection.returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{projection.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              * Based on {projection.cagr}% CAGR. Past performance is not indicative of future
              results.
            </p>
          </div>

          {/* Add to Cart Button */}
          <button onClick={handleAddToCart} className="btn btn-success w-full mt-6">
            <ShoppingCart className="w-5 h-5" />
            Assign & Add to Cart
          </button>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Investment Philosophy</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {(basket as any).philosophy || 'Long-term growth with disciplined investing.'}
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-success" />
              <h3 className="text-lg font-semibold">Best Suited For</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {(basket as any).suitableFor || 'Investors with medium to long-term goals.'}
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold">Investor Profile</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              <strong>Experience Level:</strong> {(basket as any).experienceLevel || 'All levels'}
              <br />
              <strong>Age Range:</strong> {(basket as any).ageRange || 'All ages'}
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-danger" />
              <h3 className="text-lg font-semibold">Financial Goals</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {((basket as any).goals as string[] || ['Wealth Creation']).map((goal, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketDetailsPage;
