import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Bell,
  Loader
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
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
  Filler
} from 'chart.js';
import { portfolioApi, Portfolio } from '../services/api';

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

/* =====================================================
   GOALS (UI-ONLY DATA)
===================================================== */
const GOALS = [
  { name: 'Retirement Fund', target: 10000000, current: 525000, deadline: '2045-12-31' },
  { name: 'Child Education', target: 2000000, current: 350000, deadline: '2030-06-30' },
  { name: 'Dream Home', target: 5000000, current: 800000, deadline: '2028-12-31' }
];

const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
     FETCH DATA
  ===================================================== */
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await portfolioApi.get('demo-user');

        if (response.status === 'success' && response.data) {
          setPortfolio(response.data);
        } else {
          setError(response.message || 'Failed to load portfolio');
        }
      } catch {
        setError('Unable to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  /* =====================================================
     LOADING / ERROR
  ===================================================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center pt-32">
        <Loader className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     CHART DATA
  ===================================================== */
  const performanceData = {
    labels: portfolio.performance.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: portfolio.performance.values,
        borderColor: '#2E89C4',
        backgroundColor: 'rgba(46,137,196,0.12)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const allocationData = {
    labels: portfolio.holdings.map(h => h.basketName),
    datasets: [
      {
        data: portfolio.holdings.map(h => h.current),
        backgroundColor: ['#2E89C4', '#3BAF4A', '#E8C23A', '#FF6B35'],
        borderWidth: 0
      }
    ]
  };

  // Use portfolio goals if provided by API; fall back to static UI goals
  const goalsLocal = (portfolio as any).goals ?? GOALS;

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Portfolio Dashboard</h1>
            <p className="text-gray-600">Track your investments and performance</p>
          </div>
          <button className="btn btn-outline flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Total Value" value={`₹${(portfolio.totalValue / 1e5).toFixed(2)}L`} />
          <SummaryCard title="Invested" value={`₹${(portfolio.invested / 1e5).toFixed(2)}L`} />
          <SummaryCard title="Returns" value={`₹${(portfolio.returns / 1e3).toFixed(0)}K`} />
          <SummaryCard title="Next SIP" value="₹22.5K" subtitle="Feb 1, 2024" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Portfolio Performance">
              <div className="flex gap-2 mb-4">
                {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-4 py-2 rounded-lg ${
                      timeRange === r ? 'bg-primary text-white' : 'bg-gray-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="h-80">
                <Line data={performanceData} />
              </div>
            </Card>

            <Card title="Holdings">
              {portfolio.holdings.map((h, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between">
                    <strong>{h.basketName}</strong>
                    <span>₹{h.current.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="bg-primary h-2 rounded"
                      style={{ width: `${(h.current / h.invested) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <Card title="Asset Allocation">
              <div className="h-64">
                <Doughnut data={allocationData} />
              </div>
            </Card>

            <Card title="Goals Progress">
              {goalsLocal.map((g: any, i: number) => {
                const progress = (g.current / g.target) * 100;
                return (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        {g.name}
                      </span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div
                        className="bg-primary h-2 rounded"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   SMALL REUSABLE COMPONENTS
===================================================== */
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    {children}
  </div>
);

const SummaryCard: React.FC<{ title: string; value: string; subtitle?: string }> = ({
  title,
  value,
  subtitle
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

export default DashboardPage;
