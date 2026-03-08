import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Video, Search, TrendingUp, Shield, Calculator, FileText, ExternalLink, ChevronRight, ArrowLeft } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  category: string;
  description: string;
  readTime: string;
  icon: typeof BookOpen;
}

interface VideoResource {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: 'Getting Started with Investment Baskets',
    category: 'Basics',
    description: 'Learn the fundamentals of investment baskets and how they can help diversify your portfolio.',
    readTime: '5 min',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Understanding Risk and Returns',
    category: 'Basics',
    description: 'Discover the relationship between investment risk and potential returns.',
    readTime: '7 min',
    icon: Shield,
  },
  {
    id: 3,
    title: 'Tax Planning for Investors',
    category: 'Tax',
    description: 'Maximize your returns with smart tax planning strategies.',
    readTime: '8 min',
    icon: Calculator,
  },
  {
    id: 4,
    title: 'Advanced Portfolio Strategies',
    category: 'Advanced',
    description: 'Explore advanced techniques for optimizing your investment portfolio.',
    readTime: '10 min',
    icon: TrendingUp,
  },
  {
    id: 5,
    title: 'Market Analysis Techniques',
    category: 'Market Insights',
    description: 'Learn how to analyze market trends and make informed investment decisions.',
    readTime: '12 min',
    icon: FileText,
  },
  {
    id: 6,
    title: 'Rebalancing Your Portfolio',
    category: 'Advanced',
    description: 'When and how to rebalance your portfolio for optimal performance.',
    readTime: '6 min',
    icon: TrendingUp,
  },
];

const glossaryTerms: GlossaryTerm[] = [
  { term: 'CAGR', definition: 'Compound Annual Growth Rate - the mean annual growth rate of an investment over a specified time period longer than one year.' },
  { term: 'NAV', definition: 'Net Asset Value - represents the net value of an entity and is calculated as the total value of assets minus the total value of liabilities.' },
  { term: 'Volatility', definition: 'A statistical measure of the dispersion of returns for a given security or market index.' },
  { term: 'Diversification', definition: 'A risk management strategy that mixes a wide variety of investments within a portfolio.' },
  { term: 'Asset Allocation', definition: 'An investment strategy that aims to balance risk and reward by apportioning a portfolio\'s assets according to goals, risk tolerance, and investment horizon.' },
  { term: 'Equity', definition: 'Ownership interest in a company in the form of stocks, representing a claim on part of the company\'s assets and earnings.' },
  { term: 'Debt', definition: 'Fixed-income investments like bonds where an investor lends money to an entity for a defined period at a fixed interest rate.' },
  { term: 'Benchmark', definition: 'A standard or point of reference against which investment performance can be measured.' },
];

const EducationalHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Basics', 'Advanced', 'Tax', 'Market Insights'];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredGlossary = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container-main">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Educational Hub</h1>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          <p className="text-blue-100 text-lg">
            Master the art of investing with our comprehensive learning resources
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, videos, or glossary terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                Term of the Week
              </div>
              <h2 className="text-2xl font-bold mb-3">CAGR - Compound Annual Growth Rate</h2>
              <p className="text-blue-100 mb-6">
                {glossaryTerms[0].definition}
              </p>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50">
                Learn More
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Calculator className="w-24 h-24 opacity-20 ml-8" />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => {
              const Icon = article.icon;
              return (
                <div
                  key={article.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">{article.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{article.readTime} read</span>
                    <span className="text-primary font-medium group-hover:underline">Read More →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Video Tutorials</h2>
            <a 
              href="https://flip.alphanifty.com/sessions#past" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark font-medium flex items-center gap-2"
            >
              View All Sessions
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="https://flip.alphanifty.com/sessions#past"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative bg-gradient-to-br from-blue-400 to-purple-500 h-48 flex items-center justify-center">
                <Video className="w-16 h-16 text-white opacity-80" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-blue-600 text-xs rounded-full font-semibold">
                  Live Sessions
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary">
                  Investment Fundamentals
                </h3>
                <p className="text-sm text-gray-600">Watch our expert-led sessions on investment basics</p>
              </div>
            </a>

            <a
              href="https://flip.alphanifty.com/sessions#past"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative bg-gradient-to-br from-green-400 to-blue-500 h-48 flex items-center justify-center">
                <Video className="w-16 h-16 text-white opacity-80" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-green-600 text-xs rounded-full font-semibold">
                  Past Recordings
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary">
                  Portfolio Management
                </h3>
                <p className="text-sm text-gray-600">Learn advanced portfolio strategies from our experts</p>
              </div>
            </a>

            <a
              href="https://flip.alphanifty.com/sessions#past"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative bg-gradient-to-br from-purple-400 to-pink-500 h-48 flex items-center justify-center">
                <Video className="w-16 h-16 text-white opacity-80" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-purple-600 text-xs rounded-full font-semibold">
                  Q&A Sessions
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary">
                  Market Analysis & Insights
                </h3>
                <p className="text-sm text-gray-600">Stay updated with market trends and expert analysis</p>
              </div>
            </a>
          </div>
        </div>

        {/* Glossary Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Glossary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGlossary.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900 mb-1">{item.term}</h3>
                <p className="text-gray-600 text-sm">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/investment-guide"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <BookOpen className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Investment Guide</h3>
            <p className="text-blue-100 text-sm">Complete guide to get started with investing</p>
          </Link>

          <Link
            to="/calculators"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <Calculator className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Financial Calculators</h3>
            <p className="text-green-100 text-sm">Plan your investments with our tools</p>
          </Link>

          <Link
            to="/help-faq"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <FileText className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Help & FAQ</h3>
            <p className="text-purple-100 text-sm">Find answers to common questions</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EducationalHubPage;
