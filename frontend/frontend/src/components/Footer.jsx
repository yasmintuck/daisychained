import React, { useEffect, useRef } from 'react';
import { Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import "./Footer.css";

export default function Footer(){
  const curveRef = useRef(null);

  useEffect(() => {
    const el = curveRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // If no observer support, reveal immediately
      if (el) el.classList.add('curve-visible');
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('curve-visible');
          // reveal once
          obs.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <footer className="site-footer">
      {/* SVG curve at the top of footer - curved downward */}
      <svg className="footer-curve" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,0 C360,120 1080,120 1440,0 L1440,220 L0,220 Z" />
      </svg>

      {/* Box over the curve */}
      <div className="footer-curve-box" ref={curveRef}>
        <div className="footer-curve-content">
          <div className="footer-curve-heading">
            <span className="footer-curve-heading-white">Extend your</span> <span className="footer-curve-heading-yellow">digital capability</span>
          </div>
          <div className="footer-curve-body">
            We help colleges and schools design and build bespoke learning content, acting as a trusted extension of your digital and curriculum teams.
          </div>
          <div className="footer-curve-action">
            <a href="#" className="footer-curve-btn">Learn more</a>
          </div>
        </div>
      </div>

      {/* Footer content sections */}
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
            <div className="footer-section-title">Product</div>
            <ul>
              <li><Link to="/#">Features</Link></li>
              <li><Link to="/#">Custom content</Link></li>
              <li><Link to="/#">FAQs</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <div className="footer-section-title">Company</div>
            <ul>
              <li><Link to="/#">Our story</Link></li>
              <li><Link to="/#">Meet the team</Link></li>
              <li><Link to="/#">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <div className="footer-section-title">Get in touch</div>
            <ul>
              <li><Link to="/#">Book a demo</Link></li>
              <li><Link to="/#">Contact us</Link></li>
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

        {/* Legal and brand section */}
        <div className="site-footer-inner">
          <div className="footer-brand">
            <div>
              <div className="brand-email">© 2026 daisychained. All rights reserved.</div>
            </div>
          </div>

          {/* legal links are included above in the "Other" section */}

          <div className="footer-socials">
            <a href="#" aria-label="LinkedIn"><Linkedin size={28} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={28} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
