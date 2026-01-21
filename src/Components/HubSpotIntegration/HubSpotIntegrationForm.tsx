import { Loading } from "../Loading";

interface HubSpotIntegrationFormProps {
  onConnect: () => void;
  loading: boolean;
  onShowInstructions: () => void;
}

export function HubSpotIntegrationForm({
  onConnect,
  loading,
  onShowInstructions,
}: HubSpotIntegrationFormProps) {
  return (
    <div className="px-6 py-6 bg-white">
      <div className="space-y-5">
        {/* Instructions Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                type="button"
                onClick={onShowInstructions}
                className="w-10 h-10 bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                title="View full instructions"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 z-20 w-64">
                <div className="bg-gray-900 text-white text-xs rounded-lg py-2.5 px-4 shadow-xl">
                  <p className="font-semibold mb-1">Quick Tips:</p>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Click "Connect HubSpot" to authorize</li>
                    <li>• You'll be redirected to HubSpot</li>
                    <li>• After authorization, you can fetch leads</li>
                  </ul>
                  <p className="mt-2 pt-2 border-t border-gray-700 text-primary font-medium">Click for full guide →</p>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Need help?</h3>
              <p className="text-xs text-gray-600">Click "View Full Guide" for detailed instructions</p>
            </div>
          </div>
          <button
            onClick={onShowInstructions}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>View Full Guide</span>
          </button>
        </div>

        {/* Connect Button */}
        <div className="flex items-center justify-center py-6">
          <button
            onClick={onConnect}
            disabled={loading}
            className="group relative bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold text-lg px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-3 min-w-[220px]"
          >
            {loading ? (
              <>
                <div className="w-6 h-6">
                  <Loading />
                </div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Connect HubSpot</span>
              </>
            )}
          </button>
        </div>

        {/* Info Message */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">How it works</p>
            <p className="text-xs text-blue-800">Click the button above to connect your HubSpot account. You'll be redirected to HubSpot to authorize the connection, then redirected back to this page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

