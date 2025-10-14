// frontend/frontend/src/pages/Badges.jsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import BadgeLoader from "../components/BadgeLoader";
import "./Dashboard.css"; // reuse the exact same stylesheet as Dashboard
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

/* --- helpers & icon map (mirrors Dashboard.jsx) --- */
const slugify = (s = "") =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const ICON_MAP_BY_SLUG = {
  "personal-development": "sparkles",
  safeguarding: "shield-alert",
  "next-steps": "signpost",
  "cultural-capital": "landmark",
  "british-values": "scale",
  "ai-digital-literacy": "cpu",
};

const iconForPackage = (name) => ICON_MAP_BY_SLUG[slugify(name)] ?? "folder";
const ICON_ALL = "layout-grid";

export default function Badges() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();

  // ---- Page state (unchanged functional behavior) ----
  const [searchTerm, setSearchTerm] = useState("");
  const [packages, setPackages] = useState([]);
  const [activePackageId, setActivePackageId] = useState(null);
  const [activePackageName, setActivePackageName] = useState(null);
  const [hideAll, setHideAll] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0); // shown as “Y available badges”

  // IMPORTANT: keep this in sync with viewport like Dashboard.jsx
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 900);

  // Sort (badges doesn’t need filter)
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("newest"); // "newest" | "oldest"

  const apiBase = import.meta.env.VITE_BACKEND_URL;
  const sortRef = useRef(null);

  const toggleSidebar = () => setSidebarCollapsed((p) => !p);

  useEffect(() => {
    document.title = "Badges + Certificates | daisychained";
  }, []);

  // ---- FIX: match Dashboard.jsx resize behavior exactly ----
  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth <= 900);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // set the correct initial state on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---- Data loading (kept as-is; no simplifications) ----
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    let alive = true;

    (async () => {
      try {
        // same payload used in Dashboard.jsx
        const body = {
          email: user.email,
          firstName: user.given_name,
          lastName: user.family_name,
          externalId: user.sub,
        };

        // Packages for left menu
        const pkgRes = await axios.post(`${apiBase}/api/UserAccess/packages`, body);
        const pkgList = pkgRes.data ?? [];
        if (!alive) return;

        setPackages(pkgList);

        if (pkgList.length === 1) {
          setActivePackageId(pkgList[0].packageId);
          setActivePackageName(pkgList[0].packageName);
          setHideAll(true);
        } else {
          setActivePackageId(null);
          setActivePackageName(null);
          setHideAll(false);
        }

        // We use modules count as the “Y available badges”
        const modsRes = await axios.post(`${apiBase}/api/UserAccess/modules`, body);
        const mods = modsRes.data ?? [];
        if (!alive) return;

        setTotalAvailable(mods.length);
      } catch (e) {
        console.error("Failed to fetch packages/modules for badges", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, user, apiBase]);

  // ---- Outside click to close sort menu (unchanged) ----
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- Hydrate Lucide <i data-lucide="..."> icons (unchanged) ----
  useEffect(() => {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }, [packages, sidebarCollapsed, showSortDropdown, searchTerm, activePackageId]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* ==== Sidebar (structure/classes identical to Dashboard.jsx) ==== */}
        <div className={`sidebar ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
          <div className="toggle-container">
            <button className="collapse-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {sidebarCollapsed ? (
            <div className="search-icon-only" onClick={() => setSidebarCollapsed(false)}>
              <i data-lucide="search"></i>
            </div>
          ) : (
            <div className="search-container">
              <i data-lucide="search" className="search-icon"></i>
              <input
                type="text"
                className="module-search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm("")}>
                  <i data-lucide="x" className="clear-icon"></i>
                </button>
              )}
            </div>
          )}

          {/* Package list (mirrors Dashboard menu) */}
          <ul className="menu-items">
            {!hideAll && (
              <li
                className={activePackageId === null ? "active" : ""}
                onClick={() => {
                  setActivePackageId(null);
                  setActivePackageName(null);
                }}
                title="All badges + certificates"
              >
                <i data-lucide={ICON_ALL}></i>
                <span>All badges + certificates</span>
              </li>
            )}

            {packages.map((p) => (
              <li
                key={p.packageId}
                className={activePackageId === p.packageId ? "active" : ""}
                onClick={() => {
                  setActivePackageId(p.packageId);
                  setActivePackageName(p.packageName);
                }}
                title={p.packageDescription}
              >
                <i data-lucide={iconForPackage(p.packageName)}></i>
                <span>{p.packageName}</span>
              </li>
            ))}
          </ul>

          <div className="bottom-actions">
            <li
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: import.meta.env.VITE_LOGOUT_URL,
                    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
                  },
                })
              }
            >
              <i data-lucide="log-out"></i>
              <span>Logout</span>
            </li>

            {/* Dark mode placeholder to match Dashboard layout */}
            {sidebarCollapsed ? (
              <div className="dark-mode-toggle collapsed-toggle-only">
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            ) : (
              <div className="dark-mode-toggle">
                <span>Dark Mode</span>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* ==== Content wrapper (identical class names to Dashboard) ==== */}
        <div className="content-wrapper">
          <div className="page-header">
            <div className="page-title">
              {hideAll
                ? activePackageName || "Badges + Certificates"
                : activePackageId === null
                ? "All badges + certificates"
                : activePackageName || "Badges + Certificates"}
            </div>

            {/* Desktop-only: Sort dropdown */}
            <div className="dropdown-controls">
              <div className="sort-dropdown" ref={sortRef}>
                <button
                  className="dropdown-button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <span className="button-content">
                    <ArrowUpDown size={18} />
                    <span>Sort by</span>
                  </span>
                </button>

                {showSortDropdown && window.innerWidth > 900 && (
                  <ul className="dropdown-menu">
                    <li
                      className={sortOption === "newest" ? "active-option" : ""}
                      onClick={() => {
                        setSortOption("newest");
                        setShowSortDropdown(false);
                      }}
                    >
                      Newest to oldest
                    </li>
                    <li
                      className={sortOption === "oldest" ? "active-option" : ""}
                      onClick={() => {
                        setSortOption("oldest");
                        setShowSortDropdown(false);
                      }}
                    >
                      Oldest to newest
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* Mobile icon-only Sort button */}
            <div className="mobile-dropdown-buttons">
              <button
                className="icon-button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                aria-label="Sort badges"
              >
                <ArrowUpDown size={18} />
              </button>
            </div>

            {/* Mobile dropdown overlay */}
            {showSortDropdown && window.innerWidth <= 900 && (
              <div className="mobile-overlay" onClick={() => setShowSortDropdown(false)}></div>
            )}

            {/* Mobile dropdown list */}
            {showSortDropdown && window.innerWidth <= 900 && (
              <ul className="dropdown-menu mobile-dropdown" ref={sortRef}>
                <li
                  className={sortOption === "newest" ? "active-option" : ""}
                  onClick={() => {
                    setSortOption("newest");
                    setShowSortDropdown(false);
                  }}
                >
                  Newest to oldest
                </li>
                <li
                  className={sortOption === "oldest" ? "active-option" : ""}
                  onClick={() => {
                    setSortOption("oldest");
                    setShowSortDropdown(false);
                  }}
                >
                  Oldest to newest
                </li>
              </ul>
            )}
          </div>

          {/* Grid + summary line rendered by BadgeLoader (unchanged) */}
          <BadgeLoader
            searchTerm={searchTerm}
            sortOption={sortOption}
            activePackageId={activePackageId}
            totalAvailable={totalAvailable}
          />
        </div>

        {/* Overlay for mobile sidebar ONLY — identical condition to Dashboard.jsx */}
        {!sidebarCollapsed && window.innerWidth <= 900 && (
          <div className="sidebar-overlay" onClick={() => setSidebarCollapsed(true)} />
        )}
      </div>
    </div>
  );
}
