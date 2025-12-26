import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Calendar, ArrowUpRight, ArrowDownLeft, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { portfolioApi, Portfolio } from '../services/api';

const TransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await portfolioApi.get();
        if (response.status === 'success' && response.data) {
          setPortfolio(response.data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const transactions = portfolio?.transactions || [];
  const filteredTransactions = filter === 'All' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Buy':
        return <ArrowDownLeft className="w-5 h-5 text-success" />;
      case 'Sell':
        return <ArrowUpRight className="w-5 h-5 text-error" />;
      case 'SIP':
        return <RefreshCw className="w-5 h-5 text-primary" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'Completed' 
      ? <CheckCircle className="w-4 h-4 text-success" />
      : <Clock className="w-4 h-4 text-warning" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-8">Transaction History</h1>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Filter Transactions</h3>
          </div>

          <div className="flex gap-2">
            {['All', 'Buy', 'Sell', 'SIP'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{transaction.type}</h3>
                        <span className="flex items-center gap-1 text-sm">
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{transaction.basketName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.type === 'Sell' ? 'text-success' : 'text-gray-900'
                    }`}>
                      {transaction.type === 'Sell' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
