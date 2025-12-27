import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ShoppingCart, ArrowLeft, Loader, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { Line, Pie, Doughnut } from 'react-chartjs-2';
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

import { basketApi, Basket as ApiBasket, cartApi } from '../services/api';
import useCart from '../context/CartContext';

/* ================= CHART REGISTER ================= */
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

/* ================= TYPES ================= */
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

interface PerformancePoint {
  label: string;
  portfolioValue: number;
  niftyValue: number;
}

/* ================= COMPONENT ================= */
const BasketDetailsPage: React.FC = () => {
  const { id } = useParams();
  const basketId = id; // Keep as string since IDs are like "b1", "b2", etc.
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [basket, setBasket] = useState<ApiBasket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [investmentType, setInvestmentType] = useState<'SIP' | 'Lumpsum'>('SIP');
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y' | '10Y'>('5Y');

  /* ================= FETCH BASKET ================= */
  useEffect(() => {
    if (!basketId) return;

    const fetchBasket = async () => {
      try {
        setLoading(true);
        const res = await basketApi.getById(basketId);
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
  }, [basketId]);

  /* ================= FETCH PERFORMANCE ================= */
  useEffect(() => {
    if (!basketId) return;

    const fetchPerformance = async () => {
      try {
        setPerformanceLoading(true);
        const res = await fetch(
          `http://127.0.0.1:5000/api/baskets/${basketId}/excel-performance?period=${timeRange}`
        );
        const json = await res.json();
        setPerformanceData(json?.data?.performance || []);
      } catch {
        setPerformanceData([]);
      } finally {
        setPerformanceLoading(false);
      }
    };

    fetchPerformance();
  }, [basketId, timeRange]);

  /* ================= LOADING / ERROR ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-primary" />
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

  /* ================= SAFE OPTIONAL DATA ================= */
  const fundAllocations = (basket as any).fundAllocations as FundAllocation[] | undefined;
  const sectorAllocation = (basket as any).sectorAllocation as SectorAllocation[] | undefined;
  const topHoldings = (basket as any).topHoldings as TopHolding[] | undefined;

  /* ================= PROJECTION CALCULATIONS ================= */
  const years =
    timeRange === '1Y' ? 1 :
    timeRange === '3Y' ? 3 :
    timeRange === '5Y' ? 5 : 10;

  const cagr = basket.cagr5Y || 12;

  const projection =
    investmentType === 'SIP'
      ? (() => {
          const r = cagr / 100 / 12;
          const n = years * 12;
          const fv =
            investmentAmount *
            (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
          return {
            invested: investmentAmount * n,
            total: fv,
            returns: fv - investmentAmount * n,
          };
        })()
      : (() => {
          const fv = investmentAmount * Math.pow(1 + cagr / 100, years);
          return {
            invested: investmentAmount,
            total: fv,
            returns: fv - investmentAmount,
          };
        })();

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!basketId) return;
    
    try {
      const res = await cartApi.add({
        userId: 'guest',
        basketId,
        investmentType,
        amount: investmentAmount,
        frequency: investmentType === 'SIP' ? 'Monthly' : undefined,
      });

      if (res.status === 'success') {
        await refreshCart();
        alert('Basket added to cart');
      } else {
        alert(res.message || 'Failed to add to cart');
      }
    } catch {
      alert('Error adding to cart');
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">

        {/* Back */}
        <button
          onClick={() => navigate('/explore-baskets')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Baskets
        </button>

        {/* Header */}
        <div className="card p-8 mb-6">
          <div className="flex gap-6 items-start">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: basket.color }}
            >
              <Layers className="w-12 h-12 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{basket.name}</h1>
              <p className="text-gray-600 mb-4">{basket.description}</p>
              
              <div className="flex gap-6 flex-wrap">
                <div>
                  <p className="text-sm text-gray-500">Risk Level</p>
                  <p className="font-semibold">{basket.risk || basket.riskLevel || 'Medium'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Min Investment</p>
                  <p className="font-semibold text-primary">₹{basket.minInvestment.toLocaleString('en-IN')}</p>
                </div>
                {basket.cagr5Y && (
                  <div>
                    <p className="text-sm text-gray-500">5Y CAGR</p>
                    <p className="font-semibold text-green-600">{basket.cagr5Y}%</p>
                  </div>
                )}
                {basket.cagr3Y && (
                  <div>
                    <p className="text-sm text-gray-500">3Y CAGR</p>
                    <p className="font-semibold text-green-600">{basket.cagr3Y}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        {performanceData && performanceData.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Trend
              </h2>
              <div className="flex gap-2">
                {(['1Y', '3Y', '5Y', '10Y'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm ${
                      timeRange === range
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            {performanceLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="h-64">
                <Line
                  data={{
                    labels: performanceData.map(p => p.label),
                    datasets: [
                      {
                        label: basket.name,
                        data: performanceData.map(p => p.portfolioValue),
                        borderColor: basket.color || '#2E89C4',
                        backgroundColor: `${basket.color || '#2E89C4'}20`,
                        fill: true,
                        tension: 0.4,
                      },
                      {
                        label: 'Nifty 50',
                        data: performanceData.map(p => p.niftyValue),
                        borderColor: '#EF4444',
                        backgroundColor: '#EF444420',
                        fill: true,
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const },
                      tooltip: { mode: 'index', intersect: false },
                    },
                    scales: {
                      y: { beginAtZero: false },
                    },
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Charts Row - Sector and Fund Allocation */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Sector Allocation */}
          {sectorAllocation && sectorAllocation.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Sector Allocation
              </h2>
              <div className="h-64">
                <Pie
                  data={{
                    labels: sectorAllocation.map(s => s.sector),
                    datasets: [
                      {
                        data: sectorAllocation.map(s => s.percent),
                        backgroundColor: [
                          '#3B82F6',
                          '#10B981',
                          '#F59E0B',
                          '#EF4444',
                          '#8B5CF6',
                          '#EC4899',
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right' as const },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Fund Allocation */}
          {fundAllocations && fundAllocations.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Fund Allocation
              </h2>
              <div className="space-y-3">
                {fundAllocations.map((fund, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{fund.fundName}</span>
                      <span className="text-gray-600">{fund.allocationPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${fund.allocationPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Holdings */}
        {topHoldings && topHoldings.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Top Holdings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Stock</th>
                    <th className="text-left py-3 px-2">Sector</th>
                    <th className="text-right py-3 px-2">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {topHoldings.map((holding, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-3 px-2 font-medium">{holding.stockName}</td>
                      <td className="py-3 px-2 text-gray-600">{holding.sector}</td>
                      <td className="py-3 px-2 text-right font-semibold">{holding.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* About This Basket */}
        {(basket.philosophy || basket.rationale || basket.suitableFor) && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">About This Basket</h2>
            
            {basket.philosophy && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary mb-2">Investment Philosophy</h3>
                <p className="text-gray-700">{basket.philosophy}</p>
              </div>
            )}
            
            {basket.rationale && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary mb-2">Strategy & Rationale</h3>
                <p className="text-gray-700">{basket.rationale}</p>
              </div>
            )}
            
            {basket.suitableFor && (
              <div className="mb-4">
                <h3 className="font-semibold text-primary mb-2">Suitable For</h3>
                <p className="text-gray-700">{basket.suitableFor}</p>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
              {basket.timeHorizon && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time Horizon</p>
                  <p className="font-semibold">{basket.timeHorizon}</p>
                </div>
              )}
              {basket.experienceLevel && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Experience Level</p>
                  <p className="font-semibold">{basket.experienceLevel}</p>
                </div>
              )}
              {basket.rebalancingFrequency && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rebalancing</p>
                  <p className="font-semibold">{basket.rebalancingFrequency}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Investment Goals */}
        {basket.goals && basket.goals.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Investment Goals</h2>
            <div className="flex flex-wrap gap-2">
              {basket.goals.map((goal, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Risk Metrics */}
        {(basket.sharpeRatio || basket.riskPercentage) && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Risk Metrics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {basket.sharpeRatio && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Sharpe Ratio</p>
                  <p className="text-2xl font-bold text-primary">{basket.sharpeRatio}</p>
                  <p className="text-xs text-gray-500 mt-1">Risk-adjusted return</p>
                </div>
              )}
              {basket.riskPercentage && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Volatility</p>
                  <p className="text-2xl font-bold text-orange-600">{basket.riskPercentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">Standard deviation</p>
                </div>
              )}
              {basket.riskLevel && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                  <p className={`text-2xl font-bold ${
                    basket.riskLevel === 'High' ? 'text-red-600' : 
                    basket.riskLevel === 'Medium' ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>{basket.riskLevel}</p>
                  <p className="text-xs text-gray-500 mt-1">Overall risk rating</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Investment Calculator */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Investment Calculator</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Investment Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInvestmentType('SIP')}
                  className={`flex-1 py-2 px-4 rounded transition-colors ${
                    investmentType === 'SIP'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  SIP
                </button>
                <button
                  onClick={() => setInvestmentType('Lumpsum')}
                  className={`flex-1 py-2 px-4 rounded transition-colors ${
                    investmentType === 'Lumpsum'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Lumpsum
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Horizon</label>
              <div className="flex gap-2">
                {(['1Y', '3Y', '5Y', '10Y'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`flex-1 py-2 px-4 rounded text-sm transition-colors ${
                      timeRange === range
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {investmentType === 'SIP' ? 'Monthly' : 'Investment'} Amount
            </label>
            <input
              type="number"
              min={basket.minInvestment}
              step={500}
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="input w-full"
            />
          </div>

          {/* Projection Results */}
          <div className="grid md:grid-cols-3 gap-4 my-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                {investmentType === 'SIP' ? 'Total Invested' : 'Principal'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{projection.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Expected Returns</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{projection.returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-primary">
                ₹{projection.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4 text-center">
            Based on {cagr}% expected annual return over {years} year{years > 1 ? 's' : ''}
          </p>

          {/* Investment Breakdown */}
          {fundAllocations && fundAllocations.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Fund-wise Allocation</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {fundAllocations.map((fund, idx) => {
                  const amount = (investmentAmount * fund.allocationPercent) / 100;
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{fund.fundName}</span>
                      <span className="font-semibold">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={handleAddToCart} className="btn btn-success w-full">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart - ₹{investmentAmount.toLocaleString('en-IN')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BasketDetailsPage;
