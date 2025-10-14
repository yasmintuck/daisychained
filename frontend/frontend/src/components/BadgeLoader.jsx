import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { Download as DownloadIcon } from "lucide-react";

/**
 * Grid renderer for earned badges.
 * Props:
 *  - searchTerm: string
 *  - sortOption: "newest" | "oldest"
 *  - activePackageId: number | null  (reserved for later use)
 *  - totalAvailable: number  (for the summary line)
 */
export default function BadgeLoader({ searchTerm, sortOption, activePackageId, totalAvailable }) {
  const { user, isAuthenticated } = useAuth0();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBase = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!isAuthenticated || !user?.email) return;
      setLoading(true);
      try {
        // Earned badges for this user
        const res = await axios.get(`${apiBase}/api/Badges/user/${encodeURIComponent(user.email)}`);
        const raw = res.data ?? [];

        // Search + sort
        let filtered = raw.filter(b =>
          (b.moduleTitle || "").toLowerCase().includes((searchTerm || "").toLowerCase())
        );

        filtered = filtered.sort((a, b) => {
          const da = a.completedAt ? new Date(a.completedAt) : new Date(0);
          const db = b.completedAt ? new Date(b.completedAt) : new Date(0);
          if (sortOption === "oldest") return da - db;
          return db - da; // default newest
        });

        if (!ignore) setBadges(filtered);
      } catch (e) {
        console.error("Failed to load earned badges", e);
        if (!ignore) setBadges([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [isAuthenticated, user, searchTerm, sortOption, activePackageId]);

  const onDownload = async (b) => {
    try {
      // Backend expects JWT identity; in dev it allows ?debugEmail=
        const sep = b.certificateDownloadUrl.includes("?") ? "&" : "?";
        const url = `${apiBase}${b.certificateDownloadUrl}`
        + `${sep}origin=${encodeURIComponent(apiBase)}`
        + `${import.meta.env.DEV ? `&debugEmail=${encodeURIComponent(user.email)}` : ""}`;

      window.open(url, "_blank");
    } catch (e) {
      console.error("Certificate download failed", e);
    }
  };

  return (
    <div className="badges-area">
      {/* Summary line */}
      <div style={{ margin: "0 0 1rem 0", color: "#2c2829" }}>
        <span>You've completed </span>
        <strong>{badges.length}</strong>
        <span> out of </span>
        <strong>{totalAvailable}</strong>
        <span> available badges.</span>
      </div>

      {loading ? (
        <p style={{ marginTop: "1rem" }}>Loading badges…</p>
      ) : badges.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No badges yet.</p>
      ) : (
        <div className="badge-grid">
          {badges.map((b) => (
            <div className="badge-card" key={b.moduleId}>
              <div className="badge-card-kebab">⋯</div>
              <div className="badge-img-wrap">
                <img src={b.badgePath} alt={`${b.moduleTitle} badge`} />
              </div>
              <div className="badge-title" title={b.moduleTitle}>{b.moduleTitle}</div>
              <div className="badge-meta">
                <span className="tick">✔</span>
                <span>
                  {" "}
                  Earned {b.completedAt ? new Date(b.completedAt).toLocaleDateString(undefined, { day:"2-digit", month:"short", year:"numeric" }) : ""}
                </span>
              </div>
                <button
                type="button"
                className="badge-download"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDownload(b); }}
                >
                <DownloadIcon size={18} aria-hidden="true" />
                <span>Download</span>
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
