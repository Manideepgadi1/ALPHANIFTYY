import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, ShoppingCart, TrendingUp } from 'lucide-react';
import useCart from '../context/CartContext';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Correct cart usage
  const { items } = useCart();
 const cartCount = items.reduce<number>(
  (sum, item) => sum + item.quantity,
  0
);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Explore Baskets', href: '/explore-baskets' },
    { name: 'Calculators', href: '/calculators' },
    { name: 'Mutual Funds', href: '/explore-funds' },
    { name: 'My Baskets', href: '/my-baskets' },
    { name: 'Portfolio', href: '/portfolio' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">
              Alpha<span className="text-primary">nifty</span>
            </span>
          </div>

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

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login */}
            <Link
              to="/sign-in"
              className="hidden md:flex items-center gap-2 btn btn-outline"
            >
              <User className="w-5 h-5" />
              Login
            </Link>

            {/* Mobile Menu */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

              <Link
                to="/sign-in"
                className="flex items-center gap-2 text-gray-700 hover:text-primary py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
