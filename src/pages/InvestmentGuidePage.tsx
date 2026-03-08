import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, DollarSign, PieChart, BookOpen, Lightbulb, ChevronRight, Shield, BarChart3, Users } from 'lucide-react';

const InvestmentGuidePage: React.FC = () => {
  const guides = [
    {
      icon: Target,
      title: 'Getting Started with Mutual Funds',
      description: 'Learn the basics of mutual fund investing, understand different fund types, and discover how to choose the right funds for your goals.',
      topics: ['What are Mutual Funds?', 'Types of Mutual Funds', 'SIP vs Lumpsum', 'Risk Assessment']
    },
    {
      icon: PieChart,
      title: 'Understanding Investment Baskets',
      description: 'Explore our curated baskets designed by experts. Learn how diversification can help you achieve better risk-adjusted returns.',
      topics: ['Basket Selection', 'Diversification Benefits', 'Rebalancing Strategy', 'Performance Tracking']
    },
    {
      icon: BarChart3,
      title: 'Risk Management',
      description: 'Master the art of managing investment risk. Understand volatility, asset allocation, and how to build a resilient portfolio.',
      topics: ['Risk vs Return', 'Volatility Management', 'Asset Allocation', 'Stop Loss Strategies']
    },
    {
      icon: DollarSign,
      title: 'Tax-Efficient Investing',
      description: 'Maximize your returns by understanding tax implications, LTCG, STCG, and tax-saving investment options.',
      topics: ['Tax on Equity Funds', 'Tax on Debt Funds', 'ELSS Funds', 'Tax Loss Harvesting']
    }
  ];

  const principles = [
    {
      icon: Shield,
      title: 'Start Early',
      description: 'The power of compounding works best when you give it time. Start investing as early as possible.'
    },
    {
      icon: Target,
      title: 'Set Clear Goals',
      description: 'Define your financial goals - retirement, education, home purchase - and align your investments accordingly.'
    },
    {
      icon: PieChart,
      title: 'Diversify',
      description: "Don't put all eggs in one basket. Spread your investments across asset classes and sectors."
    },
    {
      icon: TrendingUp,
      title: 'Stay Consistent',
      description: 'Regular investments through SIPs help you average out market volatility and build wealth systematically.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-20">
        <div className="container-main">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Investment Guide</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              Your complete resource for smart investing. Learn how to build wealth through mutual funds and curated investment baskets.
            </p>
            <Link 
              to="/explore-baskets"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Explore Investment Baskets
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Investment Principles */}
      <section className="container-main py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Investment Principles</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these time-tested principles to build a successful investment portfolio
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <principle.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{principle.title}</h3>
              <p className="text-gray-600">{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Investment Guides */}
      <section className="bg-white py-16">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Guides</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deep dive into specific topics to enhance your investment knowledge
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {guides.map((guide, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <guide.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{guide.title}</h3>
                    <p className="text-gray-600">{guide.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Topics Covered:</p>
                  <ul className="space-y-2">
                    {guide.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600">
                        <ChevronRight className="w-4 h-4 text-primary" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Calculator CTA */}
      <section className="container-main py-16">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <Lightbulb className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Try Our Investment Calculators</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Use our powerful calculators to plan your investments, estimate returns, and make informed decisions.
          </p>
          <Link 
            to="/calculators"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Explore Calculators
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-50 py-8">
        <div className="container-main">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-sm text-gray-700 text-center">
              <strong>Investment Disclaimer:</strong> Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing. Past performance is not indicative of future returns. This guide is for educational purposes only and should not be considered as investment advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestmentGuidePage;
