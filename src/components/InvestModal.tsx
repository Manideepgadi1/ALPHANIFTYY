import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Calendar, ShoppingCart, Zap } from 'lucide-react';

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundName: string;
  fundId: string | number;
  currentNAV?: number;
  minSIP?: string | number;
  minInvestment?: string | number;
}

const InvestModal: React.FC<InvestModalProps> = ({
  isOpen,
  onClose,
  fundName,
  fundId,
  currentNAV = 100,
  minSIP = '500',
  minInvestment = '5000'
}) => {
  const [investmentType, setInvestmentType] = useState<'SIP' | 'Lumpsum'>('SIP');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [startDate, setStartDate] = useState('1');

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (!amount) {
      alert('Please enter an amount');
      return;
    }
    
    const newItem = {
      id: Date.now(),
      basketId: String(fundId),
      quantity: 1,
      investmentType: investmentType as 'SIP' | 'Lumpsum',
      amount: parseFloat(amount)
    };
    
    // Save to localStorage immediately
    const currentCart = JSON.parse(localStorage.getItem('alphanifty_cart') || '[]');
    localStorage.setItem('alphanifty_cart', JSON.stringify([...currentCart, newItem]));
    
    // Dispatch event to update header counter
    window.dispatchEvent(new Event('cart-updated'));
    
    alert(`Added to cart:\n${fundName}\nType: ${investmentType}\nAmount: ₹${amount}${investmentType === 'SIP' ? `/${frequency}` : ''}`);
    onClose();
  };

  const handleInvestNow = () => {
    // Direct investment logic here
    alert(`Proceeding to invest:\n${fundName}\nType: ${investmentType}\nAmount: ₹${amount}${investmentType === 'SIP' ? `/${frequency}` : ''}`);
    onClose();
  };

  const minAmount = investmentType === 'SIP' ? minSIP : minInvestment;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold mb-2">Invest in Fund</h2>
            <p className="text-white/90 text-sm truncate">{fundName}</p>
            <p className="text-white/80 text-xs mt-1">Current NAV: ₹{currentNAV.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Investment Type Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setInvestmentType('SIP')}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                investmentType === 'SIP'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>SIP</span>
            </button>
            <button
              onClick={() => setInvestmentType('Lumpsum')}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                investmentType === 'Lumpsum'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Lumpsum</span>
            </button>
          </div>

          {/* SIP Form */}
          {investmentType === 'SIP' && (
            <div className="space-y-5">
              {/* Monthly Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Monthly Investment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min. ${minAmount}`}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Minimum SIP amount: ₹{minAmount}</p>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  title="Select SIP frequency"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date (Day of Month)
                </label>
                <select
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Select SIP start date"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-medium"
                >
                  {[1, 5, 10, 15, 20, 25].map(day => (
                    <option key={day} value={day}>{day} of every month</option>
                  ))}
                </select>
              </div>

              {/* SIP Info */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900 mb-1">Systematic Investment Plan</p>
                    <p className="text-xs text-emerald-700">Invest regularly and benefit from rupee cost averaging. Build wealth systematically over time.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lumpsum Form */}
          {investmentType === 'Lumpsum' && (
            <div className="space-y-5">
              {/* One-time Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Investment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min. ${minAmount}`}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Minimum investment: ₹{minAmount}</p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  {['5000', '10000', '25000', '50000', '100000', '500000'].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className="py-2 px-4 bg-slate-100 hover:bg-blue-50 border-2 border-transparent hover:border-blue-500 rounded-lg font-semibold text-slate-700 hover:text-blue-700 transition text-sm"
                    >
                      ₹{parseInt(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lumpsum Info */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">One-time Investment</p>
                    <p className="text-xs text-blue-700">Invest a lump sum amount at once. Ideal when you have surplus funds available.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Investment Summary */}
          {amount && parseFloat(amount) >= parseFloat(minAmount.toString()) && (
            <div className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Investment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Investment Type:</span>
                  <span className="font-bold text-slate-900">{investmentType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-bold text-emerald-600 text-lg">₹{parseFloat(amount).toLocaleString()}</span>
                </div>
                {investmentType === 'SIP' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Frequency:</span>
                      <span className="font-bold text-slate-900">{frequency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Start Date:</span>
                      <span className="font-bold text-slate-900">{startDate} of every month</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-300">
                  <span className="text-slate-600">Approx. Units:</span>
                  <span className="font-bold text-slate-900">{(parseFloat(amount) / currentNAV).toFixed(3)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sticky Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t-2 border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://fund.alphanifty.com/login?authpage=basket"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 px-6 bg-slate-100 text-slate-700 border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </a>
            <a
              href="https://fund.alphanifty.com/login?authpage=basket"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Invest Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestModal;
