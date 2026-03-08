import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRandomQuote } from '../utils/investmentQuotes';
import {
  ArrowLeft, Building2, Star, TrendingUp, TrendingDown, Calendar, DollarSign,
  BarChart3, AlertCircle, Share2, Loader, Shield, Target, Award,
  Users, Clock, Percent, Activity, PieChart, Zap, Info, CheckCircle2,
  Briefcase, FileText, ArrowUpRight, ArrowDownRight, Sparkles,
  Lightbulb, Heart, ExternalLink, Download, Eye, ShoppingCart,
  Globe, BadgeCheck, LineChart, Package, Flame, TrendingUpIcon as TrendUp
} from 'lucide-react';
import { fundApi, Fund } from '../services/api';
import InvestModal from '../components/InvestModal';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? 'http://localhost:5000/api'
    : 'https://app.vsfintech.in/alphanifty/api'
);

interface ExtendedFundDetails extends Fund {
  scheme_code?: string;
  scheme_name?: string;
  nav_date?: string;
  fund_manager_1?: string;
  fund_manager_2?: string;
  fund_manager_3?: string;
  objective?: string;
  benchmark?: string;
  min_investment?: string | number;
  sip_min_investment?: string;
  lock_in_period?: string;
  exit_load?: string;
  inception_date?: string;
  factsheet_url?: string;
  return_1month?: string | number;
  return_3month?: string | number;
  return_6month?: string | number;
  return_1year?: string | number;
  return_3year?: string | number;
  return_5year?: string | number;
  ratios?: Array<{
    BETAR?: string;
    SHARPR?: string;
    STANDARDR?: string;
    ALPHAR?: string;
    YTM?: string;
    Average_Maturity?: string;
  }>;
  holdings?: Array<{
    Compname?: string;
    HoldPer?: string;
    Instrument?: string;
    MKTVAL?: string;
  }>;
  asset_allocation?: Array<{
    Asset?: string;
    Percentage?: string;
  }>;
  sector_allocation?: Array<{
    Sector?: string;
    Percentage?: string;
  }>;
  isin?: string;
}

const FundDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fund, setFund] = useState<ExtendedFundDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'holdings' | 'allocation' | 'ratios' | 'chart'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [navChartData, setNavChartData] = useState<Array<{date: string, nav: string}>>([]);
  const [chartPeriod, setChartPeriod] = useState<'1Y' | '3Y' | '5Y' | 'MAX'>('1Y');
  const [chartLoading, setChartLoading] = useState(false);
  const [investModalOpen, setInvestModalOpen] = useState(false);
  
  // Debug log to verify component is loaded
  console.log('FundDetailsPage loaded with InvestModal integration');

  useEffect(() => {
    const fetchFund = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fundApi.getById(id);
        if (response.status === 'success' && response.data) {
          setFund(response.data as ExtendedFundDetails);
        } else {
          setError(response.message || 'Failed to load fund details');
        }
      } catch {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchFund();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chart' && fund && navChartData.length === 0) {
      fetchNAVChartData(chartPeriod);
    }
  }, [activeTab, chartPeriod]);

  const fetchNAVChartData = async (period: string) => {
    if (!fund) return;
    
    setChartLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/funds/${fund.id || fund.scheme_code}/nav-history?period=${period}`);
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Take every Nth point for better visualization (more points for longer periods)
        const step = period === 'MAX' ? 10 : period === '5Y' ? 5 : period === '3Y' ? 3 : 1;
        const filteredData = result.data.filter((_: any, idx: number) => idx % step === 0);
        setNavChartData(filteredData.map((item: any) => ({
          date: item.NAVDATE || item.Date || '',
          nav: item.ADJNAVRS || item.NAV || item.NAVRS || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching NAV chart data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  const formatNumber = (value: string | number | undefined, decimals: number = 2) => {
    if (value === undefined || value === null || value === '') return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  const downloadNAVData = async () => {
    if (!fund) return;
    
    try {
      // Fetch historical NAV data from API (Since Inception)
      const response = await fetch(`${API_BASE_URL}/funds/${fund.id || fund.scheme_code}/nav-history?period=SI`);
      const result = await response.json();
      
      console.log('API Response:', result);
      console.log('First 3 records:', result.data?.slice(0, 3));
      
      // Check what fields are available in the first record
      if (result.data && result.data.length > 0) {
        console.log('Available fields in first record:', Object.keys(result.data[0]));
        console.log('First record full data:', result.data[0]);
      }
      
      if (result.status === 'success' && result.data && result.data.length > 0) {
        // Build CSV content properly
        let csvContent: string = fund.name || fund.scheme_name || 'Fund';
        csvContent += '\n\n'; // Two newlines for blank line
        csvContent += 'Date,NAV\n';
        
        // Add each date-NAV pair
        result.data.forEach((item: any) => {
          const date = item.NAVDATE || item.Date || item.date || '';
          const nav = item.ADJNAVRS || item.NAV || item.NAVRS || item.nav || '';
          csvContent += `${date},${nav}\n`;
        });
        
        console.log('CSV Preview (first 500 chars):', csvContent.substring(0, 500));
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${(fund.name || fund.scheme_name)?.replace(/[^a-z0-9]/gi, '_')}_NAV_History.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Downloaded ${result.data.length} NAV records`);
      } else {
        console.error('❌ No NAV history data available');
        alert('NAV history data is not available for this fund.');
      }
    } catch (error) {
      console.error('❌ Error downloading NAV history:', error);
      alert('Failed to download NAV history. Please try again.');
    }
  };

  const getReturnColor = (value: string | number | undefined) => {
    if (value === undefined || value === null || value === '') return 'text-gray-600';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'text-gray-600';
    return num >= 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  // Mock chart data for visualization
  const generateChartData = () => {
    const returns = [
      parseFloat(formatNumber(fund?.return_1month, 2)),
      parseFloat(formatNumber(fund?.return_3month, 2)),
      parseFloat(formatNumber(fund?.return_6month, 2)),
      parseFloat(formatNumber(fund?.return_1year, 2)),
      parseFloat(formatNumber(fund?.return_3year, 2)),
      parseFloat(formatNumber(fund?.return_5year, 2))
    ];
    return returns.filter(v => !isNaN(v));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center max-w-2xl mx-auto px-4">
          <Loader className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-4">Loading fund details...</p>
          <p className="text-sm text-gray-500 italic">" {getRandomQuote()} "</p>
        </div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="text-center card p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Fund</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/explore-funds')}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Funds
          </button>
        </div>
      </div>
    );
  }

  const fundManagers = [fund.fund_manager_1, fund.fund_manager_2, fund.fund_manager_3].filter(Boolean);
  const chartData = generateChartData();
  const maxReturn = Math.max(...chartData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/explore-funds')}
              className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition font-medium px-4 py-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Explorer
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 rounded-lg transition shadow-sm ${
                  isFavorite ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 transition shadow-sm" aria-label="Share">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={downloadNAVData}
                className="p-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition shadow-sm" 
                aria-label="Download NAV Data"
                title="Download NAV Data"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* HERO SECTION - Clean Professional Design */}
        <div className="mb-6">
          <div className="card p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* LEFT: Fund Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3">{fund.name || fund.scheme_name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold shadow-sm">
                        {fund.category}
                      </span>
                      <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-sm">
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        {fund.rating || 4}/5
                      </span>
                      <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-sm">
                        <Shield className="w-4 h-4" />
                        {fund.risk}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                      {fund.objective ? fund.objective.substring(0, 200) + '...' : 'A professionally managed mutual fund designed to optimize returns while managing risk effectively.'}
                    </p>
                  </div>
                </div>

                {/* QUICK STATS */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="text-white/70 text-xs mb-1 font-medium">NAV</p>
                    <p className="text-2xl font-bold">₹{formatNumber(fund.nav, 2)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="text-white/70 text-xs mb-1 font-medium">1Y Return</p>
                    <p className={`text-2xl font-bold ${parseFloat(formatNumber(fund.return_1year || fund.returns1Y, 2)) >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                      {formatNumber(fund.return_1year || fund.returns1Y, 2)}%
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="text-white/70 text-xs mb-1 font-medium">3Y Return</p>
                    <p className={`text-2xl font-bold ${parseFloat(formatNumber(fund.return_3year || fund.returns3Y, 2)) >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                      {formatNumber(fund.return_3year || fund.returns3Y, 2)}%
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="text-white/70 text-xs mb-1 font-medium">Expense</p>
                    <p className="text-2xl font-bold">{formatNumber(fund.expenseRatio, 2)}%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="text-white/70 text-xs mb-1 font-medium">Launch Date</p>
                    <p className="text-lg font-bold">{fund.inception_date || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* RIGHT: Actions */}
              <div className="flex flex-col gap-3 justify-center">
                <button 
                  onClick={() => setInvestModalOpen(true)}
                  className="w-full px-6 py-4 bg-white text-emerald-700 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-xl"
                >
                  <DollarSign className="w-5 h-5" />
                  Invest Now
                </button>
                <button 
                  onClick={() => setInvestModalOpen(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-2xl transition flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Start SIP
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => navigate(`/compare-funds?funds=${fund.id}`)}
                    className="px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition flex items-center justify-center shadow-lg" 
                    aria-label="Compare"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                  <button className="px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition flex items-center justify-center shadow-lg" aria-label="Track">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition flex items-center justify-center shadow-lg" aria-label="Report">
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PERFORMANCE CARDS - Modern Colorful Design */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Performance Snapshot
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { period: '1M', value: fund.return_1month, icon: <Calendar className="w-4 h-4" />, from: 'from-blue-500', to: 'to-blue-600' },
              { period: '3M', value: fund.return_3month, icon: <Calendar className="w-4 h-4" />, from: 'from-purple-500', to: 'to-purple-600' },
              { period: '6M', value: fund.return_6month, icon: <Calendar className="w-4 h-4" />, from: 'from-pink-500', to: 'to-pink-600' },
              { period: '1Y', value: fund.return_1year || fund.returns1Y, icon: <TrendingUp className="w-4 h-4" />, from: 'from-orange-500', to: 'to-orange-600' },
              { period: '3Y', value: fund.return_3year || fund.returns3Y, icon: <TrendingUp className="w-4 h-4" />, from: 'from-emerald-500', to: 'to-emerald-600' },
              { period: '5Y', value: fund.return_5year || fund.returns5Y, icon: <Award className="w-4 h-4" />, from: 'from-cyan-500', to: 'to-cyan-600' }
            ].map((item, idx) => {
              const val = parseFloat(formatNumber(item.value, 2));
              const isPositive = !isNaN(val) && val >= 0;
              return (
                <div key={idx} className={`card p-5 bg-gradient-to-br ${item.from} ${item.to} text-white hover:shadow-2xl transition-all transform hover:-translate-y-1`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold opacity-90">{item.period}</span>
                    {item.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{formatNumber(item.value, 2)}%</p>
                    {isPositive ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>



        {/* TAB NAVIGATION */}
        <div className="mb-6">
          <div className="flex gap-2 border-b-2 border-slate-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
              { id: 'performance', label: 'Performance Analysis', icon: <TrendUp className="w-4 h-4" /> },
              { id: 'holdings', label: 'Top Holdings', icon: <Briefcase className="w-4 h-4" /> },
              { id: 'allocation', label: 'Portfolio Mix', icon: <PieChart className="w-4 h-4" /> },
              { id: 'ratios', label: 'Key Metrics', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'chart', label: 'NAV Chart', icon: <TrendingUp className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 font-semibold transition flex items-center gap-2 whitespace-nowrap border-b-4 ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-emerald-600'
                    : 'text-slate-600 hover:text-emerald-600 border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* KEY INVESTMENT DETAILS */}
                <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-slate-50">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Key Investment Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1 font-medium">AUM</p>
                      <p className="text-2xl font-bold text-slate-900">{fund.aum || 'N/A'}</p>
                      <p className="text-xs text-slate-500 mt-1">Total Assets</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1 font-medium">Min SIP</p>
                      <p className="text-2xl font-bold text-slate-900">₹{fund.sip_min_investment || '500'}</p>
                      <p className="text-xs text-slate-500 mt-1">Monthly Investment</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1 font-medium">Min Lumpsum</p>
                      <p className="text-2xl font-bold text-slate-900">₹{formatNumber(fund.min_investment, 0) || '5,000'}</p>
                      <p className="text-xs text-slate-500 mt-1">One-time Investment</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1 font-medium">Exit Load</p>
                      <p className="text-lg font-bold text-slate-900">{fund.exit_load || 'N/A'}</p>
                      <p className="text-xs text-slate-500 mt-1">Redemption Charge</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1 font-medium">Lock-in</p>
                      <p className="text-lg font-bold text-slate-900">{fund.lock_in_period || 'None'}</p>
                      <p className="text-xs text-slate-500 mt-1">Holding Period</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-200 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1 font-medium">Inception</p>
                      <p className="text-lg font-bold text-slate-900">{fund.inception_date || 'N/A'}</p>
                      <p className="text-xs text-slate-500 mt-1">Launch Date</p>
                    </div>
                  </div>
                </div>

                {/* OBJECTIVE */}
                {fund.objective && (
                  <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-amber-50 to-orange-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      Investment Objective & Strategy
                    </h3>
                    <p className="text-slate-700 leading-relaxed">{fund.objective}</p>
                  </div>
                )}

                {/* FUND MANAGERS */}
                {fundManagers.length > 0 && (
                  <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-blue-50 to-indigo-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Expert Fund Management Team
                    </h3>
                    <div className="space-y-3">
                      {fundManagers.map((manager, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {manager?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{manager}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <BadgeCheck className="w-4 h-4 text-blue-600" />
                              {idx === 0 ? 'Lead Fund Manager' : 'Associate Fund Manager'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                {/* COMPARATIVE ANALYSIS */}
                <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-emerald-50">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Performance Comparison
                  </h3>
                  <div className="space-y-4">
                    {[
                      { period: '1 Month', value: fund.return_1month, category: 'Equity' },
                      { period: '3 Months', value: fund.return_3month, category: 'Equity' },
                      { period: '6 Months', value: fund.return_6month, category: 'Equity' },
                      { period: '1 Year', value: fund.return_1year || fund.returns1Y, category: 'Equity' },
                      { period: '3 Years', value: fund.return_3year || fund.returns3Y, category: 'Equity' },
                      { period: '5 Years', value: fund.return_5year || fund.returns5Y, category: 'Equity' }
                    ].map((item, idx) => {
                      const val = parseFloat(formatNumber(item.value, 2));
                      const isPositive = !isNaN(val) && val >= 0;
                      return (
                        <div key={idx} className="p-4 bg-white rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-slate-700">{item.period} Returns</p>
                            <div className="flex items-center gap-2">
                              {isPositive ? (
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              )}
                              <span className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatNumber(item.value, 2)}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(Math.abs(val) * 5, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RISK ANALYSIS */}
                <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-orange-50 to-red-50">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    Risk & Volatility Analysis
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <p className="text-sm text-slate-600 mb-2">Risk Level</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              fund.risk === 'Low' ? 'bg-emerald-500 w-1/3' :
                              fund.risk === 'Medium' ? 'bg-amber-500 w-2/3' :
                              'bg-red-500 w-full'
                            }`}
                          />
                        </div>
                        <span className="font-bold text-slate-900">{fund.risk}</span>
                      </div>
                    </div>
                    {fund.ratios && fund.ratios[0]?.BETAR && (
                      <div className="p-4 bg-white rounded-xl shadow-sm">
                        <p className="text-sm text-slate-600 mb-2">Beta (Market Risk)</p>
                        <p className="text-3xl font-bold text-slate-900">{formatNumber(fund.ratios[0].BETAR, 3)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chart' && (
              <div className="space-y-6">
                <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-blue-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      NAV Historical Performance
                    </h3>
                    <div className="flex gap-2">
                      {['1Y', '3Y', '5Y', 'MAX'].map((period) => (
                        <button
                          key={period}
                          onClick={() => {
                            setChartPeriod(period as any);
                            fetchNAVChartData(period);
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            chartPeriod === period
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {chartLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : navChartData.length > 0 ? (
                    <div className="relative">
                      <div className="h-96 relative">
                        <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                          {/* Grid Lines */}
                          <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                              <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
                            </linearGradient>
                          </defs>
                          
                          {/* Horizontal grid lines */}
                          {[0, 1, 2, 3, 4].map((i) => (
                            <line
                              key={i}
                              x1="0"
                              y1={i * 100}
                              x2="800"
                              y2={i * 100}
                              stroke="#e2e8f0"
                              strokeWidth="1"
                            />
                          ))}
                          
                          {/* Chart Line */}
                          <polyline
                            fill="url(#chartGradient)"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            points={(() => {
                              const navValues = navChartData.map(d => parseFloat(d.nav)).filter(v => !isNaN(v));
                              const minNav = Math.min(...navValues);
                              const maxNav = Math.max(...navValues);
                              const range = maxNav - minNav || 1;
                              
                              const points = navChartData.map((point, idx) => {
                                const nav = parseFloat(point.nav);
                                if (isNaN(nav)) return null;
                                const x = (idx / (navChartData.length - 1)) * 800;
                                const y = 350 - ((nav - minNav) / range) * 300;
                                return `${x},${y}`;
                              }).filter(Boolean).join(' ');
                              
                              // Add bottom points for fill
                              const firstX = 0;
                              const lastX = 800;
                              return `${firstX},350 ${points} ${lastX},350`;
                            })()}
                          />
                          
                          {/* Top line (without fill) */}
                          <polyline
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={(() => {
                              const navValues = navChartData.map(d => parseFloat(d.nav)).filter(v => !isNaN(v));
                              const minNav = Math.min(...navValues);
                              const maxNav = Math.max(...navValues);
                              const range = maxNav - minNav || 1;
                              
                              return navChartData.map((point, idx) => {
                                const nav = parseFloat(point.nav);
                                if (isNaN(nav)) return null;
                                const x = (idx / (navChartData.length - 1)) * 800;
                                const y = 350 - ((nav - minNav) / range) * 300;
                                return `${x},${y}`;
                              }).filter(Boolean).join(' ');
                            })()}
                          />
                          
                          {/* Data points */}
                          {(() => {
                            const navValues = navChartData.map(d => parseFloat(d.nav)).filter(v => !isNaN(v));
                            const minNav = Math.min(...navValues);
                            const maxNav = Math.max(...navValues);
                            const range = maxNav - minNav || 1;
                            
                            // Show only every Nth point for cleaner visualization
                            const step = Math.ceil(navChartData.length / 20);
                            return navChartData.map((point, idx) => {
                              if (idx % step !== 0 && idx !== navChartData.length - 1) return null;
                              const nav = parseFloat(point.nav);
                              if (isNaN(nav)) return null;
                              const x = (idx / (navChartData.length - 1)) * 800;
                              const y = 350 - ((nav - minNav) / range) * 300;
                              return (
                                <circle
                                  key={idx}
                                  cx={x}
                                  cy={y}
                                  r="5"
                                  fill="#3b82f6"
                                  stroke="white"
                                  strokeWidth="2"
                                  className="hover:r-8 transition-all cursor-pointer"
                                >
                                  <title>{`${point.date}: ₹${nav.toFixed(2)}`}</title>
                                </circle>
                              );
                            });
                          })()}
                        </svg>
                        
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 -ml-16 text-sm text-slate-600 font-semibold">
                          {(() => {
                            const navValues = navChartData.map(d => parseFloat(d.nav)).filter(v => !isNaN(v));
                            const minNav = Math.min(...navValues);
                            const maxNav = Math.max(...navValues);
                            return [maxNav, (maxNav + minNav) / 2, minNav].map((val, idx) => (
                              <span key={idx}>₹{val.toFixed(2)}</span>
                            ));
                          })()}
                        </div>
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="flex justify-between mt-4 text-sm text-slate-600 font-medium">
                        <span>{navChartData[0]?.date}</span>
                        <span>{navChartData[Math.floor(navChartData.length / 2)]?.date}</span>
                        <span>{navChartData[navChartData.length - 1]?.date}</span>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                          <p className="text-sm text-slate-600 mb-1">Highest NAV</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            ₹{Math.max(...navChartData.map(d => parseFloat(d.nav)).filter(v => !isNaN(v))).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                          <p className="text-sm text-slate-600 mb-1">Current NAV</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ₹{parseFloat(navChartData[navChartData.length - 1]?.nav).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                          <p className="text-sm text-slate-600 mb-1">Lowest NAV</p>
                          <p className="text-2xl font-bold text-orange-600">
                            ₹{Math.min(...navChartData.map(d => parseFloat(d.nav)).filter(v => !isNaN(v))).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">No NAV data available for selected period</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'holdings' && (
              <div className="space-y-6">
                {fund.holdings && fund.holdings.length > 0 ? (
                  <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-teal-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                      Top 10 Portfolio Holdings
                    </h3>
                    <div className="space-y-3">
                      {fund.holdings.slice(0, 10).map((holding, idx) => {
                        const percentage = parseFloat(holding.HoldPer || '0');
                        return (
                          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {idx + 1}
                                  </span>
                                  <p className="font-bold text-slate-900">{holding.Compname}</p>
                                </div>
                                <p className="text-sm text-slate-600 ml-8">{holding.Instrument}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-teal-600">{formatNumber(percentage, 2)}%</p>
                                <p className="text-xs text-slate-600">₹{formatNumber(holding.MKTVAL, 2)} Cr</p>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 ml-8">
                              <div
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(percentage * 10, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="card p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Holdings</h3>
                    <p className="text-slate-600">Holdings data not available for this fund.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'allocation' && (
              <div className="space-y-6">
                {/* ASSET ALLOCATION */}
                {fund.asset_allocation && fund.asset_allocation.length > 0 && (
                  <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-purple-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      Asset Allocation Breakdown
                    </h3>
                    <div className="space-y-3">
                      {fund.asset_allocation.map((asset, idx) => {
                        const percentage = parseFloat(asset.Percentage || '0');
                        const colors = [
                          { from: 'from-blue-500', to: 'to-blue-600' },
                          { from: 'from-emerald-500', to: 'to-emerald-600' },
                          { from: 'from-purple-500', to: 'to-purple-600' },
                          { from: 'from-orange-500', to: 'to-orange-600' },
                          { from: 'from-pink-500', to: 'to-pink-600' }
                        ];
                        const color = colors[idx % colors.length];
                        return (
                          <div key={idx} className="p-4 bg-white rounded-xl hover:shadow-md transition border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-bold text-slate-900">{asset.Asset}</p>
                              <p className="text-2xl font-bold text-slate-900">{formatNumber(percentage, 2)}%</p>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                              <div
                                className={`bg-gradient-to-r ${color.from} ${color.to} h-3 rounded-full transition-all shadow-sm`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SECTOR ALLOCATION */}
                {fund.sector_allocation && fund.sector_allocation.length > 0 && (
                  <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-orange-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      Sector-wise Distribution
                    </h3>
                    <div className="grid gap-3">
                      {fund.sector_allocation.slice(0, 10).map((sector, idx) => {
                        const percentage = parseFloat(sector.Percentage || '0');
                        return (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-semibold text-slate-900 text-sm">{sector.Sector}</p>
                              <p className="text-lg font-bold text-orange-600">{formatNumber(percentage, 2)}%</p>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(!fund.asset_allocation || fund.asset_allocation.length === 0) && 
                 (!fund.sector_allocation || fund.sector_allocation.length === 0) && (
                  <div className="card p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Portfolio Allocation</h3>
                    <p className="text-slate-600">Allocation data not available for this fund.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ratios' && (
              <div className="space-y-6">
                {fund.ratios && fund.ratios.length > 0 ? (
                  <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-indigo-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      Advanced Financial Metrics
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {fund.ratios[0].BETAR && (
                        <div className="p-6 bg-white rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Beta</p>
                          </div>
                          <p className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(fund.ratios[0].BETAR, 3)}</p>
                          <p className="text-xs text-slate-500">Market volatility measure</p>
                        </div>
                      )}
                      {fund.ratios[0].SHARPR && (
                        <div className="p-6 bg-white rounded-xl border-2 border-emerald-200 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Sharpe Ratio</p>
                          </div>
                          <p className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(fund.ratios[0].SHARPR, 3)}</p>
                          <p className="text-xs text-slate-500">Risk-adjusted returns</p>
                        </div>
                      )}
                      {fund.ratios[0].STANDARDR && (
                        <div className="p-6 bg-white rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Standard Deviation</p>
                          </div>
                          <p className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(fund.ratios[0].STANDARDR, 2)}%</p>
                          <p className="text-xs text-slate-500">Return volatility measure</p>
                        </div>
                      )}
                      {fund.ratios[0].ALPHAR && (
                        <div className="p-6 bg-white rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <TrendUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Alpha</p>
                          </div>
                          <p className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(fund.ratios[0].ALPHAR, 2)}</p>
                          <p className="text-xs text-slate-500">Excess return measure</p>
                        </div>
                      )}
                      {fund.ratios[0].YTM && (
                        <div className="p-6 bg-white rounded-xl border-2 border-pink-200 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                              <Percent className="w-5 h-5 text-pink-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Yield to Maturity</p>
                          </div>
                          <p className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(fund.ratios[0].YTM, 2)}%</p>
                          <p className="text-xs text-slate-500">Expected bond yield</p>
                        </div>
                      )}
                      {fund.ratios[0].Average_Maturity && (
                        <div className="p-6 bg-white rounded-xl border-2 border-cyan-200 shadow-sm hover:shadow-md transition col-span-2">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-cyan-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Average Maturity</p>
                          </div>
                          <p className="text-4xl font-bold text-slate-900 mb-2">{formatNumber(fund.ratios[0].Average_Maturity, 2)} years</p>
                          <p className="text-xs text-slate-500">Portfolio average maturity period</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Key Ratios</h3>
                    <p className="text-slate-600">Financial ratios data not available for this fund.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* INVESTMENT TIPS */}
            <div className="card p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-emerald-600" />
                Investment Tips
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-xl border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Set Clear Goals</h4>
                      <p className="text-xs text-slate-600">Define your investment horizon and risk tolerance before investing</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Diversify Portfolio</h4>
                      <p className="text-xs text-slate-600">Spread investments across different asset classes and sectors</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Stay Invested Long-term</h4>
                      <p className="text-xs text-slate-600">Compounding works best over extended periods. Avoid frequent churning</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <TrendUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Review Regularly</h4>
                      <p className="text-xs text-slate-600">Monitor performance quarterly and rebalance annually if needed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK INFO */}
            <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Quick Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-slate-600 font-medium">NAV Date</span>
                  <span className="font-bold text-slate-900">{fund.nav_date || 'Latest'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-slate-600 font-medium">Rating</span>
                  <span className="font-bold text-slate-900">{fund.rating || 4}★</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-slate-600 font-medium">Risk Level</span>
                  <span className={`font-bold ${
                    fund.risk === 'Low' ? 'text-emerald-600' :
                    fund.risk === 'Medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{fund.risk}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-slate-600 font-medium">ISIN</span>
                  <span className="font-mono text-xs text-slate-900">{fund.isin || 'N/A'}</span>
                </div>
                {fund.benchmark && (
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-sm text-slate-600 font-medium block mb-1">Benchmark</span>
                    <span className="text-xs text-slate-900">{fund.benchmark}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ASSET ALLOCATION */}
            <div className="space-y-6">
              {fund.asset_allocation && fund.asset_allocation.length > 0 && (
                  <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-purple-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      Asset Allocation Breakdown
                    </h3>
                    <div className="space-y-3">
                      {fund.asset_allocation.map((asset, idx) => {
                        const percentage = parseFloat(asset.Percentage || '0');
                        const colors = [
                          { from: 'from-blue-500', to: 'to-blue-600', bg: 'bg-blue-500' },
                          { from: 'from-emerald-500', to: 'to-emerald-600', bg: 'bg-emerald-500' },
                          { from: 'from-purple-500', to: 'to-purple-600', bg: 'bg-purple-500' },
                          { from: 'from-orange-500', to: 'to-orange-600', bg: 'bg-orange-500' },
                          { from: 'from-pink-500', to: 'to-pink-600', bg: 'bg-pink-500' }
                        ];
                        const color = colors[idx % colors.length];
                        return (
                          <div key={idx} className="p-4 bg-white rounded-xl hover:shadow-md transition border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-bold text-slate-900">{asset.Asset}</p>
                              <p className="text-2xl font-bold text-slate-900">{formatNumber(percentage, 2)}%</p>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                              <div
                                className={`bg-gradient-to-r ${color.from} ${color.to} h-3 rounded-full transition-all shadow-sm`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SECTOR ALLOCATION */}
                {fund.sector_allocation && fund.sector_allocation.length > 0 && (
                  <div className="card p-6 hover:shadow-xl transition bg-gradient-to-br from-white to-orange-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      Sector-wise Distribution
                    </h3>
                    <div className="grid gap-3">
                      {fund.sector_allocation.slice(0, 10).map((sector, idx) => {
                        const percentage = parseFloat(sector.Percentage || '0');
                        return (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-semibold text-slate-900 text-sm">{sector.Sector}</p>
                              <p className="text-lg font-bold text-orange-600">{formatNumber(percentage, 2)}%</p>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* QUICK INFO */}
            <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Quick Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-slate-600 font-medium">NAV Date</span>
                  <span className="font-bold text-slate-900">{fund.nav_date || 'Latest'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-slate-600 font-medium">Rating</span>
                  <span className="font-bold text-slate-900">{fund.rating || 4}★</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-slate-600 font-medium">Risk Level</span>
                  <span className={`font-bold ${
                    fund.risk === 'Low' ? 'text-emerald-600' :
                    fund.risk === 'Medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{fund.risk}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-slate-600 font-medium">ISIN</span>
                  <span className="font-mono text-xs text-slate-900">{fund.isin || 'N/A'}</span>
                </div>
                {fund.benchmark && (
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-sm text-slate-600 font-medium block mb-1">Benchmark</span>
                    <span className="text-xs font-semibold text-slate-900">{fund.benchmark}</span>
                  </div>
                )}
              </div>
            </div>

            {/* INVEST NOW BUTTON */}
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-xl">
              <button 
                onClick={() => setInvestModalOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="text-lg">Invest Now</span>
              </button>
              <button 
                onClick={() => setInvestModalOpen(true)}
                className="w-full mt-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <Activity className="w-6 h-6" />
                <span className="text-lg">Start SIP</span>
              </button>
            </div>

            {/* WHY INVEST */}
            <div className="card p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Key Investment Benefits
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 font-medium">Expert fund management by seasoned professionals</p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 font-medium">Diversified portfolio across sectors</p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 font-medium">Strong historical performance track record</p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 font-medium">Low minimum SIP investment option</p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 font-medium">Tax benefits under applicable sections</p>
                </div>
              </div>
            </div>

            {/* TAX BENEFITS */}
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Tax & Compliance
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Tax Category</p>
                  <p className="font-bold text-slate-900">Equity/Debt Fund</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Dividend Option</p>
                  <p className="font-bold text-slate-900">Available</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">SIP Eligibility</p>
                  <p className="font-bold text-emerald-600">Yes</p>
                </div>
              </div>
            </div>

            {/* DOCUMENTS */}
            <div className="card p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                Important Documents
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    if (fund.factsheet_url) {
                      window.open(fund.factsheet_url, '_blank');
                    } else {
                      alert('Factsheet URL not available. Please visit the AMC website directly.');
                    }
                  }}
                  className="p-4 bg-white hover:bg-blue-50 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition text-left group"
                >
                  <FileText className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition" />
                  <p className="font-bold text-slate-900 text-sm">View Factsheet</p>
                  <p className="text-xs text-slate-500 mt-1">Latest fund details</p>
                </button>
                
                <button 
                  onClick={() => {
                    alert('Scheme information will be available soon. Please check AMC website.');
                  }}
                  className="p-4 bg-white hover:bg-emerald-50 rounded-xl border-2 border-slate-200 hover:border-emerald-300 transition text-left group"
                >
                  <Info className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition" />
                  <p className="font-bold text-slate-900 text-sm">Scheme Info</p>
                  <p className="text-xs text-slate-500 mt-1">Full details</p>
                </button>
                
                <button 
                  onClick={() => {
                    alert('Annual report will be available soon. Please check AMC website.');
                  }}
                  className="p-4 bg-white hover:bg-purple-50 rounded-xl border-2 border-slate-200 hover:border-purple-300 transition text-left group"
                >
                  <FileText className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition" />
                  <p className="font-bold text-slate-900 text-sm">Annual Report</p>
                  <p className="text-xs text-slate-500 mt-1">Yearly analysis</p>
                </button>
                
                <button 
                  onClick={() => {
                    alert('KIM document will be available soon. Please check AMC website.');
                  }}
                  className="p-4 bg-white hover:bg-orange-50 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition text-left group"
                >
                  <FileText className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition" />
                  <p className="font-bold text-slate-900 text-sm">KIM</p>
                  <p className="text-xs text-slate-500 mt-1">Key info</p>
                </button>
              </div>
              
              <button 
                onClick={downloadNAVData}
                className="w-full mt-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-5 h-5" />
                Download NAV History
              </button>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex gap-4 justify-center">
          <button 
            onClick={() => setInvestModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-2xl transition flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Invest Now
          </button>
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition flex items-center gap-2 ${
              isFavorite 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Added to Wishlist' : 'Add to Wishlist'}
          </button>
          <button 
            onClick={() => navigate(`/compare-funds?funds=${fund.id}`)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold hover:shadow-2xl transition flex items-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Compare Funds
          </button>
        </div>

        {/* INVEST MODAL */}
        <InvestModal
          isOpen={investModalOpen}
          onClose={() => setInvestModalOpen(false)}
          fundName={fund.name}
          fundId={fund.id || fund.scheme_code || ''}
          currentNAV={fund.nav ? parseFloat(String(fund.nav)) : 0}
          minSIP={fund.sip_min_investment || fund.min_investment || '500'}
          minInvestment={fund.min_investment || '5000'}
        />
      </div>
    </div>
  );
};

export default FundDetailsPage;
