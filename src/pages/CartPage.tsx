import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { basketApi, Basket, cartApi } from '../services/api';
import useCart from '../context/CartContext';

interface CartItem {
  id?: string;
  basketId: number | string;
  investmentType: 'SIP' | 'Lumpsum';
  amount: number;
  frequency?: 'Monthly' | 'Quarterly' | 'Yearly';
  addedAt?: string;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { refreshCart } = useCart();

  const [baskets, setBaskets] = useState<Basket[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch baskets and cart in parallel
        const [basketsRes, cartRes] = await Promise.all([
          basketApi.getAll().catch(() => ({ status: 'error', data: [] })),
          cartApi.get().catch(() => ({ status: 'error', data: [] }))
        ]);

        // Set baskets
        if (basketsRes.status === 'success' && basketsRes.data) {
          setBaskets(basketsRes.data);
        }

        // Set cart items
        if (cartRes.status === 'success' && Array.isArray(cartRes.data)) {
          const items: CartItem[] = cartRes.data.map((it: any) => ({
            id: it.id,
            basketId: it.basketId,
            investmentType: it.investmentType,
            amount: Number(it.amount),
            frequency: it.frequency,
            addedAt: it.addedAt,
          }));
          setCartItems(items);
          await refreshCart();
        }
      } catch (err) {
        console.error('Failed to load cart data', err);
      }
    };

    fetchData();
  }, []);

  /* =====================================================
     HELPERS
  ===================================================== */
  const getBasket = (basketId: number | string): Basket | undefined => {
    return baskets.find(b => String(b.id) === String(basketId));
  };

  const updateAmount = async (index: number, change: number) => {
    const item = cartItems[index];
    const newAmount = Math.max(500, item.amount + change);

    // Optimistic update - update UI immediately
    setCartItems(items => items.map((it, i) => (i === index ? { ...it, amount: newAmount } : it)));

    // Background API update
    if (item.id) {
      try {
        await cartApi.update(item.id, { userId: 'guest', amount: newAmount });
        refreshCart();
      } catch (e) {
        console.error('Failed to update cart item');
        // Revert on error
        setCartItems(items => items.map((it, i) => (i === index ? { ...it, amount: item.amount } : it)));
      }
    }
  };

  const updateInvestmentType = async (index: number, type: 'SIP' | 'Lumpsum') => {
    const item = cartItems[index];
    const newItem = { ...item, investmentType: type, frequency: type === 'SIP' ? item.frequency ?? 'Monthly' : undefined };
    setCartItems(items => items.map((it, i) => (i === index ? newItem : it)));

    if (item.id) {
      try {
        await cartApi.update(item.id, { userId: 'guest', investmentType: newItem.investmentType, frequency: newItem.frequency });
        await refreshCart();
      } catch (e) {
        console.error('Failed to update investment type');
      }
    }
  };

  const updateFrequency = async (
    index: number,
    frequency: 'Monthly' | 'Quarterly' | 'Yearly'
  ) => {
    const item = cartItems[index];
    setCartItems(items => items.map((it, i) => (i === index ? { ...it, frequency } : it)));

    if (item.id) {
      try {
        await cartApi.update(item.id, { userId: 'guest', frequency });
        await refreshCart();
      } catch (e) {
        console.error('Failed to update frequency');
      }
    }
  };

  const removeItem = async (index: number) => {
    const item = cartItems[index];
    
    // Optimistic update - remove from UI immediately
    setCartItems(items => items.filter((_, i) => i !== index));
    
    // Update localStorage
    const currentCart = JSON.parse(localStorage.getItem('alphanifty_cart') || '[]');
    const updatedCart = currentCart.filter((cartItem: any, i: number) => i !== index);
    localStorage.setItem('alphanifty_cart', JSON.stringify(updatedCart));
    
    // Dispatch event to update header counter
    window.dispatchEvent(new Event('cart-updated'));

    if (item.id) {
      try {
        await cartApi.remove(item.id, 'guest');
        await refreshCart();
        // Dispatch again after API sync
        window.dispatchEvent(new Event('cart-updated'));
      } catch (e) {
        console.error('Failed to remove item');
      }
    }
  };

  const getTotalAmount = () =>
    cartItems.reduce((sum, item) => sum + item.amount, 0);

  /* =====================================================
     EMPTY STATE
  ===================================================== */
  if (cartItems.length === 0) {
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
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center max-w-2xl mx-auto border border-gray-100">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Start building your investment portfolio by exploring our curated baskets
            </p>
            <button
              onClick={() => navigate('/explore-baskets')}
              className="btn btn-primary text-lg px-10 py-4 shadow-lg hover:shadow-xl"
            >
              Explore Baskets
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 pt-24 pb-20">
      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-100 rounded-full px-5 py-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Shopping Cart</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Your <span className="text-primary">Cart</span></h1>
          <p className="text-xl text-gray-600">Review and complete your investment selection</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item, index) => {
            const basket = getBasket(item.basketId);
            if (!basket) return null;

            const risk = basket.riskLevel ?? 'Medium';
            const minReturn = basket.cagr3Y ?? 0;
            const maxReturn = basket.cagr5Y ?? 0;

            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-2">{basket.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {basket.description}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100">
                    {risk} Risk
                  </span>
                  <span className="text-success font-bold">
                    {minReturn}% – {maxReturn}%
                  </span>
                </div>

                {/* INVESTMENT TYPE */}
                <div className="flex gap-3 mb-4">
                  {(['SIP', 'Lumpsum'] as const).map(type => (
                    <button
                      key={type}
                      aria-label={`Select ${type}`}
                      onClick={() => updateInvestmentType(index, type)}
                      className={`flex-1 py-2 rounded-lg font-semibold ${
                        item.investmentType === type
                          ? 'bg-primary text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* SIP FREQUENCY */}
                {item.investmentType === 'SIP' && (
                  <select
                    aria-label="Select SIP frequency"
                    value={item.frequency}
                    onChange={e =>
                      updateFrequency(
                        index,
                        e.target.value as 'Monthly' | 'Quarterly' | 'Yearly'
                      )
                    }
                    className="w-full mb-4 p-2 border rounded-lg"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                )}

                {/* AMOUNT */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      aria-label="Decrease amount"
                      onClick={() => updateAmount(index, -500)}
                      disabled={item.amount <= 500}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="font-bold text-lg min-w-[120px] text-center">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>

                    <button
                      aria-label="Increase amount"
                      onClick={() => updateAmount(index, 500)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    aria-label="Remove basket"
                    onClick={() => removeItem(index)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>

          {/* SUMMARY */}
          <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-24">
            <h3 className="text-2xl font-bold mb-6">Order Summary</h3>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Total Items</span>
                <span className="font-semibold text-gray-900">{cartItems.length}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{getTotalAmount().toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <a
              href="https://fund.alphanifty.com/login?authpage=basket"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Proceed to checkout"
              className="block w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 transition shadow-lg hover:shadow-xl text-center"
            >
              Proceed to Checkout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
