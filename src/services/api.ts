// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? 'http://localhost:5000/api'
    : '/alphanifty/api'
);

// Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface Basket {
  id: number | string;
  name: string;
  description: string;
  minReturn?: number;
  maxReturn?: number;
  cagr1Y?: number;
  cagr3Y?: number;
  cagr5Y?: number;
  risk?: 'Low' | 'Medium' | 'High';
  riskLevel?: string;
  minInvestment: number;
  category?: string;
  funds: (number | string)[];
  color?: string;
  timeHorizon?: string;
  experienceLevel?: string;
  riskPercentage?: number;
  sharpeRatio?: number | string;
  philosophy?: string;
  rationale?: string;
  suitableFor?: string;
  goals?: string[];
  rebalancingFrequency?: string;
}

export interface Fund {
  id: number | string;
  name: string;
  amc?: string;
  fundHouse?: string;
  category: string;
  subCategory?: string;
  nav: number;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  expenseRatio: number;
  aum: number | string;
  risk: string;
  rating: number;
  sharpe?: number;
  sharpeRatio?: number;
  minInvestment?: number;
}

export interface PerformanceData {
  basket: number[];
  nifty50: number[];
  labels: string[];
}

export interface CartItem {
  id: string;
  basketId: number | string;
  investmentType: 'SIP' | 'Lumpsum';
  amount: number;
  frequency?: 'Monthly' | 'Quarterly' | 'Yearly';
  addedAt: string;
}

export interface Portfolio {
  totalValue: number;
  invested: number;
  returns: number;
  returnsPercent: number;
  goals?: Array<{
    name: string;
    target: number;
    current: number;
    deadline?: string;
  }>;
  holdings: Array<{
    basketId: number;
    basketName: string;
    invested: number;
    current: number;
    returns: number;
    returnsPercent: number;
  }>;
  sips: Array<{
    basketId: number;
    basketName: string;
    amount: number;
    frequency: string;
    nextDate: string;
    status: 'Active' | 'Paused';
  }>;
  transactions: Array<{
    date: string;
    type: 'Buy' | 'Sell' | 'SIP';
    basketName: string;
    amount: number;
    status: 'Completed' | 'Pending';
  }>;
  performance: {
    labels: string[];
    values: number[];
  };
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Basket APIs
export const basketApi = {
  getAll: () => apiCall<Basket[]>('/baskets'),
  
  getById: (id: number | string) => apiCall<Basket>(`/baskets/${id}`),
  
  getPerformance: (id: number) => apiCall<PerformanceData>(`/baskets/${id}/performance`),
};

// Fund APIs
export const fundApi = {
  getAll: () => apiCall<Fund[]>('/funds'),
  
  getById: (id: number | string) => apiCall<Fund>(`/funds/${id}`),
};

// Calculator APIs
export const calculatorApi = {
  calculateSIP: (data: {
    monthlyInvestment: number;
    annualReturn: number;
    years: number;
  }) =>
    apiCall<{
      investedAmount: number;
      estimatedReturns: number;
      totalValue: number;
    }>('/calculators/sip', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  calculateLumpsum: (data: {
    principal: number;
    annualReturn: number;
    years: number;
  }) =>
    apiCall<{
      investedAmount: number;
      estimatedReturns: number;
      totalValue: number;
    }>('/calculators/lumpsum', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  calculateGoal: (data: {
    targetAmount: number;
    years: number;
    annualReturn: number;
    existingInvestment: number;
  }) =>
    apiCall<{
      requiredMonthlySIP: number;
      targetAmount: number;
      years: number;
      existingInvestment: number;
      futureValueOfExisting: number;
      additionalRequired: number;
      message?: string;
    }>('/calculators/goal', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Cart APIs
export const cartApi = {
  get: (userId: string = 'guest') =>
    apiCall<CartItem[]>(`/cart?userId=${userId}`),

  add: (data: {
    userId?: string;
    basketId: number | string;
    investmentType: 'SIP' | 'Lumpsum';
    amount: number;
    frequency?: 'Monthly' | 'Quarterly' | 'Yearly';
  }) =>
    apiCall<CartItem>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (itemId: string, data: {
    userId?: string;
    amount?: number;
    investmentType?: 'SIP' | 'Lumpsum';
    frequency?: 'Monthly' | 'Quarterly' | 'Yearly';
  }) =>
    apiCall<CartItem>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (itemId: string, userId: string = 'guest') =>
    apiCall(`/cart/${itemId}?userId=${userId}`, {
      method: 'DELETE',
    }),

  clear: (userId: string = 'guest') =>
    apiCall('/cart/clear', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

// Portfolio APIs
export const portfolioApi = {
  get: (userId: string = 'demo-user') =>
    apiCall<Portfolio>(`/portfolio?userId=${userId}`),
};

// Search API
export const searchApi = {
  search: (query: string) =>
    apiCall<{ baskets: Basket[]; funds: Fund[] }>(`/search?q=${encodeURIComponent(query)}`),
};

// Health check
export const healthCheck = () => apiCall<{ message: string; version: string }>('/health');
