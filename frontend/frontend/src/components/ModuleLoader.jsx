import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ModuleLoader = () => {
  const { user, isAuthenticated } = useAuth0();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12); // Show 12 initially
  const navigate = useNavigate();

  //   useEffect(() => {
  //   if (!isAuthenticated || !user) return;

  //   const syncUserAndFetchModules = async () => {
  //     setLoading(true);

  //     try {
  //       const payload = {
  //         externalId: user.sub,
  //         firstName: user.given_name || "",
  //         lastName: user.family_name || "",
  //         email: user.email
  //       };

  //       // Sync user and get modules
  //       const res = await axios.post(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/UserAccess/sync-user`,
  //         payload
  //       );
  //       const fetchedModules = res.data;

  //       // Get user progress records
  //       const progressRes = await axios.get(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/UserProgress/user/${user.email}`
  //       );
  //       const userProgress = progressRes.data || [];

  //       // Merge module data with progress status
  //       const enrichedModules = fetchedModules.map((mod) => {
  //         const match = userProgress.find((p) => p.moduleId === mod.moduleId);
  //         let progressStatus = "not started";
  //         if (match?.progress === 1) progressStatus = "in progress";
  //         else if (match?.progress === 2) progressStatus = "completed";

  //         return { ...mod, progressStatus };
  //       });

  //       setModules(enrichedModules);
  //     } catch (err) {
  //       console.error("Error fetching modules or progress:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   syncUserAndFetchModules();
  // }, [isAuthenticated, user]);

useEffect(() => {
  if (!isAuthenticated || !user) return;

  const fetchAllData = async () => {
    console.time("⏱️ Module Load Time"); // ✅ Start before try
    setLoading(true);

    try {
      const payload = {
        externalId: user.sub,
        firstName: user.given_name || "",
        lastName: user.family_name || "",
        email: user.email
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/UserAccess/sync-user`,
        payload
      );

      const [modulesRes, progressRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/Modules`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UserProgress/user/${user.email}`)
      ]);

      const fetchedModules = modulesRes.data;
      const userProgress = progressRes.data || [];

      // const enrichedModules = fetchedModules.map((mod) => {
      //   const record = userProgress.find((p) => p.moduleId === mod.moduleId);
      //   let status = "not started";
      //   if (record?.progress === 1) status = "in progress";
      //   else if (record?.progress === 2) status = "completed";
      //   return { ...mod, progressStatus: status };
      // });

      const enrichedModules = fetchedModules
      .map((mod) => {
        const record = userProgress.find((p) => p.moduleId === mod.moduleId);
        let status = "not started";
        if (record?.progress === 1) status = "in progress";
        else if (record?.progress === 2) status = "completed";
        return { ...mod, progressStatus: status };
      })
      .sort((a, b) => a.moduleId - b.moduleId); // ✅ Sort here


      setModules(enrichedModules);
    } catch (err) {
      console.error("❌ Error loading modules:", err);
    } finally {
      console.timeEnd("⏱️ Module Load Time"); // ✅ Always ends, even if error
      setLoading(false);
    }
  };

  fetchAllData();
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
              <div
                className="course-card"
                key={mod.moduleId}
                onClick={() => navigate(`/module/${mod.slug}`, { state: { moduleId: mod.moduleId } })}
                style={{ cursor: "pointer" }}
              >
                <div className={`ribbon ${mod.progressStatus?.replace(" ", "-")}`}>
                  {mod.progressStatus === "completed"
                    ? "Completed"
                    : mod.progressStatus === "in progress"
                    ? "In progress"
                    : "Not started"}
                </div>
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
