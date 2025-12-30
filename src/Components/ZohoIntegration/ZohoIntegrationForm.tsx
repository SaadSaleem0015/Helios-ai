import { useState } from "react";
import { Input } from "../Input";
import { Loading } from "../Loading";

interface ZohoIntegrationFormProps {
  clientId: string;
  clientSecret: string;
  code: string;
  onClientIdChange: (value: string) => void;
  onClientSecretChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onIntegrate: () => void;
  loading: boolean;
  onShowInstructions: () => void;
}

export function ZohoIntegrationForm({
  clientId,
  clientSecret,
  code,
  onClientIdChange,
  onClientSecretChange,
  onCodeChange,
  onIntegrate,
  loading,
  onShowInstructions,
}: ZohoIntegrationFormProps) {
  const [showClientSecret, setShowClientSecret] = useState(false);

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
                    <li>• Client ID: Create Self Client in Zoho API Console</li>
                    <li>• Client Secret: Copy from same Self Client</li>
                    <li>• Code: Generate with scope ZohoCRM.modules.READ</li>
                  </ul>
                  <p className="mt-2 pt-2 border-t border-gray-700 text-primary font-medium">Click for full guide →</p>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Need help getting your credentials?</h3>
              <p className="text-xs text-gray-600">Hover over the info icon above or click "View Full Guide" for detailed instructions</p>
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

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Client ID Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Client ID</label>
            <Input
              type="text"
              value={clientId}
              onChange={(e) => onClientIdChange(e.currentTarget.value)}
              placeholder="Copy from Zoho API Console"
              className="w-full h-11 text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
            />
          </div>

          {/* Client Secret Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Client Secret</label>
            <div className="relative">
              <Input
                type={showClientSecret ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => onClientSecretChange(e.currentTarget.value)}
                placeholder="Copy from Zoho API Console"
                className="w-full h-11 text-sm px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowClientSecret(!showClientSecret)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showClientSecret ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Authorization Code Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Authorization Code</label>
            <Input
              type="text"
              value={code}
              onChange={(e) => onCodeChange(e.currentTarget.value)}
              placeholder="Generate code with scope: ZohoCRM.modules.READ"
              className="w-full h-11 text-sm px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
            />
          </div>
        </div>

        {/* Action Button and Security Message */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onIntegrate}
            disabled={loading || !clientId.trim() || !clientSecret.trim() || !code.trim()}
            className="group relative bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold text-base px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2.5 min-w-[180px]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5">
                  <Loading />
                </div>
                <span>Integrating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Integrate Zoho</span>
              </>
            )}
          </button>

          {/* Security Message */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your credentials are securely encrypted</span>
          </div>
        </div>

        {/* Security Message (Mobile) */}
        <div className="md:hidden flex items-start gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Your Zoho CRM credentials will be securely stored and encrypted. They will only be used to fetch leads from your Zoho account.</span>
        </div>
      </div>
    </div>
  );
}

