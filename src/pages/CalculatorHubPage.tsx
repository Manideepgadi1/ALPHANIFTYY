import React from 'react';
import { useNavigate } from 'react-router-dom';

const calculators = [
  {
    title: 'SIP Calculator',
    description: 'Calculate returns on your systematic investment plan',
    icon: <span role="img" aria-label="chart">📊</span>,
    link: '/calculators/sip',
  },
  {
    title: 'Lumpsum Calculator',
    description: 'Calculate lump sum investment returns',
    icon: <span role="img" aria-label="money">💰</span>,
    link: '/calculators/lumpsum',
  },
  {
    title: 'Goal Calculator',
    description: 'Plan investments for your financial goals',
    icon: <span role="img" aria-label="goal">🎯</span>,
    link: '/calculators/goal',
  },
];

const CalculatorHubPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container-main py-10">
      <h1 className="text-3xl font-bold mb-8">Calculators</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {calculators.map(calc => (
          <div
            key={calc.title}
            className="card p-6 cursor-pointer hover:shadow-lg"
            onClick={() => navigate(calc.link)}
          >
            <div className="text-3xl mb-3">{calc.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{calc.title}</h3>
            <p className="text-gray-600 text-sm">{calc.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatorHubPage;
