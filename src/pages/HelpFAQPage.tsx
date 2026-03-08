import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';

const HelpFAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'What is Alphanifty?',
          a: 'Alphanifty is a smart investment platform that offers curated mutual fund baskets designed to help you achieve your financial goals.'
        },
        {
          q: 'How do I start investing?',
          a: 'Simply sign up, explore our curated baskets, choose the one that matches your goals, and start investing with as little as ₹1,000.'
        },
        {
          q: 'Is my money safe?',
          a: 'Yes, all investments are made through SEBI-registered platforms. Your funds are held securely by the fund houses.'
        }
      ]
    },
    {
      category: 'Baskets',
      questions: [
        {
          q: 'What are investment baskets?',
          a: 'Investment baskets are curated portfolios of mutual funds designed around specific themes, goals, or risk profiles.'
        },
        {
          q: 'Can I customize a basket?',
          a: 'Currently, baskets are expertly curated and cannot be customized. However, you can invest in multiple baskets to diversify.'
        },
        {
          q: 'What is the minimum investment?',
          a: 'The minimum investment varies by basket, typically starting from ₹1,000 to ₹5,000.'
        }
      ]
    },
    {
      category: 'Payments',
      questions: [
        {
          q: 'What payment methods are accepted?',
          a: 'We accept UPI, net banking, debit cards, and credit cards for investments.'
        },
        {
          q: 'Are there any hidden charges?',
          a: 'No hidden charges. You only pay the fund expense ratios, which are clearly disclosed for each basket.'
        },
        {
          q: 'Can I get a refund?',
          a: 'Investments can be redeemed as per mutual fund guidelines. Redemption typically takes 3-5 business days.'
        }
      ]
    },
    {
      category: 'Account',
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'Click on "Forgot Password" on the login page and follow the instructions sent to your registered email.'
        },
        {
          q: 'Can I update my KYC details?',
          a: 'Yes, you can update your KYC details through your account settings or by contacting support.'
        },
        {
          q: 'How do I view my portfolio?',
          a: 'Access your complete portfolio summary from the Dashboard. You can see all your investments, returns, and SIPs in one place.'
        }
      ]
    }
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-warning-50 py-12">
      <div className="container-main">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-warning-100 rounded-full px-5 py-2 mb-4">
            <HelpCircle className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold text-warning">Support Center</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            How Can We <span className="text-warning">Help?</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions and get support from our team
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-16 pr-6 py-5 text-lg rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-warning focus:border-transparent shadow-lg"
            />
          </div>
        </div>

        {/* FAQs with Enhanced Design */}
        <div className="max-w-4xl mx-auto mb-16">
          {filteredFAQs.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-xl text-gray-600 font-semibold">No results found for "{searchQuery}"</p>
              <p className="text-gray-500 mt-2">Try different keywords or browse all categories</p>
            </div>
          ) : (
            filteredFAQs.map((category, catIndex) => (
              <div key={catIndex} className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-warning rounded-full"></div>
                  <h2 className="text-3xl font-bold text-gray-900">{category.category}</h2>
                </div>
                <div className="space-y-4">
                  {category.questions.map((item, qIndex) => {
                    const faqId = catIndex * 100 + qIndex;
                    const isOpen = openFAQ === faqId;
                    return (
                      <div key={qIndex} className="card border-2 border-transparent hover:border-warning transition-all">
                        <button
                          onClick={() => setOpenFAQ(isOpen ? null : faqId)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                        >
                          <span className="font-bold text-lg text-gray-900">{item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-6 h-6 text-warning flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <div className="h-px bg-gray-200 mb-4"></div>
                            <p className="text-gray-600 text-lg leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Support with Enhanced Design */}
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warning via-warning-500 to-warning-600 p-12 text-white shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold mb-3">Still Need Help?</h2>
                <p className="text-xl text-warning-100">Our dedicated support team is ready to assist you 24/7</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-warning" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                  <p className="text-warning-100">Chat with us instantly</p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-warning" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Email Support</h3>
                  <p className="text-warning-100">support@alphanifty.com</p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-warning" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Call Us</h3>
                  <p className="text-warning-100">+91 XXX XXX XXXX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQPage;
