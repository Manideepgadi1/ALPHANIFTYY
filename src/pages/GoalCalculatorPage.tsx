import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GoalCalculatorPage: React.FC = () => {
  const [goalName, setGoalName] = useState('Retirement');
  const [targetAmount, setTargetAmount] = useState(10_000_000);
  const [yearsToGoal, setYearsToGoal] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [existingInvestment, setExistingInvestment] = useState(500_000);

  /* ================= CALCULATION ================= */
  const calculateGoal = () => {
    const futureValueExisting =
      existingInvestment * Math.pow(1 + expectedReturn / 100, yearsToGoal);

    const remaining = targetAmount - futureValueExisting;

    if (remaining <= 0) {
      return {
        requiredMonthlySIP: 0,
        futureValueExisting,
        message: 'Your existing investment is sufficient to meet the goal!',
      };
    }

    const monthlyRate = expectedReturn / 12 / 100;
    const months = yearsToGoal * 12;

    const sip =
      (remaining * monthlyRate) /
      ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));

    return {
      requiredMonthlySIP: sip,
      futureValueExisting,
      message: `You need to invest ₹${sip.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
      })} per month`,
    };
  };

  const result = calculateGoal();

  /* ================= CHART ================= */
  const chartData = {
    labels: ['Existing Investment', 'SIP Investment', 'Target Goal'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [
          result.futureValueExisting,
          (result.requiredMonthlySIP || 0) * 12 * yearsToGoal,
          targetAmount,
        ],
        backgroundColor: ['#2E89C4', '#3BAF4A', '#E8C23A'],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            `₹${(Number(value) / 100000).toFixed(1)}L`,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <div className="text-center mb-8">
          <Target className="w-12 h-12 text-warning mx-auto mb-3" />
          <h1 className="text-4xl font-bold">Goal Calculator</h1>
          <p className="text-gray-600">Plan your investments smartly</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* INPUTS */}
          <div className="lg:col-span-2 card p-6">
            <label htmlFor="goalName" className="block text-sm font-medium mb-1">
              Goal Name
            </label>
            <input
              id="goalName"
              type="text"
              className="input mb-4"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />

            <label htmlFor="targetAmount" className="block text-sm font-medium mb-1">
              Target Amount (₹)
            </label>
            <input
              id="targetAmount"
              type="number"
              className="input mb-4"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
            />

            <label htmlFor="yearsToGoal" className="block text-sm font-medium mb-1">
              Years to Goal
            </label>
            <input
              id="yearsToGoal"
              type="number"
              className="input mb-4"
              value={yearsToGoal}
              onChange={(e) => setYearsToGoal(Number(e.target.value))}
            />

            <label htmlFor="expectedReturn" className="block text-sm font-medium mb-1">
              Expected Return (%)
            </label>
            <input
              id="expectedReturn"
              type="number"
              className="input mb-4"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
            />

            <label htmlFor="existingInvestment" className="block text-sm font-medium mb-1">
              Existing Investment (₹)
            </label>
            <input
              id="existingInvestment"
              type="number"
              className="input"
              value={existingInvestment}
              onChange={(e) => setExistingInvestment(Number(e.target.value))}
            />
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">{goalName}</h2>
              <p className="text-gray-600 mb-4">{result.message}</p>

              {result.requiredMonthlySIP > 0 && (
                <div className="text-4xl font-bold text-primary">
                  ₹{result.requiredMonthlySIP.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  <span className="text-sm block text-gray-500">per month</span>
                </div>
              )}
            </div>

            <div className="card p-6 h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Summary icon={<Target />} label="Target" value={targetAmount} />
              <Summary icon={<Wallet />} label="Existing" value={existingInvestment} />
              <Summary icon={<TrendingUp />} label="Future Value" value={result.futureValueExisting} />
              <Summary icon={<Calendar />} label="Years" value={yearsToGoal} suffix=" yrs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= HELPER ================= */
const Summary = ({
  icon,
  label,
  value,
  suffix = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) => (
  <div className="card p-4 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-xl font-bold">
      ₹{value.toLocaleString('en-IN')}
      {suffix}
    </p>
  </div>
);

export default GoalCalculatorPage;
