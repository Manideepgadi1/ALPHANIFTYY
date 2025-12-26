import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

const GoalCalculatorPage: React.FC = () => {
  const [goalName, setGoalName] = useState<string>('Retirement');
  const [targetAmount, setTargetAmount] = useState<number>(10000000);
  const [yearsToGoal, setYearsToGoal] = useState<number>(20);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [existingInvestment, setExistingInvestment] = useState<number>(500000);

  // Calculate goal-based investment
  const calculateGoal = () => {
    // Future value of existing investment
    const futureValueExisting = existingInvestment * Math.pow(1 + expectedReturn / 100, yearsToGoal);
    
    // Remaining amount needed
    const remainingAmount = targetAmount - futureValueExisting;
    
    if (remainingAmount <= 0) {
      return {
        requiredMonthlySIP: 0,
        futureValueExisting,
        shortfall: 0,
        isGoalAchievable: true,
        message: 'Your existing investment is sufficient to meet the goal!'
      };
    }
    
    // Calculate required monthly SIP
    const monthlyRate = expectedReturn / 12 / 100;
    const months = yearsToGoal * 12;
    
    let requiredSIP: number;
    if (monthlyRate > 0) {
      requiredSIP = remainingAmount * monthlyRate / (((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)));
    } else {
      requiredSIP = remainingAmount / months;
    }
    
    return {
      requiredMonthlySIP: requiredSIP,
      futureValueExisting,
      shortfall: remainingAmount,
      isGoalAchievable: true,
      message: `You need to invest ₹${requiredSIP.toLocaleString(undefined, { maximumFractionDigits: 0 })} monthly`
    };
  };

  const result = calculateGoal();
  const [serverResult, setServerResult] = useState<null | { requiredMonthlySIP: number; futureValueOfExisting: number; additionalRequired: number; message?: string }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callServer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await (await import('../services/api')).calculatorApi.calculateGoal({
        targetAmount,
        years: yearsToGoal,
        annualReturn: expectedReturn,
        existingInvestment,
      });

      if (res.status === 'success' && res.data) {
        setServerResult({
          requiredMonthlySIP: (res.data as any).requiredMonthlySIP,
          futureValueOfExisting: (res.data as any).futureValueOfExisting || (res.data as any).futureValueOfExisting === 0 ? (res.data as any).futureValueOfExisting : (res.data as any).futureValueOfExisting,
          additionalRequired: (res.data as any).additionalRequired || (res.data as any).additionalRequired === 0 ? (res.data as any).additionalRequired : (res.data as any).additionalRequired,
          message: (res.data as any).message,
        });
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

  // Predefined goals
  const predefinedGoals = [
    { name: 'Retirement', amount: 10000000, years: 20 },
    { name: 'Child Education', amount: 2500000, years: 15 },
    { name: 'Buy Home', amount: 5000000, years: 10 },
    { name: 'Wedding', amount: 2000000, years: 8 },
    { name: 'Vacation', amount: 500000, years: 3 },
    { name: 'Emergency Fund', amount: 1000000, years: 5 }
  ];

  // Bar chart data
  const displayed = serverResult
    ? {
        requiredMonthlySIP: serverResult.requiredMonthlySIP,
        futureValueExisting: serverResult.futureValueOfExisting,
        shortfall: serverResult.additionalRequired,
        isGoalAchievable: serverResult.requiredMonthlySIP === 0,
        message: serverResult.message || ''
      }
    : result;

  const chartData = {
    labels: ['Existing Investment', 'Additional Investment Needed', 'Target Goal'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [
          displayed.futureValueExisting,
          (displayed.requiredMonthlySIP || 0) * 12 * yearsToGoal,
          targetAmount
        ],
        backgroundColor: ['#2E89C4', '#3BAF4A', '#E8C23A'],
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `₹${context.parsed.y.toLocaleString()}`;
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
          <div className="w-16 h-16 bg-warning-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Goal-Based Calculator</h1>
          <p className="text-lg text-gray-600">
            Plan your investments to achieve your financial goals
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Goal Details</h2>
              
              {/* Goal Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Goal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedGoals.map((goal) => (
                    <button
                      key={goal.name}
                      onClick={() => {
                        setGoalName(goal.name);
                        setTargetAmount(goal.amount);
                        setYearsToGoal(goal.years);
                      }}
                      className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                        goalName === goal.name
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {goal.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Name (Custom) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Name (Custom)
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="input"
                  placeholder="e.g., Dream Car"
                />
              </div>

              {/* Target Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="input pl-8"
                    min="100000"
                    step="100000"
                  />
                </div>
                <input
                  type="range"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  min="100000"
                  max="50000000"
                  step="100000"
                  className="w-full mt-3"
                />
              </div>

              {/* Years to Goal */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years to Achieve Goal
                </label>
                <input
                  type="number"
                  value={yearsToGoal}
                  onChange={(e) => setYearsToGoal(Number(e.target.value))}
                  className="input"
                  min="1"
                  max="40"
                  step="1"
                />
                <input
                  type="range"
                  value={yearsToGoal}
                  onChange={(e) => setYearsToGoal(Number(e.target.value))}
                  min="1"
                  max="40"
                  step="1"
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

              {/* Existing Investment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Investment (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={existingInvestment}
                    onChange={(e) => setExistingInvestment(Number(e.target.value))}
                    className="input pl-8"
                    min="0"
                    step="10000"
                  />
                </div>
                <input
                  type="range"
                  value={existingInvestment}
                  onChange={(e) => setExistingInvestment(Number(e.target.value))}
                  min="0"
                  max="10000000"
                  step="10000"
                  className="w-full mt-3"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3 space-y-8">
            {/* Goal Summary */}
            <div className={`card p-8 ${displayed.isGoalAchievable ? 'bg-gradient-to-br from-success-50 to-white border-success-200' : 'bg-gradient-to-br from-danger-50 to-white border-danger-200'} border-2`}>
              <div className="text-center">
                <Target className={`w-16 h-16 mx-auto mb-4 ${displayed.isGoalAchievable ? 'text-success' : 'text-danger'}`} />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{goalName}</h2>
                <p className="text-lg text-gray-600 mb-6">{displayed.message}</p>

                <div className="mb-4">
                  <button onClick={callServer} className="btn btn-primary" disabled={loading}>
                    {loading ? 'Calculating...' : 'Calculate (Server)'}
                  </button>
                  {error && <div className="text-sm text-danger mt-2">{error}</div>}
                </div>

                {displayed.requiredMonthlySIP > 0 && (
                  <div className="bg-white rounded-2xl p-6 inline-block shadow-lg">
                    <div className="text-sm text-gray-600 mb-2">Required Monthly SIP</div>
                    <div className="text-5xl font-bold text-primary">
                      ₹{displayed.requiredMonthlySIP.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="card p-6 border-l-4 border-warning">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium text-gray-600">Target Amount</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{targetAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="card p-6 border-l-4 border-primary">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-600">Existing Investment</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{existingInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="card p-6 border-l-4 border-success">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-gray-600">Future Value</span>
                </div>
                <div className="text-2xl font-bold text-success">
                  ₹{displayed.futureValueExisting.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="card p-6 border-l-4 border-alert">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-alert" />
                  <span className="text-sm font-medium text-gray-600">Time Remaining</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {yearsToGoal} years
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Goal Breakdown</h3>
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Investment Strategy */}
            {displayed.requiredMonthlySIP > 0 && (
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Investment Strategy</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Start a Monthly SIP</h4>
                      <p className="text-gray-600">
                        Invest ₹{displayed.requiredMonthlySIP.toLocaleString(undefined, { maximumFractionDigits: 0 })} every month for {yearsToGoal} years
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Total Investment Required</h4>
                      <p className="text-gray-600">
                        ₹{((displayed.requiredMonthlySIP || 0) * 12 * yearsToGoal).toLocaleString(undefined, { maximumFractionDigits: 0 })} over {yearsToGoal} years
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Expected Goal Achievement</h4>
                      <p className="text-gray-600">
                        You will reach your target of ₹{targetAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} by the end of {yearsToGoal} years
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="card p-6 bg-primary-50 border border-primary-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips for Goal-Based Investing</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Best Practices</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Start as early as possible</li>
                    <li>• Review and adjust periodically</li>
                    <li>• Account for inflation</li>
                    <li>• Maintain emergency fund separately</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Common Goals</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Retirement planning (20-30 years)</li>
                    <li>• Child's education (10-15 years)</li>
                    <li>• Home purchase (5-10 years)</li>
                    <li>• Wedding expenses (3-8 years)</li>
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

export default GoalCalculatorPage;
