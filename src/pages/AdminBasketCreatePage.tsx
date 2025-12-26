// removed import { User } from '../App' — use `any` for user type in this repo
import { ArrowLeft, ArrowRight, Package, Info, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface AdminBasketCreatePageProps {
  navigateTo: (page: any, data?: any) => void;
  user: any | null;
  basketData?: any;
}

// Multi-Select Dropdown Component
function MultiSelectDropdown({ 
  label, 
  options, 
  selectedValues, 
  onChange, 
  placeholder,
  required = false 
}: {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const removeValue = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  };

  return (
    <div className="relative">
      <label className="block text-sm text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Selected Tags */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedValues.map(value => (
            <span
              key={value}
              className="inline-flex items-center space-x-1 bg-[#2E89C4] text-white px-3 py-1 rounded-full text-sm"
            >
              <span>{value}</span>
              <button
                onClick={() => removeValue(value)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors flex items-center justify-between bg-white"
      >
        <span className={selectedValues.length === 0 ? 'text-gray-400' : 'text-[#1B263B]'}>
          {selectedValues.length === 0 ? placeholder : `${selectedValues.length} selected`}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {options.map(option => (
              <label
                key={option}
                className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-4 h-4 text-[#3BAF4A] border-2 border-gray-300 rounded focus:ring-[#3BAF4A] focus:ring-2"
                />
                <span className="text-sm text-[#1B263B]">{option}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function AdminBasketCreatePage({ navigateTo, user, basketData }: AdminBasketCreatePageProps) {
  const isEditMode = basketData?.isEditMode || false;
  const editingBasket = basketData?.basket || null;

  const [basketName, setBasketName] = useState(editingBasket?.name || '');
  const [basketDescription, setBasketDescription] = useState(editingBasket?.description || '');
  const [basketColor, setBasketColor] = useState(editingBasket?.color || '#2E89C4');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>(editingBasket?.riskLevel || 'Medium');
  
  // Convert to arrays for multi-select
  const [ageRanges, setAgeRanges] = useState<string[]>(
    Array.isArray(editingBasket?.ageRange) ? editingBasket.ageRange : (editingBasket?.ageRange ? [editingBasket.ageRange] : [])
  );
  const [timeHorizons, setTimeHorizons] = useState<string[]>(
    Array.isArray(editingBasket?.timeHorizon) ? editingBasket.timeHorizon : (editingBasket?.timeHorizon ? [editingBasket.timeHorizon] : [])
  );
  const [investorKnowledgeLevels, setInvestorKnowledgeLevels] = useState<string[]>(
    Array.isArray(editingBasket?.experienceLevel) ? editingBasket.experienceLevel : (editingBasket?.experienceLevel ? [editingBasket.experienceLevel] : [])
  );
  const [investmentCapacities, setInvestmentCapacities] = useState<string[]>(
    Array.isArray(editingBasket?.investmentCapacity) ? editingBasket.investmentCapacity : (editingBasket?.investmentCapacity ? [editingBasket.investmentCapacity] : [])
  );
  const [expectedReturnsOptions, setExpectedReturnsOptions] = useState<string[]>(
    Array.isArray(editingBasket?.expectedReturns) ? editingBasket.expectedReturns : (editingBasket?.expectedReturns ? [editingBasket.expectedReturns] : [])
  );
  const [investmentGoals, setInvestmentGoals] = useState<string[]>(
    Array.isArray(editingBasket?.goals) ? editingBasket.goals : (editingBasket?.goals?.[0] ? [editingBasket.goals[0]] : [])
  );
  
  const [error, setError] = useState('');

  const colorOptions = [
    { name: 'Blue', value: '#2E89C4' },
    { name: 'Green', value: '#3BAF4A' },
    { name: 'Orange', value: '#FF6B35' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#E8C23A' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Navy', value: '#1B263B' },
  ];

  const handleNext = () => {
    if (!basketName.trim()) {
      setError('Please enter a basket name');
      return;
    }

    if (!ageRanges.length) {
      setError('Please select an age range');
      return;
    }

    if (!timeHorizons.length) {
      setError('Please select a time horizon');
      return;
    }

    const basketData = {
      basketName,
      basketDescription,
      basketColor,
      ageRanges,
      riskLevel,
      timeHorizons,
      investorKnowledgeLevels,
      investmentCapacities,
      expectedReturnsOptions,
      investmentGoals,
      isEditMode,
      editingBasket,
    };

    navigateTo('admin-fund-selection', basketData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App-level Header is provided in App.tsx; removed local Header usage */}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigateTo('admin-dashboard')}
          className="flex items-center space-x-2 text-[#2E89C4] hover:text-[#1B263B] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Admin Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3BAF4A] to-[#2E89C4] rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[#1B263B]">{isEditMode ? 'Edit' : 'Create New'} Curated Basket</h1>
              <p className="text-sm text-gray-600">
                {isEditMode ? 'Update the basket configuration and settings' : 'Build a professionally curated basket for users'}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#3BAF4A]">Step 1 of 5</span>
              <span className="text-sm text-gray-500">Basket Configuration</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#3BAF4A] to-[#2E89C4] h-2 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basket Name */}
              <div>
                <label htmlFor="basketName" className="block text-sm text-gray-700 mb-2">
                  Basket Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="basketName"
                  type="text"
                  value={basketName}
                  onChange={(e) => {
                    setBasketName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., Orange Basket, Retirement Builder"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{basketName.length}/50 characters</p>
              </div>

              {/* Basket Description */}
              <div>
                <label htmlFor="basketDescription" className="block text-sm text-gray-700 mb-2">
                  Basket Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="basketDescription"
                  value={basketDescription}
                  onChange={(e) => setBasketDescription(e.target.value)}
                  placeholder="Brief description of the basket's strategy and target audience..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2E89C4] transition-colors resize-none"
                  rows={4}
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">{basketDescription.length}/300 characters</p>
              </div>

              {/* Basket Color */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Basket Theme Color <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBasketColor(color.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        basketColor === color.value
                          ? 'border-[#3BAF4A] shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: color.value }}
                      />
                      <p className="text-xs text-gray-600 mt-2 text-center">{color.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <MultiSelectDropdown
                label="Target Age Range"
                options={['18-25', '25-35', '35-45', '45-55', '55+', 'All Ages']}
                selectedValues={ageRanges}
                onChange={(values) => {
                  setAgeRanges(values);
                  setError('');
                }}
                placeholder="Select age ranges"
                required
              />

              {/* Risk Level */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Risk Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Low', 'Medium', 'High'] as const).map((risk) => (
                    <button
                      key={risk}
                      onClick={() => setRiskLevel(risk)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        riskLevel === risk
                          ? 'border-[#3BAF4A] bg-[#3BAF4A]/10 text-[#3BAF4A]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Time Horizon - Multi-select */}
              <MultiSelectDropdown
                label="Time Horizon"
                options={[
                  'Short-term (1-3 years)',
                  'Medium-term (3-5 years)',
                  'Long-term (5-10 years)',
                  'Very Long-term (10+ years)'
                ]}
                selectedValues={timeHorizons}
                onChange={(values) => {
                  setTimeHorizons(values);
                  setError('');
                }}
                placeholder="Select time horizons"
                required
              />

              {/* Investor Knowledge Level - Multi-select */}
              <MultiSelectDropdown
                label="Investor Knowledge Level"
                options={['Beginner', 'Intermediate', 'Advanced', 'Expert']}
                selectedValues={investorKnowledgeLevels}
                onChange={setInvestorKnowledgeLevels}
                placeholder="Select knowledge levels"
              />

              {/* Investment Capacity - Multi-select */}
              <MultiSelectDropdown
                label="Investment Capacity"
                options={[
                  'Low (₹5,000 - ₹25,000)',
                  'Medium (₹25,000 - ₹1,00,000)',
                  'High (₹1,00,000 - ₹5,00,000)',
                  'Very High (₹5,00,000+)'
                ]}
                selectedValues={investmentCapacities}
                onChange={setInvestmentCapacities}
                placeholder="Select investment capacities"
              />

              {/* Expected Returns (CAGR) - Multi-select */}
              <MultiSelectDropdown
                label="Expected Returns (CAGR %)"
                options={[
                  'Conservative (8-10%)',
                  'Moderate (10-12%)',
                  'Aggressive (12-15%)',
                  'Very Aggressive (15%+)'
                ]}
                selectedValues={expectedReturnsOptions}
                onChange={setExpectedReturnsOptions}
                placeholder="Select expected returns"
              />

              {/* Investment Goal - Multi-select */}
              <MultiSelectDropdown
                label="Primary Investment Goal"
                options={[
                  'Wealth Creation',
                  'Retirement Planning',
                  'Child Education',
                  'Tax Saving',
                  'Emergency Fund',
                  'House Purchase',
                  'Regular Income'
                ]}
                selectedValues={investmentGoals}
                onChange={setInvestmentGoals}
                placeholder="Select investment goals"
              />

              {/* Info Card */}
              <div className="bg-gradient-to-r from-[#2E89C4]/10 to-[#3BAF4A]/10 border border-[#2E89C4]/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-[#2E89C4] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm text-[#1B263B] mb-1">Admin Tip</h4>
                    <p className="text-xs text-gray-700">
                      These filters help users find the perfect basket. Fill in as many details as possible for better discoverability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigateTo('admin-dashboard')}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-[#3BAF4A] hover:bg-[#329940] text-white rounded-lg transition-all shadow-lg flex items-center space-x-2"
            >
              <span>Next: Select Funds</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}