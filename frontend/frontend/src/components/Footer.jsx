import { Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import "./Footer.css";

export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <div className="brand-title">daisychained</div>
          <div className="brand-email">humans@daisychained.co.uk</div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation" role="navigation">
          <Link to="/privacy" aria-label="Privacy Notice">Privacy Notice</Link>
          <Link to="/terms" aria-label="Terms and Conditions">Terms</Link>
          <Link to="/cookie-policy" aria-label="Cookie Policy">Cookie Policy</Link>
        </nav>

        <div className="socials">
          <a href="#" aria-label="LinkedIn"><Linkedin /></a>
          <a href="#" aria-label="Instagram"><Instagram /></a>
        </div>
      </div>
    </footer>
  );
}
