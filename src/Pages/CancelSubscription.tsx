import { useState, useEffect } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { useNavigate } from "react-router-dom";
import { Loading } from "../Components/Loading";

export default function CancelSubscription() {
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCancelButton, setShowCancelButton] = useState<Boolean | any>(
    false
  );
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const response = await backendRequest("POST", "/cancel-subscription", {});
      if (response.success) {
        setShowCancelButton(false);
        navigate("/billing-report");
      }
      notifyResponse(response);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      notifyResponse({
        success: false,
        detail: "Failed to cancel subscription.",
      });
    } finally {
      setCancelling(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const response = await backendRequest("GET", "/check-subscription");
      if (response.success) {
        if ("subscriptionStatus" in response) {
          console.log(response.subscriptionStatus);
          setShowCancelButton(response.subscriptionStatus);
        }
      }
    } catch (error) {
      console.error("Failed to check subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!showCancelButton) {
    return (
      <div className="mt-10 border-t border-gray-100 pt-8">
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Subscription Status
              </h3>
              <p className="text-sm text-gray-600">
                Your subscription is already canceled. No further charges will
                be made.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row items-start space-x-4">
          <div className="flex-shrink-0 p-2 ml-4 sm:ml-0 bg-red-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Cancel Subscription
            </h3>
            <p className="text-sm text-gray-600 mb-4 w-[100%] sm:w-[80%] md:w-[50%]">
              You're currently in your{" "}
              <span className="font-semibold text-blue-600">
                14-day free trial
              </span>
              . To stop your card from being charged when the trial ends, cancel
              your subscription below.
            </p>

            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className={`px-6 py-3 rounded-xl text-white font-medium tracking-wide transition-all duration-300 ${
                cancelling
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-200"
              }`}
            >
              {cancelling ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Cancel Subscription</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
