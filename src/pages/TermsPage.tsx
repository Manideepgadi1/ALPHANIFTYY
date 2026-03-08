import React from 'react';
import { FileText, AlertCircle, CheckCircle, XCircle, Scale, Shield } from 'lucide-react';

const TermsPage: React.FC = () => {
  const lastUpdated = 'January 24, 2026';

  const terms = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: 'By accessing and using AlphaNifty platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.'
    },
    {
      icon: Shield,
      title: 'Use of Services',
      content: 'Our platform provides investment information, basket recommendations, and portfolio management tools. You agree to use these services responsibly and in accordance with applicable laws and regulations.'
    },
    {
      icon: AlertCircle,
      title: 'Investment Risks',
      content: 'All investments carry inherent risks. Past performance does not guarantee future results. AlphaNifty provides information and tools but does not guarantee investment returns or outcomes.'
    },
    {
      icon: Scale,
      title: 'User Responsibilities',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information and update it as necessary. Any investment decisions are your sole responsibility.'
    },
    {
      icon: CheckCircle,
      title: 'Intellectual Property',
      content: 'All content, features, and functionality on AlphaNifty are owned by us and protected by copyright, trademark, and other intellectual property laws. Unauthorized use is prohibited.'
    },
    {
      icon: XCircle,
      title: 'Limitation of Liability',
      content: 'AlphaNifty shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of our services or any investment decisions made using our platform.'
    }
  ];

  const guidelines = [
    'You must be at least 18 years old to use our services',
    'Provide accurate and truthful information when registering',
    'Do not share your account credentials with others',
    'Use the platform for lawful purposes only',
    'Do not attempt to manipulate or interfere with platform operations',
    'Respect intellectual property rights',
    'Comply with all applicable securities and investment regulations'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-main">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-xl text-gray-300 mb-4">
              Please read these terms carefully before using AlphaNifty platform.
            </p>
            <p className="text-gray-400">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="container-main py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {terms.map((term, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <term.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{term.title}</h2>
                  <p className="text-gray-700 leading-relaxed">{term.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* User Guidelines */}
      <section className="bg-white py-16">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">User Guidelines</h2>
              <p className="text-gray-700 mb-6 text-center">
                To ensure a safe and compliant platform for all users, please adhere to these guidelines:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{guideline}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="container-main py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Important Investment Notice</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Market Risks:</strong> Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing.
                  </p>
                  <p>
                    <strong>No Guarantee:</strong> Past performance is not indicative of future returns. The NAV of the scheme may go up or down depending upon the factors and forces affecting the securities market.
                  </p>
                  <p>
                    <strong>Consult Advisor:</strong> We recommend consulting with a qualified financial advisor before making investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 py-12">
        <div className="container-main text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Questions About Our Terms?</h2>
          <p className="text-blue-100 mb-6">
            If you have any questions about these terms, please contact our support team.
          </p>
          <a 
            href="mailto:alphanifty2025@gmail.com"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
