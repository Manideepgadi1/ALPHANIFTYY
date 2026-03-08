import React from 'react';
import { Shield, Lock, Eye, Database, Bell, FileText } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = 'January 24, 2026';

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Personal identification information (Name, email address, phone number)',
        'Financial information necessary for investment transactions',
        'Usage data and analytics to improve our services',
        'Device and browser information for security purposes'
      ]
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: [
        'To provide and maintain our investment services',
        'To process your transactions and manage your portfolio',
        'To send you important updates and notifications',
        'To improve our platform and user experience',
        'To comply with legal and regulatory requirements'
      ]
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: [
        'We use industry-standard encryption to protect your data',
        'Secure servers with regular security audits and updates',
        'Access controls and authentication measures',
        'Regular backups and disaster recovery procedures',
        'Compliance with data protection regulations'
      ]
    },
    {
      icon: Eye,
      title: 'Information Sharing',
      content: [
        'We do not sell your personal information to third parties',
        'We may share information with trusted service providers',
        'Information may be shared with regulatory authorities when required',
        'Anonymous, aggregated data may be used for analytics'
      ]
    },
    {
      icon: Bell,
      title: 'Your Rights',
      content: [
        'Access your personal information',
        'Request correction of inaccurate data',
        'Request deletion of your account and data',
        'Opt-out of marketing communications',
        'Export your data in a portable format'
      ]
    },
    {
      icon: FileText,
      title: 'Cookies and Tracking',
      content: [
        'We use cookies to enhance your browsing experience',
        'Analytics cookies help us understand user behavior',
        'You can control cookie preferences in your browser',
        'Essential cookies are required for platform functionality'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-main">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-xl text-gray-300 mb-4">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-gray-400">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="container-main py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16">
        <div className="container-main">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Your Privacy?</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions or concerns about our privacy policy, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:alphanifty2025@gmail.com"
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Email Us
              </a>
              <a 
                href="/alphanifty/help-faq"
                className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-primary"
              >
                Visit FAQ
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
