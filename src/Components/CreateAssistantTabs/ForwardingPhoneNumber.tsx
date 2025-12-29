import React, { useState, useEffect } from 'react';
import { FaPhone, FaForward, FaLink, FaMicrophone, FaInfoCircle } from 'react-icons/fa';
import { backendRequest } from '../../Helpers/backendRequest';
import { InfoTooltip } from '../InfoTooltip';

interface AssistantData {
  forwardingPhoneNumber?: string;
  attached_Number?: string; 
  endCallPhrases?: string[];
}
interface User {
  username: string;
  email: string;
}

interface PurchasedNumber {
  friendly_name: string;
  phone_number: string;
  user: User;
  date_purchased: string;
  attached?: boolean;
  attached_assistant: number;
}
interface TranscribeProps {
  assistantData: AssistantData;
  handleChange: (key: keyof AssistantData, value: string | string[]) => void;
}

const ForwardingPhoneNumber: React.FC<TranscribeProps> = ({ assistantData, handleChange }) => {
  const [purchasedNumbers, setPurchasedNumbers] = useState<PurchasedNumber[]>([]);
  
  useEffect(() => {
    fetchPurchasedNumbers();
  }, []);

  const fetchPurchasedNumbers = async () => {
    try {
      const response = await backendRequest<PurchasedNumber[]>('GET', '/purchased_numbers');
      setPurchasedNumbers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching purchased numbers:', error);
    }
  };

  const handleEndCallPhrasesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleChange('endCallPhrases', [value]);
  };
  
  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <FaPhone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Phone Number Configuration</h1>
              <p className="text-gray-600 text-sm">
                Configure phone settings and call management for your assistant
              </p>
            </div>
          </div>

          {/* Simple Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaForward className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Forwarding</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaLink className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Attached</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaMicrophone className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Phrases</p>
            </div>
          </div>
        </div>

        {/* Main Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaPhone className="w-4 h-4 text-primary mr-2" />
            Phone Settings
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Forwarding Phone Number */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Attach Phone Number
                </label>
            <select
              value={assistantData.attached_Number || ''}
              onChange={(e) => handleChange('attached_Number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  <option value="" disabled>Choose a phone number...</option>
                  {purchasedNumbers.map(number => (
                  <option key={number.phone_number} value={number.phone_number}>
                      {number.phone_number} {!number.attached_assistant ? "" : " (Attached)"}
                  </option>
                ))}
            </select>
          </div>

           <div className="space-y-2">
  <div className="flex items-center gap-2">
    <label className="block text-sm font-medium text-gray-700">
      Forwarding Phone Number
    </label>
    <InfoTooltip
      content={
        <div className="text-sm space-y-2">
          <p>
            For the forwarding feature to work, you need to instruct your AI agent 
            in the system prompt when to forward calls.
          </p>
          
          <div className="bg-gray-800 p-2 rounded">
            <p className="text-xs text-gray-300 mb-1">Example prompt instruction:</p>
            <code className="text-xs text-primary">
              "Forward calls to [number] when the user requests to speak with a 
              human representative or when you cannot answer technical questions."
            </code>
          </div>
          
          <ul className="text-xs space-y-1">
            <li className="flex items-start gap-1">
              <span className="text-primary mt-0.5">•</span>
              <span>Specify exact forwarding scenarios</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-primary mt-0.5">•</span>
              <span>Include keywords that trigger forwarding</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-primary mt-0.5">•</span>
              <span>Test with different conversation scenarios</span>
            </li>
          </ul>
          
          <div className="text-xs text-gray-300 pt-1 border-t border-gray-700">
            <strong>Remember:</strong> The AI agent only forwards calls when explicitly 
            instructed to do so in the system prompt.
          </div>
        </div>
      }
    />
  </div>
  
  <input
    type="text"
    placeholder="Enter forwarding number (e.g., +1234567890)..."
    value={assistantData.forwardingPhoneNumber || ""}
    onChange={(e) => handleChange('forwardingPhoneNumber', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
  />
  
  <div className="text-xs text-gray-500 space-y-1">
    <p>Enter the phone number for call forwarding</p>
    <p className="text-primary/80">
      ⚠️ Don't forget to add forwarding instructions in your system prompt
    </p>
  </div>
</div>

              {/* Attach Number */}
             
        </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* End Call Phrases */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  End Call Phrases
                </label>
                <textarea
                  value={assistantData.endCallPhrases || ''}
                  rows={4}
                  placeholder="Enter phrases that will end the call (e.g., goodbye, thank you, end call)..."
                  onChange={handleEndCallPhrasesChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                />
                <p className="text-xs text-gray-500">
                  Separate multiple phrases with commas or new lines
                </p>
              </div>

              {/* Help Section */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-1">
                    <FaInfoCircle className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">How It Works</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• <strong>Forwarding:</strong> Calls are routed to this number</p>
                      <p>• <strong>Attached:</strong> This number is linked to your assistant</p>
                      <p>• <strong>End Phrases:</strong> Assistant will end call when these are spoken</p>
                      <p>• <strong>Integration:</strong> Works seamlessly with your phone system</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
              <FaInfoCircle className="w-4 h-4 text-primary mr-2" />
              Current Configuration Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Forwarding Number</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {assistantData.forwardingPhoneNumber || 'Not set'}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Attached Number</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {assistantData.attached_Number || 'Not attached'}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">End Phrases</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {assistantData.endCallPhrases?.length ? `${assistantData.endCallPhrases.length} set` : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardingPhoneNumber;
