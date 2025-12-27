import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ShoppingCart, ArrowLeft, Loader } from 'lucide-react';
import { basketApi, Basket as ApiBasket } from '../services/api';

/* =====================================================
   UI-ONLY EXTENSIONS (NOT IN API)
===================================================== */
interface FundAllocation {
  fundId: string;
  fundName: string;
  allocationPercent: number;
  category: string;
}

interface SectorAllocation {
  sector: string;
  percent: number;
}

interface TopHolding {
  stockName: string;
  percent: number;
  sector: string;
}

interface ExtendedBasket extends ApiBasket {
  fundAllocations?: FundAllocation[];
  sectorAllocation?: SectorAllocation[];
  topHoldings?: TopHolding[];
}

/* =====================================================
   COMPONENT
===================================================== */
const BasketDetailsPage_New: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [basket, setBasket] = useState<ExtendedBasket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!id) return;

    const fetchBasket = async () => {
      try {
        setLoading(true);

        // ✅ FIX: string → number
        const res = await basketApi.getById(Number(id));

        if (res.status === 'success' && res.data) {
          setBasket(res.data as ExtendedBasket);
        } else {
          setError(res.message || 'Basket not found');
        }
      } catch {
        setError('Unable to load basket details');
      } finally {
        setLoading(false);
      }
    };

    fetchBasket();
  }, [id]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!basket || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/explore-baskets')} className="btn btn-primary">
            Back to Baskets
          </button>
        </div>
      </div>
    );
  }

  /* ================= DERIVED ================= */
  const fundAllocations = basket.fundAllocations ?? [];
  const sectorAllocation = basket.sectorAllocation ?? [];
  const topHoldings = basket.topHoldings ?? [];

  /* ================= HANDLERS ================= */
  const handleAddToCart = () => {
    alert(`Added ₹${investmentAmount.toLocaleString('en-IN')} to cart`);
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        {/* Back */}
        <button
          onClick={() => navigate('/explore-baskets')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Baskets
        </button>

        {/* Header */}
        <div className="card p-6 mb-6 flex gap-6 items-center">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: basket.color || '#2E89C4' }}
          >
            <Layers className="w-10 h-10 text-white" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{basket.name}</h1>
            <p className="text-gray-600">{basket.description}</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Min Investment</p>
            <p className="text-xl font-bold text-primary">
              ₹{basket.minInvestment.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Fund Allocation */}
        {fundAllocations.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Fund Allocation</h2>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Fund</th>
                  <th className="text-center py-2">Allocation</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {fundAllocations.map((f, i) => {
                  const amt = (investmentAmount * f.allocationPercent) / 100;
                  return (
                    <tr key={i} className="border-b">
                      <td className="py-3">{f.fundName}</td>
                      <td className="text-center">{f.allocationPercent}%</td>
                      <td className="text-right">
                        ₹{amt.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Top Holdings */}
        {topHoldings.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Top Holdings</h2>

            {topHoldings.map((h, i) => (
              <div key={i} className="flex justify-between border-b py-2">
                <span>{h.stockName}</span>
                <span className="font-semibold">{h.percent}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Action */}
        <button onClick={handleAddToCart} className="btn btn-success w-full">
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default BasketDetailsPage_New;
