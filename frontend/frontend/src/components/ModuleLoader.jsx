import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const ModuleLoader = () => {
  const { user, isAuthenticated } = useAuth0();
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const syncUserAndFetchModules = async () => {
      try {
        const payload = {
          externalId: user.sub,
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          email: user.email
        };

        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/UserAccess/sync-user`,
          payload
        );
        console.log("Modules returned from backend:", res.data);
        setModules(res.data);
      } catch (err) {
        console.error("Error fetching modules:", err);
      }
    };

    syncUserAndFetchModules();
  }, [isAuthenticated, user]);

  return (
    <div>
      <h3>Modules You Have Access To</h3>
      <ul>
        {modules.map((m) => (
          <li key={m.moduleId}>
            <strong>{m.moduleTitle}</strong> — {m.moduleDescription}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModuleLoader;