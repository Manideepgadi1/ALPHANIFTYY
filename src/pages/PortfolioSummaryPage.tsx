import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, PieChart, Calendar, Download } from 'lucide-react';
import { portfolioApi, Portfolio } from '../services/api';
import { Line } from 'react-chartjs-2';

const PortfolioSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await portfolioApi.get();
        if (response.status === 'success' && response.data) {
          setPortfolio(response.data);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load portfolio</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: portfolio.performance.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: portfolio.performance.values,
        borderColor: '#2E89C4',
        backgroundColor: '#2E89C420',
        fill: true,
        tension: 0.4,
      },
    ],
  };

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

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Portfolio Summary</h1>
          <button className="btn btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-2">Total Value</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{portfolio.totalValue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-2">Invested</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{portfolio.invested.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-2">Returns</p>
            <p className="text-3xl font-bold text-success flex items-center gap-2">
              {portfolio.returns >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6 text-error" />
              )}
              ₹{Math.abs(portfolio.returns).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-2">Returns %</p>
            <p className={`text-3xl font-bold ${portfolio.returnsPercent >= 0 ? 'text-success' : 'text-error'}`}>
              {portfolio.returnsPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Performance Trend</h2>
          <div className="h-80">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Holdings */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Holdings</h2>
          <div className="space-y-4">
            {portfolio.holdings.map((holding, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{holding.basketName}</h3>
                  <p className="text-sm text-gray-600">
                    Invested: ₹{holding.invested.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{holding.current.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-sm ${holding.returnsPercent >= 0 ? 'text-success' : 'text-error'}`}>
                    {holding.returnsPercent >= 0 ? '+' : ''}{holding.returnsPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active SIPs */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Active SIPs</h2>
          <div className="space-y-4">
            {portfolio.sips.map((sip, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{sip.basketName}</h3>
                  <p className="text-sm text-gray-600">{sip.frequency}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{sip.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Next: {sip.nextDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummaryPage;
