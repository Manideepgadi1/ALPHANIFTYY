import React from 'react';
import { 
  Layers, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  BarChart3,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { Basket } from '../services/api';

interface BasketCardProps {
  basket: Basket;
  onViewDetails?: (basketId: string) => void;
  onAddToCart?: (basketId: string) => void;
}

const BasketCard: React.FC<BasketCardProps> = ({ 
  basket, 
  onViewDetails, 
  onAddToCart 
}) => {
  const getRiskBadgeClass = (risk: string) => {
    const riskLower = risk.toLowerCase();
    if (riskLower.includes('low')) return 'badge-low';
    if (riskLower.includes('high')) return 'badge-high';
    return 'badge-medium';
  };

  const getRiskIcon = () => {
    return <AlertCircle className="w-4 h-4" />;
  };

  const riskLevel = basket.risk || basket.riskLevel || 'Medium';
  const minReturn = basket.minReturn || basket.cagr1Y || 0;
  const maxReturn = basket.maxReturn || basket.cagr5Y || 0;
  const color = (basket as any).color || '#2E89C4';
  const experienceLevel = (basket as any).experienceLevel || basket.category || 'For all investors';
  const timeHorizon = (basket as any).timeHorizon || '3-5 years';
  const riskPercentage = (basket as any).riskPercentage || 12.5;
  const sharpeRatio = (basket as any).sharpeRatio || 1.5;

  return (
    <div className="card p-6 flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex gap-4">
        {/* Colored Icon Box */}
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          <Layers className="w-9 h-9 text-white" />
        </div>

        {/* Basket Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
            {basket.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {experienceLevel}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {basket.description}
          </p>
        </div>
      </div>

      {/* Metrics Section - 3 Column Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Row 1 - Risk */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-500">
            {getRiskIcon()}
            <span className="text-xs font-medium">Risk</span>
          </div>
          <span className={`badge ${getRiskBadgeClass(riskLevel)}`}>
            {riskLevel}
          </span>
        </div>

        {/* Row 1 - Timeline */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Timeline</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {basket.timeHorizon || '5+ years'}
          </span>
        </div>

        {/* Row 1 - Min SIP */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-500">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Min SIP</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            ₹{basket.minInvestment.toLocaleString()}
          </span>
        </div>

        {/* Row 2 - Returns (3Y & 5Y) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Returns</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">3Y:</span>
            <span className="text-sm font-semibold text-success">
              {basket.cagr3Y || minReturn}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">5Y:</span>
            <span className="text-sm font-semibold text-success">
              {basket.cagr5Y || maxReturn}%
            </span>
          </div>
        </div>

        {/* Row 2 - Risk % */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-500">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Risk %</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {basket.riskPercentage || '12.5'}%
          </span>
        </div>

        {/* Row 2 - Sharpe Ratio */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-500">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Sharpe</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {basket.sharpeRatio || '1.5'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onViewDetails?.(String(basket.id))}
          className="flex-1 btn btn-primary"
        >
          <Eye className="w-5 h-5" />
          View Basket
        </button>
        <button
          onClick={() => onAddToCart?.(String(basket.id))}
          className="flex-1 btn btn-success"
        >
          <ShoppingCart className="w-5 h-5" />
          Add
        </button>
      </div>
    </div>
  );
};

export default BasketCard;
