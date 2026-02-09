import React, { useState, useEffect } from 'react';
import FooterAlt from '../components/FooterAlt';
import './CustomContent.css';
import './BookDemo.css';
import DaisyLogo from '../assets/hero/thank-you.png';
import { Link } from 'react-router-dom';

export default function CustomContent() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // mirror homepage: set loaded so hero elements receive the "visible" class
    // using requestAnimationFrame double-rAF gives the browser a paint before
    // the visible class is applied, ensuring the CSS transitions animate.
    requestAnimationFrame(() => requestAnimationFrame(() => setLoaded(true)));
  }, []);

  // Reveal observer for elements with .reveal on this page (matches homepage behavior)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const container = document.querySelector('.custom-content-page');
    if (!container) return;
    const els = Array.from(container.querySelectorAll('.reveal'));
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => requestAnimationFrame(() => {
            entry.target.classList.add('visible');
          }));
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="public-page custom-content-page">
      {/* Section 1: Hero / two-column */}
      <section className="public-body custom-hero">
        <div className="public-container">
          <div className="two-col hero-grid">
            <div className={`col left hero-left ${loaded ? 'visible' : ''}`}>
              <h1 className="page-title">Custom content, built from what you already have</h1>
              <p className="lead">We transform your existing documents, slides, and guidance into interactive online learning modules with built-in assessments, packaged in a SCORM format for your VLE.</p>
              <div className="cta-row">
                <a href="#contact-top" className="primary-cta">Enquire</a>
                <a href="#how-it-works" className="outline-btn">How it works</a>
              </div>
              
            </div>

            <div className={`col right hero-right ${loaded? 'visible' : ''}`}>
              <img src="/images/mockup1.png" alt="Custom content mockup" className="page-visual" />
            </div>
          </div>
        </div>
      </section>

      {/* SVG curve placed outside the hero so it cleanly separates the hero from the next section */}
      <svg className="hero-curve" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        {/* left side straighter, right side more wonky */}
        <path d="M0,0 C40,10 940,260 1440,20 L1440,220 L0,220 Z" />
      </svg>

      {/* Section 2: How it works (cards + form) */}
      <section id="how-it-works" className="public-body feature-cards">
        <div className="public-container">
          <h2 className="page-title reveal">How it works</h2>
          <div className="cards-grid">
            <div className="card reveal" tabIndex="0">
              <div className="card-header">
                <div className="card-icon" aria-hidden>
                  <img src="/images/card-icon1.png" alt="" className="card-icon-img" />
                </div>
                <h3 className="card-title">Share your materials</h3>
              </div>
              <p className="card-desc">Send us your exsisting content: PowerPoint, Word doc, PDF, or written notes.</p>
            </div>
            <div className="card reveal" tabIndex="0">
              <div className="card-header">
                <div className="card-icon" aria-hidden>
                  <img src="/images/card-icon2.png" alt="" className="card-icon-img" />
                </div>
                <h3 className="card-title">We design and build</h3>
              </div>
              <p className="card-desc">Our expert team will create bespoke online courses or microlearning modules with built-in interaction and knowledge checks.</p>
            </div>
            <div className="card reveal" tabIndex="0">
              <div className="card-header">
                <div className="card-icon" aria-hidden>
                  <img src="/images/card-icon3.png" alt="" className="card-icon-img" />
                </div>
                <h3 className="card-title">Upload and track</h3>
              </div>
              <p className="card-desc">We send you SCORM files to upload to your VLE, ready to track engagement and completion.</p>
            </div>
          </div>
          {/* Contact form copied from BookDemo page; placed under How it works */}
          <div className="contact-form-section">
              <div className="contact-form-container">
                <div id="contact-top" aria-hidden="true" />
                <h2 className="page-title">Get in touch</h2>
                <aside id="contact-form" className="contact-form-card" aria-labelledby="contact-form-title">
                {!submitted && <p className="contact-intro">Complete the form and we’ll be in touch to talk through your requirements and suggest the best approach, with no obligation.</p>}

                { submitted ? (
                  <div className="contact-thanks contact-thanks-replace" aria-live="polite">
                    <img src={DaisyLogo} alt="daisychained" className="demo-thanks-logo" />
                    <h2 className="contact-thanks-heading">We'll be in touch soon</h2>
                    <p className="contact-thanks-text">We're over the moon about your interest in daisychained. One of our team will be in touch with you shortly.</p>
                  </div>
                ) : (
                <form className="contact-form" onSubmit={async (e)=>{
                  e.preventDefault();
                  const form = e.target;
                  const fd = new FormData(form);
                  const values = {
                    firstName: (fd.get('firstName') || '').toString().trim(),
                    lastName: (fd.get('lastName') || '').toString().trim(),
                    email: (fd.get('email') || '').toString().trim(),
                    jobTitle: (fd.get('jobTitle') || '').toString().trim(),
                    company: (fd.get('company') || '').toString().trim(),
                    phone: (fd.get('phone') || '').toString().trim(),
                    message: (fd.get('message') || '').toString().trim(),
                  };
                  const newErrors = {};
                  if (!values.firstName) newErrors.firstName = 'Please enter your first name';
                  if (!values.lastName) newErrors.lastName = 'Please enter your last name';
                  if (!values.email) newErrors.email = 'Please enter your email address';
                  else if (!/^\S+@\S+\.\S+$/.test(values.email)) newErrors.email = 'Please enter a valid email address';
                  if (!values.message) newErrors.message = 'Please enter a message';
                  setErrors(newErrors);
                  setServerError(null);
                  if (Object.keys(newErrors).length === 0) {
                    setLoading(true);
                    try {
                      const body = {
                        FullName: `${values.firstName} ${values.lastName}`.trim(),
                        Email: values.email,
                        Phone: values.phone,
                        Company: values.company,
                        Message: values.message,
                        RequestType: 'Custom content request'
                      };

                      const devBase = 'http://localhost:5245';
                      const envBase = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE ?? '';
                      const normalizedEnvBase = envBase && !envBase.startsWith('http') ? `https://${envBase}` : envBase;
                      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                        ? devBase
                        : (normalizedEnvBase ?? '');

                      const res = await fetch(`${apiBase}/api/DemoRequests`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                      });

                      if (res.ok) {
                        setSubmitted(true);
                        form.reset();
                      } else {
                        const text = await res.text();
                        setServerError(text || 'Failed to send request');
                      }
                    } catch (err) {
                      setServerError(err?.message || 'Network error');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}>
                  <div className="contact-form-row">
                    <div className="field">
                      <input className={errors.firstName? 'invalid':''} type="text" name="firstName" placeholder="First Name*" />
                      {errors.firstName && <div className="field-error">{errors.firstName}</div>}
                    </div>
                    <div className="field">
                      <input className={errors.lastName? 'invalid':''} type="text" name="lastName" placeholder="Last Name*" />
                      {errors.lastName && <div className="field-error">{errors.lastName}</div>}
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="field">
                      <input className={errors.email? 'invalid':''} type="email" name="email" placeholder="Work Email*" />
                      {errors.email && <div className="field-error">{errors.email}</div>}
                    </div>
                    <div className="field"><input type="text" name="jobTitle" placeholder="Job Title" /></div>
                  </div>

                  <div className="contact-form-row">
                    <div className="field"><input type="text" name="company" placeholder="Company Name" /></div>
                    <div className="field"><input type="text" name="phone" placeholder="Phone Number" /></div>
                  </div>

                  <div style={{ marginTop: '18px' }}>
                    <textarea className={errors.message? 'invalid':''} name="message" placeholder="Tell us about your requirements…*" />
                    {errors.message && <div className="field-error">{errors.message}</div>}
                  </div>

                  <p className="contact-legal">By filling in this form you agree to share your information with daisychained. We take privacy seriously, <Link to="/privacy">click here</Link> to read our privacy notice.</p>

                  <div style={{ marginTop: '18px' }}>
                    <button className="contact-submit" type="submit" disabled={loading || submitted}>{loading? 'Sending…' : (submitted? 'Sent' : 'Get in touch')}</button>
                  </div>
                </form>
                )}
                { serverError && <div className="server-error" role="alert">{serverError}</div> }
              </aside>
            </div>
          </div>
        </div>
      </section>

      <FooterAlt />
    </div>
  );
}
