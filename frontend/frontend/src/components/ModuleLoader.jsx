import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const ModuleLoader = () => {
  const { user, isAuthenticated } = useAuth0();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const syncUserAndFetchModules = async () => {
      setLoading(true); // ✅ Start loading

      try {
        const payload = {
          externalId: user.sub,
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          email: user.email
        };

        console.log("🔄 Syncing user with payload:", payload); // debugging


        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/UserAccess/sync-user`,
          payload
        );

        console.log("Modules returned from backend:", res.data);
        
        setModules(res.data);
      } catch (err) {
        console.error("Error fetching modules:", err);
      } finally {
        setLoading(false); // ✅ Always end loading
      }
    };

    syncUserAndFetchModules();
  }, [isAuthenticated, user]);

  return (
    <div>
      <h3 style={{ marginTop: "2rem" }}>Modules you have access to:</h3>

      {loading ? (
        <p style={{ marginTop: "2rem", color: "white" }}>
          Loading your modules...
        </p>
      ) : modules.length > 0 ? (
        <div style={{ marginTop: "1rem" }}>
          {modules.map((m) => (
            <div key={m.moduleId} style={{ marginBottom: "1rem" }}>
              <strong>{m.moduleTitle}</strong> — {m.moduleDescription}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: "1rem", color: "white" }}>
          You don’t currently have access to any modules.
        </p>
      )}
    </div>
  );
};

export default ModuleLoader;
