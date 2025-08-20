import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

//const ModuleLoader = ({ searchTerm, statusFilter, sortOption }) => {
const ModuleLoader = ({ searchTerm, statusFilter, sortOption, activePackageId }) => {
  const { user, isAuthenticated } = useAuth0();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const navigate = useNavigate();

  useEffect(() => {
    setVisibleCount(12);
  }, [activePackageId, searchTerm, statusFilter, sortOption]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchAllData = async () => {
      console.time("⏱️ Module Load Time");
      setLoading(true);

      try {
        const payload = {
          externalId: user.sub,
          firstName: user.given_name || "",
          lastName: user.family_name || "",
          email: user.email
        };

        // const [modulesRes, progressRes] = await Promise.all([
        //   axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/Modules`),
        //   axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UserProgress/user/${user.email}`)
        // ]);
        const [modsRes, progressRes] = await Promise.all([
          axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/UserAccess/modules`, {
            email: user.email,
            firstName: user.given_name,
            lastName: user.family_name,
            externalId: user.sub,
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UserProgress/user/${user.email}`)
        ]);

//        const fetchedModules = modulesRes.data;
        const fetchedModules = modsRes.data ?? []; // each item has packageIds: number[]
        const userProgress = progressRes.data || [];

        const enrichedModules = fetchedModules
          .map((mod) => {
            const record = userProgress.find((p) => p.moduleId === mod.moduleId);
            let status = "not started";
            if (record?.progress === 1) status = "in progress";
            else if (record?.progress === 2) status = "completed";
            return { ...mod, progressStatus: status };
          })
          .sort((a, b) => a.moduleId - b.moduleId);

        setModules(enrichedModules);
      } catch (err) {
        console.error("❌ Error loading modules:", err);
      } finally {
        console.timeEnd("⏱️ Module Load Time");
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isAuthenticated, user]);

  //   const filteredModules = modules.filter((mod) => {
  //     const matchesSearch = mod.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase());
  //     const matchesStatus = statusFilter ? mod.progressStatus === statusFilter : true;
  //     return matchesSearch && matchesStatus;
  // });
  const packageFiltered =
  activePackageId != null
    ? modules.filter(
        (m) => Array.isArray(m.packageIds) && m.packageIds.includes(Number(activePackageId))
      )
    : modules;


const filteredModules = packageFiltered.filter((mod) => {
  const matchesSearch = (mod.moduleTitle || "")
    .toLowerCase()
    .includes((searchTerm || "").toLowerCase());
  const matchesStatus = statusFilter ? mod.progressStatus === statusFilter : true;
  return matchesSearch && matchesStatus;
});

  // const sortedModules = [...filteredModules].sort((a, b) => {
  //   if (sortOption === "newest") {
  //     return new Date(b.lastUpdated) - new Date(a.lastUpdated);
  //   } else if (sortOption === "oldest") {
  //     return new Date(a.lastUpdated) - new Date(b.lastUpdated);
  //   } else if (sortOption === "shortest") {
  //     return parseInt(a.duration) - parseInt(b.duration);
  //   } else if (sortOption === "longest") {
  //     return parseInt(b.duration) - parseInt(a.duration);
  //   }
  //   return 0;
  // });

    const sortedModules = [...filteredModules].sort((a, b) => {
    // Safe dates (fallback to epoch if missing/invalid)
    const dateA = a?.lastUpdated ? new Date(a.lastUpdated) : new Date(0);
    const dateB = b?.lastUpdated ? new Date(b.lastUpdated) : new Date(0);

    // Safe durations (fallback to 0 if missing/invalid)
    const durAraw = parseInt(a?.duration, 10);
    const durBraw = parseInt(b?.duration, 10);
    const durA = Number.isFinite(durAraw) ? durAraw : 0;
    const durB = Number.isFinite(durBraw) ? durBraw : 0;

    // Stable tie-breaker so sort order doesn't jump around
    const tieBreak = (a?.moduleId ?? 0) - (b?.moduleId ?? 0);

    if (sortOption === "newest") return (dateB - dateA) || tieBreak;
    if (sortOption === "oldest") return (dateA - dateB) || tieBreak;
    if (sortOption === "shortest") return (durA - durB) || tieBreak;
    if (sortOption === "longest") return (durB - durA) || tieBreak;

    return tieBreak;
  });


  return (
    <>
      {loading ? (
        <p style={{ marginTop: "2rem", color: "#231F20" }}>
          Loading your modules...
        </p>
      ) : sortedModules.length > 0 ? (
        <>
          <div className="course-area">
            {sortedModules.slice(0, visibleCount).map((mod) => (
              <div
                className="course-card"
                key={mod.moduleId}
                onClick={() =>
                  navigate(`/module/${mod.slug}`, {
                    state: { moduleId: mod.moduleId },
                  })
                }
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
                      Updated: {new Date(mod.lastUpdated).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < sortedModules.length && (
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
          No modules found.
        </p>
      )}
    </>
  );
};

export default ModuleLoader;
