import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
  return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
