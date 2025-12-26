import { useState, useEffect } from 'react';
import { Star, Eye, Trash2, TrendingUp } from 'lucide-react';
import { mockBaskets } from '../data/mockData';

interface WatchlistManagerProps {
  navigateTo: (page: string, basketId?: string) => void;
}

export function WatchlistManager({ navigateTo }: WatchlistManagerProps) {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('alphanifty_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  const saveWatchlist = (list: string[]) => {
    localStorage.setItem('alphanifty_watchlist', JSON.stringify(list));
    setWatchlist(list);
  };

  const addToWatchlist = (basketId: string) => {
    if (!watchlist.includes(basketId)) {
      saveWatchlist([...watchlist, basketId]);
    }
  };

  const removeFromWatchlist = (basketId: string) => {
    saveWatchlist(watchlist.filter((id: string) => id !== basketId));
  };

  const isInWatchlist = (basketId: string) => watchlist.includes(basketId);

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}

// Watchlist Page Component
interface WatchlistPageProps {
  navigateTo: (page: string, basketId?: string) => void;
  user: any | null;
  setSelectedBasket: (basket: any) => void;
  onShowCalculator?: () => void;
  onShowHelp?: () => void;
}

export function WatchlistPage({ navigateTo, user, setSelectedBasket, onShowCalculator, onShowHelp }: WatchlistPageProps) {
  const { watchlist, removeFromWatchlist } = WatchlistManager({ navigateTo });
  const watchlistBaskets = mockBaskets.filter((b: any) => watchlist.includes(b.id));

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-gradient-to-r from-[#2E89C4] to-[#1B6EA1] text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">My Watchlist</h1>
          <p className="text-blue-100">Keep track of your favorite baskets</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {watchlistBaskets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlistBaskets.map((basket: any) => (
              <div key={basket.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-2" style={{ backgroundColor: basket.color }} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{basket.name}</h3>
                    <button
                      onClick={() => removeFromWatchlist(basket.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{basket.description}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div>
                      <span className="text-gray-500">CAGR (5Y)</span>
                      <p className="font-bold text-green-600">{basket.cagr5Y}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk</span>
                      <p className="font-bold text-orange-600">{basket.riskPercentage}%</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateTo('basket-details', basket.id)}
                    className="w-full bg-[#2E89C4] hover:bg-[#1B6EA1] text-white py-2 rounded-lg transition-colors font-semibold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Watchlist is Empty</h3>
            <p className="text-gray-600 mb-6">Start adding baskets to your watchlist to track them easily</p>
            <button
              onClick={() => navigateTo('basket-list')}
              className="bg-[#2E89C4] text-white px-6 py-3 rounded-lg hover:bg-[#1B6EA1] transition-colors"
            >
              Explore Baskets
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Watchlist Button Component (for basket cards)
export function WatchlistButton({ basketId }: { basketId: string }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = WatchlistManager({ navigateTo: () => {} });
  const inWatchlist = isInWatchlist(basketId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (inWatchlist) {
          removeFromWatchlist(basketId);
        } else {
          addToWatchlist(basketId);
        }
      }}
      className={`
        p-2 rounded-lg transition-all
        ${inWatchlist 
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
      `}
      title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Star className={`w-5 h-5 ${inWatchlist ? 'fill-current' : ''}`} />
    </button>
  );
}
