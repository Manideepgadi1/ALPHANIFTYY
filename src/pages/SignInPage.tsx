import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isGuest, continueAsGuest, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated (but NOT if guest - guests can sign in)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const returnUrl = (location.state as any)?.from?.pathname || '/';
      navigate(returnUrl);
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleGuestContinue = () => {
    continueAsGuest();
    const returnUrl = (location.state as any)?.from?.pathname || '/';
    navigate(returnUrl);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      // Use AuthContext login
      await login(email, password);
      
      // Redirect to return URL or home page
      const returnUrl = (location.state as any)?.from?.pathname || '/';
      navigate(returnUrl);
    } catch (error: any) {
      setIsLoading(false);
      setErrors({
        general: error.message || 'Invalid email or password. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 pt-24 pb-20 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-success rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header with Enhanced Design */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2 mb-4 shadow-sm border border-primary-200">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Secure Login</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-lg text-gray-600">Sign in to continue your investment journey</p>
          </div>

          {/* Sign In Card with Enhanced Shadow */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600 font-medium">{errors.general}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-primary to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-primary/90 hover:to-blue-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Continue as Guest */}
            <div className="space-y-3">
              <button 
                type="button"
                onClick={handleGuestContinue}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-primary-200 rounded-xl hover:bg-primary-50 transition-colors font-semibold text-primary"
              >
                <ArrowRight className="w-5 h-5" />
                Continue as Guest
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-primary hover:text-primary/80 font-bold"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-primary mb-1">256-bit</p>
              <p className="text-xs text-gray-600">SSL Encryption</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-success mb-1">SEBI</p>
              <p className="text-xs text-gray-600">Registered</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-gray-900 mb-1">2FA</p>
              <p className="text-xs text-gray-600">Protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
