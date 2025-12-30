interface ZohoInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ZohoInstructionsModal({ isOpen, onClose }: ZohoInstructionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Zoho CRM Integration Guide</h2>
                <p className="text-sm text-gray-600 mt-0.5">Step-by-step instructions to get your credentials</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Go to Zoho API Console</h3>
                <p className="text-sm text-gray-600 mb-3">Navigate to the Zoho API Console to create your application credentials.</p>
                <a
                  href="https://api-console.zoho.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors text-sm"
                >
                  <span>Open Zoho API Console</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Create a Self Client</h3>
                <p className="text-sm text-gray-600">Create a new Self Client application in the Zoho API Console. This will generate your Client ID and Client Secret.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Copy Client ID and Client Secret</h3>
                <p className="text-sm text-gray-600 mb-3">After creating the Self Client, you'll see your Client ID and Client Secret. Copy both values.</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                  <p className="text-xs text-gray-600 font-medium mb-1">💡 Tip:</p>
                  <p className="text-xs text-gray-600">Keep these credentials secure. You'll need to paste them in the form above.</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Generate Authorization Code</h3>
                <p className="text-sm text-gray-600 mb-3">Click on "Generate Code" in the same popup where you created the Self Client.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Enter Scope and Description</h3>
                <div className="space-y-2 mt-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Scope:</p>
                    <code className="text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded">ZohoCRM.modules.READ</code>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-900 mb-1">Description:</p>
                    <code className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded">Integrating CRM</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  6
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Copy Authorization Code</h3>
                <p className="text-sm text-gray-600 mb-3">After generating the code, copy the Authorization Code that appears.</p>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  7
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Complete Integration</h3>
                <p className="text-sm text-gray-600 mb-3">Paste the Client ID, Client Secret, and Authorization Code in the form above, then click "Integrate Zoho".</p>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-2">
                  <p className="text-xs text-primary font-semibold mb-1">✅ You're all set!</p>
                  <p className="text-xs text-gray-700">Once integrated, you'll be able to fetch leads from your Zoho CRM automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

