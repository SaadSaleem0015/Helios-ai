import React from "react";

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  message,
}) => {
  if (!show) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-800/60 backdrop-blur-xs z-50 px-4 sm:px-8"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white p-5 sm:p-6 rounded-lg shadow-lg max-w-md w-full"
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold">Confirm Action</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-700">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="bg-gray-200 text-xs sm:text-sm text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-primary text-xs sm:text-sm text-white py-2 px-4 rounded hover:bg-hoverdPrimary"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

