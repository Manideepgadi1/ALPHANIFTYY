import React, { useEffect, useState } from 'react';
import { TrendingUp, Target, Shield, Sparkles, Loader } from 'lucide-react';
import { basketApi, Basket } from '../services/api';
import BasketCard from '../components/BasketCard';

const HomePage: React.FC = () => {
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBaskets = async () => {
      try {
        setLoading(true);
        const response = await basketApi.getAll();
        if (response.status === 'success' && response.data) {
          // Show only top 3 baskets on home page
          setBaskets(response.data.slice(0, 3));
        } else {
          setError(response.message || 'Failed to load baskets');
        }
      } catch (err) {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchBaskets();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="container-main">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Invest Smarter with
              <span className="text-primary"> Curated Baskets</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover expertly crafted mutual fund portfolios designed to help you achieve your financial goals with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/explore-baskets" className="btn btn-primary text-lg px-8">
                Explore Baskets
              </a>
              <a href="/calculators" className="btn btn-outline text-lg px-8">
                Try Calculators
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Alphanifty?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Curated Baskets</h3>
              <p className="text-gray-600">
                Expert-designed portfolios tailored to different risk profiles and investment goals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Performance Tracking</h3>
              <p className="text-gray-600">
                Real-time portfolio monitoring with detailed analytics and benchmark comparisons.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Risk Management</h3>
              <p className="text-gray-600">
                Smart diversification and rebalancing to optimize risk-adjusted returns.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-alert-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-alert" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Investing</h3>
              <p className="text-gray-600">
                Simple SIP setup, automatic rebalancing, and hassle-free portfolio management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-main">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10+</div>
              <div className="text-gray-600">Curated Baskets</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600">Mutual Funds</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15%+</div>
              <div className="text-gray-600">Avg. Returns</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-gray-600">Happy Investors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Baskets Section */}
      <section className="py-20 bg-white">
        <div className="container-main">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Featured Baskets
            </h2>
            <a href="/explore-baskets" className="btn btn-outline">
              View All Baskets
            </a>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-12 h-12 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-semibold mb-2">Unable to load baskets</p>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {baskets.map((basket) => (
                <BasketCard key={basket.id} basket={basket} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container-main text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of smart investors building wealth with Alphanifty's expert-curated portfolios.
          </p>
          <a href="/register" className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8">
            Get Started Free
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
