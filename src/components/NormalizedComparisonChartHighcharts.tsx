import React, { useEffect, useState, useRef } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { Loader, Download, TrendingUp } from 'lucide-react';

// API Configuration
const API_BASE = import.meta.env.DEV ? '/api' : '/alphanifty/api';

// Helper function to normalize date strings to YYYY-MM-DD for consistent comparison
const normalizeDateString = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
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
  funds: Fund[];
  includeNifty?: boolean;
}

const NormalizedComparisonChartHighcharts: React.FC<NormalizedComparisonChartProps> = ({
  funds,
  includeNifty = true
}) => {
  const [chartData, setChartData] = useState<NormalizedData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [youngestFundDate, setYoungestFundDate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1Y' | '3Y' | '5Y' | 'ALL'>('ALL');
  const chartRef = useRef<HighchartsReact.RefObject>(null);

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
      
      const allData: NormalizedData = {};
      let latestInceptionDate: Date | null = null;
      
      // Fetch NAV data for each fund
      for (const fund of funds) {
        try {
          // Get fund factsheet for inception date
          const factsheetUrl = `${API_BASE}/funds/${fund.schemeCode}/factsheet`;
          const factsheetRes = await fetch(factsheetUrl);
          const factsheet = await factsheetRes.json();
          const inceptionDateStr = factsheet.snapshot_summary?.[0]?.INCEPT_DATE;
          
          if (inceptionDateStr) {
            try {
              const datePart = inceptionDateStr.split(' ')[0];
              const inceptionDate = new Date(datePart);
              
              if (!isNaN(inceptionDate.getTime())) {
                if (!latestInceptionDate || inceptionDate > latestInceptionDate) {
                  latestInceptionDate = inceptionDate;
                }
              }
            } catch (e) {
              console.error(`Error parsing inception date: ${inceptionDateStr}`, e);
            }
          }
          
          // Get NAV history
          const navUrl = `${API_BASE}/funds/${fund.schemeCode}/nav-history?period=SI`;
          const navRes = await fetch(navUrl);
          const navApiResponse = await navRes.json();
          const navData = navApiResponse.data || navApiResponse;
          
          let history: NAVData[] = [];
          let dataArray = navData.Table || (Array.isArray(navData) ? navData : null);
          
          if (dataArray && Array.isArray(dataArray)) {
            history = dataArray.map((item: any) => {
              const rawDate = item.NAVDATE || item.Date || item.date;
              return {
                date: normalizeDateString(rawDate),
                nav: parseFloat(item.NAVRS || item.NAV || item.ADJNAVRS || item.nav || 0)
              };
            }).filter((item: NAVData) => item.nav > 0 && item.date);
          }
          
          allData[fund.schemeCode] = history;
        } catch (err) {
          console.error(`Error loading fund ${fund.schemeCode}:`, err);
        }
      }
      
      // Fetch Nifty 50 data if requested
      if (includeNifty) {
        try {
          const niftyUrl = `${API_BASE}/funds/3641/nav-history?period=SI`;
          const niftyRes = await fetch(niftyUrl);
          const niftyApiResponse = await niftyRes.json();
          const niftyData = niftyApiResponse.data || niftyApiResponse;
          
          if (Array.isArray(niftyData) && niftyData.length > 0) {
            const niftyHistory: NAVData[] = niftyData.map((item: any) => {
              const rawDate = item.NAVDATE || item.date || item.DATE;
              const navValue = parseFloat(item.ADJNAVRS || item.NAVRS || item['NIFTY 50'] || item.value || item.nav || 0);
              return {
                date: normalizeDateString(rawDate),
                nav: navValue
              };
            }).filter((item: NAVData) => item.nav > 0 && item.date);
            
            allData['NIFTY50'] = niftyHistory;
          }
        } catch (err) {
          console.error('Error loading Nifty 50 data:', err);
        }
      }
      
      setYoungestFundDate(latestInceptionDate);
      setChartData(allData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError('Failed to load comparison data');
      setLoading(false);
    }
  };

  // Generate Highcharts options
  const getChartOptions = (): Highcharts.Options => {
    if (Object.keys(chartData).length === 0) {
      return {};
    }

    // Find the start date
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

    if (!startDate) {
      return {};
    }
    
    if (periodStartDate && periodStartDate > startDate) {
      startDate = periodStartDate;
    }

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

    // Create series data
    const series: Highcharts.SeriesOptionsType[] = [];

    // Combined Portfolio Line
    const fundDataMaps: Map<string, number>[] = [];
    const baseNavs: number[] = [];
    
    funds.forEach(fund => {
      const history = chartData[fund.schemeCode];
      if (!history || history.length === 0) return;

      const filteredHistory = history.filter(item => new Date(item.date) >= startDate!);
      if (filteredHistory.length === 0) return;

      const navMap = new Map(filteredHistory.map(h => [h.date, h.nav]));
      fundDataMaps.push(navMap);
      
      const baseNav = filteredHistory[0].nav;
      baseNavs.push(baseNav);
    });

    if (fundDataMaps.length > 0) {
      const portfolioData: Array<[number, number]> = sortedDates.map(dateStr => {
        const normalizedValues: number[] = [];
        
        fundDataMaps.forEach((navMap, idx) => {
          const nav = navMap.get(dateStr);
          if (nav && baseNavs[idx]) {
            const normalized = (nav / baseNavs[idx]) * 100;
            normalizedValues.push(normalized);
          }
        });
        
        const avgValue = normalizedValues.length > 0
          ? normalizedValues.reduce((sum, val) => sum + val, 0) / normalizedValues.length
          : null;
        
        return [new Date(dateStr).getTime(), avgValue ?? 0] as [number, number];
      }).filter(([_, val]) => val > 0) as Array<[number, number]>;

      series.push({
        type: 'line',
        name: `Portfolio (${funds.length} Fund${funds.length > 1 ? 's' : ''})`,
        data: portfolioData,
        color: '#3b82f6',
        lineWidth: 2.5,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 4,
          states: {
            hover: {
              enabled: true,
              radius: 5,
              lineWidth: 2,
              lineColor: '#2563eb'
            }
          }
        },
        states: {
          hover: {
            lineWidth: 3
          }
        }
      });
    }

    // Add Nifty 50 benchmark
    if (includeNifty && chartData['NIFTY50']) {
      const niftyHistory = chartData['NIFTY50'];
      const filteredNifty = niftyHistory.filter(item => new Date(item.date) >= startDate!);
      
      if (filteredNifty.length > 0) {
        const niftyMap = new Map(filteredNifty.map(h => [h.date, h.nav]));
        const baseNifty = filteredNifty[0].nav;

        const normalizedNifty: Array<[number, number]> = sortedDates.map(dateStr => {
          const nav = niftyMap.get(dateStr);
          const value = nav ? (nav / baseNifty) * 100 : null;
          return [new Date(dateStr).getTime(), value ?? 0] as [number, number];
        }).filter(([_, val]) => val > 0) as Array<[number, number]>;

        series.push({
          type: 'line',
          name: 'Nifty 50 (Benchmark)',
          data: normalizedNifty,
          color: '#10b981',
          lineWidth: 2.5,
          dashStyle: 'Dot',
          marker: {
            enabled: false
          },
          states: {
            hover: {
              lineWidth: 3
            }
          }
        });
      }
    }

    return {
      chart: {
        backgroundColor: '#ffffff',
        zooming: {
          mouseWheel: {
            enabled: true,
            sensitivity: 1.1
          }
        },
        height: 500,
        marginTop: 60
      },
      
      rangeSelector: {
        enabled: false // We use custom buttons
      },
      
      navigator: {
        enabled: true,
        height: 50,
        margin: 15,
        maskFill: 'rgba(59, 130, 246, 0.08)',
        outlineColor: '#60a5fa',
        outlineWidth: 1,
        handles: {
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          width: 14,
          height: 26,
          symbols: ['navigator-handle', 'navigator-handle'],
          lineWidth: 1
        },
        series: {
          type: 'areaspline',
          lineWidth: 1.5,
          color: '#60a5fa',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(96, 165, 250, 0.4)'],
              [1, 'rgba(96, 165, 250, 0.05)']
            ]
          },
          fillOpacity: 1
        },
        xAxis: {
          gridLineWidth: 0,
          labels: {
            style: {
              color: '#6b7280',
              fontSize: '11px'
            }
          }
        }
      },
      
      scrollbar: {
        enabled: false
      },
      
      title: {
        text: undefined
      },
      
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Date',
          style: {
            color: '#334155',
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        labels: {
          style: {
            color: '#64748b',
            fontSize: '11px'
          }
        },
        lineColor: '#cbd5e1',
        gridLineWidth: 0
      },
      
      yAxis: {
        title: {
          text: 'Normalized Value (Base 100)',
          style: {
            color: '#334155',
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        labels: {
          formatter: function() {
            const val = (typeof this.value === 'number' ? this.value : parseFloat(String(this.value)));
            return val.toFixed(0);
          },
          style: {
            color: '#64748b',
            fontSize: '11px'
          }
        },
        gridLineColor: '#e5e7eb',
        gridLineDashStyle: 'Dash'
      },
      
      tooltip: {
        shared: true,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        shadow: true,
        style: {
          color: '#1e293b',
          fontSize: '12px'
        },
        xDateFormat: '%e %b %Y',
        valueDecimals: 2,
        pointFormatter: function() {
          const value = this.y ?? 0;
          const returnPct = value - 100;
          return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${value.toFixed(2)}</b> (${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%)<br/>`;
        }
      },
      
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
        itemStyle: {
          color: '#475569',
          fontSize: '13px',
          fontWeight: '500'
        }
      },
      
      plotOptions: {
        series: {
          showInNavigator: true,
          animation: {
            duration: 400
          },
          states: {
            hover: {
              lineWidthPlus: 1
            }
          }
        }
      },
      
      series: series,
      
      credits: {
        enabled: false
      },
      
      exporting: {
        enabled: false
      }
    };
  };

  const downloadCSV = () => {
    if (Object.keys(chartData).length === 0) return;

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

    const allDates = new Set<string>();
    Object.values(chartData).forEach(history => {
      history.forEach(item => {
        if (new Date(item.date) >= startDate!) {
          allDates.add(item.date);
        }
      });
    });
    const sortedDates = Array.from(allDates).sort();

    const rows: string[] = [];
    const headers = ['Date', ...funds.map(f => f.name), ...(includeNifty ? ['Nifty 50'] : [])];
    rows.push(headers.join(','));

    sortedDates.forEach(dateStr => {
      const row: (string | number)[] = [dateStr];
      
      funds.forEach(fund => {
        const history = chartData[fund.schemeCode];
        const baseNav = history && history.length > 0 ? history.find(h => new Date(h.date) >= startDate!)?.nav : null;
        const navItem = history?.find(h => h.date === dateStr);
        
        if (navItem && baseNav) {
          const normalized = (navItem.nav / baseNav) * 100;
          row.push(normalized.toFixed(2));
        } else {
          row.push('');
        }
      });

      if (includeNifty && chartData['NIFTY50']) {
        const niftyHistory = chartData['NIFTY50'];
        const baseNifty = niftyHistory.find(h => new Date(h.date) >= startDate!)?.nav;
        const niftyItem = niftyHistory.find(h => h.date === dateStr);
        
        if (niftyItem && baseNifty) {
          const normalized = (niftyItem.nav / baseNifty) * 100;
          row.push(normalized.toFixed(2));
        } else {
          row.push('');
        }
      }

      rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `fund-comparison-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-800 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Loading comparison data...</p>
          <p className="text-sm text-gray-500 mt-1">Fetching NAV history for {funds.length} fund(s)</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center">
          <p className="font-semibold text-red-600">Error loading chart</p>
          <p className="text-sm mt-1 text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const chartOptions = getChartOptions();

  if (!chartOptions.series || chartOptions.series.length === 0) {
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-md">
      {/* Header Section */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Performance Comparison</h3>
            <p className="text-gray-600 text-sm mt-0.5">
              {funds.length} Fund{funds.length > 1 ? 's' : ''} vs Nifty 50 • Normalized to Base 100
            </p>
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm"
            aria-label="Download CSV data"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Period Filter Buttons */}
      <div className="px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex gap-2 flex-wrap">
          {(['1Y', '3Y', '5Y', 'ALL'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-6">
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'stockChart'}
          options={chartOptions}
          ref={chartRef}
        />
      </div>

      {/* Tips Section */}
      <div className="px-6 pb-6">
        <div className="bg-slate-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs text-slate-600 space-y-2">
            <p><strong className="text-slate-800">Zoom:</strong> Use mouse wheel, drag handles below chart, or click & drag on chart</p>
            <p><strong className="text-slate-800">Reset:</strong> Double-click the chart to reset zoom</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NormalizedComparisonChartHighcharts;
