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
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Hello <strong>{user.given_name}</strong> 👋. Welcome to daisychained.</p>
      <p className="page-text">This is a development environment, and soon it's going to look amazing. For now, I want you to know that you're a registered user of daisychained.</p>
      <p className="page-text">Check out the modules you have access to below. If you logged in with a Google account, you'll see AI modules. If you logged in with a Hotmail account, you'll see personal development modules.</p>

      {user.picture && (
        <img
          src={user.picture}
          alt="User profile"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "cover",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        />
      )}
      <br />
      <ModuleLoader />
      <br />
      <button
        onClick={() =>
          logout({
            logoutParams: {
              returnTo: import.meta.env.VITE_LOGOUT_URL,
              client_id: import.meta.env.VITE_AUTH0_CLIENT_ID, // Add this line
            },
          })
        }
        style={{
          marginTop: "2rem",
          padding: "0.6rem 1.2rem",
          fontSize: "1rem",
          background: "transparent",
          border: "2px solid white",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Log Out
      </button>
    </div>
  );
}

export default Dashboard;