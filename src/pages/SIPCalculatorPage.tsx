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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 py-12">
      <div className="container-main">
        {/* HEADER with Enhanced Design */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100 rounded-full px-5 py-2 mb-4">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">SIP Investment Tool</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            <span className="text-primary">SIP</span> Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plan your systematic investment and estimate future returns with precision
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
              min="0"
              value={monthlyInvestment}
              onChange={(e) => {
                const val = e.target.value.replace(/^0+/, '') || '0';
                setMonthlyInvestment(val === '' ? 0 : parseInt(val, 10) || 0);
              }}
              onBlur={(e) => {
                const val = e.target.value.replace(/^0+/, '') || '0';
                setMonthlyInvestment(parseInt(val, 10) || 0);
              }}
            />

            <label htmlFor="expectedReturn" className="block text-sm mb-1">
              Expected Return (%)
            </label>
            <input
              id="expectedReturn"
              type="number"
              className="input mb-4"
              min="0"
              step="0.1"
              value={expectedReturn}
              onChange={(e) => {
                const val = e.target.value;
                setExpectedReturn(val === '' ? 0 : parseFloat(val) || 0);
              }}
            />

            <label htmlFor="timePeriod" className="block text-sm mb-1">
              Time Period (Years)
            </label>
            <input
              id="timePeriod"
              type="number"
              className="input"
              min="1"
              value={timePeriod}
              onChange={(e) => {
                const val = e.target.value;
                setTimePeriod(val === '' ? 1 : parseInt(val, 10) || 1);
              }}
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
