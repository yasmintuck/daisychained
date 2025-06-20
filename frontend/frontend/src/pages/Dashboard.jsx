import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.fontFamily = "'Open Sans', sans-serif";
    document.body.style.backgroundColor = "#303030";
    document.body.style.color = "#ffffff";

    return () => {
      document.body.style = null;
    };
  }, []);

  if (isLoading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!isAuthenticated) return <p style={{ padding: "2rem" }}>Not authenticated</p>;

  const email = user?.email || "";
  const domain = email.substring(email.lastIndexOf("@") + 1); // Get domain after @

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Dashboard</h1>
      <p style={{ fontSize: "1.25rem" }}>
        Hello <strong>{user.name}</strong>, welcome to daisychained.
      </p>
      <p style={{ fontSize: "1rem", marginTop: "1rem" }}>
        <strong>Email:</strong> {email}
        <br />
        <strong>Domain:</strong> {domain}
      </p>

      {user.picture && (
        <img
          src={user.picture}
          alt="User profile"
          style={{
            marginTop: "2rem",
            width: "100px",
            height: "100px",
            objectFit: "cover",
            borderRadius: "8px"
          }}
        />
      )}

      <br />
      <button
        onClick={() => logout({ returnTo: window.location.origin })}
        style={{
          marginTop: "2rem",
          padding: "0.6rem 1.2rem",
          fontSize: "1rem",
          background: "transparent",
          border: "2px solid white",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Log Out
      </button>
    </div>
  );
}

export default Dashboard;