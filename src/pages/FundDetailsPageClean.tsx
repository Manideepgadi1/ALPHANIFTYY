import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, Download, TrendingUp, TrendingDown,
  Info, Star, Shield, Target, BarChart2, Calendar,
  DollarSign, Percent, Award, AlertCircle, CheckCircle2, Lightbulb,
  Users, Briefcase, LineChart, ShoppingCart, ExternalLink, FileText, Zap, Loader, Calculator
} from 'lucide-react';
import { getRandomQuote } from '../utils/investmentQuotes';
import InvestModal from '../components/InvestModal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

// API Configuration
const API_BASE = import.meta.env.DEV 
  ? '/api' 
  : '/alphanifty/api';

const VERSION = `v${Date.now()}`; // Cache busting

const FundDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fund, setFund] = useState<any>(null);
  const [navHistory, setNavHistory] = useState<any[]>([]);
  const [fullNavHistory, setFullNavHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNav, setLoadingNav] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'holdings' | 'ratios' | 'chart' | 'calculator'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [navPeriod, setNavPeriod] = useState<'1M' | '3M' | '6M' | '1Y' | '3Y' | 'ALL'>('1Y');
  const [rollingPeriod, setRollingPeriod] = useState<'1Y' | '3Y' | '5Y'>('5Y');
  const [rollingReturns, setRollingReturns] = useState<any[]>([]);
  const [trailingReturns, setTrailingReturns] = useState<any[]>([]);
  const rollingChartRef = useRef<any>(null);
  const trailingChartRef = useRef<any>(null);
  
  // Calculator states
  const [calcType, setCalcType] = useState<'lumpsum' | 'sip'>('lumpsum');
  const [lumpsumAmount, setLumpsumAmount] = useState<string>('100000');
  const [sipAmount, setSipAmount] = useState<string>('5000');

  // Invest modal state
  const [investModalOpen, setInvestModalOpen] = useState(false);

  useEffect(() => {
    const fetchFundDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/funds/${id}`);
        const result = await response.json();
        const data = result.data || result;
        
        console.log('📊 Fund data received:', data);
        
        // Data is returned directly, not in snapshot_summary
        if (data && typeof data === 'object') {
          // Extract AMC name from scheme name
          const schemeName = data.name || data.S_NAME || data.scheme_name || '';
          const amcName = schemeName.includes('-') 
            ? schemeName.split('-')[0].trim() 
            : schemeName.includes('(') 
              ? schemeName.split('(')[0].trim() 
              : '';

          setFund({
            // Map API fields to expected format
            scheme_name: schemeName,
            nav: data.nav || data.NAVRS,
            nav_date: data.nav_date || data.NAVDATE,
            inception_date: data.inception_date || data.INCEPT_DATE,
            category: data.category || data.CATEGORY_NAME,
            aum: data.aum || data.AUM,
            return_1month: data.return_1month || data['1MONTHRET'],
            return_3month: data.return_3month || data['3MONTHRET'],
            return_6month: data.return_6month || data['6MONTHRET'],
            return_1year: data.return_1year || data['1YRRET'],
            return_3year: data.return_3year || data.csv_return_3year || data['3YEARRET'],
            return_5year: data.return_5year || data['5YEARRET'],
            inception_return: data.inception_return || data.csv_inception_return || data.INCRET,
            expense_ratio: data.expense_ratio || data.EXPENSE_RATIO,
            rating: data.rating || data.RATING || 4,
            benchmark: data.benchmark || data.BENCHMARK,
            fund_manager: [data.fund_manager_1, data.fund_manager_2, data.fund_manager_3].filter(Boolean).join(', '),
            risk: data.risk || data.RISKTYPE,
            min_investment: data.min_investment || data.MININVT,
            sip_min_investment: data.sip_min_investment || data.SIPMININVEST,
            exit_load: data.exit_load || data.EXIT_LOAD,
            exit_remarks: data.exit_remarks || data.EXIT_REMARKS,
            asset_type: data.asset_type || data.ASSET_TYPE,
            objective: data.objective || data.OBJECTIVE,
            amc_name: amcName || data.amc_name || data.AMC_NAME,
            isin: data.isin || data.ISIN,
            lock_in: data.lock_in_period || data.LOCK_IN_PERIOD,
            plan_type: data.plan_type || data.PLANTYPE,
            // Include full data
            ...data,
            asset_allocation: data.asset_allocation || [],
            holdings: data.holdings || [],
            market_cap: data.market_cap || [],
            sector_allocation: data.sector_allocation || [],
            credit_rating: data.credit_rating || []
          });
          console.log('✅ Fund data set successfully');
        } else {
          console.log('❌ No data found in response');
          setError('Fund data not available');
        }
        
        // Fetch NAV history with default 1Y period
        fetchNAVHistory(id, '1Y');
      } catch (err: any) {
        console.log('❌ Error fetching fund:', err);
        setError(err.message || 'Failed to load fund details');
      } finally {
        setLoading(false);
      }
    };

    fetchFundDetails();
  }, [id]);

  const fetchNAVHistory = async (schemeCode: string, period: string = 'SI') => {
    try {
      setLoadingNav(true);
      // Use Accord API endpoint - supports all 9000+ funds automatically
      // Always fetch SI (Since Inception) and filter frontend
      const url = `${API_BASE}/funds/${schemeCode}/nav-history?period=SI&t=${Date.now()}`;
      console.log('🔍 Fetching NAV from:', url, 'Period:', period);
      
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📊 Response data:', result);
      
      const data = result.data || result;
      console.log('📈 Processed data type:', typeof data);
      console.log('📈 Is Array:', Array.isArray(data));
      console.log('📈 Has Table:', !!data?.Table);
      
      // Handle both formats: Array directly OR {Table: Array}
      let navArray = Array.isArray(data) ? data : (data?.Table || []);

      // Sort full NAV history by date ascending and store for rolling returns
      navArray = navArray
        .slice()
        .filter((item: any) => item.NAVRS || item.NAV || item.ADJNAVRS)
        .sort((a: any, b: any) => {
          const da = new Date(a.NAVDATE || a.Date || a.date || 0).getTime();
          const db = new Date(b.NAVDATE || b.Date || b.date || 0).getTime();
          return da - db;
        });
      setFullNavHistory(navArray);
      
      console.log(`✅ Found ${navArray.length} NAV records`);
      
      if (navArray.length > 0) {
        // Filter based on period
        let filteredData = navArray;
        const today = new Date();
        
        if (period !== 'ALL' && period !== 'SI') {
          const months: {[key: string]: number} = {
            '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '3Y': 36, '5Y': 60
          };
          const monthsBack = months[period] || 12;
          const cutoffDate = new Date();
          cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
          
          filteredData = navArray.filter((item: any) => {
            const itemDate = new Date(item.NAVDATE || item.Date || '');
            return itemDate >= cutoffDate;
          });
          console.log(`📊 Filtered ${filteredData.length} records for period ${period}`);
        }
        
        setNavHistory(filteredData.map((item: any) => ({
          date: item.NAVDATE || item.Date,
          nav: parseFloat(item.ADJNAVRS || item.NAVRS || item.NAV || 0)
        })));
      } else {
        console.error('❌ No NAV data in response:', data);
      }
    } catch (err) {
      console.error('❌ Error fetching NAV history:', err);
    } finally {
      setLoadingNav(false);
    }
  };

  const formatNumber = (value: any, decimals: number = 2): string => {
    if (!value || isNaN(parseFloat(value))) return 'N/A';
    return parseFloat(value).toFixed(decimals);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not Available';
    try {
      // Remove time portion if present
      const dateOnly = dateString.split(' ')[0];
      // Try to parse and format the date
      const date = new Date(dateOnly);
      if (isNaN(date.getTime())) return dateString;
      // Format as DD/MM/YYYY or use locale string
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const downloadCSV = async () => {
    if (!fund) return;
    
    try {
      // Fetch historical NAV data from Accord API (Since Inception) - No mapping needed
      const response = await fetch(`${API_BASE}/funds/${id}/nav-history?period=SI`);
      const apiResponse = await response.json();
      const result = apiResponse.data || apiResponse;
      
      // Handle both formats: Array directly OR {Table: Array}
      let navArray = Array.isArray(result) ? result : (result?.Table || []);
      
      if (navArray.length > 0) {
        // Build CSV content with fund name, blank line, then Date,NAV data
        let csvContent = fund.scheme_name || fund.S_NAME || 'Fund';
        csvContent += '\n\n'; // Two newlines for blank line
        csvContent += 'Date,NAV\n';
        
        // Add each date-NAV pair
        navArray.forEach((item: any) => {
          const date = item.NAVDATE || item.Date || '';
          const nav = item.ADJNAVRS || item.NAVRS || item.NAV || '';
          csvContent += `${date},${nav}\n`;
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${(fund.scheme_name || fund.S_NAME || 'Fund')?.replace(/[^a-z0-9]/gi, '_')}_NAV_History.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Downloaded ${navArray.length} NAV records`);
      } else {
        console.error('❌ No NAV history data available');
        alert('NAV history data is not available for this fund.');
      }
    } catch (error) {
      console.error('❌ Error downloading NAV history:', error);
      alert('Failed to download NAV history. Please try again.');
    }
  };

  // Compute rolling returns (absolute % and CAGR %) for a given period
  useEffect(() => {
    if (!fullNavHistory || fullNavHistory.length < 2) {
      setRollingReturns([]);
      return;
    }

    const monthsMap: Record<typeof rollingPeriod, number> = {
      '1Y': 12,
      '3Y': 36,
      '5Y': 60,
    };

    const targetMonths = monthsMap[rollingPeriod];
    const results: any[] = [];

    for (let endIdx = 0; endIdx < fullNavHistory.length; endIdx++) {
      const endItem = fullNavHistory[endIdx];
      const endDateStr = endItem.NAVDATE || endItem.Date || endItem.date;
      if (!endDateStr) continue;
      const endDate = new Date(endDateStr);
      if (isNaN(endDate.getTime())) continue;

      const startCutoff = new Date(endDate);
      startCutoff.setMonth(startCutoff.getMonth() - targetMonths);

      let startIdx = -1;
      for (let i = 0; i <= endIdx; i++) {
        const dStr = fullNavHistory[i].NAVDATE || fullNavHistory[i].Date || fullNavHistory[i].date;
        if (!dStr) continue;
        const d = new Date(dStr);
        if (isNaN(d.getTime())) continue;
        if (d >= startCutoff) {
          startIdx = i;
          break;
        }
      }

      if (startIdx === -1 || startIdx === endIdx) continue;

      const startItem = fullNavHistory[startIdx];
      const startNav = parseFloat(startItem.ADJNAVRS || startItem.NAVRS || startItem.NAV || startItem.nav || '0');
      const endNav = parseFloat(endItem.ADJNAVRS || endItem.NAVRS || endItem.NAV || endItem.nav || '0');
      if (!startNav || !endNav || isNaN(startNav) || isNaN(endNav)) continue;

      const absReturn = ((endNav / startNav) - 1) * 100;
      const years = targetMonths / 12;
      const cagr = (Math.pow(endNav / startNav, 1 / years) - 1) * 100;

      results.push({
        startDate: startItem.NAVDATE || startItem.Date || startItem.date,
        endDate: endDateStr,
        absReturn,
        cagr,
      });
    }

    setRollingReturns(results);
  }, [fullNavHistory, rollingPeriod]);

  // Calculate Trailing Returns - Returns from X period ago to today
  // Trailing returns show: "What was the return if I invested X time ago and held till today?"
  useEffect(() => {
    if (!fullNavHistory || fullNavHistory.length === 0) {
      setTrailingReturns([]);
      return;
    }

    // Sort NAV history by date (oldest to newest)
    const sorted = [...fullNavHistory].sort((a, b) => {
      const dateA = new Date(a.NAVDATE || a.Date || a.date || '');
      const dateB = new Date(b.NAVDATE || b.Date || b.date || '');
      return dateA.getTime() - dateB.getTime();
    });

    // Get the most recent NAV (this is our "today" or end point)
    const currentNav = sorted[sorted.length - 1];
    const currentNavValue = parseFloat(currentNav.ADJNAVRS || currentNav.NAVRS || currentNav.NAV || currentNav.nav || '0');
    const currentDateStr = currentNav.NAVDATE || currentNav.Date || currentNav.date;
    
    if (!currentNavValue || !currentDateStr) {
      setTrailingReturns([]);
      return;
    }

    const currentDate = new Date(currentDateStr);
    if (isNaN(currentDate.getTime())) {
      setTrailingReturns([]);
      return;
    }

    // Define trailing periods we want to calculate
    // Format: { label for X-axis, months to look back, years (for CAGR calculation) }
    const trailingPeriods = [
      { label: '1W', name: '1 Week', days: 7, isAnnualized: false },
      { label: '1M', name: '1 Month', days: 30, isAnnualized: false },
      { label: '3M', name: '3 Months', days: 90, isAnnualized: false },
      { label: '6M', name: '6 Months', days: 180, isAnnualized: false },
      { label: '1Y', name: '1 Year', days: 365, isAnnualized: true },
      { label: '2Y', name: '2 Years', days: 730, isAnnualized: true },
      { label: '3Y', name: '3 Years', days: 1095, isAnnualized: true },
      { label: '5Y', name: '5 Years', days: 1825, isAnnualized: true },
    ];

    const trailingResults: any[] = [];

    // Calculate returns for each period
    for (const period of trailingPeriods) {
      // Calculate target date (go back X days from current date)
      const targetDate = new Date(currentDate);
      targetDate.setDate(targetDate.getDate() - period.days);

      // Find the closest NAV on or before the target date
      let historicalNav = null;
      let closestDiff = Infinity;

      for (const navItem of sorted) {
        const navDateStr = navItem.NAVDATE || navItem.Date || navItem.date;
        if (!navDateStr) continue;
        
        const navDate = new Date(navDateStr);
        if (isNaN(navDate.getTime())) continue;

        // Only consider dates on or before our target date
        if (navDate <= targetDate) {
          const diff = Math.abs(targetDate.getTime() - navDate.getTime());
          if (diff < closestDiff) {
            closestDiff = diff;
            historicalNav = navItem;
          }
        }
      }

      // If we found a historical NAV, calculate the return
      if (historicalNav) {
        const historicalNavValue = parseFloat(
          historicalNav.ADJNAVRS || historicalNav.NAVRS || historicalNav.NAV || historicalNav.nav || '0'
        );
        const historicalDateStr = historicalNav.NAVDATE || historicalNav.Date || historicalNav.date;

        if (historicalNavValue && historicalDateStr) {
          const historicalDate = new Date(historicalDateStr);
          
          // Calculate actual days between the two dates
          const actualDays = Math.round((currentDate.getTime() - historicalDate.getTime()) / (1000 * 60 * 60 * 24));
          const actualYears = actualDays / 365.25;

          // Calculate absolute return
          const absoluteReturn = ((currentNavValue / historicalNavValue) - 1) * 100;

          // Calculate annualized return (CAGR) for periods >= 1 year
          let displayValue: number;
          let returnType: string;

          if (period.isAnnualized && actualYears >= 1) {
            // CAGR = ((End Value / Beginning Value) ^ (1 / Years)) - 1
            displayValue = (Math.pow(currentNavValue / historicalNavValue, 1 / actualYears) - 1) * 100;
            returnType = 'CAGR';
          } else {
            // For periods less than 1 year, show absolute return
            displayValue = absoluteReturn;
            returnType = 'Absolute';
          }

          trailingResults.push({
            label: period.label,
            name: period.name,
            days: actualDays,
            years: actualYears,
            startDate: historicalDateStr,
            endDate: currentDateStr,
            startNav: historicalNavValue,
            endNav: currentNavValue,
            absoluteReturn,
            cagr: actualYears >= 1 ? (Math.pow(currentNavValue / historicalNavValue, 1 / actualYears) - 1) * 100 : null,
            returnValue: displayValue,
            returnType,
          });
        }
      }
    }

    setTrailingReturns(trailingResults);
  }, [fullNavHistory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-2xl mx-auto px-4">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Loading fund details...</p>
          <p className="text-sm text-gray-500 italic">"{getRandomQuote()}"</p>
        </div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Fund</h2>
          <p className="text-slate-600 mb-4">{error || 'Fund not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
    { id: 'chart', label: 'NAV Chart', icon: <LineChart className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'holdings', label: 'Holdings', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'ratios', label: 'Ratios', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  // Calculator functions
  const calculateHistoricalReturns = () => {
    const principal = parseFloat(calcType === 'lumpsum' ? lumpsumAmount : '0') || 0;
    const monthlyInvestment = parseFloat(calcType === 'sip' ? sipAmount : '0') || 0;

    const periods = [
      { label: '1 Year', years: 1, returnRate: fund.return_1year },
      { label: '3 Years', years: 3, returnRate: fund.return_3year },
      { label: '5 Years', years: 5, returnRate: fund.return_5year },
    ];

    return periods.map(period => {
      if (!period.returnRate || period.returnRate === 'N/A') {
        return { ...period, futureValue: null, totalGain: null, totalInvested: null };
      }

      const annualRate = parseFloat(period.returnRate.toString()) / 100;

      if (calcType === 'lumpsum') {
        // Lumpsum: FV = P × (1 + r)^t
        const futureValue = principal * Math.pow(1 + annualRate, period.years);
        const totalGain = futureValue - principal;
        return { 
          ...period, 
          futureValue, 
          totalGain, 
          totalInvested: principal 
        };
      } else {
        // SIP: FV = P × [(1 + r)^n - 1] / r × (1 + r)
        const monthlyRate = annualRate / 12;
        const months = period.years * 12;
        const futureValue = monthlyInvestment * 
          (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
        const totalInvested = monthlyInvestment * months;
        const totalGain = futureValue - totalInvested;
        return { 
          ...period, 
          futureValue, 
          totalGain, 
          totalInvested 
        };
      }
    }).filter(p => p.futureValue !== null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleRollingResetZoom = () => {
    const chart = rollingChartRef.current;
    if (chart && typeof chart.resetZoom === 'function') {
      chart.resetZoom();
    }
  };

  const handleTrailingResetZoom = () => {
    const chart = trailingChartRef.current;
    if (chart && typeof chart.resetZoom === 'function') {
      chart.resetZoom();
    }
  };

  const rollingCagrValues = rollingReturns.map(r => r.cagr).filter((v) => Number.isFinite(v));
  const rollingMin = rollingCagrValues.length ? Math.min(...rollingCagrValues) : undefined;
  const rollingMax = rollingCagrValues.length ? Math.max(...rollingCagrValues) : undefined;
  const rollingPadding = rollingMin !== undefined && rollingMax !== undefined
    ? Math.max(0.2, (rollingMax - rollingMin) * 0.2)
    : undefined;
  const rollingSuggestedMin = rollingMin !== undefined && rollingPadding !== undefined
    ? rollingMin - rollingPadding
    : undefined;
  const rollingSuggestedMax = rollingMax !== undefined && rollingPadding !== undefined
    ? rollingMax + rollingPadding
    : undefined;

  const trailingDisplayValues = trailingReturns.map(r => r.returnValue).filter((v) => Number.isFinite(v));
  const trailingMin = trailingDisplayValues.length ? Math.min(...trailingDisplayValues) : undefined;
  const trailingMax = trailingDisplayValues.length ? Math.max(...trailingDisplayValues) : undefined;
  const trailingPadding = trailingMin !== undefined && trailingMax !== undefined
    ? Math.max(0.2, (trailingMax - trailingMin) * 0.2)
    : undefined;
  const trailingSuggestedMin = trailingMin !== undefined && trailingPadding !== undefined
    ? trailingMin - trailingPadding
    : undefined;
  const trailingSuggestedMax = trailingMax !== undefined && trailingPadding !== undefined
    ? trailingMax + trailingPadding
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            title="Go back to previous page"
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Fund Details</h1>
        </div>

        {/* Fund Header Card */}
        <div className="card p-6 mb-6 bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{fund.scheme_name || fund.schemeName}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {fund.rating || 4}/5
                </span>
                <span>Category: {fund.category || 'Equity'}</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                  {fund.risk || 'Medium'} Risk
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-3 rounded-lg transition ${
                  isFavorite ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button 
                aria-label="Share fund"
                title="Share fund"
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={downloadCSV}
                aria-label="Download fund details"
                title="Download fund details as CSV"
                className="p-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-600 mb-1">Current NAV</p>
              <p className="text-2xl font-bold text-emerald-600">₹{formatNumber(fund.nav, 4)}</p>
              <p className="text-xs text-slate-500 mt-1">{formatDate(fund.nav_date)}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-600 mb-1">Inception Date</p>
              <p className="text-lg font-bold text-blue-600">
                {formatDate(fund.inception_date)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {fund.inception_date ? (() => {
                  try {
                    const inceptionTime = new Date(fund.inception_date).getTime();
                    const years = Math.floor((Date.now() - inceptionTime) / (365.25 * 24 * 60 * 60 * 1000));
                    return years > 0 ? `${years} years old` : 'Less than a year';
                  } catch {
                    return '';
                  }
                })() : ''}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-600 mb-1">1 Year Return</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(fund.return_1year, 2)}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-600 mb-1">3 Year Return</p>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(fund.return_3year, 2)}%</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-600 mb-1">AUM</p>
              <p className="text-2xl font-bold text-slate-900">₹{formatNumber(fund.aum, 2)}</p>
              <p className="text-xs text-slate-500 mt-1">Crores</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
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

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Key Investment Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Min Lumpsum</p>
                      <p className="text-xl font-bold text-blue-600">₹{fund.min_investment || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Min SIP</p>
                      <p className="text-xl font-bold text-teal-600">₹{fund.sip_min_investment || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Expense Ratio</p>
                      <p className="text-xl font-bold text-purple-600">{fund.expense_ratio ? formatNumber(fund.expense_ratio, 2) + '%' : 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-1">Exit Load</p>
                      <p className="text-xl font-bold text-amber-600">{fund.exit_remarks || fund.exit_load || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">About This Fund</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {fund.objective || fund.description || 'This fund aims to provide long-term capital appreciation by investing in a diversified portfolio of securities.'}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-slate-500">Fund Manager</p>
                      <p className="font-semibold text-slate-900">{fund.fund_manager || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">AMC</p>
                      <p className="font-semibold text-slate-900">{fund.amc_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Benchmark</p>
                      <p className="font-semibold text-slate-900">{fund.benchmark || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Asset Type</p>
                      <p className="font-semibold text-slate-900">{fund.asset_type || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chart' && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  NAV Historical Chart
                </h3>
                
                {/* Period Selector and Instructions */}
                <div className="mb-6">
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {['1M', '3M', '6M', '1Y', '3Y', 'ALL'].map((period) => (
                      <button
                        key={period}
                        onClick={() => {
                          const p = period as '1M' | '3M' | '6M' | '1Y' | '3Y' | 'ALL';
                          setNavPeriod(p);
                          fetchNAVHistory(id!, p);
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          navPeriod === period
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">💡 Tip: Scroll to zoom, drag to pan, double-click to reset</p>
                </div>

                {/* NAV Chart */}
                <div className="h-80">
                  {loadingNav ? (
                    <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : navHistory.length > 0 ? (
                    <Line
                      data={{
                        labels: navHistory.map((d, idx) => {
                          const date = new Date(d.date);
                          // Show every data point's date, but format smartly
                          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        }),
                        datasets: [
                          {
                            label: 'NAV',
                            data: navHistory.map(d => parseFloat(d.nav)),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 8,
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            callbacks: {
                              title: function(context) {
                                const date = new Date(navHistory[context[0].dataIndex].date);
                                return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                              },
                              label: function(context) {
                                return `NAV: ₹${context.parsed.y ? context.parsed.y.toFixed(4) : '0'}`;
                              }
                            }
                          },
                          zoom: {
                            zoom: {
                              wheel: {
                                enabled: true,
                                speed: 0.1,
                              },
                              pinch: {
                                enabled: true,
                              },
                              mode: 'x',
                            },
                            pan: {
                              enabled: true,
                              mode: 'x',
                              onPanStart: () => {
                                console.log('Pan started');
                                return true;
                              },
                              onPan: () => {
                                console.log('Pan in progress');
                                return true;
                              },
                              onPanComplete: () => {
                                console.log('Pan complete');
                                return true;
                              }
                            },
                            limits: {
                              x: {min: 'original', max: 'original'},
                              y: {min: 'original', max: 'original'}
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              display: true,
                              color: 'rgba(0, 0, 0, 0.02)',
                            },
                            ticks: {
                              maxRotation: 0,
                              minRotation: 0,
                              font: {
                                size: 11,
                              },
                              maxTicksLimit: 15,
                              callback: function(value, index) {
                                // Show every Nth label to avoid crowding
                                const step = Math.max(1, Math.ceil(navHistory.length / 15));
                                if (index % step === 0) {
                                  const label = this.getLabelForValue(value as number);
                                  return label;
                                }
                                return '';
                              }
                            }
                          },
                          y: {
                            beginAtZero: false,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                            },
                            ticks: {
                              callback: function(value) {
                                return '₹' + (typeof value === 'number' ? value.toFixed(2) : value);
                              }
                            }
                          },
                        },
                        interaction: {
                          mode: 'nearest',
                          axis: 'x',
                          intersect: false
                        },
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl">
                      <p className="text-slate-400">No NAV data available</p>
                    </div>
                  )}
                </div>

                {/* Rolling Returns Chart */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Rolling Returns (Absolute % & CAGR)
                  </h3>

                  {/* Rolling period selector */}
                  <div className="mb-4 flex gap-2 flex-wrap items-center">
                    {['1Y', '3Y', '5Y'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setRollingPeriod(period as '1Y' | '3Y' | '5Y')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          rollingPeriod === period
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {period} Rolling
                      </button>
                    ))}
                    <button
                      onClick={handleRollingResetZoom}
                      className="px-3 py-2 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition"
                    >
                      Reset Zoom
                    </button>
                  </div>

                  <div className="h-80">
                    {rollingReturns.length > 0 ? (
                      <Line
                        ref={rollingChartRef}
                        data={{
                          labels: rollingReturns.map((r) => {
                            const d = new Date(r.endDate);
                            return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                          }),
                          datasets: [
                            {
                              label: 'CAGR %',
                              data: rollingReturns.map((r) => r.cagr),
                              borderColor: 'rgb(16, 185, 129)',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              fill: { target: typeof rollingSuggestedMin === 'number' ? rollingSuggestedMin : false },
                              tension: 0.4,
                              pointRadius: 0,
                              pointHoverRadius: 6,
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              mode: 'index',
                              intersect: false,
                              backgroundColor: 'rgba(15, 23, 42, 0.95)',
                              titleColor: '#e5e7eb',
                              bodyColor: '#e5e7eb',
                              padding: 12,
                              callbacks: {
                                title: (context) => {
                                  const idx = context[0].dataIndex;
                                  const r = rollingReturns[idx];
                                  const start = new Date(r.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                                  const end = new Date(r.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                                  return `Returns: ${start} to ${end}`;
                                },
                                label: (context) => {
                                  const idx = context.dataIndex;
                                  const r = rollingReturns[idx];
                                  const abs = r.absReturn?.toFixed(2) ?? '0.00';
                                  const cagr = r.cagr?.toFixed(2) ?? '0.00';
                                  return [
                                    `Absolute: ${abs}%`,
                                    `CAGR: ${cagr}%`,
                                  ];
                                },
                              },
                            },
                            zoom: {
                              zoom: {
                                wheel: { enabled: true, speed: 0.1 },
                                pinch: { enabled: true },
                                mode: 'x',
                              },
                              pan: {
                                enabled: true,
                                mode: 'x',
                              },
                              limits: {
                                x: { min: 'original', max: 'original' },
                                y: { min: 'original', max: 'original' },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              ticks: {
                                maxTicksLimit: 10,
                                font: { size: 11 },
                              },
                            },
                            y: {
                              grid: { color: 'rgba(0, 0, 0, 0.05)' },
                              beginAtZero: false,
                              suggestedMin: rollingSuggestedMin,
                              suggestedMax: rollingSuggestedMax,
                              ticks: {
                                callback: (value) => `${value}%`,
                              },
                            },
                          },
                          interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false,
                          },
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl">
                        <p className="text-slate-400 text-sm text-center px-4">
                          Rolling return data is not available for the selected period. Try a shorter period or another fund.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trailing Returns Chart */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-600" />
                    Trailing Returns
                  </h3>

                  <div className="mb-4 flex gap-2 items-center">
                    <button
                      onClick={handleTrailingResetZoom}
                      className="px-3 py-2 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition"
                    >
                      Reset Zoom
                    </button>
                    <div className="text-sm text-slate-500">
                      Returns calculated from past to today (Absolute &lt;1Y, CAGR ≥1Y)
                    </div>
                  </div>

                  <div className="h-80">
                    {trailingReturns.length > 0 ? (
                      <Line
                        ref={trailingChartRef}
                        data={{
                          labels: trailingReturns.map((r) => r.label),
                          datasets: [
                            {
                              label: 'Return %',
                              data: trailingReturns.map((r) => r.returnValue),
                              borderColor: 'rgb(59, 130, 246)',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              fill: { target: typeof trailingSuggestedMin === 'number' ? trailingSuggestedMin : false },
                              tension: 0.3,
                              pointRadius: 5,
                              pointHoverRadius: 8,
                              borderWidth: 2.5,
                              pointBackgroundColor: 'rgb(59, 130, 246)',
                              pointBorderColor: '#fff',
                              pointBorderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              mode: 'index',
                              intersect: false,
                              backgroundColor: 'rgba(15, 23, 42, 0.95)',
                              titleColor: '#e5e7eb',
                              bodyColor: '#e5e7eb',
                              padding: 14,
                              callbacks: {
                                title: (context) => {
                                  const idx = context[0].dataIndex;
                                  const r = trailingReturns[idx];
                                  return `${r.name} Trailing Return`;
                                },
                                label: (context) => {
                                  const idx = context.dataIndex;
                                  const r = trailingReturns[idx];
                                  const returnVal = r.returnValue?.toFixed(2) ?? '0.00';
                                  const startDate = new Date(r.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                  const endDate = new Date(r.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                  return [
                                    `Period: ${startDate} → ${endDate}`,
                                    `Duration: ${r.days} days`,
                                    `${r.returnType}: ${returnVal}%`,
                                  ];
                                },
                              },
                            },
                            zoom: {
                              zoom: {
                                wheel: { enabled: true, speed: 0.1 },
                                pinch: { enabled: true },
                                mode: 'xy',
                              },
                              pan: {
                                enabled: true,
                                mode: 'xy',
                              },
                              limits: {
                                x: { min: 'original', max: 'original' },
                                y: { min: 'original', max: 'original' },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              ticks: {
                                font: { size: 11 },
                              },
                            },
                            y: {
                              grid: { color: 'rgba(0, 0, 0, 0.05)' },
                              beginAtZero: false,
                              suggestedMin: trailingSuggestedMin,
                              suggestedMax: trailingSuggestedMax,
                              ticks: {
                                callback: (value) => `${value}%`,
                              },
                            },
                          },
                          interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false,
                          },
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl">
                        <p className="text-slate-400 text-sm text-center px-4">
                          Trailing return data is not available. Please check if historical NAV data is loaded.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-600" />
                    Investment Return Calculator
                  </h3>

                  {/* Calculator Type Selector */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setCalcType('lumpsum')}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                        calcType === 'lumpsum'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Lumpsum
                    </button>
                    <button
                      onClick={() => setCalcType('sip')}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                        calcType === 'sip'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      SIP (Monthly)
                    </button>
                  </div>

                  {/* Investment Amount Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {calcType === 'lumpsum' ? 'Investment Amount (₹)' : 'Monthly SIP Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      value={calcType === 'lumpsum' ? lumpsumAmount : sipAmount}
                      onChange={(e) => calcType === 'lumpsum' ? setLumpsumAmount(e.target.value) : setSipAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none text-lg font-semibold"
                      placeholder={calcType === 'lumpsum' ? '100000' : '5000'}
                    />
                    
                    {/* Quick Presets */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {calcType === 'lumpsum' ? (
                        <>
                          <button onClick={() => setLumpsumAmount('50000')} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition">₹50K</button>
                          <button onClick={() => setLumpsumAmount('100000')} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition">₹1L</button>
                          <button onClick={() => setLumpsumAmount('500000')} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition">₹5L</button>
                          <button onClick={() => setLumpsumAmount('1000000')} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition">₹10L</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setSipAmount('1000')} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition">₹1K</button>
                          <button onClick={() => setSipAmount('5000')} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition">₹5K</button>
                          <button onClick={() => setSipAmount('10000')} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition">₹10K</button>
                          <button onClick={() => setSipAmount('25000')} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition">₹25K</button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Historical Performance Based:</strong> Returns are calculated using this fund's actual historical performance. 
                        Past performance does not guarantee future results.
                      </span>
                    </p>
                  </div>

                  {/* Results for All Periods */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-lg mb-4">What Your Investment Would Have Become</h4>
                    
                    {calculateHistoricalReturns().map((period, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200 hover:border-emerald-300 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="font-bold text-slate-900 text-lg">{period.label}</h5>
                            <p className="text-sm text-slate-600">
                              Historical Return: <span className="font-semibold text-emerald-600">{parseFloat(period.returnRate.toString()).toFixed(2)}% p.a.</span>
                            </p>
                          </div>
                          <div className="bg-emerald-100 p-2 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-600 mb-1">Invested</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(period.totalInvested!)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-600 mb-1">Returns</p>
                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(period.totalGain!)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-600 mb-1">Total Value</p>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(period.futureValue!)}</p>
                          </div>
                        </div>
                        
                        {calcType === 'sip' && (
                          <p className="text-xs text-slate-500 mt-3 text-center">
                            Monthly: ₹{sipAmount} × {period.years * 12} months
                          </p>
                        )}
                      </div>
                    ))}

                    {calculateHistoricalReturns().length === 0 && (
                      <div className="p-8 bg-slate-50 rounded-xl text-center">
                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">Historical return data not available for this fund.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      These calculations are based on the fund's actual past performance. Returns are compounded annually.
                      Mutual fund investments are subject to market risks. Past performance is not indicative of future results.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Returns Analysis
                  </h3>
                  <div className="space-y-3">
                    {[
                      { period: '1 Month', value: fund.return_1month, color: 'blue' },
                      { period: '3 Months', value: fund.return_3month, color: 'emerald' },
                      { period: '6 Months', value: fund.return_6month, color: 'purple' },
                      { period: '1 Year', value: fund.return_1year, color: 'amber' },
                      { period: '3 Years', value: fund.return_3year, color: 'rose' },
                      { period: '5 Years', value: fund.return_5year, color: 'cyan' },
                      { period: 'Since Inception', value: fund.inception_return, color: 'indigo' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-semibold text-slate-700">{item.period}</span>
                        <span className={`text-lg font-bold text-${item.color}-600`}>
                          {formatNumber(item.value, 2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'holdings' && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  Top Holdings
                </h3>
                {fund.holdings && fund.holdings.length > 0 ? (
                  <div className="space-y-3">
                    {fund.holdings.slice(0, 10).map((holding: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{holding.Compname}</p>
                          <p className="text-xs text-slate-500 mt-1">{holding.Instrument || 'Equity'}</p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-lg font-bold text-emerald-600">{parseFloat(holding.HoldPer || '0').toFixed(2)}%</p>
                          {holding.MKTVAL && (
                            <p className="text-xs text-slate-500 mt-1">₹{holding.MKTVAL} Cr</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {fund.holdings.length > 10 && (
                      <p className="text-center text-sm text-slate-500 pt-2">
                        +{fund.holdings.length - 10} more holdings
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Holdings data not available for this fund</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ratios' && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  Key Financial Ratios
                </h3>
                {fund.ratios && fund.ratios.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {fund.ratios[0].BETAR && (
                      <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-700">Beta</p>
                        </div>
                        <p className="text-3xl font-bold text-blue-900">{formatNumber(fund.ratios[0].BETAR, 3)}</p>
                        <p className="text-xs text-blue-600 mt-1">Market volatility measure</p>
                      </div>
                    )}
                    {fund.ratios[0].SHARPR && (
                      <div className="p-5 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-emerald-600" />
                          <p className="text-sm font-semibold text-emerald-700">Sharpe Ratio</p>
                        </div>
                        <p className="text-3xl font-bold text-emerald-900">{formatNumber(fund.ratios[0].SHARPR, 3)}</p>
                        <p className="text-xs text-emerald-600 mt-1">Risk-adjusted returns</p>
                      </div>
                    )}
                    {fund.ratios[0].STANDARDR && (
                      <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart2 className="w-5 h-5 text-purple-600" />
                          <p className="text-sm font-semibold text-purple-700">Standard Deviation</p>
                        </div>
                        <p className="text-3xl font-bold text-purple-900">{formatNumber(fund.ratios[0].STANDARDR, 2)}%</p>
                        <p className="text-xs text-purple-600 mt-1">Volatility measure</p>
                      </div>
                    )}
                    {fund.ratios[0].ALPHAR && (
                      <div className="p-5 bg-amber-50 rounded-xl border-2 border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-amber-600" />
                          <p className="text-sm font-semibold text-amber-700">Alpha</p>
                        </div>
                        <p className="text-3xl font-bold text-amber-900">{formatNumber(fund.ratios[0].ALPHAR, 2)}%</p>
                        <p className="text-xs text-amber-600 mt-1">Excess returns</p>
                      </div>
                    )}
                    {fund.ratios[0].YTM && (
                      <div className="p-5 bg-rose-50 rounded-xl border-2 border-rose-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Percent className="w-5 h-5 text-rose-600" />
                          <p className="text-sm font-semibold text-rose-700">YTM</p>
                        </div>
                        <p className="text-3xl font-bold text-rose-900">{formatNumber(fund.ratios[0].YTM, 2)}%</p>
                        <p className="text-xs text-rose-600 mt-1">Yield to Maturity</p>
                      </div>
                    )}
                    {fund.ratios[0].Average_Maturity && (
                      <div className="p-5 bg-cyan-50 rounded-xl border-2 border-cyan-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-cyan-600" />
                          <p className="text-sm font-semibold text-cyan-700">Avg Maturity</p>
                        </div>
                        <p className="text-3xl font-bold text-cyan-900">{formatNumber(fund.ratios[0].Average_Maturity, 2)}</p>
                        <p className="text-xs text-cyan-600 mt-1">Years</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Financial ratios not available for this fund</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-600" />
                Quick Info
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-600">Fund Type</span>
                  <span className="font-bold text-slate-900">{fund.type || 'Open Ended'}</span>
                </div>
                <div className="flex justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-600">Category</span>
                  <span className="font-bold text-slate-900">{fund.category || 'Equity'}</span>
                </div>
                <div className="flex justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-600">Launch Date</span>
                  <span className="font-bold text-slate-900">{formatDate(fund.inception_date)}</span>
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Why Consider This Fund?
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Consistent Performance</p>
                      <p className="text-xs text-slate-600">Track record of delivering stable returns</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Expert Management</p>
                      <p className="text-xs text-slate-600">Managed by experienced fund managers</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Risk Management</p>
                      <p className="text-xs text-slate-600">Well-diversified portfolio across sectors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                Documents
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    if (fund?.factsheet_url) {
                      window.open(fund.factsheet_url, '_blank');
                    } else {
                      alert('Factsheet URL not available. Please visit the AMC website directly.');
                    }
                  }}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left flex items-center justify-between transition"
                >
                  <span className="text-sm font-semibold text-slate-700">Fact Sheet</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </button>
                {['Scheme Information', 'Annual Report'].map((doc, idx) => (
                  <button key={idx} className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left flex items-center justify-between transition">
                    <span className="text-sm font-semibold text-slate-700">{doc}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setInvestModalOpen(true)}
            className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Invest Now
          </button>
          <button 
            onClick={() => setInvestModalOpen(true)}
            className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-300 hover:border-emerald-500 rounded-xl font-bold shadow-lg hover:shadow-xl transition">
            Start SIP
          </button>
        </div>

        {/* Invest Modal */}
        {fund && (
          <InvestModal
            isOpen={investModalOpen}
            onClose={() => setInvestModalOpen(false)}
            fundName={fund.scheme_name || fund.S_NAME || fund.name || 'Fund'}
            fundId={id || fund.scheme_code || fund.id || ''}
            currentNAV={parseFloat(String(fund.nav || fund.NAVRS || 100))}
            minSIP={fund.sip_min_investment || fund.SIPMININVEST || '500'}
            minInvestment={fund.min_investment || fund.MININVT || '5000'}
          />
        )}
      </div>
    </div>
  );
};

export default FundDetailsPage;
