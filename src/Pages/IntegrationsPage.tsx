import { Link } from "react-router-dom";
import { FiCalendar, FiFileText } from "react-icons/fi";

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
          Integrations
        </h1>
        <p className="text-sm text-gray-600">
          Connect your favorite tools to enhance your workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Integration Card */}
        <Link 
          to="/integrations/calendar" 
          className="group block p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all hover:border-primary/30"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Calendar Integration
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Connect with Cal.com to sync your calendar and manage bookings seamlessly.
              </p>
              <div className="mt-4 flex items-center text-sm text-primary font-medium">
                <span>Configure</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Google Sheets Integration Card */}
        <Link 
          to="/integrations/sheets" 
          className="group block p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all hover:border-primary/30"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <FiFileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                Google Sheets Integration
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sync call data directly to Google Sheets with automated column mapping.
              </p>
              <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                <span>Configure</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}