import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, loaded } = useAuth();
  const location = useLocation();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />; // ⭐ Render children routes
};
