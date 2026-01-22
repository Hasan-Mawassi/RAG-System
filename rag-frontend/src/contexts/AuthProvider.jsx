import { useState, useEffect } from "react";
import { request } from "../http/request";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  
  // ------------------------------------------------------------
  //  Load user → if 401 → try refresh → if still 401 → logout
  // ------------------------------------------------------------
  const loadUser = async () => {
    try {
      const res = await request({
        method: "GET",
        route: "/auth/me",
        withCredentials: true,
      });

      if (!res.error && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoaded(true);
    }
  };




  useEffect(() => {
  
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await request({
      method: "POST",
      route: "/auth/login",
      body: { email, password },
      withCredentials: true,
    });

    if (res?.user) {
      setUser(res.user); //  store user only
      setLoaded(true); 
      return { success: true };
    }
let message = "Invalid ";

if (Array.isArray(res?.message)) {
  message = res.message[0];
} else if (typeof res?.message === "string") {
    message = res.message;
}
console.log("message from authProvider login",message)
    return {
      success: false,
      message,
    };
  };
const register = async (email, password) => {
  const res = await request({
    method: "POST",
    route: "/auth/register",
    body: { email, password },
    withCredentials: true,
  });

  if (res?.user) {
    setUser(res.user);
    setLoaded(true);
    return { success: true };
  }

  return {
    success: false,
    message:
      typeof res?.message === "string"
        ? res.message
        : typeof res?.message?.message === "string"
          ? res.message.message
          : typeof res?.message?.error === "string"
            ? res.message.error
            : "Registration failed",
  };
};
  const logout = async () => {
    await request({
      method: "POST",
      route: "/auth/logout",
      body: {}, // Ensure body is present if required, though GET/POST usually fine. request helper handles it.
    });

    setUser(null);
    setLoaded(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
