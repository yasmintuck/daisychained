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
  const [activeSection, setActiveSection] = useState('top');

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

  // observe page sections for active nav highlighting (only on the home page)
  useEffect(() => {
    const ids = ['top', 'features', 'faqs'];
    if (location.pathname !== '/') {
      // clear any section-based active state when not on the homepage
      setActiveSection('');
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActiveSection(e.target.id);
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0.15 });
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [location.pathname]);

  // when the location.hash changes (e.g. user clicks a link to /#features)
  // ensure the activeSection is synchronized immediately
  useEffect(() => {
    if (location.pathname === '/') {
      if (location.hash) setActiveSection(location.hash.replace('#', ''));
      else setActiveSection('top');
    }
  }, [location.hash, location.pathname]);

  // Ensure the nav highlights 'home' when the user scrolls to the very top.
  // IntersectionObserver may not always fire for the top sentinel depending on
  // scrolling behavior and rootMargins, so watch scroll position and set
  // activeSection to 'top' when close to the top of the page.
  useEffect(() => {
    if (location.pathname !== '/') return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const nav = document.querySelector('.navbar');
        const navH = nav ? nav.getBoundingClientRect().height : 0;
        // if we're within navH + 24px of the top, mark 'top' active
        if (y <= navH + 24) setActiveSection('top');
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // run once to set initial state
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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
                <Link to="/#top" className={location.pathname === '/' && activeSection === 'top' ? 'active-link' : ''}>home</Link>
                <Link to="/#features" className={location.pathname === '/' && activeSection === 'features' ? 'active-link' : ''}>features</Link>
                <Link to="/#faqs" className={location.pathname === '/' && activeSection === 'faqs' ? 'active-link' : ''}>FAQs</Link>
                <Link to="/book-demo" className={linkClass('/book-demo')}>book a demo</Link>
                <Link to="/custom-content" className={linkClass('/custom-content')}>custom content</Link>
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
              <Link to="/#top" className={location.pathname === '/' && activeSection === 'top' ? 'active-link' : ''} onClick={() => setIsOpen(false)}>home</Link>
              <Link to="/#features" className={location.pathname === '/' && activeSection === 'features' ? 'active-link' : ''} onClick={() => setIsOpen(false)}>features</Link>
              <Link to="/#faqs" className={location.pathname === '/' && activeSection === 'faqs' ? 'active-link' : ''} onClick={() => setIsOpen(false)}>FAQs</Link>
              <Link to="/book-demo" className={linkClass('/book-demo')} onClick={() => setIsOpen(false)}>book a demo</Link>
              <Link to="/custom-content" className={linkClass('/custom-content')} onClick={() => setIsOpen(false)}>custom content</Link>
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
