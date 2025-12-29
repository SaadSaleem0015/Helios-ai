import React from "react";

// Modern Spinner Loading
export function Loading() {
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-dark rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <div className="ml-4 text-gray-600 font-medium">Loading...</div>
    </div>
  );
}

// Inline Loading
export function Loading2() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

// Pulse Loading
export function LoadingPulse() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}

// Skeleton Loading
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

// Card Skeleton Loading
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

// Table Skeleton Loading
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
            </div>
        </div>
    );
}

// Page Loading with Progress Bar
export function PageLoading() {
    return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-20 h-20 mb-8">
          <div className="w-full h-full border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div className="text-2xl font-semibold text-gray-700 mb-4">Loading Page</div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <div className="mt-4 text-sm text-gray-500">Please wait while we prepare your content...</div>
            </div>
        </div>
    );
}




