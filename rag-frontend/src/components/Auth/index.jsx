// src/components/AuthForm.jsx

import React, { useState } from "react";

const AuthForm = ({ title, buttonText, onSubmit, error, loading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleForm = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/ragLogo.png"
            alt="App Logo"
            className="h-30 w-20 object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          {title}
        </h2>

        <form onSubmit={handleForm} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
