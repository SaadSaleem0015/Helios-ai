import { notifyResponse } from "../Helpers/notyf";
import { backendRequest } from "../Helpers/backendRequest";
import { useEffect, useState } from "react";
import { TbTrash } from "react-icons/tb";
import { FiEye, FiCreditCard, FiPlus } from "react-icons/fi";
import { BsCreditCardFill } from "react-icons/bs";
import ConfirmationModal from "../Components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import CardModal from "../Components/CardModal";

interface PaymentMethod {
  id: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  name_on_card: string;
  phone_number: string;
  email: string;
  is_primary: boolean;
  last4: number;
  expiration_date: string;
}

const PaymentForm = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const methods = await backendRequest<PaymentMethod[], []>(
        "GET",
        "/user/payment-methods"
      );
      setPaymentMethods(methods || []);
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSetPrimary = async (id: number) => {
    try {
      const response = await backendRequest("POST", `/primary-method/${id}`);
      notifyResponse(response);
      if (response.success) {
        fetchPaymentMethods();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const confirmDeleteMethod = (id: number) => {
    setMethodToDelete(id);
    setShowModal(true);
  };

  async function deleteMethod() {
    if (methodToDelete === null) return;
    setLoading(true);
    const response = await backendRequest(
      "DELETE",
      `/remove-payment-method/${methodToDelete}`
    );
    notifyResponse(response);
    if (response.success) {
      fetchPaymentMethods();
    }
    setShowModal(false);
    setLoading(false);
    setMethodToDelete(null);
  }

  const viewCardDetails = (method: PaymentMethod) => {
    setSelectedCard(method);
    setShowCardModal(true);
  };

  const formatCardNumber = (last4: number) => {
    return `•••• •••• •••• ${last4.toString().padStart(4, '0')}`;
  };

  const formatExpirationDate = (date: string) => {
    if (!date) return "N/A";
    // Assuming format is MM/YY or MM/YYYY
    return date;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Payment Methods Grid */}
      {!loading && paymentMethods.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`bg-white rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${
                method.is_primary 
                  ? 'border-primary border-2' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      method.is_primary ? 'bg-primary/10' : 'bg-gray-100'
                    }`}>
                      <BsCreditCardFill className={`w-5 h-5 ${
                        method.is_primary ? 'text-primary' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {method.name_on_card}
                      </h3>
                      {method.is_primary && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewCardDetails(method)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                      title="View details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDeleteMethod(method.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      title="Remove card"
                    >
                      <TbTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5">
                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Card Number
                    </div>
                    <div className="font-mono text-lg font-semibold text-gray-900">
                      {formatCardNumber(method.last4)}
                    </div>
                  </div>

                  {/* Expiry & Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Expires
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatExpirationDate(method.expiration_date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Email
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {method.email}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Phone Number
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {method.phone_number}
                    </div>
                  </div>

                  {/* Set Primary Button */}
                  {!method.is_primary && (
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleSetPrimary(method.id)}
                        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors duration-150"
                      >
                        Set as Primary Payment Method
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && paymentMethods.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Payment Methods
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add a payment method to get started. Your payment information is securely encrypted.
          </p>
          <button
            onClick={() => navigate("/payment-method")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-150"
          >
            <FiPlus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deleteMethod}
        message="Are you sure you want to remove this payment method? This action cannot be undone."
        confirmText="Remove Payment Method"
        cancelText="Cancel"
        type="danger"
      />

      {/* Card Details Modal */}
      {selectedCard && (
        <CardModal
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
          cardNumber={formatCardNumber(selectedCard.last4)}
          cardHolder={selectedCard.name_on_card}
          expiryDate={formatExpirationDate(selectedCard.expiration_date)}
        />
      )}
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage your payment methods and billing information
              </p>
            </div>
            <button
              onClick={() => navigate("/payment-method")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-150"
            >
              <FiPlus className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
    

        {/* Payment Methods Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Payment Methods</h2>
              <p className="text-gray-600 text-sm mt-1">
                Securely stored and encrypted payment information
              </p>
            </div>
          </div>

          <PaymentForm />
        </div>

        {/* Security Note */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Security & Privacy</h4>
              <p className="text-sm text-blue-700">
                All payment information is encrypted and stored securely. We never store your full card details on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;