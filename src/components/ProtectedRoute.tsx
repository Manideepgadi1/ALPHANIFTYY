import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires full authentication (not guest)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = false }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If route requires full authentication (not guest)
  if (requireAuth && !isAuthenticated) {
    // Show a message page instead of immediate redirect for better UX
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-success-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            This content is available only to registered users. Please sign in to your account to access basket details, mutual funds, and more features.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/sign-in', { state: { from: location } })}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Sign In to Continue
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:text-primary/80 font-semibold"
            >
              Sign up now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Route allows guest or authenticated users
  if (!requireAuth && !isAuthenticated && !isGuest) {
    // Redirect to sign-in if neither authenticated nor guest
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
