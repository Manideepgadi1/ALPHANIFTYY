import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, TrendingUp, TrendingDown, Building2, 
  ShoppingCart, Star, BarChart3, PieChart, Info, X, 
  ArrowUpRight, ArrowDownRight, Loader, ChevronDown 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useCart from '../context/CartContext';
import { getRandomQuote } from '../utils/investmentQuotes';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ================= INTERFACES ================= */
interface FundAMC {
  AMC_CODE: string;
  FUND: string;
}

interface FundCategory {
  classcode: string;
  className: string;
}

interface FundScheme {
  SCHEMECODE: string;
  S_NAME: string;
  AMC_NAME?: string;
  CATEGORY?: string;
  AGE?: string;
  RETURNS_1Y?: string;
  NAV?: string;
  AUM?: string;
  EXPENSE_RATIO?: string;
  RETURNS_3Y?: string;
  RETURNS_5Y?: string;
}

interface FundFactsheet {
  snapshot_summary: Array<{
    S_NAME: string;
    NAVRS: string;
    NAVDATE: string;
    AUM: string;
    EXPENSE_RATIO: string;
    INCRET: string;
    RISKTYPE: string;
    '1MONTHRET': string;
    '3MONTHRET': string;
    '6MONTHRET': string;
    '1YRRET': string;
    '3YEARRET': string;
    '5YEARRET': string;
    PER_CHANGE: string;
    BENCHMARK: string;
    MININVT: string;
    SIPMININVEST: string;
    EXIT_LOAD: string;
    INCEPT_DATE: string;
  }>;
  ratios?: Array<{
    SHARPR: string;
    STANDARDR: string;
    BETAR: string;
    SORTINO: string;
    TREYNOR: string;
  }>;
  asset_allocation?: Array<{
    Asset: string;
    HOLDPERCENTAGE: string;
  }>;
  market_cap?: Array<{
    CAP: string;
    HOLDPERCENTAGE: string;
  }>;
  holdings?: Array<{
    Compname: string;
    HoldPer: string;
    MKTVAL: string;
  }>;
  sector_allocation?: Array<{
    INDUSTRY: string;
    HOLDPER: string;
  }>;
}

interface SelectedFund {
  code: string;
  name: string;
  factsheet: FundFactsheet;
}

interface NAVHistory {
  date: string;
  nav: number;
}

/* ================= CONSTANTS ================= */
// Use backend proxy to avoid CORS issues - include /alphanifty prefix for production
const API_BASE = import.meta.env.DEV 
  ? '/api' 
  : '/alphanifty/api';
const API_MF_BASE = import.meta.env.DEV 
  ? '/api/mf' 
  : '/alphanifty/api/mf';
const ACCORD_API_BASE = 'https://mf.accordwebservices.com/MF';
const API_TOKEN = 'aFzyhRkNn8g_KX8fVBgA3Md54GiSfEpz';
const ITEMS_PER_PAGE = 20;

/* ================= HELPER FUNCTIONS ================= */
const formatNumber = (value: string | number, decimals = 2): string => {
  if (!value || value === 'N/A') return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 'N/A' : num.toFixed(decimals);
};

const formatCurrency = (value: string | number): string => {
  if (!value) return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'N/A';
  return `₹${num.toLocaleString('en-IN')}`;
};

const getRiskColor = (risk: string): string => {
  const riskLower = risk?.toLowerCase() || '';
  if (riskLower.includes('low')) return 'text-success-700 bg-success-50';
  if (riskLower.includes('moderate')) return 'text-warning-700 bg-warning-50';
  if (riskLower.includes('high')) return 'text-danger-700 bg-danger-50';
  return 'text-gray-700 bg-gray-50';
};

const getReturnColor = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'text-gray-700';
  return num >= 0 ? 'text-success-700' : 'text-danger-700';
};

