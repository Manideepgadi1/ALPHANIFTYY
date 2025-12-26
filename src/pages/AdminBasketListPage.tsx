// removed import { User } from '../App' — use `any` for user type in this repo
import { ArrowLeft, Plus, Edit, Trash2, TrendingUp, Package, Filter, Search, Eye } from 'lucide-react';
import { useState } from 'react';

interface AdminBasketListPageProps {
  navigateTo: (page: any, data?: any) => void;
  user: any | null;
  curatedBaskets: any[];
  deleteCuratedBasket?: (basketId: string) => void;
}

export function AdminBasketListPage({ navigateTo, user, curatedBaskets, deleteCuratedBasket }: AdminBasketListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [timeHorizonFilter, setTimeHorizonFilter] = useState('All');
  const [knowledgeFilter, setKnowledgeFilter] = useState('All');
  const [capacityFilter, setCapacityFilter] = useState('All');
  const [returnsFilter, setReturnsFilter] = useState('All');
  const [goalFilter, setGoalFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const riskLevels = ['All', 'Low', 'Medium', 'High'];
  const ageRanges = ['All', '18-25', '25-35', '35-45', '45-55', '55+', 'All Ages'];
  const timeHorizons = ['All', 'Short-term (1-3 years)', 'Medium-term (3-5 years)', 'Long-term (5-10 years)', 'Very Long-term (10+ years)'];
  const knowledgeLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const capacityLevels = ['All', 'Low (₹5,000 - ₹25,000)', 'Medium (₹25,000 - ₹1,00,000)', 'High (₹1,00,000 - ₹5,00,000)', 'Very High (₹5,00,000+)'];
  const returnRanges = ['All', 'Conservative (8-10%)', 'Moderate (10-12%)', 'Aggressive (12-15%)', 'Very Aggressive (15%+)'];
  const goals = ['All', 'Wealth Creation', 'Retirement Planning', 'Child Education', 'Tax Saving', 'Emergency Fund', 'House Purchase', 'Regular Income'];

  const filteredBaskets = curatedBaskets
    .filter(basket => {
      const matchesSearch = basket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           basket.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'All' || basket.riskLevel === riskFilter;
      const matchesAge = ageFilter === 'All' || basket.ageRange === ageFilter;
      const matchesTime = timeHorizonFilter === 'All' || basket.timeHorizon === timeHorizonFilter;
      const matchesKnowledge = knowledgeFilter === 'All' || basket.experienceLevel === knowledgeFilter;
      const matchesCapacity = capacityFilter === 'All' || basket.investmentCapacity === capacityFilter;
      const matchesReturns = returnsFilter === 'All' || basket.expectedReturns === returnsFilter;
      const matchesGoal = goalFilter === 'All' || basket.goals?.includes(goalFilter);
      
      return matchesSearch && matchesRisk && matchesAge && matchesTime && 
             matchesKnowledge && matchesCapacity && matchesReturns && matchesGoal;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const handleDeleteBasket = (basketId: string, basketName: string) => {
    if (window.confirm(`Are you sure you want to delete "${basketName}"? This action cannot be undone.`)) {
      if (deleteCuratedBasket) {
        deleteCuratedBasket(basketId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App-level Header is provided in App.tsx; removed local Header usage */}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigateTo('admin-dashboard')}
          className="flex items-center space-x-2 text-[#2E89C4] hover:text-[#1B263B] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Admin Dashboard</span>
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-[#1B263B] mb-2">Curated Basket List</h1>
            <p className="text-gray-600">Manage all curated investment baskets</p>
          </div>
          <button
            onClick={() => navigateTo('admin-create-basket')}
            className="mt-4 sm:mt-0 bg-[#3BAF4A] hover:bg-[#329940] text-white px-6 py-3 rounded-lg transition-all shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Basket</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-[#2E89C4]" />
            <h3 className="text-[#1B263B]">Filter Baskets</h3>
          </div>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by basket name or description..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Risk Level */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Risk Level</label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors text-sm"
                >
                  {riskLevels.map(risk => (
                    <option key={risk} value={risk}>{risk}</option>
                  ))}
                </select>
              </div>

              {/* Age Range */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Age Range</label>
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors text-sm"
                >
                  {ageRanges.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              {/* Time Horizon */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Time Horizon</label>
                <select
                  value={timeHorizonFilter}
                  onChange={(e) => setTimeHorizonFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors text-sm"
                >
                  {timeHorizons.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Knowledge Level */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Investor Knowledge</label>
                <select
                  value={knowledgeFilter}
                  onChange={(e) => setKnowledgeFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors text-sm"
                >
                  {knowledgeLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Investment Capacity */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Investment Capacity</label>
                <select
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors text-sm"
                >
                  {capacityLevels.map(cap => (
                    <option key={cap} value={cap}>{cap}</option>
                  ))}
                </select>
              </div>

              {/* Expected Returns */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Expected Returns</label>
                <select
                  value={returnsFilter}
                  onChange={(e) => setReturnsFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors text-sm"
                >
                  {returnRanges.map(ret => (
                    <option key={ret} value={ret}>{ret}</option>
                  ))}
                </select>
              </div>

              {/* Investment Goal */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Investment Goal</label>
                <select
                  value={goalFilter}
                  onChange={(e) => setGoalFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors text-sm"
                >
                  {goals.map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-gray-600 block mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Baskets Grid */}
        {filteredBaskets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-[#1B263B] mb-4">
              {curatedBaskets.length === 0 ? 'No Baskets Created Yet' : 'No Baskets Found'}
            </h2>
            <p className="text-gray-600 mb-8">
              {curatedBaskets.length === 0 
                ? 'Create your first curated basket to get started' 
                : 'Try adjusting your search or filters'}
            </p>
            {curatedBaskets.length === 0 && (
              <button
                onClick={() => navigateTo('admin-create-basket')}
                className="bg-[#3BAF4A] hover:bg-[#329940] text-white px-8 py-3 rounded-lg transition-all shadow-lg inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Basket</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredBaskets.length} of {curatedBaskets.length} basket{curatedBaskets.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBaskets.map((basket) => (
                <div key={basket.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                  {/* Basket Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg shadow-md flex-shrink-0"
                        style={{ backgroundColor: basket.color }}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigateTo('admin-edit-basket', { basket })}
                          className="p-2 text-[#2E89C4] hover:bg-[#2E89C4]/10 rounded-lg transition-colors"
                          title="Edit Basket"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBasket(basket.id, basket.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Basket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-[#1B263B] mb-2">{basket.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{basket.description}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Total Funds</p>
                        <p className="text-lg text-[#1B263B]">{basket.funds?.length || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Total Allocation</p>
                        <p className="text-lg text-[#1B263B]">100%</p>
                      </div>
                    </div>

                    {/* Filters Summary */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Age Range:</span>
                        <span className="text-[#1B263B]">{basket.ageRange}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Risk Level:</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          basket.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                          basket.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {basket.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Time Horizon:</span>
                        <span className="text-[#1B263B]">{basket.timeHorizon}</span>
                      </div>
                    </div>

                    {/* Performance */}
                    {basket.cagr3Y && (
                      <div className="bg-gradient-to-r from-[#3BAF4A]/10 to-[#2E89C4]/10 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">3Y CAGR</p>
                            <p className="text-lg text-[#3BAF4A]">{basket.cagr3Y}%</p>
                          </div>
                          <TrendingUp className="w-6 h-6 text-[#2E89C4]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-6 pb-6 space-y-2">
                    <button
                      onClick={() => navigateTo('basket-details', { basketId: basket.id })}
                      className="w-full bg-[#2E89C4] hover:bg-[#2576a8] text-white py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => navigateTo('admin-edit-basket', { basket })}
                      className="w-full border-2 border-gray-200 hover:border-[#2E89C4] text-gray-700 py-2 rounded-lg transition-colors"
                    >
                      Edit Basket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
