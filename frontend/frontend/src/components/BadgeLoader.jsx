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
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
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
        let filtered = raw.filter((b) =>
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
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user, searchTerm, sortOption, activePackageId, apiBase]);

const onDownload = async (b) => {
  try {
    if (!isAuthenticated) return;

    // 1) get a token for your API audience
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE, // e.g. "https://daisychained-api"
      },
    });

    // 2) build the URL the same way as before, but no debugEmail in prod
    const base = `${apiBase}${b.certificateDownloadUrl}`;
    const sep = base.includes("?") ? "&" : "?";
    const url = `${base}${sep}origin=${encodeURIComponent(window.location.origin)}`;

    // 3) call API with Authorization header and ask for a blob
    const res = await axios.get(url, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });

    // 4) trigger a download
    const blob = new Blob([res.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;

    // optional: a nicer filename if your API doesn’t already set it
    const niceName = (b.moduleTitle || "certificate").replace(/[^\w\d\-_. ]+/g, "");
    a.download = `${niceName.replace(/\s+/g, "_")}.pdf`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.error("Certificate download failed", e);
    alert("Sorry — we couldn’t download your certificate. Please try again.");
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
              <div className="badge-title" title={b.moduleTitle}>
                {b.moduleTitle}
              </div>
              <div className="badge-meta">
                <span className="tick">✔</span>
                <span>
                  {" "}
                  Earned{" "}
                  {b.completedAt
                    ? new Date(b.completedAt).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>
              <button
                type="button"
                className="badge-download"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDownload(b);
                }}
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
