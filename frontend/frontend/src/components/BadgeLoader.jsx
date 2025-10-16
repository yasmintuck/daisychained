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

  // Added state to track which badge is currently downloading / generating.
  const [downloadingId, setDownloadingId] = useState(null);

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

    // mark this badge as downloading so UI can show a loader / disable the button
    setDownloadingId(b.moduleId);

    const apiBase = import.meta.env.VITE_BACKEND_URL;
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

    const token = await getAccessTokenSilently({
      authorizationParams: { audience },
      detailedResponse: false,
    });

    const sep = b.certificateDownloadUrl.includes("?") ? "&" : "?";
    const url = `${apiBase}${b.certificateDownloadUrl}${sep}origin=${encodeURIComponent(window.location.origin)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
      credentials: "omit",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Download failed (${res.status}) ${text}`);
    }

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = (b.moduleTitle || "certificate").replace(/[^\w.-]+/g, "_") + ".pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.error("Certificate download failed", e);
    alert("Sorry — we couldn’t download your certificate. Please try again.");
  } finally {
    // clear downloading state regardless of success/failure
    setDownloadingId(null);
  }
};

  return (
    <div className="badges-area">
      {/* Overlay shown while a certificate is being generated */}
      {downloadingId !== null && (
        <>
          <style>{`
            /* Overlay + box */
            .cert-overlay {
              position: fixed;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0,0,0,0.35);
              z-index: 9999;
            }
            .cert-box {
              background: #fff;
              padding: 0.75rem 1rem;
              border-radius: 8px;
              box-shadow: 0 6px 18px rgba(0,0,0,0.15);
              text-align: center;
              min-width: 220px;
              max-width: 320px;
            }
            .cert-title {
              margin-bottom: 8px;
              font-weight: 700;
              font-size: 1rem;
              color: #2c2829;
              font-family: font-family: 'Baloo Paaji 2', sans-serif;
            }

            .progress-track {
              width: 220px;
              height: 10px;
              background: #eee;
              border-radius: 6px;
              overflow: hidden;
              margin: 0 auto;
            }
            .progress-bar {
              width: 40%;
              height: 100%;
              background: #ffb300; 
              border-radius: 6px;
              animation: indeterminate 1.1s infinite linear;
              box-shadow: 0 0 12px rgba(246,200,76,0.25);
            }

            @keyframes indeterminate {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(300%); }
            }

            /* Optional: small caption */
            .cert-caption {
              margin-top: 8px;
              font-size: 0.875rem;
              color: #666;
            }
          `}</style>

          <div className="cert-overlay" role="dialog" aria-modal="true" aria-live="polite">
            <div className="cert-box" role="status" aria-busy="true">
              <div className="cert-title">Building your certificate</div>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-bar" />
              </div>
              <div className="cert-caption">This may take a few seconds…</div>
            </div>
          </div>
        </>
      )}

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
                disabled={downloadingId !== null}
                aria-disabled={downloadingId !== null}
              >
                <DownloadIcon size={18} aria-hidden="true" />
                <span style={{ marginLeft: 8 }}>
                  {downloadingId === b.moduleId ? "Generating…" : "Download"}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
