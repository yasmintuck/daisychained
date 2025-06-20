import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  if (!isAuthenticated) {
    loginWithRedirect(); // or use: return <Navigate to="/" />
    return null;
  }

  return children;
};

export default PrivateRoute;
