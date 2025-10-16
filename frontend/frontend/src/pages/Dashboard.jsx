import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react'; // just added
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ModuleLoader from "../components/ModuleLoader";
import './Dashboard.css';
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";

// Map your known package names to the icons you used before
const ICON_MAP_BY_SLUG = {
  "personal-development": "sparkles",
  "safeguarding": "shield-alert",
  "next-steps": "signpost",
  "cultural-capital": "landmark",
  "british-values": "scale",
  "ai-digital-literacy": "cpu",
};

// Simple slugify so slight name changes still match
const slugify = (s = "") =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const iconForPackage = (name) =>
  ICON_MAP_BY_SLUG[slugify(name)] ?? "folder"; // fallback icon

const ICON_ALL = "layout-grid"; // the icon you used for "All modules"


function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const [searchTerm, setSearchTerm] = useState("");
  const [packages, setPackages] = useState([]);        // [{packageId, packageName, packageDescription}]
  const [activePackageId, setActivePackageId] = useState(null); // null = All
  const [hideAll, setHideAll] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 900);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState(""); // "", "not started", "in progress", "completed"
  const [sortOption, setSortOption] = useState("newest"); // "", "newest", "oldest", "shortest", "longest"

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [searchTerm, sidebarCollapsed, packages, activePackageId]);

  useEffect(() => {
    document.title = "Dashboard | daisychained";
  }, []);

   useEffect(() => {
     const loadPackages = async () => {
     if (!isAuthenticated || !user) return;
     try {
       const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/UserAccess/packages`, {
         email: user.email,
         firstName: user.given_name,
         lastName: user.family_name,
         externalId: user.sub,
       });
       const list = res.data ?? [];
       setPackages(list);
       if (list.length === 1) {
         setActivePackageId(list[0].packageId);
         setHideAll(true); // don’t show “All modules” if only one category exists
       } else {
         setActivePackageId(null); // “All modules”
         setHideAll(false);
       }
     } catch (e) {
       console.error("Failed to load packages", e);
       setPackages([]);
     }
   };
   loadPackages();
 }, [isAuthenticated, user]);

  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [searchTerm, sidebarCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth <= 900);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Run on mount to set initial state

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        sortRef.current &&
        !sortRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);




  if (!isAuthenticated) return null;

  const email = user?.email || "";
  const domain = email.substring(email.lastIndexOf("@") + 1);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* <div className="sidebar"> */}
        <div className={`sidebar ${sidebarCollapsed ? "collapsed" : "expanded"}`}>
          <div className="toggle-container">
            <button className="collapse-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          {sidebarCollapsed ? (
            <div
              className="search-icon-only"
              onClick={() => setSidebarCollapsed(false)}
            >
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

          {/* <ul className="menu-items">
            <li className="active"><i data-lucide="layout-grid"></i><span>All modules</span></li>
            <li><i data-lucide="sparkles"></i><span>Personal development</span></li>
            <li><i data-lucide="signpost"></i><span>Next steps</span></li>
            <li><i data-lucide="shield-alert"></i><span>Safeguarding</span></li>
            <li><i data-lucide="landmark"></i><span>Cultural capital</span></li>
            <li><i data-lucide="scale"></i><span>British values</span></li>
            <li><i data-lucide="cpu"></i><span>AI & digital literacy</span></li>
          </ul> */}

          <ul className="menu-items">
            {!hideAll && (
              <li
                className={activePackageId === null ? "active" : ""}
                onClick={() => setActivePackageId(null)}
              >
                <i data-lucide={ICON_ALL}></i>
                <span>All modules</span>
              </li>
            )}

            {packages.map((p) => (
              <li
                key={p.packageId}
                className={activePackageId === p.packageId ? "active" : ""}
                onClick={() => setActivePackageId(p.packageId)}
              >
                <i data-lucide={iconForPackage(p.packageName)}></i>
                <span>{p.packageName}</span>
              </li>
            ))}
          </ul>        

          {/*<div className="bottom-actions">
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

            {sidebarCollapsed ? (
              
              <div className="dark-mode-toggle collapsed-toggle-only">
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            ) : (
              
              <div className="dark-mode-toggle">
                <div className="dark-mode-left">
                  <i data-lucide="moon"></i>
                  <span>Dark mode</span>
                </div>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            )}
          </div>*/}
        </div>

        <div className="content-wrapper">
          <div className="page-header">
            {/* <div className="page-title">All modules</div> */}
          <div className="page-title">
            {hideAll
              ? (packages[0]?.packageName || "Modules")
              : (activePackageId === null ? "All modules" : (packages.find(p => p.packageId === activePackageId)?.packageName || "Modules"))}
          </div>

            {/* Desktop filter/sort buttons */}
            <div className="dropdown-controls">
              <div className="filter-dropdown" ref={filterRef}>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    setShowFilterDropdown(!showFilterDropdown);
                    setShowSortDropdown(false);
                  }}
                >
                  <span className="button-content">
                    <SlidersHorizontal size={18} />
                    <span>Filter</span>
                  </span>
                </button>

                {showFilterDropdown && window.innerWidth > 900 && (
                  <ul className="dropdown-menu">
                    <li
                      className={statusFilter === "" ? "active-option" : ""}
                      onClick={() => {
                        setStatusFilter("");
                        setShowFilterDropdown(false);
                      }}
                    >
                      <span className="dot"></span> All modules
                    </li>
                    <li
                      className={statusFilter === "not started" ? "active-option" : ""}
                      onClick={() => {
                        setStatusFilter("not started");
                        setShowFilterDropdown(false);
                      }}
                    >
                      <span className="dot purple"></span> Not started
                    </li>
                    <li
                      className={statusFilter === "in progress" ? "active-option" : ""}
                      onClick={() => {
                        setStatusFilter("in progress");
                        setShowFilterDropdown(false);
                      }}
                    >
                      <span className="dot orange"></span> In progress
                    </li>
                    <li
                      className={statusFilter === "completed" ? "active-option" : ""}
                      onClick={() => {
                        setStatusFilter("completed");
                        setShowFilterDropdown(false);
                      }}
                    >
                      <span className="dot green"></span> Completed
                    </li>

                  </ul>
                )}
              </div>

              <div className="sort-dropdown" ref={sortRef}>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowFilterDropdown(false);
                  }}
                >
                  <span className="button-content">
                    <ArrowUpDown size={18} />
                    <span>Sort by</span>
                  </span>
                </button>

                {/* Desktop-only dropdown */}
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
                    <li
                      className={sortOption === "shortest" ? "active-option" : ""}
                      onClick={() => {
                        setSortOption("shortest");
                        setShowSortDropdown(false);
                      }}
                    >
                      Duration (shortest first)
                    </li>
                    <li
                      className={sortOption === "longest" ? "active-option" : ""}
                      onClick={() => {
                        setSortOption("longest");
                        setShowSortDropdown(false);
                      }}
                    >
                      Duration (longest first)
                    </li>

                  </ul>
                )}
              </div>
            </div>

            {/* Mobile icon-only filter/sort buttons */}
            <div className="mobile-dropdown-buttons">
              <button
                className="icon-button"
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                }}
              >
                <SlidersHorizontal size={18} />
              </button>

              <button
                className="icon-button"
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
              >
                <ArrowUpDown size={18} />
              </button>
            </div>

            {/* Overlay for mobile dropdowns */}
            {(showFilterDropdown || showSortDropdown) && window.innerWidth <= 900 && (
              <div
                className="mobile-overlay"
                onClick={() => {
                  setShowFilterDropdown(false);
                  setShowSortDropdown(false);
                }}
              ></div>
            )}

            {/* Mobile dropdowns */}
            {showFilterDropdown && window.innerWidth <= 900 && (
              <ul className="dropdown-menu mobile-dropdown" ref={filterRef}>
                <li
                  className={statusFilter === "" ? "active-option" : ""}
                  onClick={() => {
                    setStatusFilter("");
                    setShowFilterDropdown(false);
                  }}
                >
                  <span className="dot"></span> All modules
                </li>
                <li
                  className={statusFilter === "not started" ? "active-option" : ""}
                  onClick={() => {
                    setStatusFilter("not started");
                    setShowFilterDropdown(false);
                  }}
                >
                  <span className="dot purple"></span> Not started
                </li>
                <li
                  className={statusFilter === "in progress" ? "active-option" : ""}
                  onClick={() => {
                    setStatusFilter("in progress");
                    setShowFilterDropdown(false);
                  }}
                >
                  <span className="dot orange"></span> In progress
                </li>
                <li
                  className={statusFilter === "completed" ? "active-option" : ""}
                  onClick={() => {
                    setStatusFilter("completed");
                    setShowFilterDropdown(false);
                  }}
                >
                  <span className="dot green"></span> Completed
                </li>

              </ul>
            )}


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
                <li
                  className={sortOption === "shortest" ? "active-option" : ""}
                  onClick={() => {
                    setSortOption("shortest");
                    setShowSortDropdown(false);
                  }}
                >
                  Duration (shortest first)
                </li>
                <li
                  className={sortOption === "longest" ? "active-option" : ""}
                  onClick={() => {
                    setSortOption("longest");
                    setShowSortDropdown(false);
                  }}
                >
                  Duration (longest first)
                </li>

              </ul>
            )}
          </div>

          {/* <ModuleLoader searchTerm={searchTerm} statusFilter={statusFilter} sortOption={sortOption} /> */}
          <ModuleLoader
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            sortOption={sortOption}
            activePackageId={activePackageId}
          />          
          {!sidebarCollapsed && window.innerWidth <= 900 && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarCollapsed(true)}
            ></div>
          )}

        </div>
      </div>
    </div>

  );
}

export default Dashboard;
