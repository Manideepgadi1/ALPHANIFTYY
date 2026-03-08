import React from 'react';

const FinancialCalculatorsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container-main py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Financial Calculators
          </h1>
          <p className="text-lg text-gray-600">
            Plan your investments and achieve your financial goals
          </p>
        </div>

        {/* Embedded Calculator iFrame */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <iframe
            src="http://82.25.105.18:5003"
            className="w-full border-0"
            style={{ height: 'calc(100vh - 200px)', minHeight: '800px' }}
            title="Financial Calculators"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialCalculatorsPage;
