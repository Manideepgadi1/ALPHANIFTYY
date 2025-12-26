// Type definitions for the application

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  riskProfile?: 'Conservative' | 'Moderate' | 'Aggressive';
  createdAt: Date;
}

export interface Basket {
  id: string;
  name: string;
  color: string; // Hex color for branding
  description: string;
  ageRange: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  minInvestment: number;
  timeHorizon: string;
  goals: string[];
  experienceLevel: string;
  
  // Performance metrics
  cagr1Y: number;
  cagr3Y: number;
  cagr5Y: number;
  riskPercentage: number;
  sharpeRatio: number;
  
  // Additional info
  funds: Fund[];
  rationale: string;
  philosophy: string;
  suitableFor: string;
  rebalancingFrequency: string;
}

export interface Fund {
  id: string;
  name: string;
  fundHouse: string;
  category: 'Equity' | 'Debt' | 'Hybrid';
  subCategory: string;
  
  // Performance
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  
  // Metrics
  aum: string;
  nav: number;
  expenseRatio: number;
  exitLoad: number;
  minInvestment: number;
  
  // Risk metrics
  risk: 'Low' | 'Medium' | 'High';
  rating: number; // 1-5 stars
  sharpeRatio: number;
  standardDeviation: number;
  beta: number;
  
  // Holdings
  topHoldings?: Holding[];
  sectorAllocation?: SectorAllocation[];
}

export interface Holding {
  name: string;
  percentage: number;
}

export interface SectorAllocation {
  sector: string;
  percentage: number;
}

export interface CartItem {
  basket: Basket;
  amount: number;
  type: 'SIP' | 'Lumpsum';
  frequency?: 'Monthly' | 'Quarterly' | 'Yearly';
  goal?: string;
  linkedGoalId?: string;
}

export interface CalculatorResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  chartData?: ChartDataPoint[];
}

export interface ChartDataPoint {
  year: number;
  invested: number;
  value: number;
}

export interface PerformanceData {
  date: string;
  basketValue: number;
  benchmarkValue: number;
}

export interface FilterOptions {
  riskLevel?: ('Low' | 'Medium' | 'High')[];
  minInvestment?: number;
  maxInvestment?: number;
  timeHorizon?: string[];
  experienceLevel?: string[];
  cagrMin?: number;
  cagrMax?: number;
  goals?: string[];
}

export interface SortOption {
  field: 'cagr1Y' | 'cagr3Y' | 'cagr5Y' | 'riskPercentage' | 'minInvestment' | 'sharpeRatio';
  direction: 'asc' | 'desc';
}
