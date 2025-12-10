// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useAuthApi } from "../../hooks/auth/useAuth.js";
import AuthCard from "../../components/AuthCard";
import AuthInput from "../../components/AuthInput";
import RagLoginBackground from "../../components/RagLoginBackground"; // ← animated background
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { register } = useAuthApi();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const res = await register(email, password);

    if (res.success) navigate("/chat");
    else if (res.status === 409) {
      setError("A user with this email already exists.");
    } else {
      setError(res.message || "Signup failed.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white">
      {/* Animated RAG-themed background */}
      <RagLoginBackground />

      {/* Glassmorphic Auth Card */}
      <AuthCard title="Create Account">
        {error && (
          <div className="bg-red-500/20 text-red-300 border border-red-400/30 p-2 mb-4 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
          />

          <button
            type="submit"
            className="w-full bg-blue-500/30 hover:bg-blue-500/40 text-white py-2 rounded-lg shadow-md transition cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-center opacity-80">
          Already have an account?
          <Link to="/login" className="text-white underline ml-1">
            Login
          </Link>
        </p>
      </AuthCard>
    </div>
  );
};

export default RegisterPage;
