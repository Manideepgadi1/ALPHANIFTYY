import React, { useState } from 'react';
import { TrendingUp, Wallet, DollarSign } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
);

const LumpsumCalculatorPage: React.FC = () => {
  const [principal, setPrincipal] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  /* ================= CALCULATION ================= */
  const futureValue =
    principal * Math.pow(1 + expectedReturn / 100, timePeriod);
  const estimatedReturns = futureValue - principal;

  const displayed = {
    investedAmount: principal,
    estimatedReturns,
    totalValue: futureValue,
  };

  /* ================= DOUGHNUT ================= */
  const doughnutData = {
    labels: ['Principal', 'Returns'],
    datasets: [
      {
        data: [displayed.investedAmount, displayed.estimatedReturns],
        backgroundColor: ['#2E89C4', '#3BAF4A'],
        borderWidth: 3,
      },
    ],
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  /* ================= BAR ================= */
  const years = Array.from({ length: timePeriod }, (_, i) => `Year ${i + 1}`);
  const values = years.map((_, i) =>
    principal * Math.pow(1 + expectedReturn / 100, i + 1)
  );

  const barData = {
    labels: years,
    datasets: [
      {
        label: 'Investment Value',
        data: values,
        backgroundColor: '#3BAF4A',
        borderRadius: 8,
      },
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
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
          <Wallet className="w-10 h-10 mx-auto mb-2 text-success" />
          <h1 className="text-4xl font-bold">Lumpsum Calculator</h1>
          <p className="text-gray-600">
            Calculate returns on one-time investments
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* INPUTS */}
          <div className="lg:col-span-2 card p-6">
            <label htmlFor="principal" className="block mb-1">
              Investment Amount (₹)
            </label>
            <input
              id="principal"
              type="number"
              className="input mb-4"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
            />

            <label htmlFor="return" className="block mb-1">
              Expected Return (%)
            </label>
            <input
              id="return"
              type="number"
              className="input mb-4"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
            />

            <label htmlFor="years" className="block mb-1">
              Time Period (Years)
            </label>
            <input
              id="years"
              type="number"
              className="input"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
            />
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard label="Principal" value={principal} icon={<Wallet />} />
              <StatCard
                label="Returns"
                value={estimatedReturns}
                icon={<TrendingUp />}
              />
              <StatCard
                label="Total Value"
                value={futureValue}
                icon={<DollarSign />}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6 h-80">
                <Doughnut
                  data={doughnutData}
                  options={doughnutOptions}
                />
              </div>
              <div className="card p-6 h-80">
                <Bar data={barData} options={barOptions as any} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SMALL CARD ================= */
const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <div className="card p-6">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <p className="text-3xl font-bold">
      ₹{value.toLocaleString('en-IN')}
    </p>
  </div>
);

export default LumpsumCalculatorPage;