/* ================= MAIN COMPONENT ================= */
const MutualFundExplorerPage: React.FC = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  
  // State Management
  const [amcList, setAmcList] = useState<FundAMC[]>([]);
  const [selectedAMC, setSelectedAMC] = useState<string>('all');
  const [categories, setCategories] = useState<FundCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [schemes, setSchemes] = useState<FundScheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<FundScheme[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFund, setSelectedFund] = useState<SelectedFund | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [navHistory, setNavHistory] = useState<NAVHistory[]>([]);
  const [loadingNav, setLoadingNav] = useState<boolean>(false);
  
  // Comparison state
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Fetch AMC List on mount
  useEffect(() => {
    fetchAMCList();
  }, []);

  // Fetch Categories when AMC changes
  useEffect(() => {
    if (selectedAMC && selectedAMC !== '' && selectedAMC !== 'all') {
      fetchCategories(selectedAMC);
    } else {
      // If "All" is selected, clear categories and load all schemes
      setCategories([]);
      setSelectedCategory('all');
      fetchAllSchemes();
    }
  }, [selectedAMC]);

  // Fetch Schemes when Category changes
  useEffect(() => {
    if (selectedAMC && selectedAMC !== '' && selectedAMC !== 'all') {
      if (selectedCategory === 'all') {
        // Fetch all schemes for the AMC, then we'll filter by search
        fetchAllSchemesForAMC(selectedAMC);
      } else {
        // Fetch schemes for specific category
        fetchSchemes(selectedAMC, selectedCategory);
      }
    }
  }, [selectedAMC, selectedCategory]);

  // Filter schemes based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSchemes(schemes);
      setCurrentPage(1);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = schemes.filter(scheme =>
      scheme.S_NAME.toLowerCase().includes(searchLower) ||
      (scheme.AMC_NAME && scheme.AMC_NAME.toLowerCase().includes(searchLower)) ||
      (scheme.CATEGORY && scheme.CATEGORY.toLowerCase().includes(searchLower))
    );
    setFilteredSchemes(filtered);
    setCurrentPage(1);
  }, [searchTerm, schemes]);

  /* ================= API CALLS ================= */
  const fetchAMCList = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/amcs`
      );
      const data = await response.json();
      setAmcList(data.Table || []);
      // Start with All selected
      setSelectedAMC('all');
    } catch (error) {
      console.error('Error fetching AMC list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (amcCode: string) => {
    try {
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(
        `${API_MF_BASE}/categories?fund=${amcCode}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      const data = await response.json();
      // Show all categories without strict filtering
      const validCategories = (data.Table || []);
      setCategories(validCategories);
      setSelectedCategory('all');
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      if (error.name === 'AbortError') {
        console.warn('Category fetch timed out');
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemes = async (amcCode: string, categoryCode: string) => {
    try {
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(
        `${API_MF_BASE}/schemes?fund=${amcCode}&category=${categoryCode}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      const filtered = (data.Table || [])
        .map((scheme: FundScheme) => ({
          ...scheme,
          AMC_NAME: amcList.find(a => a.AMC_CODE === amcCode)?.FUND || '',
          CATEGORY: categories.find(c => c.classcode === categoryCode)?.className || ''
        }));
      
      setSchemes(filtered);
      setFilteredSchemes(filtered);
    } catch (error: any) {
      console.error('Error fetching schemes:', error);
      if (error.name === 'AbortError') {
        alert('Request timed out. Please try again or select a different AMC.');
      }
      setSchemes([]);
      setFilteredSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSchemes = async () => {
    try {
      setLoading(true);
      
      // Use backend proxy with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${API_BASE}/mutual-funds/all`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the backend returned an error
      if (data.status === 'error') {
        console.error('Backend API error:', data.message);
        alert('Unable to load all funds. Please select a specific AMC or try again later.');
        setSchemes([]);
        setFilteredSchemes([]);
        return;
      }
      
      const filtered = (data.data || [])
        .map((item: any[]) => ({
          SCHEMECODE: item[0],
          S_NAME: item[1],
          AGE: item[2] || '',
          CATEGORY: item[3] || '',
          RETURNS_1Y: item[4] || '',  // Column 4: appears to be 1Y return
          NAV: item[5] || '',         // Column 5: appears to be NAV
          AUM: item[6] || '',         // Column 6: appears to be AUM or 3Y return
          AMC_NAME: item[1]?.split(' ')[0] || ''
        }));
      
      setSchemes(filtered);
      setFilteredSchemes(filtered);
    } catch (error: any) {
      console.error('Error fetching all schemes:', error);
      
      if (error.name === 'AbortError') {
        alert('Request timed out. Please select a specific AMC to view funds.');
      } else {
        alert('Unable to load funds. Please select a specific AMC or check your connection.');
      }
      
      setSchemes([]);
      setFilteredSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSchemesForAMC = async (amcCode: string) => {
    try {
      setLoading(true);
      
      // Fetch all categories in parallel with timeout
      const categoryPromises = categories.map(category => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout per request
        
        return fetch(`${API_MF_BASE}/schemes?fund=${amcCode}&category=${category.classcode}`, {
          signal: controller.signal
        })
          .then(res => {
            clearTimeout(timeoutId);
            return res.json();
          })
          .catch(err => {
            clearTimeout(timeoutId);
            console.error(`Error fetching schemes for category ${category.className}:`, err);
            return { Table: [] };
          })
          .then(data => ({
            categoryName: category.className,
            schemes: data.Table || []
          }));
      });
      
      // Wait for all requests to complete
      const allCategoryResults = await Promise.all(categoryPromises);
      
      // Process results - removed IDCW/Direct filtering
      const allSchemes: FundScheme[] = [];
      allCategoryResults.forEach(result => {
        const categorySchemes = result.schemes
          .map((scheme: FundScheme) => ({
            ...scheme,
            AMC_NAME: amcList.find(a => a.AMC_CODE === amcCode)?.FUND || '',
            CATEGORY: result.categoryName
          }));
        
        allSchemes.push(...categorySchemes);
      });
      
      setSchemes(allSchemes);
      setFilteredSchemes(allSchemes);
    } catch (error) {
      console.error('Error fetching all schemes for AMC:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFundDetails = async (schemeCode: string, schemeName: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/factsheet/${schemeCode}`
      );
      const data: FundFactsheet = await response.json();
      
      setSelectedFund({
        code: schemeCode,
        name: schemeName,
        factsheet: data
      });
      
      // Fetch NAV history
      fetchNAVHistory(schemeCode);
    } catch (error) {
      console.error('Error fetching fund details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNAVHistory = async (schemeCode: string) => {
    try {
      setLoadingNav(true);
      // Fetch NAV history using Accord API - supports all 9000+ funds automatically
      const response = await fetch(
        `${API_BASE}/funds/${schemeCode}/nav-history?period=1Y`
      );
      const apiResponse = await response.json();
      const data = apiResponse.data || apiResponse;
      
      if (data.Table && Array.isArray(data.Table)) {
        // Get last 365 days
        const history = data.Table
          .slice(-365)
          .map((item: any) => ({
            date: item.NAVDATE || item.Date,
            nav: parseFloat(item.NAVRS || item.NAV || 0)
          }))
          .filter((item: NAVHistory) => item.nav > 0);
        
        setNavHistory(history);
      }
    } catch (error) {
      console.error('Error fetching NAV history:', error);
      setNavHistory([]);
    } finally {
      setLoadingNav(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleAddToCart = (fund: SelectedFund) => {
    const snapshot = fund.factsheet.snapshot_summary?.[0];
    if (!snapshot) return;

    const newItem = {
      id: parseInt(fund.code) || Date.now(),
      basketId: fund.code,
      quantity: 1,
      investmentType: 'Lumpsum' as const,
      amount: parseFloat(snapshot.MININVT) || 5000
    };
    
    // Save to localStorage immediately
    const currentCart = JSON.parse(localStorage.getItem('alphanifty_cart') || '[]');
    localStorage.setItem('alphanifty_cart', JSON.stringify([...currentCart, newItem]));
    
    // Update context
    addItem(newItem);
    
    // Dispatch event to update header counter
    window.dispatchEvent(new Event('cart-updated'));

    alert(`${fund.name} added to cart!`);
  };

  const toggleFundSelection = (schemeCode: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(schemeCode)) {
        return prev.filter(code => code !== schemeCode);
      } else {
        if (prev.length >= 5) {
          alert('You can compare up to 5 funds at a time');
          return prev;
        }
        return [...prev, schemeCode];
      }
    });
  };

  const handleCompare = () => {
    if (selectedForComparison.length === 0) return;
    
    // Open comparison page in new tab
    const fundCodesParam = selectedForComparison.join(',');
    const basePath = import.meta.env.BASE_URL || '/';
    const comparisonUrl = `${basePath}fund-comparison-normalized?funds=${fundCodesParam}`;
    window.open(comparisonUrl, '_blank');
    
    // Clear selection after opening
    setSelectedForComparison([]);
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredSchemes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSchemes = filteredSchemes.slice(startIndex, endIndex);

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container-main">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mutual Fund Explorer
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Discover and compare thousands of mutual funds with advanced analytics
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="container-main py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* AMC Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Management Company
              </label>
              <select
                value={selectedAMC}
                onChange={(e) => setSelectedAMC(e.target.value)}
                className="input"
                aria-label="Select Asset Management Company"
              >
                <option value="all">All</option>
                {amcList.map((amc) => (
                  <option key={amc.AMC_CODE} value={amc.AMC_CODE}>
                    {amc.FUND}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
                aria-label="Select category"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.classcode} value={cat.classcode}>
                    {cat.className}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Funds
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by fund name..."
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredSchemes.length)} of{' '}
              {filteredSchemes.length} funds
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-primary hover:text-primary-700"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-main py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center max-w-2xl mx-auto px-4">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">Loading mutual funds...</p>
              <p className="text-sm text-gray-500 italic">"{getRandomQuote()}"</p>
            </div>
          </div>
        ) : currentSchemes.length === 0 ? (
          <div className="text-center py-20">
            <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No funds found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : (
          <>
            {/* Fund Cards Grid */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {currentSchemes.map((scheme) => (
                <FundCard
                  key={scheme.SCHEMECODE}
                  scheme={scheme}
                  onViewDetails={() => navigate(`/fund/${scheme.SCHEMECODE}`)}
                  isSelected={selectedForComparison.includes(scheme.SCHEMECODE)}
                  onToggleSelect={(e) => {
                    e.stopPropagation();
                    toggleFundSelection(scheme.SCHEMECODE);
                  }}
                />
              ))}
            </div>

            {/* Compare Button */}
            {selectedForComparison.length > 0 && (
              <div className="fixed bottom-8 right-8 z-40">
                <button
                  onClick={handleCompare}
                  className="btn btn-primary shadow-lg px-6 py-3 text-lg"
                >
                  <BarChart3 className="w-5 h-5" />
                  Compare {selectedForComparison.length} Fund{selectedForComparison.length > 1 ? 's' : ''}
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Fund Details Modal */}
      {selectedFund && (
        <FundDetailsModal
          fund={selectedFund}
          onClose={() => setSelectedFund(null)}
          onAddToCart={handleAddToCart}
          navHistory={navHistory}
          loadingNav={loadingNav}
        />
      )}
    </div>
  );
};

/* ================= FUND CARD COMPONENT ================= */
const FundCard: React.FC<{
  scheme: FundScheme;
  onViewDetails: () => void;
  isSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
}> = ({ scheme, onViewDetails, isSelected, onToggleSelect }) => {
  return (
    <div className="card p-6 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            onClick={onToggleSelect}
            className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
            aria-label={`Select ${scheme.S_NAME} for comparison`}
          />
        </div>

        {/* Fund Info - clickable */}
        <div 
          className="flex-1 min-w-0 cursor-pointer" 
          onClick={onViewDetails}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
            {scheme.S_NAME}
          </h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
            {scheme.AMC_NAME && (
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {scheme.AMC_NAME}
              </span>
            )}
            {scheme.CATEGORY && (
              <span className="badge badge-low">
                {scheme.CATEGORY}
              </span>
            )}
          </div>

          {/* Metrics Row - Only show AUM and 1Y Return */}
          {(scheme.AUM || scheme.RETURNS_1Y) && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
              {scheme.AUM && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">AUM</p>
                  <p className="font-semibold text-blue-600">₹{scheme.AUM} Cr</p>
                </div>
              )}
              {scheme.RETURNS_1Y && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">1Y Return</p>
                  <p className="font-semibold text-green-600">{scheme.RETURNS_1Y}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button 
          className="btn btn-primary flex-shrink-0"
          onClick={onViewDetails}
        >
          View Details
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ================= FUND DETAILS MODAL ================= */
const FundDetailsModal: React.FC<{
  fund: SelectedFund;
  onClose: () => void;
  onAddToCart: (fund: SelectedFund) => void;
  navHistory: NAVHistory[];
  loadingNav: boolean;
}> = ({ fund, onClose, onAddToCart, navHistory, loadingNav }) => {
  const snapshot = fund.factsheet.snapshot_summary?.[0];
  const ratios = fund.factsheet.ratios?.[0];

  if (!snapshot) return null;

  // NAV Line Chart Data
  const navChartData = {
    labels: navHistory.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'NAV',
      data: navHistory.map(item => item.nav),
      borderColor: '#2E89C4',
      backgroundColor: 'rgba(46, 137, 196, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2
    }]
  };

  const navChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `NAV: ₹${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: { maxTicksLimit: 8 }
      },
      y: {
        display: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value: any) => `₹${value}`
        }
      }
    }
  };

  // Sector Allocation Pie Chart
  const sectorData = fund.factsheet.sector_allocation?.slice(0, 10) || [];
  const sectorChartData = {
    labels: sectorData.map(s => s.INDUSTRY),
    datasets: [{
      data: sectorData.map(s => parseFloat(s.HOLDPER)),
      backgroundColor: [
        '#2E89C4', '#3BAF4A', '#E8C23A', '#DC2626', '#9333EA',
        '#F97316', '#06B6D4', '#84CC16', '#EF4444', '#8B5CF6'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const sectorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { boxWidth: 12, padding: 8, font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed.toFixed(2)}%`
        }
      }
    }
  };

  // Asset Allocation Doughnut Chart
  const assetData = fund.factsheet.asset_allocation || [];
  const assetChartData = {
    labels: assetData.map(a => a.Asset),
    datasets: [{
      data: assetData.map(a => parseFloat(a.HOLDPERCENTAGE)),
      backgroundColor: ['#2E89C4', '#3BAF4A', '#E8C23A', '#DC2626', '#9333EA'],
      borderWidth: 3,
      borderColor: '#fff'
    }]
  };

  const assetChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, padding: 10, font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed.toFixed(2)}%`
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {snapshot.S_NAME}
            </h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className={`badge ${getRiskColor(snapshot.RISKTYPE)}`}>
                {snapshot.RISKTYPE} Risk
              </span>
              <span className="text-gray-600">
                NAV: ₹{formatNumber(snapshot.NAVRS)}
              </span>
              <span className="text-gray-600">
                AUM: ₹{formatNumber(snapshot.AUM)} Cr
              </span>
              {snapshot.INCEPT_DATE && (
                <span className="text-gray-600 font-medium">
                  Inception: {new Date(snapshot.INCEPT_DATE).toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close modal"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Fund Details Row */}
          {snapshot.INCEPT_DATE && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fund Inception Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(snapshot.INCEPT_DATE).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Fund Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(() => {
                      const years = Math.floor((new Date().getTime() - new Date(snapshot.INCEPT_DATE).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                      return `${years} ${years === 1 ? 'Year' : 'Years'}`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="1Y Return"
              value={`${formatNumber(snapshot['1YRRET'])}%`}
              trend={parseFloat(snapshot['1YRRET']) >= 0 ? 'up' : 'down'}
            />
            <StatCard
              label="3Y Return"
              value={`${formatNumber(snapshot['3YEARRET'])}%`}
              trend={parseFloat(snapshot['3YEARRET']) >= 0 ? 'up' : 'down'}
            />
            <StatCard
              label="Expense Ratio"
              value={`${formatNumber(snapshot.EXPENSE_RATIO)}%`}
              trend="neutral"
            />
            <StatCard
              label="Min Investment"
              value={formatCurrency(snapshot.MININVT)}
              trend="neutral"
            />
          </div>

          {/* Returns Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Historical Returns</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <ReturnCell label="1D" value={snapshot.PER_CHANGE} />
              <ReturnCell label="1M" value={snapshot['1MONTHRET']} />
              <ReturnCell label="3M" value={snapshot['3MONTHRET']} />
              <ReturnCell label="6M" value={snapshot['6MONTHRET']} />
              <ReturnCell label="1Y" value={snapshot['1YRRET']} />
              <ReturnCell label="3Y" value={snapshot['3YEARRET']} />
            </div>
          </div>

          {/* NAV Price Chart */}
          {navHistory.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                NAV Price Trend (1 Year)
              </h3>
              <div className="bg-white rounded-lg border p-3 sm:p-4 chart-md overflow-x-auto">
                <Line data={navChartData} options={navChartOptions} />
              </div>
            </div>
          )}
          {loadingNav && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading chart...</span>
            </div>
          )}

          {/* Charts Row: Sector & Asset Allocation */}
          {(fund.factsheet.sector_allocation || fund.factsheet.asset_allocation) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sector Allocation */}
              {fund.factsheet.sector_allocation && fund.factsheet.sector_allocation.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Sector Allocation
                  </h3>
                  <div className="bg-white rounded-lg border p-3 sm:p-4 chart-md">
                    <Pie data={sectorChartData} options={sectorChartOptions} />
                  </div>
                </div>
              )}

              {/* Asset Allocation */}
              {fund.factsheet.asset_allocation && fund.factsheet.asset_allocation.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    Asset Allocation
                  </h3>
                  <div className="bg-white rounded-lg border p-3 sm:p-4 chart-md">
                    <Doughnut data={assetChartData} options={assetChartOptions} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Risk Metrics */}
          {ratios && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <MetricCell label="Sharpe Ratio" value={formatNumber(ratios.SHARPR)} />
                <MetricCell label="Std Dev" value={`${formatNumber(ratios.STANDARDR)}%`} />
                <MetricCell label="Beta" value={formatNumber(ratios.BETAR)} />
                <MetricCell label="Sortino" value={formatNumber(ratios.SORTINO)} />
                <MetricCell label="Treynor" value={formatNumber(ratios.TREYNOR)} />
              </div>
            </div>
          )}

          {/* Holdings */}
          {fund.factsheet.holdings && fund.factsheet.holdings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Top 10 Holdings</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Company</th>
                      <th className="text-right py-2">Holding %</th>
                      <th className="text-right py-2">Market Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fund.factsheet.holdings.slice(0, 10).map((holding, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{holding.Compname}</td>
                        <td className="text-right">{formatNumber(holding.HoldPer)}%</td>
                        <td className="text-right">₹{formatNumber(holding.MKTVAL)} Cr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => onAddToCart(fund)}
              className="btn btn-primary flex-1"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <Link
              to={`/fund/${fund.code}`}
              className="btn btn-outline flex-1 text-center"
            >
              View Full Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= HELPER COMPONENTS ================= */
const StatCard: React.FC<{
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}> = ({ label, value, trend }) => (
  <div className="card p-4">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <p className={`text-lg font-bold ${
        trend === 'up' ? 'text-success' :
        trend === 'down' ? 'text-danger' : 'text-gray-900'
      }`}>
        {value}
      </p>
      {trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
      {trend === 'down' && <TrendingDown className="w-4 h-4 text-danger" />}
    </div>
  </div>
);

const ReturnCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-sm font-semibold ${getReturnColor(value)}`}>
      {formatNumber(value)}%
    </p>
  </div>
);

const MetricCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

export default MutualFundExplorerPage;
