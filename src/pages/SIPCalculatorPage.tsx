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
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const SIPCalculatorPage: React.FC = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  /* ================= CALCULATION ================= */
  const monthlyRate = expectedReturn / 12 / 100;
  const months = timePeriod * 12;

  const futureValue =
    monthlyInvestment *
    (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate));

  const investedAmount = monthlyInvestment * months;
  const estimatedReturns = futureValue - investedAmount;

  /* ================= CHART DATA ================= */
  const doughnutData = {
    labels: ['Invested Amount', 'Estimated Returns'],
    datasets: [
      {
        data: [investedAmount, estimatedReturns],
        backgroundColor: ['#2E89C4', '#3BAF4A'],
        borderWidth: 3,
      },
    ],
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  const years = Array.from({ length: timePeriod }, (_, i) => `Year ${i + 1}`);
  const values = years.map((_, i) => {
    const m = (i + 1) * 12;
    return (
      monthlyInvestment *
      (((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) *
        (1 + monthlyRate))
    );
  });

  const invested = years.map((_, i) => monthlyInvestment * (i + 1) * 12);

  const lineData = {
    labels: years,
    datasets: [
      {
        label: 'Total Value',
        data: values,
        borderColor: '#3BAF4A',
        backgroundColor: '#3BAF4A20',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Invested Amount',
        data: invested,
        borderColor: '#2E89C4',
        backgroundColor: '#2E89C420',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `₹${Number(v) / 100000}L`,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        {/* HEADER */}
        <div className="text-center mb-8">
          <Calculator className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="text-4xl font-bold">SIP Calculator</h1>
          <p className="text-gray-600">
            Estimate your SIP returns accurately
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* INPUTS */}
          <div className="lg:col-span-2 card p-6">
            <label htmlFor="monthlyInvestment" className="block text-sm mb-1">
              Monthly Investment (₹)
            </label>
            <input
              id="monthlyInvestment"
              type="number"
              className="input mb-4"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            />

            <label htmlFor="expectedReturn" className="block text-sm mb-1">
              Expected Return (%)
            </label>
            <input
              id="expectedReturn"
              type="number"
              className="input mb-4"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
            />

            <label htmlFor="timePeriod" className="block text-sm mb-1">
              Time Period (Years)
            </label>
            <input
              id="timePeriod"
              type="number"
              className="input"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
            />
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Summary
                icon={<PiggyBank />}
                label="Invested"
                value={investedAmount}
              />
              <Summary
                icon={<TrendingUp />}
                label="Returns"
                value={estimatedReturns}
              />
              <Summary
                icon={<DollarSign />}
                label="Total Value"
                value={futureValue}
              />
            </div>

            <div className="card p-6 h-80">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>

            <div className="card p-6 h-80">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SMALL CARD ================= */
const Summary = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="card p-4 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-xl font-bold">
      ₹{value.toLocaleString('en-IN')}
    </p>
  </div>
);

export default SIPCalculatorPage;
