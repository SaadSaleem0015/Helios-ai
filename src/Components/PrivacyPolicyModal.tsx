import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Database, 
  Share2, 
  Cookie, 
  Lock, 
  UserCheck, 
  Clock, 
  Globe, 
  Users, 
  Link, 
  FileText, 
  Mail,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface PrivacySection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string[];
  subsections?: { title: string; items: string[] }[];
}

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['1']));
  const [activeSection, setActiveSection] = useState<string>('1');

  const sections: PrivacySection[] = [
    {
      id: '1',
      title: 'Overview',
      icon: <Shield className="w-5 h-5" />,
      content: [
        'This Privacy Policy explains how the platform collects, uses, and protects user data.',
        'By using the service, users agree to the data practices described here.'
      ]
    },
    {
      id: '2',
      title: 'Information We Collect',
      icon: <Database className="w-5 h-5" />,
      content: [
        'Your privacy is important to us. We collect different types of information to provide and improve our services.'
      ],
      subsections: [
        {
          title: 'a) Information you provide',
          items: [
            'Name, email, phone number',
            'Account/login details',
            'Any data you submit while using the service',
            'In some cases: financial or usage-related inputs (for service functionality)'
          ]
        },
        {
          title: 'b) Automatically collected data',
          items: [
            'IP address',
            'Device info (browser, OS, device type)',
            'Cookies & tracking data',
            'Usage behavior (pages visited, time spent, clicks)'
          ]
        },
        {
          title: 'c) Third-party data',
          items: [
            'Data from login providers (Google, etc.)',
            'Data from external integrations or services'
          ]
        }
      ]
    },
    {
      id: '3',
      title: 'How Data is Used',
      icon: <Share2 className="w-5 h-5" />,
      content: [
        'Your data is used to:',
        '• Provide and operate services',
        '• Manage your account',
        '• Improve features and performance',
        '• Personalize user experience',
        '• Detect fraud, abuse, or security issues',
        '• Comply with legal obligations'
      ]
    },
    {
      id: '4',
      title: 'Data Sharing',
      icon: <Share2 className="w-5 h-5" />,
      content: [
        'Your data may be shared with:',
        '• Service providers (Hosting, analytics, email services) – Only for operational purposes',
        '• Legal authorities – If required by law',
        '• Business transfers – In case of merger/acquisition',
        '• Aggregated data – Non-identifiable data may be shared publicly'
      ],
      subsections: [
        {
          title: 'Important',
          items: [
            'Personal data is not sold without consent'
          ]
        }
      ]
    },
    {
      id: '5',
      title: 'Cookies & Tracking',
      icon: <Cookie className="w-5 h-5" />,
      content: [
        'Used for login, analytics, personalization',
        'You can disable cookies in browser settings',
        'Some features may break if disabled'
      ]
    },
    {
      id: '6',
      title: 'Data Security',
      icon: <Lock className="w-5 h-5" />,
      content: [
        'Uses industry-standard security measures',
        'Protects against unauthorized access',
        'No system is 100% secure (important reality)'
      ]
    },
    {
      id: '7',
      title: 'User Rights',
      icon: <UserCheck className="w-5 h-5" />,
      content: [
        'Users can:',
        '• Access their data',
        '• Update or correct data',
        '• Request deletion',
        '• Withdraw consent',
        '',
        'Requests can be made via support/contact email'
      ]
    },
    {
      id: '8',
      title: 'Data Retention',
      icon: <Clock className="w-5 h-5" />,
      content: [
        'Data is stored only as long as needed',
        'Some data may be kept for legal reasons',
        'Deleted or anonymized when no longer required'
      ]
    },
    {
      id: '9',
      title: 'International Data Transfer',
      icon: <Globe className="w-5 h-5" />,
      content: [
        'Data may be processed in different countries',
        'Proper safeguards are applied for protection'
      ]
    },
    {
      id: '10',
      title: "Children's Privacy",
      icon: <Users className="w-5 h-5" />,
      content: [
        'Not intended for users under 13',
        'Data of children is removed if discovered'
      ]
    },
    {
      id: '11',
      title: 'Third-Party Links',
      icon: <Link className="w-5 h-5" />,
      content: [
        'External websites are not controlled by the platform',
        'Their privacy policies apply separately'
      ]
    },
    {
      id: '12',
      title: 'Updates to Policy',
      icon: <FileText className="w-5 h-5" />,
      content: [
        'Policy may change over time',
        'Continued use = acceptance of updates'
      ]
    },
    {
      id: '13',
      title: 'Contact',
      icon: <Mail className="w-5 h-5" />,
      content: [
        'For any privacy-related queries:',
        'Contact via official support email'
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Table of Contents - Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-0 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">Contents</h3>
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-gray-400 text-xs">{section.id}.</span>
                        <span className="truncate">{section.title}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Overview Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Our Commitment to Privacy</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    At Helios AI, we take your privacy seriously. This policy describes how we collect, 
                    use, and protect your personal information when you use our platform. By using our 
                    services, you trust us with your information, and we're committed to maintaining that 
                    trust.
                  </p>
                </div>

                {/* Sections */}
                {sections.map((section) => (
                  <div
                    key={section.id}
                    id={`section-${section.id}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-20"
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                          {section.icon}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          <span className="text-primary-600 mr-2">{section.id}.</span>
                          {section.title}
                        </h3>
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Section Content */}
                    {expandedSections.has(section.id) && (
                      <div className="px-6 pb-6">
                        <div className="space-y-4">
                          {section.content.map((paragraph, idx) => (
                            <p key={idx} className="text-sm text-gray-600 leading-relaxed">
                              {paragraph}
                            </p>
                          ))}

                          {section.subsections?.map((subsection, idx) => (
                            <div key={idx} className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                {subsection.title}
                              </h4>
                              <ul className="space-y-2">
                                {subsection.items.map((item, itemIdx) => (
                                  <li key={itemIdx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Footer Note */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Questions About Your Privacy?</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        If you have any questions or concerns about how we handle your data, 
                        please don't hesitate to reach out to our privacy team.
                      </p>
                      <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                      contact@theheliosai.com
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Helios AI. All rights reserved.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Usage example:
export function PrivacyPolicyLink() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPrivacyPolicy(true)}
        className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
      >
        Privacy Policy
      </button>

      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </>
  );
}