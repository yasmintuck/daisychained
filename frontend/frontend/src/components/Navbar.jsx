// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { loginWithRedirect, isAuthenticated, user, logout, isLoading } = useAuth0();

  // ✅ declare these FIRST so effects and helpers can use them
  const location = useLocation();
  const dropdownRef = useRef(null);

  // helper to add the active class
  const linkClass = (path) => (location.pathname === path ? 'active-link' : '');

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  // ✅ close mobile menu & dropdown whenever the route changes
  useEffect(() => {
    setIsOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsOpen((o) => !o);
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

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
                <Link to="/"      className={linkClass('/')}>home</Link>
                <Link to="/about" className={linkClass('/about')}>meet the team</Link>
                <Link to="/faq"   className={linkClass('/faq')}>faq</Link>
                <Link to="/blog"  className={linkClass('/blog')}>blog</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>my modules</Link>
                <Link to="/badges"    className={linkClass('/badges')}>badges + certificates</Link>
              </>
            )}
          </nav>
        )}

        <div className="auth-buttons">
          {!isAuthenticated ? (
            <button
              className="outline-btn"
              onClick={() =>
                loginWithRedirect({ authorizationParams: { prompt: 'select_account' } })
              }
            >
              Log in
            </button>
          ) : (
            <div className="profile-wrapper" ref={dropdownRef} onClick={toggleDropdown}>
              <span className="nav-links-style">{user?.given_name}</span>
              <img src={user?.picture} alt="User profile" className="login-profile-pic" />
              {showDropdown && (
                <div className="dropdown-menu-nav">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      logout({
                        logoutParams: {
                          returnTo: import.meta.env.VITE_LOGOUT_URL,
                          client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
                        },
                      });
                    }}
                  >
                    Logout
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
              <Link to="/"      className={linkClass('/')}       onClick={() => setIsOpen(false)}>home</Link>
              <Link to="/about" className={linkClass('/about')}  onClick={() => setIsOpen(false)}>meet the team</Link>
              <Link to="/faq"   className={linkClass('/faq')}    onClick={() => setIsOpen(false)}>faq</Link>
              <Link to="/blog"  className={linkClass('/blog')}   onClick={() => setIsOpen(false)}>blog</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={linkClass('/dashboard')} onClick={() => setIsOpen(false)}>my modules</Link>
              <Link to="/badges"    className={linkClass('/badges')}    onClick={() => setIsOpen(false)}>badges + certificates</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
