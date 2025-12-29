import React, { useEffect, useState } from "react";
import { backendRequest } from "../../Helpers/backendRequest";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await backendRequest("GET", "/get-terms-and-conditions");
        setContent(response.content || ""); 
      } catch (error) {
        console.error("Error fetching terms and conditions:", error);
        setContent("Failed to fetch terms and conditions.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchTerms();
    }
  }, [isOpen]);

  if (!isOpen) return null; 
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white p-2 sm:p-4 md:p-8 rounded-lg shadow-lg max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Terms and Conditions
        </h1>
        <hr className="mb-4 border-gray-300" />

        <div className="prose max-h-[60vh] overflow-auto">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
