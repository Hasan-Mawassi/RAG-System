// src/components/AuthInput.jsx
import React from "react";

const AuthInput = ({ label, type = "text", value, onChange }) => {
  return (
    <div className="mb-5">
      <label className="text-sm opacity-90">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // className="
        //   w-full mt-1 px-4 py-3 rounded-xl
        //   bg-white/20 focus:bg-white/30
        //   outline-none border border-white/30
        //   focus:border-white transition-all text-white
        // "
        className="
      w-full mt-1 px-4 py-3 rounded-xl 
      bg-white/20 focus:bg-white/30 
      outline-none border border-white/30 
      focus:border-white transition-all text-white
      text-sm sm:text-base
    "
      />
    </div>
  );
};

export default AuthInput;
