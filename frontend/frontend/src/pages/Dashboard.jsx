// Dashboard.jsx
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import ModuleLoader from "../components/ModuleLoader";
import "./Dashboard.css";

function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="spinner-wrapper">
        <img src="/logo.png" alt="Loading..." className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="sidebar"></div>
        <div className="content-wrapper">
          <h1 className="page-title">Dashboard</h1>
          <ModuleLoader />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
