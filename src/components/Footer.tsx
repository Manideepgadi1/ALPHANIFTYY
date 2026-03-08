import React from 'react';
import { TrendingUp, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <p className="text-sm mb-4">
              Your trusted partner for smart mutual fund investments. Build wealth with curated baskets designed by experts.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com/alphanifty" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/alphanifty" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/alphanifty" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/alphanifty" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/alphanifty/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/alphanifty/explore-baskets" className="hover:text-primary transition-colors">Explore Baskets</a></li>
              <li><a href="/alphanifty/explore-funds" className="hover:text-primary transition-colors">Mutual Funds</a></li>
              <li><a href="/alphanifty/calculators" className="hover:text-primary transition-colors">Calculators</a></li>
              <li><a href="/alphanifty/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/alphanifty/investment-guide" className="hover:text-primary transition-colors">Investment Guide</a></li>
              <li><a href="/alphanifty/learn" className="hover:text-primary transition-colors">Educational Hub</a></li>
              <li><a href="/alphanifty/help-faq" className="hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="/alphanifty/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/alphanifty/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a href="mailto:alphanifty2025@gmail.com" className="text-sm hover:text-primary transition-colors">
                  alphanifty2025@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a href="tel:+918179593300" className="text-sm hover:text-primary transition-colors">
                  +91 81795 93300
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  15-13-8/8, F.No- 502 Gayatri Apartment,<br />
                  Krishnagar, Maharani Peta,<br />
                  Visakhapatnam, Andhra Pradesh 530002
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {currentYear} All rights reserved.</p>
            <p className="text-gray-400">
              Mutual fund investments are subject to market risks. Please read all scheme related documents carefully.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
