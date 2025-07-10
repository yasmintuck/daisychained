import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import ModuleLoader from "../components/ModuleLoader";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import './Dashboard.css';

function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/" />;

  const email = user?.email || "";
  const domain = email.substring(email.lastIndexOf("@") + 1); // Get domain after @

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