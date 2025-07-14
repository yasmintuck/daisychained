import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import ModuleLoader from "../components/ModuleLoader";
import './Dashboard.css';
import LoadingSpinner from "../components/LoadingSpinner";

function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();

  useEffect(() => {
    document.title = "Dashboard | daisychained";
  }, []);

  if (!isAuthenticated) return null;

  const email = user?.email || "";
  const domain = email.substring(email.lastIndexOf("@") + 1);

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="sidebar">
        </div>
        <div className="content-wrapper">
          <div className="page-title">Dashboard</div>
          <ModuleLoader />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
