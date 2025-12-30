import { Loading } from "../Loading";

interface ZohoIntegrationHeaderProps {
  checkingConnection: boolean;
  isZohoConnected: boolean;
}

export function ZohoIntegrationHeader({ checkingConnection, isZohoConnected }: ZohoIntegrationHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Zoho CRM Integration</h2>
          <p className="text-sm text-gray-600 mt-0.5">Connect your Zoho CRM to fetch leads automatically</p>
        </div>
      </div>

      {/* Status Section */}
      <div className="mt-4">
        {checkingConnection ? (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5">
              <Loading />
            </div>
            <span className="text-gray-700 font-medium">Checking connection status...</span>
          </div>
        ) : isZohoConnected ? (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-green-800 block">Zoho CRM is connected</span>
              <span className="text-xs text-green-700">You can now fetch leads from your Zoho account</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-yellow-800 block">Zoho CRM is not connected</span>
              <span className="text-xs text-yellow-700">Please enter your credentials below to connect</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

