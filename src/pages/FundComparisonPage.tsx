import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Download, Loader, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
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

interface NAVHistory {
  date: string;
  nav: number;
}

interface FundData {
  code: string;
  name: string;
  history: NAVHistory[];
  benchmark: string;
}

// Use backend proxy to avoid CORS issues - include /alphanifty prefix for production
const API_BASE = import.meta.env.DEV 
  ? '/api' 
  : '/alphanifty/api';
const API_MF_BASE = import.meta.env.DEV 
  ? '/api/mf' 
  : '/alphanifty/api/mf';

const FundComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const fundsParam = searchParams.get('funds') || '';
  const fundCodes = fundsParam.split(',').filter(Boolean);
  
  const [fundsData, setFundsData] = useState<FundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1y');
  const [benchmarkData, setBenchmarkData] = useState<NAVHistory[]>([]);

  useEffect(() => {
    if (fundsParam && fundCodes.length > 0) {
      loadFundsData();
    } else {
      // No funds to compare - redirect to explorer
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fundsParam]);

  const loadFundsData = async () => {
    try {
      setLoading(true);
      const loadedFunds: FundData[] = [];

      for (const code of fundCodes) {
        try {
          // Fetch factsheet for fund name and benchmark
          const factsheetRes = await fetch(`${API_BASE}/funds/${code}/factsheet`);
          const factsheet = await factsheetRes.json();
          const fundName = factsheet.snapshot_summary?.[0]?.S_NAME || `Fund ${code}`;
          const benchmark = factsheet.snapshot_summary?.[0]?.BENCHMARK || 'Nifty 50';

          // Fetch NAV history using automatic scheme mapping
          const navRes = await fetch(`${API_BASE}/funds/${code}/nav-history?period=1Y`);
          const navApiResponse = await navRes.json();
          const navData = navApiResponse.data || navApiResponse;

          let history: NAVHistory[] = [];
          if (navData.Table && Array.isArray(navData.Table)) {
            history = navData.Table.map((item: any) => ({
              date: item.NAVDATE || item.Date,
              nav: parseFloat(item.NAVRS || item.NAV || 0)
            })).filter((item: NAVHistory) => item.nav > 0);
          }

          loadedFunds.push({
            code,
            name: fundName,
            history,
            benchmark
          });
        } catch (err) {
          console.error(`Error loading fund ${code}:`, err);
        }
      }

      setFundsData(loadedFunds);
      
      if (loadedFunds.length === 0) {
        alert('Could not load data for any of the selected funds. Please try again.');
      } else if (loadedFunds.length < fundCodes.length) {
        const failedCount = fundCodes.length - loadedFunds.length;
        alert(`Warning: ${failedCount} fund(s) could not be loaded. Showing data for ${loadedFunds.length} fund(s).`);
      }
      
      // Load benchmark data (simulated - you can replace with actual API)
      loadBenchmarkData();
    } catch (error) {
      console.error('Error loading funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFund = (codeToRemove: string) => {
    const updatedCodes = fundCodes.filter(code => code !== codeToRemove);
    if (updatedCodes.length === 0) {
      // If no funds left, go back to explorer
      navigate('/mutual-funds');
    } else {
      // Update URL with remaining funds
      navigate(`/fund-comparison?funds=${updatedCodes.join(',')}`);
    }
  };

  const downloadData = () => {
    if (fundsData.length === 0) return;

    // Get all unique dates
    const allDates = new Set<string>();
    fundsData.forEach(fund => {
      fund.history.forEach(item => allDates.add(item.date));
    });
    benchmarkData.forEach(item => allDates.add(item.date));
    
    const sortedDates = Array.from(allDates).sort();

    // Find the first date where ALL funds AND benchmark have data
    let baseDate: string | null = null;
    for (const date of sortedDates) {
      const allFundsHaveData = fundsData.every(fund => 
        fund.history.some(h => h.date === date && h.nav > 0)
      );
      const benchmarkHasData = benchmarkData.some(h => h.date === date && h.nav > 0);
      
      if (allFundsHaveData && benchmarkHasData) {
        baseDate = date;
        break;
      }
    }

    // Get base values at the common start date
    const fundBaseMaps = fundsData.map(fund => {
      const navMap = new Map(fund.history.map(h => [h.date, h.nav]));
      const baseNav = baseDate ? navMap.get(baseDate) : fund.history[0]?.nav;
      return { navMap, baseNav };
    });

    const benchmarkMap = new Map(benchmarkData.map(h => [h.date, h.nav]));
    const benchmarkBaseNav = baseDate ? benchmarkMap.get(baseDate) : benchmarkData[0]?.nav;

    // Create CSV content
    let csv = 'Date,';
    
    // Add fund names as headers
    fundsData.forEach(fund => {
      csv += `"${fund.name} (NAV)",`;
    });
    
    // Add portfolio average
    csv += 'Portfolio Indexed (Base 100),';
    
    // Add Nifty 50
    csv += 'Nifty 50 (NAV),Nifty 50 Indexed (Base 100)\n';

    // Add data rows
    sortedDates.forEach(date => {
      csv += `${date},`;
      
      // Fund NAVs and indexed values
      const fundIndexedValues: number[] = [];
      fundsData.forEach((_, idx) => {
        const nav = fundBaseMaps[idx].navMap.get(date);
        csv += nav ? `${nav.toFixed(2)},` : ',';
        
        if (nav && fundBaseMaps[idx].baseNav) {
          const indexed = (nav / fundBaseMaps[idx].baseNav) * 100;
          fundIndexedValues.push(indexed);
        }
      });
      
      // Portfolio average indexed value
      const avgIndexed = fundIndexedValues.length > 0 
        ? fundIndexedValues.reduce((a, b) => a + b, 0) / fundIndexedValues.length 
        : null;
      csv += avgIndexed !== null ? `${avgIndexed.toFixed(2)},` : ',';
      
      // Nifty 50 data
      const niftyNav = benchmarkMap.get(date);
      csv += niftyNav ? `${niftyNav.toFixed(2)},` : ',';
      
      const niftyIndexed = niftyNav && benchmarkBaseNav 
        ? (niftyNav / benchmarkBaseNav) * 100
        : null;
      csv += niftyIndexed !== null ? `${niftyIndexed.toFixed(2)}\n` : '\n';
    });

    // Download the CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const loadBenchmarkData = async () => {
    try {
      // Load Nifty 50 data using same endpoint as other funds (scheme 3641 = UTI Nifty 50 Index Fund)
      const response = await fetch(`${API_BASE}/funds/3641/nav-history?period=SI`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const niftyApiResponse = await response.json();
      
      console.log('✅ Nifty 50 raw response:', niftyApiResponse);
      
      // Handle response format (same as other funds)
      const niftyData = niftyApiResponse.data || niftyApiResponse;
      
      // Transform Nifty 50 data to NAVHistory format
      if (Array.isArray(niftyData) && niftyData.length > 0) {
        const transformedData: NAVHistory[] = niftyData.map((item: any) => ({
          date: item.NAVDATE || item.date || item.DATE,
          nav: parseFloat(item.ADJNAVRS || item.NAVRS || item['NIFTY 50'] || item.value || item.nav || 0)
        })).filter((item: NAVHistory) => item.nav > 0 && item.date);
        
        setBenchmarkData(transformedData);
        console.log(`✅ Loaded ${transformedData.length} Nifty 50 data points`);
        console.log('First point:', transformedData[0]);
        console.log('Last point:', transformedData[transformedData.length - 1]);
      } else {
        console.warn('⚠️ No valid Nifty 50 data received');
        setBenchmarkData([]);
      }
    } catch (error) {
      console.error('❌ Error loading Nifty 50 benchmark data:', error);
      setBenchmarkData([]);
    }
  };

  const filterDataByPeriod = (data: NAVHistory[]) => {
    if (!data || data.length === 0) return [];
    
    const today = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case '1m':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case '3y':
        startDate.setFullYear(today.getFullYear() - 3);
        break;
      case 'all':
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= startDate);
  };

  const generateChartData = () => {
    if (fundsData.length === 0) return null;

    // Filter data by selected period FIRST
    const filteredFundsData = fundsData.map(fund => ({
      ...fund,
      history: filterDataByPeriod(fund.history)
    }));
    const filteredBenchmark = filterDataByPeriod(benchmarkData);

    // Get all unique dates from FILTERED data
    const allDates = new Set<string>();
    filteredFundsData.forEach(fund => {
      fund.history.forEach(item => allDates.add(item.date));
    });
    filteredBenchmark.forEach(item => allDates.add(item.date));
    
    const sortedDates = Array.from(allDates).sort();

    // Sample dates for cleaner chart (show every Nth point)
    const sampleRate = Math.max(1, Math.floor(sortedDates.length / 100));
    let sampledDates = sortedDates.filter((_, i) => i % sampleRate === 0);

    // Find the FIRST sampled date where ALL selected funds have data AND benchmark has data
    // This is critical - we need actual NAV data for all funds AND benchmark
    let actualStartDate: string | null = null;
    for (const date of sampledDates) {
      const allFundsHaveData = filteredFundsData.every(fund => 
        fund.history.some(h => h.date === date && h.nav > 0)
      );
      const benchmarkHasData = filteredBenchmark.some(h => h.date === date && h.nav > 0);
      
      if (allFundsHaveData && benchmarkHasData) {
        actualStartDate = date;
        break;
      }
    }

    // Filter sampledDates to only include dates from actualStartDate onwards
    if (actualStartDate) {
      sampledDates = sampledDates.filter(date => date >= actualStartDate);
    }

    const datasets = [];

    // Use the FIRST sampled date (where all funds have data) as the base for normalization
    // This ensures both portfolio and benchmark start at exactly 100
    const baseDate = sampledDates[0];

    // CORRECT APPROACH: Normalize each fund to index (starting at 100) using the first sampled date
    const fundIndexedValues = filteredFundsData.map(fund => {
      const navMap = new Map(fund.history.map(h => [h.date, h.nav]));
      
      // Get the base NAV at the first sampled date
      const baseValue = navMap.get(baseDate);
      
      // Calculate indexed value (base 100) for each sampled date
      return sampledDates.map(date => {
        const nav = navMap.get(date);
        return nav && baseValue ? (nav / baseValue) * 100 : null;
      });
    });

    // Average the indexed values across all funds
    const avgIndexedValues = sampledDates.map((_, dateIndex) => {
      const valuesForDate = fundIndexedValues
        .map(indexed => indexed[dateIndex])
        .filter(v => v !== null);
      
      return valuesForDate.length > 0 
        ? valuesForDate.reduce((a, b) => a + b, 0) / valuesForDate.length 
        : null;
    });

    // Add combined funds dataset (single line for all selected funds)
    datasets.push({
      label: fundsData.length === 1 
        ? (fundsData[0].name.length > 60 ? fundsData[0].name.substring(0, 60) + '...' : fundsData[0].name)
        : `Portfolio (${fundsData.length} Funds)`,
      data: avgIndexedValues,
      borderColor: '#3498DB', // Blue for portfolio
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#3498DB',
      tension: 0.4, // Smooth curves
      fill: false
    });

    // Add benchmark (Nifty 50) dataset - also normalized to base 100 using SAME base date
    if (filteredBenchmark.length > 0) {
      const benchmarkMap = new Map(filteredBenchmark.map(h => [h.date, h.nav]));
      
      // Use the benchmark NAV at the SAME base date as funds
      const baseBenchmark = benchmarkMap.get(baseDate);
      
      const benchmarkIndexed = sampledDates.map(date => {
        const nav = benchmarkMap.get(date);
        return nav && baseBenchmark ? (nav / baseBenchmark) * 100 : null;
      });

      datasets.push({
        label: 'Nifty 50 (Benchmark)',
        data: benchmarkIndexed,
        borderColor: '#95A5A6', // Gray for benchmark
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line for benchmark
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#95A5A6',
        tension: 0.4,
        fill: false
      });
    }

    return {
      labels: sampledDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { 
          month: 'short', 
          year: selectedPeriod === '1m' || selectedPeriod === '3m' ? undefined : 'numeric'
        });
      }),
      datasets
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1
          },
          pinch: {
            enabled: false
          },
          mode: 'x' as const
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
          modifierKey: 'ctrl' as const
        }
      },      legend: {
        display: true,
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          boxWidth: 15,
          boxHeight: 3,
          padding: 15,
          font: { size: 12, weight: 500 as const },
          usePointStyle: false,
          color: '#2c3e50'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            // Show indexed value (base 100) and calculate return percentage
            const returnPct = value - 100;
            return `${label}: ${value.toFixed(2)} (${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: (value: any) => `${value}`, // Show indexed value (base 100)
          font: { size: 11 },
          color: '#7f8c8d',
          padding: 10
        },
        title: {
          display: true,
          text: 'Indexed Value (Base 100)',
          font: { size: 12, weight: 600 as const },
          color: '#2c3e50'
        }
      }
    }
  };

  const chartData = generateChartData();
  const startDate = fundsData[0]?.history[0]?.date || '';
  const endDate = fundsData[0]?.history[fundsData[0].history.length - 1]?.date || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fund Comparison</h1>
              <p className="text-sm text-gray-600 mt-1">
                Comparing {fundsData.length} fund{fundsData.length > 1 ? 's' : ''} with benchmark
              </p>
            </div>
            <button
              onClick={() => navigate('/fund-explorer')}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading comparison data...</span>
        </div>
      ) : fundCodes.length === 0 ? (
        <div className="container-main py-20">
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Funds Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select funds from the Fund Explorer to compare their performance
            </p>
            <button
              onClick={() => navigate('/fund-explorer')}
              className="btn btn-primary"
            >
              Go to Fund Explorer
            </button>
          </div>
        </div>
      ) : fundsData.length === 0 ? (
        <div className="container-main py-20">
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Unable to Load Fund Data</h2>
            <p className="text-gray-600 mb-6">
              The selected funds could not be loaded. Please try again or select different funds.
            </p>
            <button
              onClick={() => navigate('/fund-explorer')}
              className="btn btn-primary"
            >
              Back to Fund Explorer
            </button>
          </div>
        </div>
      ) : (
        <div className="container-main py-8">
          {/* Fund List */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold">Selected Funds</h3>
              <button
                onClick={downloadData}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download Data (CSV)</span>
              </button>
            </div>
            <div className="space-y-2">
              {fundsData.map((fund, idx) => (
                <div key={fund.code} className="flex items-center justify-between gap-2 sm:gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full flex-shrink-0 fund-color-${idx}`}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-700 truncate">{fund.name}</span>
                      <span className="text-xs text-gray-500 truncate hidden sm:inline">• Benchmark: {fund.benchmark}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFund(fund.code)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
                    title="Remove fund"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-3 p-2">
                <div className="w-4 h-1 bg-gray-400 border-dashed" />
                <span className="text-sm font-medium text-gray-600">Nifty 50 (Benchmark)</span>
              </div>
            </div>
          </div>

          {/* Time Period Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Time Period:</span>
              </div>
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                {['1m', '3m', '6m', '1y', '3y', 'all'].map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period === 'all' ? 'All' : period.toUpperCase()}
                  </button>
                ))}
              </div>
              {startDate && endDate && (
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  <span className="inline sm:hidden">
                    {new Date(startDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                    {' — '}
                    {new Date(endDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                  </span>
                  <span className="hidden sm:inline">
                    {new Date(startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' — '}
                    {new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-6">
            <div className="chart-lg overflow-x-auto">
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-semibold">Fund</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold">Current Return</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold">Data Points</th>
                  </tr>
                </thead>
                <tbody>
                  {fundsData.map((fund, idx) => {
                    const filtered = filterDataByPeriod(fund.history);
                    const firstNav = filtered[0]?.nav || 0;
                    const lastNav = filtered[filtered.length - 1]?.nav || 0;
                    const returns = firstNav ? ((lastNav - firstNav) / firstNav) * 100 : 0;

                    return (
                      <tr key={fund.code} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full fund-color-${idx}`}
                            />
                            <span className="text-sm">{fund.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={`text-sm font-semibold ${returns >= 0 ? 'text-success' : 'text-danger'}`}>
                            {returns >= 0 ? '+' : ''}{returns.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-sm text-gray-600">
                          {filtered.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundComparisonPage;
