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
      // 1) Auth0 bearer token
      const token = await getAccessTokenSilently();

      // 2) Stable public origin for asset resolution by the backend
      const origin =
        import.meta.env.MODE === "development"
          ? import.meta.env.VITE_FRONTEND_PUBLIC_ORIGIN_DEV
          : import.meta.env.VITE_FRONTEND_PUBLIC_ORIGIN_PROD;

      // 3) Build URL from API base + server-provided path, then append origin (+ optional debugEmail in dev)
      const sep = b.certificateDownloadUrl.includes("?") ? "&" : "?";
      const url =
        `${apiBase}${b.certificateDownloadUrl}` +
        `${sep}origin=${encodeURIComponent(origin)}` +
        `${import.meta.env.DEV ? `&debugEmail=${encodeURIComponent(user.email)}` : ""}`;

      // 4) Authenticated fetch → blob → programmatic download (no window.open)
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);

      const blob = await res.blob();

      // Try to honor filename from Content-Disposition; fall back to module title
      const dispo = res.headers.get("Content-Disposition") || "";
      const match = dispo.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
      const fallback = `${(b.moduleTitle || "certificate").replace(/[^\w\-]+/g, "_")}.pdf`;
      const filename = match ? decodeURIComponent(match[1]) : fallback;

      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      console.error("Certificate download failed", e);
      alert("Sorry, we couldn’t download your certificate. Please try again.");
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
