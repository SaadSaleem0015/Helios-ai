import React, { useState, useEffect } from 'react';
import { FaPhone, FaMicrophone, FaVolumeUp, FaTimes } from 'react-icons/fa';

interface CallingUIProps {
  isVisible: boolean;
  onEndCall: () => void;
  status: 'connecting' | 'connected' | 'ended';
  agentName?: string;
}

const CallingUI: React.FC<CallingUIProps> = ({ 
  isVisible, 
  onEndCall, 
  status, 
  agentName = "AI Assistant" 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const connectingMessages = [
    "Agent is connecting...",
    "Prepare your questions...",
    "Be specific and to the point...",
    "The AI is getting ready...",
    "Almost there...",
    "Setting up the conversation..."
  ];

  const connectedMessages = [
    "You're now connected!",
    "Speak clearly and naturally...",
    "Ask your questions...",
    "The AI is listening...",
    "Have a great conversation!"
  ];

  const messages = status === 'connected' ? connectedMessages : connectingMessages;

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, messages.length, status]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50  backdrop-blur-sm"
        onClick={onEndCall}
      ></div>
      
      {/* Right Sidebar */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-green-50 via-green-100 to-green-200 h-full shadow-2xl transform transition-all duration-500 ease-out">
        {/* Close Button */}
        <button
          onClick={onEndCall}
          className="absolute top-6 right-6 text-gray-600 hover:text-red-500 transition-all duration-300 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl hover:scale-110"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Content Container */}
        <div className="h-full flex flex-col items-center justify-center px-8 py-12 relative">
          {/* Main Content */}
          <div className="relative z-10 text-center w-full">
            {/* Status Icon */}
            <div className="mb-8">
              {status === 'connecting' && (
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                    <FaPhone className="w-14 h-14 text-white animate-bounce" />
                  </div>
                  {/* Subtle Ripple Effect */}
                  <div className="absolute inset-0 w-28 h-28 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-30"></div>
                </div>
              )}
              
              {status === 'connected' && (
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                    <FaMicrophone className="w-14 h-14 text-white" />
                  </div>
                  {/* Subtle Ripple Effect */}
                  <div className="absolute inset-0 w-28 h-28 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full animate-ping opacity-30"></div>
                </div>
              )}
            </div>

            {/* Agent Name */}
            <h1 className="text-3xl font-bold mb-4 text-gray-800">
              {agentName}
            </h1>

            {/* Status Text */}
            <div className="text-xl font-semibold mb-6 text-gray-700">
              {status === 'connecting' ? 'Connecting...' : 'Connected!'}
            </div>

            {/* Rotating Message */}
            <div className="mb-8">
              <div className="h-16 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 mx-4">
                <p className="text-base text-gray-700 font-medium animate-fade-in-out">
                  {messages[currentMessageIndex]}
                </p>
              </div>
            </div>

            {/* Call Duration (when connected) */}
            {status === 'connected' && (
              <div className="mb-8">
                <div className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center">
                  <FaVolumeUp className="mr-2 animate-pulse text-green-500" />
                  Call in progress...
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4">
              {status === 'connected' && (
                <button
                  onClick={onEndCall}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 w-full shadow-lg hover:shadow-xl"
                >
                  <FaTimes className="w-5 h-5" />
                  <span>End Call</span>
                </button>
              )}
              
              {status === 'connecting' && (
                <button
                  onClick={onEndCall}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 w-full shadow-lg hover:shadow-xl"
                >
                  <FaTimes className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {/* Progress Bar for Connecting */}
            {status === 'connecting' && (
              <div className="mt-8 w-full px-4">
                <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full animate-progress shadow-sm"></div>
                </div>
              </div>
            )}
          </div>

          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full"></div>
            <div className="absolute bottom-20 right-16 w-24 h-24 bg-emerald-400 rounded-full"></div>
            <div className="absolute top-1/2 left-8 w-16 h-16 bg-green-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallingUI;
