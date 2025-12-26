import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ShoppingCart, ArrowLeft, Loader } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import { basketApi, Basket as ApiBasket, cartApi } from '../services/api';
import useCart from '../context/CartContext';

/* ================= CHART REGISTER ================= */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ================= TYPES ================= */
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

interface PerformancePoint {
  label: string;
  portfolioValue: number;
  niftyValue: number;
}

/* ================= COMPONENT ================= */
const BasketDetailsPage: React.FC = () => {
  const { id } = useParams();
  const basketId = Number(id);
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [basket, setBasket] = useState<ApiBasket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [investmentType, setInvestmentType] = useState<'SIP' | 'Lumpsum'>('SIP');
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y' | '10Y'>('5Y');

  /* ================= FETCH BASKET ================= */
  useEffect(() => {
    if (!basketId) return;

    const fetchBasket = async () => {
      try {
        setLoading(true);
        const res = await basketApi.getById(basketId);
        if (res.status === 'success' && res.data) {
          setBasket(res.data);
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
  }, [basketId]);

  /* ================= FETCH PERFORMANCE ================= */
  useEffect(() => {
    if (!basketId) return;

    const fetchPerformance = async () => {
      try {
        setPerformanceLoading(true);
        const res = await fetch(
          `http://127.0.0.1:5000/api/baskets/${basketId}/excel-performance?period=${timeRange}`
        );
        const json = await res.json();
        setPerformanceData(json?.data?.performance || []);
      } catch {
        setPerformanceData([]);
      } finally {
        setPerformanceLoading(false);
      }
    };

    fetchPerformance();
  }, [basketId, timeRange]);

  /* ================= LOADING / ERROR ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-primary" />
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

  /* ================= SAFE OPTIONAL DATA ================= */
  const fundAllocations = (basket as any).fundAllocations as FundAllocation[] | undefined;
  const sectorAllocation = (basket as any).sectorAllocation as SectorAllocation[] | undefined;
  const topHoldings = (basket as any).topHoldings as TopHolding[] | undefined;

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    try {
      const res = await cartApi.add({
        userId: 'guest',
        basketId,
        investmentType,
        amount: investmentAmount,
        frequency: investmentType === 'SIP' ? 'Monthly' : undefined,
      });

      if (res.status === 'success') {
        await refreshCart();
        alert('Basket added to cart');
      } else {
        alert(res.message || 'Failed to add to cart');
      }
    } catch {
      alert('Error adding to cart');
    }
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
        <div className="card p-8 mb-6">
          <div className="flex gap-6">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: basket.color }}
            >
              <Layers className="w-12 h-12 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{basket.name}</h1>
              <p className="text-gray-600 mt-2">{basket.description}</p>
            </div>
          </div>
        </div>

        {/* Calculator */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Return Calculator</h2>

          <input
            type="number"
            min={basket.minInvestment}
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(Number(e.target.value))}
            className="input mb-4"
          />

          <button onClick={handleAddToCart} className="btn btn-success w-full">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
};

export default BasketDetailsPage;
