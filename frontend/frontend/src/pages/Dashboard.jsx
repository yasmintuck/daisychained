import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react'; // just added
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ModuleLoader from "../components/ModuleLoader";
import './Dashboard.css';
import LoadingSpinner from "../components/LoadingSpinner";


function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 900);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const filterRef = useRef(null);
const sortRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    document.title = "Dashboard | daisychained";
  }, []);

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
          {/* <button className="collapse-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <i data-lucide={sidebarCollapsed ? "chevron-right" : "chevron-left"}></i>
          </button> */}
          <button className="collapse-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {sidebarCollapsed ? (
          <div className="search-icon-only">
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

        <ul className="menu-items">
          <li className="active"><i data-lucide="layout-grid"></i><span>All modules</span></li>
          <li><i data-lucide="sparkles"></i><span>Personal development</span></li>
          <li><i data-lucide="signpost"></i><span>Next steps</span></li>
          <li><i data-lucide="shield-alert"></i><span>Safeguarding</span></li>
          <li><i data-lucide="landmark"></i><span>Cultural capital</span></li>
          <li><i data-lucide="scale"></i><span>British values</span></li>
          <li><i data-lucide="cpu"></i><span>AI & digital literacy</span></li>
        </ul>

        <div className="bottom-actions">
          <li><i data-lucide="log-out"></i><span>Logout</span></li>
          {sidebarCollapsed ? (
            // ✅ Collapsed view: just show the toggle switch
            <div className="dark-mode-toggle collapsed-toggle-only">
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>
          ) : (
            // ✅ Expanded view: full layout
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
        </div>
      </div>

      <div className="content-wrapper">
<div className="page-header">
  <div className="page-title">All modules</div>

  {/* Desktop filter/sort buttons */}
  <div className="dropdown-controls">
    {/* Filter dropdown */}
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
    </div>

    {/* Sort dropdown */}
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
    </div>
  </div>

  {/* Mobile filter/sort icon buttons */}
  <div className="mobile-dropdown-buttons">
    <button
      className="icon-button"
      onClick={() => {
        setShowFilterDropdown(!showFilterDropdown);
        setShowSortDropdown(false);
      }}
      ref={filterRef}
    >
      <SlidersHorizontal size={18} />
    </button>

    <button
      className="icon-button"
      onClick={() => {
        setShowSortDropdown(!showSortDropdown);
        setShowFilterDropdown(false);
      }}
      ref={sortRef}
    >
      <ArrowUpDown size={18} />
    </button>
  </div>

  {/* Overlay when any dropdown is open */}
  {(showFilterDropdown || showSortDropdown) && (
    <div
      className="mobile-overlay"
      onClick={() => {
        setShowFilterDropdown(false);
        setShowSortDropdown(false);
      }}
    ></div>
  )}

  {/* Shared dropdown menu rendering */}
  {showFilterDropdown && (
    <ul className="dropdown-menu mobile-dropdown" ref={filterRef}>
      <li><span className="dot purple"></span> Not started</li>
      <li><span className="dot orange"></span> In progress</li>
      <li><span className="dot green"></span> Completed</li>
    </ul>
  )}

  {showSortDropdown && (
    <ul className="dropdown-menu mobile-dropdown" ref={sortRef}>
      <li>Newest to oldest</li>
      <li>Oldest to newest</li>
      <li>Duration (shortest first)</li>
      <li>Duration (longest first)</li>
    </ul>
  )}
</div>





        <ModuleLoader searchTerm={searchTerm} />
      </div>
    </div>
    </div>

  );
}

export default Dashboard;
