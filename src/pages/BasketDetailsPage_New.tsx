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
  Award,
} from 'lucide-react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
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
  BarElement,
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

interface SectorAllocation {
  sector: string;
  percent: number;
}

interface TopHolding {
  stockName: string;
  percent: number;
  sector: string;
}

interface InvestmentPerformance {
  [key: string]: {
    allocation: number;
    returns1Y: number;
    returns3Y: number;
  };
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
  const sectorAllocation = (basket as any).sectorAllocation as SectorAllocation[] | undefined;
  const topHoldings = (basket as any).topHoldings as TopHolding[] | undefined;
  const investmentPerformance = (basket as any).investmentPerformance as InvestmentPerformance | undefined;

  /* ================= SECTOR PIE CHART ================= */
  const sectorPieData = {
    labels: sectorAllocation?.map((s) => s.sector) || [],
    datasets: [
      {
        data: sectorAllocation?.map((s) => s.percent) || [],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
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
          boxWidth: 15,
          padding: 15,
          font: { size: 12 },
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${value}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  /* ================= INVESTMENT PERFORMANCE BAR CHART ================= */
  const performanceData = investmentPerformance
    ? Object.entries(investmentPerformance).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        allocation: value.allocation,
        returns: value.returns3Y,
      }))
    : [];

  const performanceBarData = {
    labels: performanceData.map((p) => p.name),
    datasets: [
      {
        label: 'Allocation (%)',
        data: performanceData.map((p) => p.allocation),
        backgroundColor: '#3B82F6',
      },
      {
        label: '3Y Returns (%)',
        data: performanceData.map((p) => p.returns),
        backgroundColor: '#10B981',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  /* ================= PERFORMANCE LINE CHART ================= */
  const performanceLineData = {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [100, 105, 108, 112, 118, 125],
        borderColor: basket.color || '#2E89C4',
        backgroundColor: `${basket.color || '#2E89C4'}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Nifty 50',
        data: [100, 103, 106, 108, 112, 118],
        borderColor: '#94A3B8',
        backgroundColor: '#94A3B820',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

        {/* Fund Allocation Table */}
        {fundAllocations && fundAllocations.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Fund Allocation</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                      Fund Name
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                      Allocation
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fundAllocations.map((fund, idx) => {
                    const amount = (investmentAmount * fund.allocationPercent) / 100;
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-2">
                          <div className="text-sm font-medium text-gray-900">{fund.fundName}</div>
                          <div className="text-xs text-gray-500">{fund.category}</div>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-primary-100 text-primary-700">
                            {fund.allocationPercent}%
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right text-sm font-semibold text-success-700">
                          ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-4 px-2 text-center">
                          <button className="text-primary hover:text-primary-700 text-sm font-medium">
                            View More →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sector Allocation */}
          {sectorAllocation && sectorAllocation.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Sector-Wise Allocation</h3>
              </div>
              <div className="h-80">
                <Pie data={sectorPieData} options={pieOptions} />
              </div>
            </div>
          )}

          {/* Investment Performance */}
          {investmentPerformance && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-success" />
                <h3 className="text-lg font-bold">Investment Performance</h3>
              </div>
              <div className="h-80">
                <Bar data={performanceBarData} options={barOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Top Holdings */}
        {topHoldings && topHoldings.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-warning" />
              <h2 className="text-xl font-bold">Top Holdings</h2>
            </div>

            <div className="space-y-3">
              {topHoldings.map((holding, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{holding.stockName}</p>
                      <p className="text-xs text-gray-500">{holding.sector}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-success">{holding.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Trend */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-lg font-bold">Performance Comparison vs Nifty 50</h3>
          </div>
          <div className="h-80">
            <Line data={performanceLineData} options={lineOptions} />
          </div>
        </div>

        {/* Calculator Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Return Calculator</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Investment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInvestmentType('SIP')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    investmentType === 'SIP'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  SIP (Monthly)
                </button>
                <button
                  onClick={() => setInvestmentType('Lumpsum')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
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
            <div className="flex gap-2 flex-wrap">
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
          <div className="bg-gradient-to-r from-success-50 via-primary-50 to-warning-50 rounded-xl p-6 mb-4">
            <p className="text-center text-sm text-gray-600 mb-4">
              If you invest <strong>₹{projection.invested.toLocaleString('en-IN')}</strong> today, it grows to{' '}
              <strong className="text-primary">₹{projection.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>{' '}
              in <strong>{timeRange}</strong>
            </p>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Compared to SIP of ₹22,749 | CAGR expected at {projection.cagr}%</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Invested Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{projection.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Expected Returns</p>
                <p className="text-2xl font-bold text-success">
                  +₹{projection.returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{projection.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button onClick={handleAddToCart} className="btn btn-success w-full">
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
              <strong>Experience:</strong> {(basket as any).experienceLevel || 'All levels'}
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
