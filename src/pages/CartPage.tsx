import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
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
    const fetchBaskets = async () => {
      try {
        const response = await basketApi.getAll();
        if (response.status === 'success' && response.data) {
          setBaskets(response.data);
        }
      } catch (err) {
        console.error('Failed to load baskets');
      }
    };
    const fetchCart = async () => {
      try {
        const res = await cartApi.get();
        if (res.status === 'success' && Array.isArray(res.data)) {
          const items: CartItem[] = res.data.map((it: any) => ({
            id: it.id,
            basketId: it.basketId,
            investmentType: it.investmentType,
            amount: Number(it.amount),
            frequency: it.frequency,
            addedAt: it.addedAt,
          }));
          setCartItems(items);
        }
      } catch (e) {
        console.error('Failed to load cart');
      }
    };

    fetchBaskets();
    fetchCart();
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

    setCartItems(items => items.map((it, i) => (i === index ? { ...it, amount: newAmount } : it)));

    if (item.id) {
      try {
        await cartApi.update(item.id, { userId: 'guest', amount: newAmount });
        await refreshCart();
      } catch (e) {
        console.error('Failed to update cart item');
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
    setCartItems(items => items.filter((_, i) => i !== index));

    if (item.id) {
      try {
        await cartApi.remove(item.id, 'guest');
        await refreshCart();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-32">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">
              Explore curated baskets to start investing.
            </p>
            <button
              onClick={() => navigate('/explore-baskets')}
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-32 pb-20">
      <div className="container mx-auto px-6 grid lg:grid-cols-3 gap-8">
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
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Decrease amount"
                    onClick={() => updateAmount(index, -500)}
                    disabled={item.amount <= 500}
                  >
                    <Minus />
                  </button>

                  <span className="font-bold">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>

                  <button
                    aria-label="Increase amount"
                    onClick={() => updateAmount(index, 500)}
                  >
                    <Plus />
                  </button>

                  <button
                    aria-label="Remove basket"
                    onClick={() => removeItem(index)}
                    className="ml-auto text-red-600"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="bg-white rounded-2xl shadow-xl p-6 h-fit">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>

          <div className="flex justify-between mb-3">
            <span>Total Items</span>
            <span>{cartItems.length}</span>
          </div>

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">
              ₹{getTotalAmount().toLocaleString('en-IN')}
            </span>
          </div>

          <button
            aria-label="Proceed to checkout"
            className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-bold"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
