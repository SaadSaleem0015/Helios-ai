import React from 'react';
import { FaTimesCircle } from 'react-icons/fa'; // Importing a cancel icon

const CanceledPage: React.FC = () => {
  return (
    <div className="relative min-h--[80vh] flex justify-center items-center">
      <div className="relative z-20 bg-white text-black rounded-2xl p-10 w-96 text-center">
        <div className="flex justify-center mb-6">
          <FaTimesCircle className="text-red-500 text-6xl" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Canceled</h1>
        <p className="text-gray-400 mb-6">
          Unfortunately, your payment could not be completed. If you have any questions, please contact support.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg  transition"
          >
            Go to Home
          </button>
          {/* <button
            onClick={() => window.location.href = '/support'}
            className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg  transition"
          >
            Contact Support
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default CanceledPage;
