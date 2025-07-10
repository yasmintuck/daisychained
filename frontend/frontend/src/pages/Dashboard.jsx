import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import ModuleLoader from "../components/ModuleLoader";
import { useState } from "react";
import './Dashboard.css';

function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();

  console.log("LOGOUT REDIRECT:", import.meta.env.VITE_LOGOUT_URL); 

  if (isLoading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!isAuthenticated) return <p style={{ padding: "2rem" }}>Not authenticated</p>;

  const email = user?.email || "";
  const domain = email.substring(email.lastIndexOf("@") + 1); // Get domain after @

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="sidebar">
          <button
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo: import.meta.env.VITE_LOGOUT_URL,
                  client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
                },
              })
            }
            className="logout-button"
          >
            Log Out
          </button>
        </div>
        <div className="content-wrapper">
          <h1 className="page-title">Dashboard</h1>
          <ModuleLoader />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;