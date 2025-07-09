// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    setHasMounted(true);
    setIsMobile(window.innerWidth <= 900);
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

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

        <Link to="/">
          <img src="/logo.png" alt="DaisyChained Logo" className="logo" />
        </Link>

        {!isMobile && (
          <nav className={`nav-links ${isMobile ? 'mobile-hidden' : ''}`}>
            {!isAuthenticated ? (
              <>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/faq">FAQ</Link>
                <Link to="/blog">Blog</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">My Modules</Link>
                <Link to="/badges">My Badges</Link>
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
          user?.picture && (
            <img
              src={user.picture}
              alt="User profile"
              className="login-profile-pic"
            />
          )
        )}
      </div>
      </div>

      {isMobile && (
        <nav className={`nav-links ${isOpen ? 'open' : 'collapsed'}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/blog">Blog</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">My Modules</Link>
              <Link to="/badges">My Badges</Link>
            </>
          )}
        </nav>
      )}
    </header>

  );
}
