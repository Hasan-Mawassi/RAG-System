// // src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuthApi } from "../../hooks/auth/useAuth.js";
import AuthCard from "../../components/AuthCard";
import AuthInput from "../../components/AuthInput";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Link, useNavigate } from "react-router-dom";
import RagLoginBackground from "../../components/RagLoginBackground/index.jsx";

const LoginPage = () => {
  const { login } = useAuthApi();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const res = await login(email, password);
    console.log(res)
    if (res.success) navigate("/chat");
    else setError(res.message);
  };

  return (
    // <div className="relative min-h-screen flex items-center justify-center text-white">
    <div className="relative min-h-screen flex items-center justify-center text-white px-4 py-8">
      {/* Background Animation */}
      <RagLoginBackground />

      {/* Auth Card */}
      <AuthCard title="Welcome Back">
        {error && (
          <div className="bg-red-500/20 text-red-300 p-2 mb-4 rounded text-center text-sm">
            {error}
          </div>
        )}

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
          onClick={handleLogin}
          // className="w-full bg-blue-500/30 hover:bg-blue-500/40 cursor-pointer text-white py-3 rounded-lg transition shadow-lg"
          className="
    w-full bg-blue-500/30 hover:bg-blue-500/40 
    cursor-pointer text-white py-3 rounded-lg 
    transition shadow-lg text-sm sm:text-base
  "
        >
          Login
        </button>

        {/* <p className="text-center text-sm opacity-80 mt-3">
          Don't have an account?
          <Link
            to="/signup"
            className="ml-1 font-semibold underline text-white"
          >
            Sign up
          </Link>
        </p> */}
        <p className="text-center text-xs sm:text-sm opacity-80 mt-3">
          Don't have an account?
          <Link
            to="/signup"
            className="ml-1 font-semibold underline text-white"
          >
            Sign up
          </Link>
        </p>
      </AuthCard>
    </div>
  );
};

export default LoginPage;

