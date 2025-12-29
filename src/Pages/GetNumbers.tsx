import React, { useState } from 'react';
import { FaPhone, FaSearch, FaCheckCircle, FaShoppingCart } from 'react-icons/fa';
import AvailableNumbers from '../Components/GetNumberTabs/AvailableNumbers';
import PurchasedNumbers from '../Components/GetNumberTabs/PurchasedNumbers';

const GetNumbers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-numbers' | 'buy-numbers'>('buy-numbers');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      {/* <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaPhone className="w-6 h-6 text-primary mr-3" />
                Phone Numbers
              </h1>
              <p className="mt-1 text-gray-600 text-sm">
                Purchase and manage your phone numbers
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-xs text-gray-500">Active Numbers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">0</div>
                <div className="text-xs text-gray-500">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 ">
        
        {/* Simplified Tab Navigation */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('buy-numbers')}
              className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'buy-numbers'
                  ? 'border-primry-dark text-primary bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaShoppingCart className="w-4 h-4 mr-2" />
              Buy Numbers
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                New
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('my-numbers')}
              className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'my-numbers'
                  ? 'border-primary-dark text-primary bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCheckCircle className="w-4 h-4 mr-2" />
              My Numbers
            </button>
          </div>
        </div>

        {/* Tab Content with Clean Layout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Buy Numbers Tab */}
          {activeTab === 'buy-numbers' && (
            <div>
              {/* Search Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <FaSearch className="w-5 h-5 text-blue-600 mr-2" />
                  Find Available Numbers
                </h2>
                <p className="text-gray-600">
                  Search for phone numbers in your desired area. Click "Purchase" to buy instantly.
                </p>
              </div>
              
              {/* Search Tips */}
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium mr-2">Tip:</span>
                  Search by area code, city, or state to find local numbers
                </div>
              </div>
              
              {/* Numbers List */}
              <div className="p-1">
                <AvailableNumbers />
              </div>
            </div>
          )}
          
          {/* My Numbers Tab */}
          {activeTab === 'my-numbers' && (
            <div>
         
              <div className="p-6">
                <PurchasedNumbers />
                
              
              </div>
            </div>
          )}
        </div>
        
        {/* Help Section */}
     
      </div>
    </div>
  );
};

export default GetNumbers;