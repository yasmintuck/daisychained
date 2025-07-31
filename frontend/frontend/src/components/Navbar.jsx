// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { loginWithRedirect, isAuthenticated, user, logout, isLoading } = useAuth0();

  useEffect(() => {
    setHasMounted(true);
    setIsMobile(window.innerWidth <= 900);
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleDropdown = () => setShowDropdown(prev => !prev);

  const dropdownRef = useRef(null);

  const location = useLocation();

  if (isLoading) return null;

  return (
    <header className="navbar">
      <div className="nav-container">
        {isMobile && (
          <button className="hamburger" onClick={toggleMenu}>
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        )}


        <img src="/logo.png" alt="DaisyChained Logo" className="logo" />


        {!isMobile && (
          <nav className={`nav-links ${isMobile ? 'mobile-hidden' : ''}`}>
            {!isAuthenticated ? (
              <>
                <Link to="/" className={location.pathname === "/" ? "active-link" : ""}>Home</Link>
                <Link to="/about" className={location.pathname === "/about" ? "active-link" : ""}>About</Link>
                <Link to="/faq" className={location.pathname === "/faq" ? "active-link" : ""}>FAQs</Link>
                <Link to="/blog" className={location.pathname === "/blog" ? "active-link" : ""}>Blog</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active-link" : ""}>Dashboard</Link>
                <Link to="/badges" className={location.pathname === "/badges" ? "active-link" : ""}>Badges</Link>
              </>
            )}
          </nav>
        )}

        <div className="auth-buttons">
          {!isAuthenticated ? (
            <button
              className="outline-btn"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { prompt: 'select_account' },
                })
              }
            >
              Log in
            </button>
          ) : (
            <div className="profile-wrapper" ref={dropdownRef} onClick={toggleDropdown}>
              <span className="nav-links-style">{user?.given_name}</span>
              <img
                src={user?.picture}
                alt="User profile"
                className="login-profile-pic"
              />
              {showDropdown && (
                <div className="dropdown-menu-nav">
                  {/* Add more links here if needed */}
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      // Placeholder for future "My account" logic
                      setShowDropdown(false);
                    }}
                  >
                    My account
                  </button>

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <nav className={`nav-links ${isOpen ? 'open' : 'collapsed'}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/faq">FAQs</Link>
              <Link to="/blog">Blog</Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={location.pathname === "/dashboard" ? "active-link" : ""}
              >   Dashboard
              </Link>
              <Link to="/badges">Badges</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
