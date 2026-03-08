import React, { useState, useEffect } from 'react';
import { Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fundApi, Fund as ApiFund } from '../services/api';

interface WatchlistItem {
  id: string;
  type: 'fund' | 'basket';
  data: ApiFund | any;
}

const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('alphanifty_watchlist');
      const watchlistIds = saved ? JSON.parse(saved) : [];

      if (watchlistIds.length === 0) {
        setWatchlistItems([]);
        setLoading(false);
        return;
      }

      // Separate fund IDs from basket IDs
      const fundIds = watchlistIds.filter((id: string) => id.startsWith('fund_'));
      const basketIds = watchlistIds.filter((id: string) => !id.startsWith('fund_'));

      const items: WatchlistItem[] = [];

      // Fetch fund details if there are fund IDs
      if (fundIds.length > 0) {
        try {
          const fundPromises = fundIds.map((id: string) => 
            fundApi.getById(id.replace('fund_', '')).catch(() => null)
          );
          const fundResults = await Promise.all(fundPromises);
          
          fundResults.forEach((result, index) => {
            if (result && result.data) {
              items.push({
                id: fundIds[index],
                type: 'fund',
                data: result.data
              });
            }
          });
        } catch (error) {
          console.error('Error fetching funds:', error);
        }
      }

      setWatchlistItems(items);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = (id: string) => {
    // Optimistic update - remove immediately from UI
    setWatchlistItems(items => items.filter(item => item.id !== id));
    
    // Then update localStorage
    const saved = localStorage.getItem('alphanifty_watchlist');
    const watchlistIds = saved ? JSON.parse(saved) : [];
    const updated = watchlistIds.filter((wid: string) => wid !== id);
    localStorage.setItem('alphanifty_watchlist', JSON.stringify(updated));
    
    // Dispatch event to update header
    window.dispatchEvent(new Event('watchlist-updated'));
  };

  const addToCart = async (fund: ApiFund) => {
    try {
      const cartItem = {
        id: Date.now(),
        basketId: fund.id,
        quantity: 1,
        investmentType: 'Lumpsum' as const,
        amount: 5000
      };
      localStorage.setItem('alphanifty_cart', JSON.stringify([...(JSON.parse(localStorage.getItem('alphanifty_cart') || '[]')), cartItem]));
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  /* ===== EMPTY STATE ===== */
  if (!loading && watchlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 pt-24">
        <div className="container mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Watchlist is Empty</h2>
            <p className="text-lg text-gray-600 mb-8">Add funds to your watchlist to track them</p>
            <button
              onClick={() => navigate('/explore-funds')}
              className="btn btn-primary px-10 py-3"
            >
              Explore Funds
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===== PAGE ===== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 pt-24 pb-20">
      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Watchlist</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlistItems.map((item) => {
              if (item.type !== 'fund') return null;

              const fund = item.data;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  {/* Fund Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {fund.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {fund.fundHouse || fund.amc}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/fund/${fund.id}`)}
                      className="btn btn-primary btn-sm px-4 py-2 text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => addToCart(fund)}
                      className="btn btn-success btn-sm px-4 py-2 text-sm flex items-center gap-1"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(item.id)}
                      className="btn btn-danger btn-sm px-4 py-2 text-sm"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
