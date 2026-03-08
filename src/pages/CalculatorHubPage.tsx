import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, TrendingUp, DollarSign, Target, ArrowRight } from 'lucide-react';

const calculators = [
  {
    title: 'SIP Calculator',
    description: 'Calculate returns on your systematic investment plan',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'primary',
    link: '/calculators/sip',
  },
  {
    title: 'Lumpsum Calculator',
    description: 'Calculate lump sum investment returns',
    icon: <DollarSign className="w-8 h-8" />,
    color: 'success',
    link: '/calculators/lumpsum',
  },
  {
    title: 'Goal Calculator',
    description: 'Plan investments for your financial goals',
    icon: <Target className="w-8 h-8" />,
    color: 'warning',
    link: '/calculators/goal',
  },
];

const CalculatorHubPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 py-16">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100 rounded-full px-5 py-2 mb-4">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Financial Tools</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Investment <span className="text-primary">Calculators</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plan your investments with precision using our powerful calculation tools
          </p>
        </div>

        {/* Calculator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {calculators.map(calc => (
            <div
              key={calc.title}
              className="card p-8 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group border-2 border-transparent hover:border-primary"
              onClick={() => navigate(calc.link)}
            >
              <div className={`w-16 h-16 bg-${calc.color}-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-${calc.color}`}>
                {calc.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">{calc.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{calc.description}</p>
              <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
                <span>Calculate Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculatorHubPage;
