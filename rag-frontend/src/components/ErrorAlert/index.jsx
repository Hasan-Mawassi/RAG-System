import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
      </div>
      <button onClick={onClose} className="text-red-600 hover:text-red-800">
        ×
      </button>
    </div>
  );
};

export default ErrorAlert;
