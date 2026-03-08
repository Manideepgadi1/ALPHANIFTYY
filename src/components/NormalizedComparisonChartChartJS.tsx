import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Loader, Download, ZoomIn, RotateCcw } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

// API Configuration
const API_BASE = import.meta.env.DEV ? '/api' : '/alphanifty/api';

// Helper function to normalize date strings to YYYY-MM-DD for consistent comparison
const normalizeDateString = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return original if invalid
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
};

interface Fund {
  schemeCode: string;
  name: string;
  color?: string;
}

interface NAVData {
  date: string;
  nav: number;
}

interface NormalizedData {
  [key: string]: NAVData[];
}

interface NormalizedComparisonChartProps {
  funds: Fund[]; // Selected funds (1-10)
  includeNifty?: boolean; // Whether to include Nifty 50 benchmark
}

const NormalizedComparisonChartChartJS: React.FC<NormalizedComparisonChartProps> = ({
  funds,
  includeNifty = true
}) => {
  const [chartData, setChartData] = useState<NormalizedData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [youngestFundDate, setYoungestFundDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1Y' | '3Y' | '5Y' | 'ALL'>('ALL');
  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    if (funds.length === 0) {
      setLoading(false);
      setError('No funds selected for comparison');
      return;
    }
    
    fetchAllData();
  }, [funds]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Starting PARALLEL data fetch for funds:', funds.map(f => f.schemeCode));
      
      const allData: NormalizedData = {};
      let latestInceptionDate: Date | null = null;
      
      // OPTIMIZATION 1: Fetch all factsheets in PARALLEL
      console.log('📊 Step 1: Fetching factsheets in parallel...');
      const factsheetPromises = funds.map(fund => 
        fetch(`${API_BASE}/funds/${fund.schemeCode}/factsheet`)
          .then(res => res.json())
          .then(data => ({ schemeCode: fund.schemeCode, data }))
          .catch(err => {
            console.error(`❌ Factsheet error for ${fund.schemeCode}:`, err);
            return { schemeCode: fund.schemeCode, data: null };
          })
      );
      
      const factsheets = await Promise.all(factsheetPromises);
      console.log(`✅ Fetched ${factsheets.length} factsheets in parallel`);
      
      // Extract inception dates
      for (const { schemeCode, data: factsheet } of factsheets) {
        if (factsheet?.snapshot_summary?.[0]?.INCEPT_DATE) {
          try {
            const inceptionDateStr = factsheet.snapshot_summary[0].INCEPT_DATE;
            const datePart = inceptionDateStr.split(' ')[0];
            const inceptionDate = new Date(datePart);
            
            if (!isNaN(inceptionDate.getTime())) {
              if (!latestInceptionDate || inceptionDate > latestInceptionDate) {
                latestInceptionDate = inceptionDate;
                console.log(`  → Latest inception: ${schemeCode} (${datePart})`);
              }
            }
          } catch (e) {
            console.error(`  ❌ Error parsing inception date for ${schemeCode}:`, e);
          }
        }
      }
      
      // OPTIMIZATION 2: Use BATCH endpoint for NAV history (if available)
      // Try batch endpoint first, fallback to parallel individual requests
      let navDataFetched = false;
      
      try {
        console.log('📈 Step 2: Trying BATCH NAV history endpoint...');
        const fundCodes = funds.map(f => f.schemeCode);
        
        const batchResponse = await fetch(`${API_BASE}/funds/batch-nav-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fund_codes: fundCodes,
            period: 'SI'
          })
        });
        
        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          
          if (batchData.status === 'success' && batchData.data) {
            console.log(`✅ Batch endpoint success! Summary:`, batchData.summary);
            
            // Process batch results
            for (const [schemeCode, navArray] of Object.entries(batchData.data)) {
              if (Array.isArray(navArray) && navArray.length > 0) {
                const history: NAVData[] = navArray.map((item: any) => {
                  const rawDate = item.NAVDATE || item.Date || item.date;
                  return {
                    date: normalizeDateString(rawDate),
                    nav: parseFloat(item.NAVRS || item.NAV || item.ADJNAVRS || item.nav || 0)
                  };
                }).filter((item: NAVData) => item.nav > 0 && item.date);
                
                allData[schemeCode] = history;
                console.log(`  ✅ ${schemeCode}: ${history.length} records`);
              }
            }
            
            navDataFetched = true;
          }
        }
      } catch (batchError) {
        console.warn('⚠️ Batch endpoint not available, falling back to parallel individual requests');
      }
      
      // OPTIMIZATION 3: Fallback to PARALLEL individual requests (still faster than sequential)
      if (!navDataFetched) {
        console.log('📈 Step 2 (Fallback): Fetching NAV history in parallel...');
        const navPromises = funds.map(fund =>
          fetch(`${API_BASE}/funds/${fund.schemeCode}/nav-history?period=SI`)
            .then(res => res.json())
            .then(apiResponse => {
              const navData = apiResponse.data || apiResponse;
              const dataArray = navData.Table || (Array.isArray(navData) ? navData : null);
              
              if (dataArray && Array.isArray(dataArray)) {
                const history: NAVData[] = dataArray.map((item: any) => {
                  const rawDate = item.NAVDATE || item.Date || item.date;
                  return {
                    date: normalizeDateString(rawDate),
                    nav: parseFloat(item.NAVRS || item.NAV || item.ADJNAVRS || item.nav || 0)
                  };
                }).filter((item: NAVData) => item.nav > 0 && item.date);
                
                return { schemeCode: fund.schemeCode, history };
              }
              return { schemeCode: fund.schemeCode, history: [] };
            })
            .catch(err => {
              console.error(`❌ NAV error for ${fund.schemeCode}:`, err);
              return { schemeCode: fund.schemeCode, history: [] };
            })
        );
        
        const navResults = await Promise.all(navPromises);
        
        for (const { schemeCode, history } of navResults) {
          allData[schemeCode] = history;
          console.log(`  ✅ ${schemeCode}: ${history.length} records`);
        }
        
        console.log(`✅ Fetched ${navResults.length} NAV histories in parallel`);
      }
      
      // Fetch Nifty 50 data if requested
      if (includeNifty) {
        try {
          console.log('📈 Step 3: Fetching Nifty 50 benchmark...');
          const niftyUrl = `${API_BASE}/funds/3641/nav-history?period=SI`;
          const niftyRes = await fetch(niftyUrl);
          const niftyApiResponse = await niftyRes.json();
          const niftyData = niftyApiResponse.data || niftyApiResponse;
          const niftyArray = niftyData.Table || (Array.isArray(niftyData) ? niftyData : null);
          
          if (niftyArray && Array.isArray(niftyArray) && niftyArray.length > 0) {
            const niftyHistory: NAVData[] = niftyArray.map((item: any) => {
              const rawDate = item.NAVDATE || item.Date || item.date || item.DATE;
              const navValue = parseFloat(item.ADJNAVRS || item.NAVRS || item.NAV || item['NIFTY 50'] || item.value || item.nav || 0);
              return {
                date: normalizeDateString(rawDate),
                nav: navValue
              };
            }).filter((item: NAVData) => item.nav > 0 && item.date);
            
            console.log(`  ✅ Nifty 50: ${niftyHistory.length} data points`);
            allData['NIFTY50'] = niftyHistory;
          } else {
            console.log(`  ⚠️ No valid Nifty data found`);
          }
        } catch (err) {
          console.error('❌ Error loading Nifty 50 data:', err);
        }
      }
      
      // Set youngest fund date (latest inception = youngest fund)
      console.log('📅 Latest inception date:', latestInceptionDate);
      console.log('📊 Total data loaded:', Object.keys(allData).map(key => `${key}: ${allData[key].length} points`));
      console.log('🔍 Full allData structure:', allData);
      
      setYoungestFundDate(latestInceptionDate);
      setChartData(allData);
      setLoading(false);
      console.log('✅ Data fetch complete, loading set to false');
    } catch (err) {
      console.error('❌ Error fetching comparison data:', err);
      setError('Failed to load comparison data');
      setLoading(false);
    }
  };

  // Generate normalized chart data
  const generateChartData = () => {
    console.log('🎨 generateChartData called');
    console.log('  chartData keys:', Object.keys(chartData));
    console.log('  youngestFundDate:', youngestFundDate);
    console.log('  selectedPeriod:', selectedPeriod);
    console.log('  funds:', funds);
    
    if (Object.keys(chartData).length === 0) {
      console.log('  ❌ No chartData, returning null');
      return null;
    }

    // Find the start date based on selected period
    const today = new Date();
    let periodStartDate: Date | null = null;
    
    if (selectedPeriod === '1Y') {
      periodStartDate = new Date(today);
      periodStartDate.setFullYear(today.getFullYear() - 1);
    } else if (selectedPeriod === '3Y') {
      periodStartDate = new Date(today);
      periodStartDate.setFullYear(today.getFullYear() - 3);
    } else if (selectedPeriod === '5Y') {
      periodStartDate = new Date(today);
      periodStartDate.setFullYear(today.getFullYear() - 5);
    }
    // For 'ALL', periodStartDate remains null

    // Find the start date (youngest fund's inception or first date where all funds have data)
    let startDate: Date | null = youngestFundDate;
    
    if (!startDate) {
      // Fallback: find the latest date where all funds have data
      console.log('  ⚠️ No youngestFundDate, using fallback logic');
      const allDates = new Set<string>();
      Object.values(chartData).forEach(history => {
        history.forEach(item => allDates.add(item.date));
      });
      const sortedDates = Array.from(allDates).sort();
      console.log('  → Total unique dates:', sortedDates.length);
      
      // Find first date where ALL funds have data
      for (const dateStr of sortedDates) {
        const allFundsHaveData = Object.values(chartData).every(history =>
          history.some(h => h.date === dateStr && h.nav > 0)
        );
        if (allFundsHaveData) {
          startDate = new Date(dateStr);
          console.log('  → Found common start date:', dateStr);
          break;
        }
      }
    }

    if (!startDate) {
      console.log('  ❌ No startDate, returning null');
      return null;
    }
    
    // Apply period filter if not 'ALL'
    if (periodStartDate && periodStartDate > startDate) {
      startDate = periodStartDate;
      console.log('  📅 Period filter applied, new start date:', startDate);
    }
    
    console.log('  ✅ Final start date:', startDate);

    // Collect all unique dates from start date onwards
    const allDates = new Set<string>();
    Object.values(chartData).forEach(history => {
      history.forEach(item => {
        if (new Date(item.date) >= startDate!) {
          allDates.add(item.date);
        }
      });
    });
    const sortedDates = Array.from(allDates).sort();

    // Sample dates (show every Nth point for performance)
    const sampleRate = Math.max(1, Math.floor(sortedDates.length / 200));
    const sampledDates = sortedDates.filter((_, i) => i % sampleRate === 0);

    // Create datasets
    const datasets = [];

    // **COMBINED PORTFOLIO LINE** - Average of all selected funds
    const fundDataMaps: Map<string, number>[] = [];
    const baseNavs: number[] = [];
    
    funds.forEach(fund => {
      const history = chartData[fund.schemeCode];
      if (!history || history.length === 0) return;

      // Filter data from start date
      const filteredHistory = history.filter(item => new Date(item.date) >= startDate!);
      if (filteredHistory.length === 0) return;

      // Create a map for quick lookups
      const navMap = new Map(filteredHistory.map(h => [h.date, h.nav]));
      fundDataMaps.push(navMap);
      
      // Get base NAV (first value in filtered data)
      const baseNav = filteredHistory[0].nav;
      baseNavs.push(baseNav);
      console.log(`  → Fund ${fund.schemeCode} base NAV (at start date):`, baseNav, 'on', filteredHistory[0].date);
    });

    console.log('  📊 All base NAVs:', baseNavs);

    if (fundDataMaps.length > 0) {
      // Calculate portfolio average for each date
      const portfolioData = sampledDates.map(dateStr => {
        const normalizedValues: number[] = [];
        
        fundDataMaps.forEach((navMap, idx) => {
          const nav = navMap.get(dateStr);
          if (nav && baseNavs[idx]) {
            const normalized = (nav / baseNavs[idx]) * 100;
            normalizedValues.push(normalized);
          }
        });
        
        // Return average if we have data from at least one fund
        if (normalizedValues.length > 0) {
          return normalizedValues.reduce((sum, val) => sum + val, 0) / normalizedValues.length;
        }
        return null;
      });
      
      console.log('  📊 Sample portfolio normalized values (first 5):', portfolioData.slice(0, 5));
      console.log('  📊 Sample portfolio normalized values (last 5):', portfolioData.slice(-5));
      console.log('  📊 Portfolio data points with values:', portfolioData.filter(v => v !== null).length);

      datasets.push({
        label: `Portfolio (${funds.length} Fund${funds.length > 1 ? 's' : ''})`,
        data: portfolioData,
        borderColor: '#3498DB', // Blue
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#3498DB',
        tension: 0.3,
        fill: false,
        spanGaps: true
      });
    }

    // Add Nifty 50 benchmark
    if (includeNifty && chartData['NIFTY50']) {
      const niftyHistory = chartData['NIFTY50'];
      console.log('  📊 Total Nifty 50 data points:', niftyHistory.length);
      const filteredNifty = niftyHistory.filter(item => new Date(item.date) >= startDate!);
      console.log('  📊 Filtered Nifty 50 data points (after period filter):', filteredNifty.length);
      
      if (filteredNifty.length > 0) {
        const niftyMap = new Map(filteredNifty.map(h => [h.date, h.nav]));
        const baseNifty = filteredNifty[0].nav;
        
        console.log('  📈 Nifty 50 base NAV (at start date):', baseNifty, 'on', filteredNifty[0].date);
        console.log('  📈 Nifty 50 last NAV:', filteredNifty[filteredNifty.length - 1].nav, 'on', filteredNifty[filteredNifty.length - 1].date);

        const normalizedNifty = sampledDates.map(dateStr => {
          const nav = niftyMap.get(dateStr);
          return nav ? (nav / baseNifty) * 100 : null;
        });
        
        console.log('  📊 Sample normalized Nifty values (first 5):', normalizedNifty.slice(0, 5));
        console.log('  📊 Sample normalized Nifty values (last 5):', normalizedNifty.slice(-5));

        datasets.push({
          label: 'Nifty 50 (Benchmark)',
          data: normalizedNifty,
          borderColor: '#95A5A6',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [8, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#95A5A6',
          tension: 0.3,
          fill: false,
          spanGaps: true
        });
      }
    }

    console.log('  📊 Generated datasets:', datasets.length);
    console.log('  🏷️ Labels count:', sampledDates.length);
    
    return {
      labels: sampledDates,
      datasets
    };
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      title: {
        display: true,
        text: 'Portfolio Performance Comparison',
        font: {
          size: 18,
          weight: '600'
        },
        color: '#2c3e50',
        padding: {
          top: 10,
          bottom: 20
        },
        align: 'start' as const
      },
      subtitle: {
        display: true,
        text: youngestFundDate 
          ? `Combined portfolio of ${funds.length} fund${funds.length > 1 ? 's' : ''} - Starting from: ${youngestFundDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}`
          : `Combined portfolio of ${funds.length} fund${funds.length > 1 ? 's' : ''} normalized to base 100`,
        font: {
          size: 13
        },
        color: '#7f8c8d',
        padding: {
          bottom: 15
        },
        align: 'start' as const
      },
      legend: {
        display: true,
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          boxWidth: 15,
          boxHeight: 3,
          padding: 15,
          font: { size: 12, weight: '500' },
          usePointStyle: false,
          color: '#2c3e50'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 14,
        displayColors: true,
        callbacks: {
          title: (context: any) => {
            // context[0].parsed.x contains the timestamp when using time scale
            const timestamp = context[0].parsed?.x || context[0].label;
            const date = new Date(timestamp);
            
            if (isNaN(date.getTime())) {
              return 'Invalid Date';
            }
            
            return date.toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (!value) return label;
            
            // Show indexed value (base 100) and calculate return percentage
            const returnPct = value - 100;
            return `${label}: ${value.toFixed(2)} (${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%)`;
          }
        }
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1
          },
          pinch: {
            enabled: true
          },
          mode: 'x' as const
        },
        pan: {
          enabled: true,
          mode: 'x' as const
        },
        limits: {
          x: { min: 'original', max: 'original' }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM yyyy'
          }
        },
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: { size: 12, weight: '500' },
          color: '#2c3e50'
        },
        grid: {
          display: false,
          drawBorder: true
        },
        ticks: {
          maxTicksLimit: 12,
          font: { size: 11 },
          color: '#7f8c8d'
        }
      },
      y: {
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Indexed Value (Base 100)',
          font: { size: 12, weight: '500' },
          color: '#2c3e50'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: true
        },
        ticks: {
          callback: (value: any) => value.toFixed(0),
          font: { size: 11 },
          color: '#7f8c8d'
        }
      }
    }
  };

  const downloadCSV = () => {
    if (Object.keys(chartData).length === 0) return;

    // Get start date
    let startDate: Date | null = youngestFundDate;
    if (!startDate) {
      const allDates = new Set<string>();
      Object.values(chartData).forEach(history => {
        history.forEach(item => allDates.add(item.date));
      });
      const sortedDates = Array.from(allDates).sort();
      for (const dateStr of sortedDates) {
        const allFundsHaveData = Object.values(chartData).every(history =>
          history.some(h => h.date === dateStr && h.nav > 0)
        );
        if (allFundsHaveData) {
          startDate = new Date(dateStr);
          break;
        }
      }
    }
    if (!startDate) return;

    // Collect all unique dates from start date onwards
    const allDates = new Set<string>();
    Object.values(chartData).forEach(history => {
      history.forEach(item => {
        if (new Date(item.date) >= startDate!) {
          allDates.add(item.date);
        }
      });
    });
    const sortedDates = Array.from(allDates).sort();

    // Build portfolio data maps
    const fundDataMaps: Map<string, number>[] = [];
    const baseNavs: number[] = [];
    
    funds.forEach(fund => {
      const history = chartData[fund.schemeCode];
      if (!history || history.length === 0) return;
      const filteredHistory = history.filter(item => new Date(item.date) >= startDate!);
      if (filteredHistory.length === 0) return;
      const navMap = new Map(filteredHistory.map(h => [h.date, h.nav]));
      fundDataMaps.push(navMap);
      baseNavs.push(filteredHistory[0].nav);
    });

    // Build Nifty 50 data
    let niftyMap: Map<string, number> | null = null;
    let baseNifty = 0;
    if (includeNifty && chartData['NIFTY50']) {
      const niftyHistory = chartData['NIFTY50'];
      const filteredNifty = niftyHistory.filter(item => new Date(item.date) >= startDate!);
      if (filteredNifty.length > 0) {
        niftyMap = new Map(filteredNifty.map(h => [h.date, h.nav]));
        baseNifty = filteredNifty[0].nav;
      }
    }

    // Create CSV content
    let csvContent = 'Date,"Portfolio (' + funds.length + ' Fund' + (funds.length > 1 ? 's' : '') + ')"';
    if (niftyMap) csvContent += ',"Nifty 50 (Benchmark)"';
    csvContent += '\n';

    // Add data rows - only rows with at least one value
    sortedDates.forEach(dateStr => {
      // Calculate portfolio value
      const normalizedValues: number[] = [];
      fundDataMaps.forEach((navMap, idx) => {
        const nav = navMap.get(dateStr);
        if (nav && baseNavs[idx]) {
          const normalized = (nav / baseNavs[idx]) * 100;
          normalizedValues.push(normalized);
        }
      });
      const portfolioValue = normalizedValues.length > 0 
        ? normalizedValues.reduce((sum, val) => sum + val, 0) / normalizedValues.length
        : null;

      // Calculate Nifty value
      const niftyValue = niftyMap && baseNifty
        ? ((niftyMap.get(dateStr) || 0) / baseNifty) * 100
        : null;

      // Only export row if BOTH portfolio AND nifty have values (or if no nifty, just portfolio)
      const hasValidData = niftyMap 
        ? (portfolioValue !== null && niftyValue !== null && niftyValue > 0)
        : (portfolioValue !== null);
        
      if (hasValidData) {
        csvContent += `${dateStr},`;
        csvContent += portfolioValue !== null ? portfolioValue.toFixed(2) : '';
        if (niftyMap) {
          csvContent += ',';
          csvContent += niftyValue !== null && niftyValue > 0 ? niftyValue.toFixed(2) : '';
        }
        csvContent += '\n';
      }
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `portfolio_comparison_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading comparison data...</p>
          <p className="text-sm text-gray-400 mt-1">Fetching NAV history for {funds.length} fund(s)</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading chart</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const data = generateChartData();

  if (!data || data.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p className="font-semibold">No data available</p>
          <p className="text-sm mt-1">Unable to load performance data for selected funds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Performance Comparison</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {funds.length} fund{funds.length > 1 ? 's' : ''} vs Nifty 50 • Normalized to Base 100
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => chartRef.current?.resetZoom()}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all font-medium text-sm border border-gray-300 shadow-sm"
              title="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Zoom
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm shadow-sm"
              aria-label="Download CSV data"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Period Filter Buttons */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Time Range:</span>
          <div className="flex gap-2 flex-wrap">
            {(['1Y', '3Y', '5Y', 'ALL'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <ZoomIn className="w-3 h-3" />
          Scroll to zoom • Drag to pan • Use Reset Zoom to restore view
        </p>
      </div>

      <div className="p-6 h-[520px]">
        <Line ref={chartRef} data={data} options={chartOptions} />
      </div>
    </div>
  );
};

export default NormalizedComparisonChartChartJS;
