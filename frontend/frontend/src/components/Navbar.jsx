// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/">
          <img src="/logo.png" alt="DaisyChained Logo" className="logo" />
        </Link>

        {isMobile && (
          <button className="hamburger" onClick={toggleMenu}>
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        )}

        <nav className={`nav-links ${isMobile ? (isOpen ? 'open' : 'collapsed') : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">My Modules</Link>
              <Link to="/badges">My Badges</Link>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/blog">Blog</Link>
            </>
          )}
        </nav>

        <div className={`auth-buttons ${isMobile ? 'mobile' : ''}`}>
          <button className="outline-btn">Sign up</button>
          <button
            className="outline-btn"
            onClick={() =>
              loginWithRedirect({ authorizationParams: { prompt: 'select_account' } })
            }
          >
            Log in
          </button>
        </div>
      </div>
    </header>
  );
}
