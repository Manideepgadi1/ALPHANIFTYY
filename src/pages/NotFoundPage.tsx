import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-success rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-4">
            404
          </div>
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl">
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link to="/explore-baskets" className="btn btn-outline text-lg px-8 py-4">
            <ArrowLeft className="w-5 h-5" />
            Explore Baskets
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          Need help? <Link to="/help" className="text-primary hover:underline font-semibold">Contact Support</Link>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
