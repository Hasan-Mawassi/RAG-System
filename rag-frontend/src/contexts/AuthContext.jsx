import { createContext, useContext, useState, useEffect } from "react";
import { request } from "../http/request";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  
  // ------------------------------------------------------------
  //  Load user → if 401 → try refresh → if still 401 → logout
  // ------------------------------------------------------------
  const loadUser = async () => {
  try {
    // 1️⃣ Try /me using access token cookie
    const res = await request({
      method: "GET",
      route: "/auth/me",
      withCredentials: true,
    });

    if (!res.error && res.user) {
      setUser(res.user);
      return;
    }

    // 2️⃣ If unauthorized → try refresh
    if (res.status === 401) {
      const ref = await request({
        method: "POST",
        route: "/auth/refresh",
        withCredentials: true,
      });

      if (!ref.error && ref.user) {
        // refresh succeeded → try /me again
        const retry = await request({
          method: "GET",
          route: "/auth/me",
          withCredentials: true,
        });

        if (!retry.error && retry.user) {
          setUser(retry.user);
          return;
        }
      }
    }

    // 3️⃣ Refresh failed → force logout
    setUser(null);
  } catch (err) {
    setUser(null);
  } finally {
    setLoaded(true);
  }
};


  useEffect(() => {
    loadUser()
  }, []);

  const login = async (email, password) => {
    const res = await request({
      method: "POST",
      route: "/auth/login",
      body: { email, password },
      withCredentials: false,
    });

    if (res?.user) {
      setUser(res.user); // ⭐ store user only
      return { success: true };
    }

    return { success: false, message: res?.message || "Invalid credentials" };
  };

  const logout = async () => {
    await request({
      method: "POST",
      route: "/auth/logout",
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        login,
        logout,
        loaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
