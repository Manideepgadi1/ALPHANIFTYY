import { Package, Plus, List, BarChart3, Users, TrendingUp, Eye } from 'lucide-react';

interface AdminDashboardPageProps {
  navigateTo: (page: any, data?: any) => void;
  user: any | null;
  curatedBaskets: any[];
}

export function AdminDashboardPage({ navigateTo, user, curatedBaskets }: AdminDashboardPageProps) {
  const totalBaskets = curatedBaskets.length;
  const totalFunds = curatedBaskets.reduce((sum, basket) => sum + (basket.funds?.length || 0), 0);
  const avgFundsPerBasket = totalBaskets > 0 ? (totalFunds / totalBaskets).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App-level Header is provided in App.tsx; removed page-local Header */}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#1B263B] mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage curated investment baskets and platform content</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#3BAF4A] to-[#2E89C4] text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Total Baskets</h3>
              <Package className="w-6 h-6" />
            </div>
            <p className="text-4xl mb-2">{totalBaskets}</p>
            <p className="text-sm text-white/80">Curated baskets</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1B263B]">Total Funds</h3>
              <BarChart3 className="w-6 h-6 text-[#2E89C4]" />
            </div>
            <p className="text-4xl text-[#1B263B] mb-2">{totalFunds}</p>
            <p className="text-sm text-gray-600">Across all baskets</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1B263B]">Avg Funds</h3>
              <TrendingUp className="w-6 h-6 text-[#3BAF4A]" />
            </div>
            <p className="text-4xl text-[#3BAF4A] mb-2">{avgFundsPerBasket}</p>
            <p className="text-sm text-gray-600">Per basket</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1B263B]">Active Users</h3>
              <Users className="w-6 h-6 text-[#E8C23A]" />
            </div>
            <p className="text-4xl text-[#E8C23A] mb-2">-</p>
            <p className="text-sm text-gray-600">Platform users</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-[#1B263B] mb-6">Quick Actions</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => navigateTo('admin-create-basket')}
              className="bg-gradient-to-br from-[#3BAF4A] to-[#2E89C4] hover:from-[#329940] hover:to-[#2576a8] text-white p-6 rounded-xl transition-all shadow-lg text-left"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <h3>Create New Basket</h3>
              </div>
              <p className="text-sm text-white/80">Build a new curated basket for users</p>
            </button>

            <button
              onClick={() => navigateTo('admin-basket-list')}
              className="bg-white border-2 border-[#2E89C4] hover:bg-[#2E89C4]/10 text-[#2E89C4] p-6 rounded-xl transition-all shadow-lg text-left"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#2E89C4]/10 rounded-lg flex items-center justify-center">
                  <List className="w-6 h-6" />
                </div>
                <h3>View All Baskets</h3>
              </div>
              <p className="text-sm text-gray-600">Manage existing curated baskets</p>
            </button>

            <button
              onClick={() => navigateTo('home')}
              className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 p-6 rounded-xl transition-all shadow-lg text-left"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <h3>View User Site</h3>
              </div>
              <p className="text-sm text-gray-600">Preview user-facing website</p>
            </button>
          </div>
        </div>

        {/* Recent Baskets */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#1B263B]">Recent Baskets</h2>
            <button
              onClick={() => navigateTo('admin-basket-list')}
              className="text-[#2E89C4] hover:text-[#2576a8] text-sm"
            >
              View All →
            </button>
          </div>

          {curatedBaskets.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">No baskets created yet</p>
              <button
                onClick={() => navigateTo('admin-create-basket')}
                className="bg-[#3BAF4A] hover:bg-[#329940] text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Basket</span>
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {curatedBaskets.slice(0, 6).map((basket) => (
                <div
                  key={basket.id}
                  className="border-2 border-gray-100 rounded-xl p-6 hover:border-[#2E89C4] transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => navigateTo('admin-basket-list')}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg shadow-md"
                      style={{ backgroundColor: basket.color }}
                    />
                    <div>
                      <h3 className="text-[#1B263B]">{basket.name}</h3>
                      <p className="text-sm text-gray-500">{basket.funds?.length || 0} funds</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Risk:</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        basket.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        basket.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {basket.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Min Investment:</span>
                      <span className="text-[#1B263B]">₹{basket.minInvestment?.toLocaleString() || 0}</span>
                    </div>
                    {basket.cagr3Y && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">3Y CAGR:</span>
                        <span className="text-[#3BAF4A]">{basket.cagr3Y}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
