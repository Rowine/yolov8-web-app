import { Navigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUserStore();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;
