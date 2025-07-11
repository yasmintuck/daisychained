import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const ModuleLoader = () => {
  const { user, isAuthenticated } = useAuth0();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12); // Show 12 initially

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const syncUserAndFetchModules = async () => {
      setLoading(true);

      try {
        const payload = {
          externalId: user.sub,
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          email: user.email
        };

        console.log("🔄 Syncing user with payload:", payload);

        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/UserAccess/sync-user`,
          payload
        );

        console.log("Modules returned from backend:", res.data);
        setModules(res.data);
      } catch (err) {
        console.error("Error fetching modules:", err);
      } finally {
        setLoading(false);
      }
    };

    syncUserAndFetchModules();
  }, [isAuthenticated, user]);

  return (
    <>
      {loading ? (
        <p style={{ marginTop: "2rem", color: "#231F20" }}>
          Loading your modules...
        </p>
      ) : modules.length > 0 ? (
        <>
          <div className="course-area">
            {modules.slice(0, visibleCount).map((mod) => (
              <div className="course-card" key={mod.moduleId}>
                <div
                  className="card-image"
                  style={{
                    backgroundImage: `url(${mod.coverImageUrl})`,
                  }}
                />
                <div className="course-content">
                  <div className="course-title">{mod.moduleTitle}</div>
                  <div>
                    <div className="course-duration">{mod.duration}</div>
                    <div className="course-updated">
                      Updated: {new Date(mod.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < modules.length && (
            <div className="load-more-container">
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount(visibleCount + 12)}
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <p style={{ marginTop: "1rem", color: "#231F20" }}>
          You don’t currently have access to any modules.
        </p>
      )}
    </>
  );
};

export default ModuleLoader;
