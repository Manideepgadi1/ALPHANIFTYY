import React, { useState } from 'react';
import { Calculator, TrendingUp, PiggyBank, DollarSign } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SIPCalculatorPage: React.FC = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [timePeriod, setTimePeriod] = useState<number>(10);

  // Calculate SIP returns
  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = timePeriod * 12;
    
    let futureValue: number;
    if (monthlyRate > 0) {
      futureValue = monthlyInvestment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    } else {
      futureValue = monthlyInvestment * months;
    }
    
    const investedAmount = monthlyInvestment * months;
    const estimatedReturns = futureValue - investedAmount;
    
    return {
      investedAmount,
      estimatedReturns,
      totalValue: futureValue
    };
  };

  const result = calculateSIP();
  const [serverResult, setServerResult] = useState<null | { investedAmount: number; estimatedReturns: number; totalValue: number }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callServer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await (await import('../services/api')).calculatorApi.calculateSIP({
        monthlyInvestment,
        annualReturn: expectedReturn,
        years: timePeriod,
      });

      if (res.status === 'success' && res.data) {
        setServerResult(res.data);
      } else {
        setError(res.message || 'Server error');
        setServerResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setServerResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate year-wise data for line chart
  const generateYearWiseData = () => {
    const years = [];
    const invested = [];
    const values = [];
    
    for (let year = 1; year <= timePeriod; year++) {
      const monthlyRate = expectedReturn / 12 / 100;
      const months = year * 12;
      const futureValue = monthlyInvestment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      const investedAmount = monthlyInvestment * months;
      
      years.push(`Year ${year}`);
      invested.push(investedAmount);
      values.push(futureValue);
    }
    
    return { years, invested, values };
  };

  const yearWiseData = generateYearWiseData();

  const displayed = serverResult ?? result;

  // Doughnut chart data
  const doughnutData = {
    labels: ['Invested Amount', 'Estimated Returns'],
    datasets: [
      {
        data: [displayed.investedAmount, displayed.estimatedReturns],
        backgroundColor: ['#2E89C4', '#3BAF4A'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 4,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
            weight: 'bold' as const
          },
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ₹${context.parsed.toLocaleString()}`;
          }
        }
      }
    }
  };

  // Line chart data
  const lineData = {
    labels: yearWiseData.years,
    datasets: [
      {
        label: 'Total Value',
        data: yearWiseData.values,
        borderColor: '#3BAF4A',
        backgroundColor: '#3BAF4A20',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Invested Amount',
        data: yearWiseData.invested,
        borderColor: '#2E89C4',
        backgroundColor: '#2E89C420',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 15,
          font: {
            size: 14,
            weight: 'bold' as const
          },
          usePointStyle: true
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + (value / 100000).toFixed(1) + 'L';
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SIP Calculator</h1>
          <p className="text-lg text-gray-600">
            Plan your Systematic Investment Plan and estimate your returns
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Investment Details</h2>
              
              {/* Monthly Investment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Investment
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                    className="input pl-8"
                    min="500"
                    step="500"
                  />
                </div>
                <input
                  type="range"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  min="500"
                  max="100000"
                  step="500"
                  className="w-full mt-3"
                />
              </div>

              {/* Expected Return Rate */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Annual Return (%)
                </label>
                <input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="input"
                  min="1"
                  max="30"
                  step="0.5"
                />
                <input
                  type="range"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  min="1"
                  max="30"
                  step="0.5"
                  className="w-full mt-3"
                />
              </div>

              {/* Time Period */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period (Years)
                </label>
                <input
                  type="number"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="input"
                  min="1"
                  max="40"
                  step="1"
                />
                <input
                  type="range"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  min="1"
                  max="40"
                  step="1"
                  className="w-full mt-3"
                />
              </div>
            
              <div className="mt-4">
                <button
                  onClick={callServer}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Calculating...' : 'Calculate (Server)'}
                </button>
                {error && <div className="text-sm text-danger mt-2">{error}</div>}
              </div>
          
              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Quick Presets</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setMonthlyInvestment(5000);
                      setExpectedReturn(12);
                      setTimePeriod(10);
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Beginner
                  </button>
                  <button
                    onClick={() => {
                      setMonthlyInvestment(10000);
                      setExpectedReturn(14);
                      setTimePeriod(15);
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Moderate
                  </button>
                  <button
                    onClick={() => {
                      setMonthlyInvestment(25000);
                      setExpectedReturn(15);
                      setTimePeriod(20);
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Aggressive
                  </button>
                  <button
                    onClick={() => {
                      setMonthlyInvestment(50000);
                      setExpectedReturn(12);
                      setTimePeriod(25);
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Retirement
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3 space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card p-6 border-l-4 border-primary">
                <div className="flex items-center gap-3 mb-2">
                  <PiggyBank className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-600">Invested Amount</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ₹{displayed.investedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="card p-6 border-l-4 border-success">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-gray-600">Estimated Returns</span>
                </div>
                <div className="text-3xl font-bold text-success">
                  ₹{displayed.estimatedReturns.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="card p-6 border-l-4 border-warning">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium text-gray-600">Total Value</span>
                </div>
                <div className="text-3xl font-bold text-warning">
                  ₹{displayed.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Wealth Breakdown</h3>
              <div className="h-80">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>

            {/* Line Chart */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Growth Over Time</h3>
              <div className="h-80">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            {/* Info Box */}
            <div className="card p-6 bg-primary-50 border border-primary-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding SIP</h3>
              <p className="text-gray-700 mb-4">
                A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly in mutual funds. 
                This disciplined approach helps you benefit from rupee cost averaging and the power of compounding.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Benefits</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Disciplined investing habit</li>
                    <li>• Rupee cost averaging</li>
                    <li>• Power of compounding</li>
                    <li>• Flexible investment amounts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Best For</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Long-term wealth creation</li>
                    <li>• Goal-based investing</li>
                    <li>• Salaried individuals</li>
                    <li>• First-time investors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPCalculatorPage;
