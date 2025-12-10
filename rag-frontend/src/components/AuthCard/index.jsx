// src/components/AuthCard.jsx
import React from "react";

const AuthCard = ({ title, children }) => {
  return (
    <div
      className="
        glass p-10 rounded-3xl shadow-xl max-w-md w-full 
        animate-fadeIn backdrop-blur-xl border border-white/20
      "
    >
      <h1 className="text-3xl font-bold mb-6 text-center drop-shadow-lg">
        {title}
      </h1>

      {children}
    </div>
  );
};

export default AuthCard;

