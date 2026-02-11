import React, { useCallback } from 'react';
import { Linkedin, Instagram } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import "./FooterAlt.css";

export default function FooterAlt(){
  const navigate = useNavigate();

  const handleFounderClick = useCallback((e) => {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    navigate('/', { state: { scrollTo: 'founder-section' } });
  }, [navigate]);
  return (
    <footer className="site-footer alt-footer">
      <svg className="footer-curve" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,0 C360,120 1080,120 1440,0 L1440,220 L0,220 Z" />
      </svg>

      {/* alternative footer: curve box removed for this variant */}

      <div className="footer-content-wrapper">
        <div className="site-footer-sections">
          <div className="footer-section">
          <div className="footer-brand">
            <img src="/logo.png" alt="daisychained logo" className="footer-logo" />
            <div>
              <div className="brand-title">daisychained</div>
              <div className="brand-email">humans@daisychained.co.uk</div>
            </div>
          </div>
          </div>
          <div className="footer-section">
            <div className="footer-section-title">Platform</div>
            <ul>
              <li><Link to="/#features">Features</Link></li>
              <li><Link to="/custom-content">Custom content</Link></li>
              <li><Link to="/#faqs">FAQs</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <div className="footer-section-title">Company</div>
            <ul>
              <li><a href="/#founder-section" onClick={handleFounderClick}>Why daisychained?</a></li>
              <li><Link to="/#">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <div className="footer-section-title">Get in touch</div>
            <ul>
              <li><Link to="/enquiries">Enquiries</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <div className="footer-section-title">Legal</div>
            <ul>
              <li><Link to="/privacy">Privacy notice</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/cookie-policy">Cookie policy</Link></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="site-footer-inner">
          <div className="footer-brand">
            <div>
              <div className="brand-email">© 2026 daisychained. All rights reserved.</div>
            </div>
          </div>

          <div className="footer-socials">
            <a href="#" aria-label="LinkedIn"><Linkedin size={28} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={28} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
