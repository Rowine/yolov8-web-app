import { Navigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import { LoadingSpinner } from "./LoadingSpinner";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUserStore();

  if (loading) {
    return <LoadingSpinner>Checking authentication...</LoadingSpinner>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
