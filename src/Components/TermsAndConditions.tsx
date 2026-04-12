import React from 'react';
import { 
  Scale,
  Shield,
  FileText,
  CreditCard,
  RefreshCw,
  Users,
  Eye,
  Zap,
  Ban,
  AlertCircle,
  Link,
  FileWarning,
  Mail,
  BookOpen,
  ChevronRight,
  Globe,
  Lock
} from 'lucide-react';

export function TermsAndConditions() {
  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 1,
      title: "Use of Services",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "You agree to use our services only for lawful purposes and in accordance with these Terms. You must be at least 18 years old to access or use our programs.",
        "You agree not to:"
      ],
      list: [
        "Use our services in any way that violates applicable laws or regulations",
        "Attempt to gain unauthorized access to systems, accounts, or data",
        "Distribute, copy, or exploit our content without permission",
        "Interfere with or disrupt the integrity or performance of our services"
      ]
    },
    {
      id: 2,
      title: "Intellectual Property",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "All content, materials, frameworks, systems, and methodologies provided through The AI Implementation Method—including but not limited to text, videos, templates, strategies, and branding—are the intellectual property of Esquared Media LLC.",
        "You are granted a limited, non-transferable, non-exclusive license for personal or internal business use only.",
        "You may not:"
      ],
      list: [
        "Resell, redistribute, or sublicense our materials",
        "Reproduce or copy our systems for commercial use without written consent",
        "Claim ownership of any of our intellectual property"
      ]
    },
    {
      id: 3,
      title: "Payments & Billing",
      icon: <CreditCard className="w-5 h-5" />,
      content: [
        "By purchasing any of our services, you agree to:",
        "• Provide accurate billing information",
        "• Pay all fees as agreed at the time of purchase",
        "",
        "All payments are final unless otherwise explicitly stated in writing.",
        "",
        "We reserve the right to:",
        "• Suspend or terminate access to services for non-payment",
        "• Change pricing at any time (without affecting prior purchases)"
      ]
    },
    {
      id: 4,
      title: "Refund Policy",
      icon: <RefreshCw className="w-5 h-5" />,
      content: [
        "Unless otherwise stated in a specific offer or agreement:",
        "• All sales are final",
        "• No refunds will be issued",
        "",
        "If a guarantee or refund policy is offered, it will be clearly outlined at the point of sale and will override this section."
      ]
    },
    {
      id: 5,
      title: "Program Access & Community Guidelines",
      icon: <Users className="w-5 h-5" />,
      content: [
        "If you are granted access to a community, coaching program, or platform, you agree to:"
      ],
      list: [
        "Maintain respectful and professional conduct",
        "Not share, distribute, or leak confidential materials or discussions",
        "Not use the community for unsolicited promotion or spam"
      ],
      additionalContent: [
        "We reserve the right to remove access at any time for violations of these guidelines, without refund."
      ]
    },
    {
      id: 6,
      title: "Confidentiality",
      icon: <Eye className="w-5 h-5" />,
      content: [
        "Any non-public information shared within our programs—including business strategies, internal processes, and member discussions—is considered confidential.",
        "You agree not to:",
        "• Disclose or share confidential information with third parties",
        "• Use proprietary insights outside the intended scope of the program"
      ]
    },
    {
      id: 7,
      title: "AI & Automation Disclaimer",
      icon: <Zap className="w-5 h-5" />,
      content: [
        "Our services may include the use of AI tools, automation systems, and implementation strategies.",
        "You acknowledge that:",
        "• Results are not guaranteed",
        "• Outcomes depend on execution, market conditions, and individual effort",
        "• AI tools are provided \"as-is\" without warranties of accuracy or performance"
      ]
    },
    {
      id: 8,
      title: "No Guarantees or Earnings Claims",
      icon: <Ban className="w-5 h-5" />,
      content: [
        "We do not guarantee specific results, income, or business outcomes.",
        "Any examples, case studies, or testimonials are for illustrative purposes only and should not be interpreted as guarantees."
      ]
    },
    {
      id: 9,
      title: "Limitation of Liability",
      icon: <Scale className="w-5 h-5" />,
      content: [
        "To the fullest extent permitted by law, Esquared Media LLC shall not be liable for:",
        "• Any indirect, incidental, or consequential damages",
        "• Loss of profits, revenue, data, or business opportunities",
        "• Any decisions made based on information provided through our services",
        "",
        "Your use of our services is at your own risk."
      ]
    },
    {
      id: 10,
      title: "Third-Party Tools & Services",
      icon: <Link className="w-5 h-5" />,
      content: [
        "We may utilize third-party platforms, software, or tools to deliver our services.",
        "We are not responsible for:",
        "• The performance or availability of third-party services",
        "• Any data handling practices of those providers",
        "",
        "Your use of third-party tools is subject to their respective terms."
      ]
    },
    {
      id: 11,
      title: "Termination",
      icon: <FileWarning className="w-5 h-5" />,
      content: [
        "We reserve the right to suspend or terminate your access to our services at any time, without prior notice, if you violate these Terms.",
        "You may discontinue use of our services at any time; however, no refunds will be provided unless explicitly stated."
      ]
    },
    {
      id: 12,
      title: "Privacy",
      icon: <Lock className="w-5 h-5" />,
      content: [
        "Your use of our services is also governed by our Privacy Policy. By using our services, you consent to the collection and use of your information as outlined in that policy."
      ]
    },
    {
      id: 13,
      title: "Changes to Terms",
      icon: <RefreshCw className="w-5 h-5" />,
      content: [
        "We may update these Terms at any time. Updates will be posted with a revised \"Last Updated\" date.",
        "Continued use of our services constitutes acceptance of the updated Terms."
      ]
    },
    {
      id: 14,
      title: "Governing Law",
      icon: <Globe className="w-5 h-5" />,
      content: [
        "These Terms shall be governed by and interpreted in accordance with the laws of the State of Texas, United States."
      ]
    },
    {
      id: 15,
      title: "Contact Information",
      icon: <Mail className="w-5 h-5" />,
      content: [
        "If you have any questions about these Terms, please contact:"
      ],
      contact: {
        company: "Esquared Media LLC",
        email: "accounting@e2influencers.com",
        governingLaw: "State of Texas, United States"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Terms and Conditions</h1>
              <p className="text-primary-100 text-lg mt-2">Last Updated: January 8, 2026</p>
            </div>
          </div>
          <p className="max-w-3xl text-primary-50 text-lg">
            Welcome to The AI Implementation Method, operated by Esquared Media LLC, a Texas-based company. 
            These Terms govern your access to and use of our website, programs, services, and related offerings.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using our services, you agree to be bound by these Terms. 
                If you do not agree with any part of these Terms, you should not use our services.
              </p>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Section Header */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    <span className="text-primary-600 mr-2">{section.id}.</span>
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Section Content */}
              <div className="px-6 py-5">
                <div className="space-y-4">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx} className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}

                  {section.list && (
                    <ul className="space-y-2 mt-3">
                      {section.list.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600">
                          <ChevronRight className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.additionalContent && section.additionalContent.map((paragraph, idx) => (
                    <p key={`additional-${idx}`} className="text-gray-600 leading-relaxed mt-3">
                      {paragraph}
                    </p>
                  ))}

                  {section.contact && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">{section.contact.company}</p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Email:</span>{' '}
                        <a 
                          href={`mailto:${section.contact.email}`}
                          className="text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          {section.contact.email}
                        </a>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Governing Law:</span> {section.contact.governingLaw}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acknowledgment Card */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-200 p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acknowledgment</h3>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you acknowledge that you have read, understood, 
                and agreed to these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Esquared Media LLC. All rights reserved.</p>
          <p className="mt-1">The AI Implementation Method is a trademark of Esquared Media LLC.</p>
        </div>
      </div>
    </div>
  );
}