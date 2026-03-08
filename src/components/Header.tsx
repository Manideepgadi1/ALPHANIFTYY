import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, ShoppingCart, Bookmark, Calculator, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import useCart from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [localCartCount, setLocalCartCount] = useState(0);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Correct cart usage - use localStorage count first, then CartContext
  const { items } = useCart();
  const contextCartCount = items.reduce<number>(
    (sum, item) => sum + item.quantity,
    0
  );
  const cartCount = localCartCount > 0 ? localCartCount : contextCartCount;

  // Load and sync counts
  useEffect(() => {
    const loadCounts = () => {
      // Load watchlist count
      const savedWatchlist = localStorage.getItem('alphanifty_watchlist');
      const watchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];
      setWatchlistCount(watchlist.length);
      
      // Load cart count from localStorage (for instant display)
      const savedCart = localStorage.getItem('alphanifty_cart');
      const cart = savedCart ? JSON.parse(savedCart) : [];
      setLocalCartCount(cart.length);
    };

    loadCounts();

    // Listen for updates
    const handleUpdate = () => {
      loadCounts();
    };

    window.addEventListener('watchlist-updated', handleUpdate);
    window.addEventListener('cart-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('watchlist-updated', handleUpdate);
      window.removeEventListener('cart-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Also sync with CartContext items for real-time updates from API
  useEffect(() => {
    if (items) {
      const count = items.reduce<number>((sum, item) => sum + item.quantity, 0);
      setLocalCartCount(count);
    }
  }, [items]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Explore Baskets', href: '/explore-baskets' },
    { name: 'Mutual Funds', href: '/explore-funds' },
    { name: 'Fund Explorer', href: '/fund-explorer' },
  ];

  const rightNavigation = [
    { name: 'Calculators', href: '/financial-calculators' },
    { name: 'Learn', href: '/learn' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container-main">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <img 
              src="/alphanifty/logo.png" 
              alt="AlphaNifty Logo" 
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Right - All Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Learn Link */}
            <Link
              to="/learn"
              className="hidden md:block text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Learn
            </Link>

            {/* Calculator Icon - Hidden on small mobile, show on sm+ */}
            <a
              href="https://app.vsfintech.in/alphanifty/calculators"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-colors"
              aria-label="Calculators"
            >
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>

            {/* Watchlist */}
            <Link
              to="/watchlist"
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-colors"
              aria-label="Watchlist"
            >
              <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
              {watchlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-primary text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {watchlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-danger text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile or Login */}
            {isAuthenticated && user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/portfolio-dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">My Profile</span>
                    </Link>

                    <Link
                      to="/watchlist"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span className="text-sm font-medium">Watchlist</span>
                    </Link>

                    <Link
                      to="/cart"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm font-medium">My Cart</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-medium">Settings</span>
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-danger hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="hidden md:flex items-center gap-2 btn btn-outline"
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              className="md:hidden p-1.5 sm:p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-primary font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && user ? (
                <>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/portfolio-dashboard"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 text-danger hover:opacity-80 py-2 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className="flex items-center gap-2 text-gray-700 hover:text-primary py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
