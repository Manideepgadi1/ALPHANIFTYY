import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, TrendingUp } from 'lucide-react';
import NormalizedComparisonChartChartJS from '../components/NormalizedComparisonChartChartJS';

interface Fund {
  code: string;
  name: string;
  age: string;
  category: string;
  amc: string;
  returns1Y: string;
  aum?: string;
  expenseRatio?: string;
  returns3Y?: string;
  returns5Y?: string;
  nav?: string;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? 'http://localhost:5000/api'
    : 'https://app.vsfintech.in/alphanifty/api'
);

const FundComparisonWithNormalization: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedFunds, setSelectedFunds] = useState<Array<{
    schemeCode: string;
    name: string;
    color?: string;
    inceptionDate?: string;
    aum?: string;
    expenseRatio?: string;
    returns3Y?: string;
    returns5Y?: string;
    returnsInception?: string;
  }>>([]);
  const [allFunds, setAllFunds] = useState<Fund[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFund, setShowAddFund] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fund colors for visualization
  const fundColors = ['#3498DB', '#E74C3C', '#2ECC71', '#F39C12'];

  useEffect(() => {
    fetchAllFunds();
    
    // Load funds from URL params
    const fundsParam = searchParams.get('funds');
    if (fundsParam) {
      const fundCodes = fundsParam.split(',').filter(Boolean);
      // We'll fetch names after getting all funds
      if (fundCodes.length > 0) {
        const initialFunds = fundCodes.map((code, idx) => ({
          schemeCode: code,
          name: `Fund ${code}`, // Temporary name
          color: fundColors[idx % fundColors.length]
        }));
        setSelectedFunds(initialFunds);
      }
    }
  }, []);

  // Update selected funds names and fetch details once we have all funds data
  useEffect(() => {
    if (allFunds.length > 0 && selectedFunds.length > 0) {
      // Only update if funds don't have detailed metrics yet
      const needsUpdate = selectedFunds.some(f => !f.aum && !f.inceptionDate);
      
      if (needsUpdate) {
        const fetchFundDetails = async () => {
          const updatedFunds = await Promise.all(
            selectedFunds.map(async (sf) => {
              const fullFund = allFunds.find(f => f.code === sf.schemeCode);
              
              // If already has details, keep them
              if (sf.aum || sf.inceptionDate) {
                return {
                  ...sf,
                  name: fullFund?.name || sf.name
                };
              }
              
              // Fetch details from factsheet
              let fundDetails = {
                inceptionDate: '',
                aum: '',
                expenseRatio: '',
                returns3Y: '',
                returns5Y: '',
                returnsInception: ''
              };
              
              try {
                const response = await fetch(`${API_BASE_URL}/funds/${sf.schemeCode}/factsheet`);
                const data = await response.json();
                const snapshot = data.data?.snapshot_summary?.[0] || {};
                
                fundDetails = {
                  inceptionDate: snapshot.INCEPT_DATE || '',
                  aum: snapshot.AUM || '',
                  expenseRatio: snapshot.EXPENSE_RATIO || '',
                  returns3Y: snapshot['3YEARRET'] || '',
                  returns5Y: snapshot['5YEARRET'] || '',
                  returnsInception: snapshot.INCRET || ''
                };
              } catch (error) {
                console.error('Error fetching fund details:', error);
              }
              
              return {
                ...sf,
                name: fullFund?.name || sf.name,
                ...fundDetails
              };
            })
          );
          
          setSelectedFunds(updatedFunds);
        };
        
        fetchFundDetails();
      }
    }
  }, [allFunds]);

  const fetchAllFunds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mutual-funds`);
      const result = await response.json();
      
      if ((result.status === 'success' || result.status === 200) && result.data) {
        const funds: Fund[] = result.data.map((item: any[]) => ({
          code: item[0],
          name: item[1],
          age: item[2],
          category: item[3],
          amc: item[1].split(' ')[0], // Extract AMC from name
          returns1Y: item[4],
          nav: item[5] || '',
          aum: item[6] || '',
          expenseRatio: item[7] || '',
          returns3Y: item[8] || '',
          returns5Y: item[9] || ''
        }));
        
        setAllFunds(funds);
      }
    } catch (error) {
      console.error('Error fetching funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFund = async (fund: Fund) => {
    if (selectedFunds.length >= 10) {
      alert('Maximum 10 funds can be compared');
      return;
    }
    
    if (selectedFunds.some(f => f.schemeCode === fund.code)) {
      alert('This fund is already selected');
      return;
    }

    // Fetch fund details from factsheet
    let fundDetails = {
      inceptionDate: '',
      aum: '',
      expenseRatio: '',
      returns3Y: '',
      returns5Y: '',
      returnsInception: ''
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/funds/${fund.code}/factsheet`);
      const data = await response.json();
      const snapshot = data.data?.snapshot_summary?.[0] || {};
      
      fundDetails = {
        inceptionDate: snapshot.INCEPT_DATE || '',
        aum: snapshot.AUM || '',
        expenseRatio: snapshot.EXPENSE_RATIO || '',
        returns3Y: snapshot['3YEARRET'] || '',
        returns5Y: snapshot['5YEARRET'] || '',
        returnsInception: snapshot.INCRET || ''
      };
    } catch (error) {
      console.error('Error fetching fund details:', error);
    }

    const newFund = {
      schemeCode: fund.code,
      name: fund.name,
      color: fundColors[selectedFunds.length % fundColors.length],
      ...fundDetails
    };

    const updatedFunds = [...selectedFunds, newFund];
    setSelectedFunds(updatedFunds);
    
    // Update URL
    const fundCodes = updatedFunds.map(f => f.schemeCode).join(',');
    navigate(`?funds=${fundCodes}`, { replace: true });
    
    setShowAddFund(false);
    setSearchTerm('');
  };

  const removeFund = (schemeCode: string) => {
    const updatedFunds = selectedFunds.filter(f => f.schemeCode !== schemeCode);
    setSelectedFunds(updatedFunds);
    
    if (updatedFunds.length === 0) {
      navigate('?', { replace: true });
    } else {
      const fundCodes = updatedFunds.map(f => f.schemeCode).join(',');
      navigate(`?funds=${fundCodes}`, { replace: true });
    }
  };

  const filteredFunds = allFunds.filter(fund =>
    fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fund.code.includes(searchTerm)
  ).slice(0, 20); // Show top 20 results

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all shadow-sm border border-gray-200 mb-6 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explorer
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Fund Performance Comparison
              </h1>
            </div>
            <p className="text-gray-600 text-sm ml-14">
              Compare up to 10 mutual funds with Nifty 50 benchmark • All normalized to base 100
            </p>
          </div>
        </div>

        {/* Selected Funds */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Selected Funds <span className="text-sm font-normal text-gray-500">({selectedFunds.length}/10)</span>
            </h2>
            
            {selectedFunds.length < 10 && (
              <button
                onClick={() => setShowAddFund(!showAddFund)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Fund
              </button>
            )}
          </div>

          {selectedFunds.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-10 w-10 opacity-40" />
              </div>
              <p className="font-semibold text-gray-700">No funds selected</p>
              <p className="text-sm mt-2">Click "Add Fund" to start comparing performance</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedFunds.map((fund, idx) => (
                <div
                  key={fund.schemeCode}
                  className="flex items-center justify-between p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: fund.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fund.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-600">
                        {fund.aum && (
                          <span>AUM: ₹{parseFloat(fund.aum).toFixed(0)}Cr</span>
                        )}
                        {fund.inceptionDate && (() => {
                          const inception = new Date(fund.inceptionDate);
                          const today = new Date();
                          const ageInYears = ((today.getTime() - inception.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
                          return <span>Age: {ageInYears}Y</span>;
                        })()}
                        {fund.returnsInception && (
                          <span>SI: {parseFloat(fund.returnsInception).toFixed(1)}%</span>
                        )}
                        {fund.returns3Y && (
                          <span>3Y: {parseFloat(fund.returns3Y).toFixed(1)}%</span>
                        )}
                        {fund.returns5Y && (
                          <span>5Y: {parseFloat(fund.returns5Y).toFixed(1)}%</span>
                        )}
                        {fund.expenseRatio && (
                          <span>ER: {fund.expenseRatio}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFund(fund.schemeCode)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                    aria-label={`Remove ${fund.name}`}
                    title={`Remove ${fund.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Fund Search/Add Modal */}
          {showAddFund && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <input
                type="text"
                placeholder="Search funds by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                autoFocus
              />
              
              {searchTerm && (
                <div className="mt-3 max-h-64 overflow-y-auto space-y-1">
                  {filteredFunds.map((fund) => (
                    <button
                      key={fund.code}
                      onClick={() => addFund(fund)}
                      className="w-full text-left p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-200"
                      disabled={selectedFunds.some(f => f.schemeCode === fund.code)}
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fund.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-600">
                        {fund.age && <span>Age: {fund.age}</span>}
                        {fund.nav && <span>NAV: ₹{parseFloat(fund.nav).toFixed(2)}</span>}
                        {fund.aum && <span>AUM: ₹{parseFloat(fund.aum).toFixed(0)}Cr</span>}
                        {fund.returns1Y && <span className="text-green-600 font-medium">1Y: {parseFloat(fund.returns1Y).toFixed(1)}%</span>}
                        {fund.returns3Y && <span className="text-green-600 font-medium">3Y: {parseFloat(fund.returns3Y).toFixed(1)}%</span>}
                        {fund.returns5Y && <span className="text-green-600 font-medium">5Y: {parseFloat(fund.returns5Y).toFixed(1)}%</span>}
                        {fund.expenseRatio && <span>ER: {fund.expenseRatio}%</span>}
                      </div>
                    </button>
                  ))}
                  
                  {filteredFunds.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">
                      No funds found
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Normalized Comparison Chart */}
        {selectedFunds.length > 0 && (
          <NormalizedComparisonChartChartJS 
            funds={selectedFunds}
            includeNifty={true}
          />
        )}

        {/* Info Box */}
        {selectedFunds.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Understanding the Comparison
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">✅ Normalized to 100</p>
                <p className="text-xs">All funds and Nifty 50 start at 100 for fair comparison regardless of actual NAV values</p>
              </div>
              <div>
                <p className="font-medium mb-1">📅 Youngest Fund Start</p>
                <p className="text-xs">Chart begins from the youngest fund's inception date to ensure all funds can be compared fairly</p>
              </div>
              <div>
                <p className="font-medium mb-1">📊 One Line Per Fund</p>
                <p className="text-xs">Each selected fund gets its own colored line, plus Nifty 50 benchmark as dotted gray line</p>
              </div>
              <div>
                <p className="font-medium mb-1">🎯 Return Percentage</p>
                <p className="text-xs">Hover over chart to see indexed value and percentage return from starting point</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundComparisonWithNormalization;
