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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Help & FAQ</h1>
          <p className="text-gray-600 text-lg">Find answers to common questions</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="input w-full pl-12 py-4 text-lg"
            />
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto mb-12">
          {filteredFAQs.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-600">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredFAQs.map((category, catIndex) => (
              <div key={catIndex} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                <div className="space-y-3">
                  {category.questions.map((item, qIndex) => {
                    const faqId = catIndex * 100 + qIndex;
                    const isOpen = openFAQ === faqId;
                    return (
                      <div key={qIndex} className="card">
                        <button
                          onClick={() => setOpenFAQ(isOpen ? null : faqId)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900">{item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <p className="text-gray-600 leading-relaxed">{item.a}</p>
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

        {/* Contact Support */}
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 bg-gradient-to-r from-primary-50 to-success-50">
            <h2 className="text-2xl font-bold mb-4 text-center">Still need help?</h2>
            <p className="text-gray-600 text-center mb-6">Our support team is here to assist you</p>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="btn btn-outline flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Live Chat
              </button>
              <button className="btn btn-outline flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                Email Support
              </button>
              <button className="btn btn-outline flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Call Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQPage;
