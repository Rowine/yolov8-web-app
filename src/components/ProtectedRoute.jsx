import { Navigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import { LoadingSpinner } from "./LoadingSpinner";

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useUserStore();

  if (isLoading) {
    return <LoadingSpinner>Checking authentication...</LoadingSpinner>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
