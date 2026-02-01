import React, { useState } from 'react';
import FooterAlt from '../components/FooterAlt';
import './BookDemo.css';
import { Link } from 'react-router-dom';
import DaisyLogo from '../assets/hero/thank-you.png';

export default function BookDemo(){
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(null);
  return (
    <div className="public-page">
      <section className="book-demo-hero">
        <div className="book-demo-container">
          <div className="book-demo-left">
            <div className="section-header"><div className="heading">let's chat</div></div>
          </div>
        </div>
      </section>

      <section className="book-demo-form-section">
        <div className="book-demo-container">
          <aside className="demo-form-card" aria-labelledby="demo-form-title">
            {!submitted && <p className="demo-intro">Request a free demo. We’ll get back to you.</p>}

            { submitted ? (
              <div className="demo-thanks demo-thanks-replace" aria-live="polite">
                <img src={DaisyLogo} alt="daisychained" className="demo-thanks-logo" />
                <h2 className="demo-thanks-heading">We'll be in touch soon</h2>
                <p className="demo-thanks-text">We're over the moon about your interest in daisychained. One of our team will be in touch with you shortly to organise a chat and demo at a time that suits you.</p>
              </div>
            ) : (
            <form className="demo-form" onSubmit={async (e)=>{
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
                // submit to backend
                setLoading(true);
                try {
                  const body = {
                    FullName: `${values.firstName} ${values.lastName}`.trim(),
                    Email: values.email,
                    Phone: values.phone,
                    Company: values.company,
                    Message: values.message
                  };

                  // Resolve API base for dev vs production.
                  // Use existing `VITE_BACKEND_URL` env var used elsewhere in the app.
                  const devBase = 'http://localhost:5245';
                  const envBase = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_BASE ?? '';
                  // Ensure an absolute URL: if env var is present but missing scheme, prefix with https://
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
              <div className="demo-form-row">
                <div className="field">
                  <input className={errors.firstName? 'invalid':''} type="text" name="firstName" placeholder="First Name*" />
                  {errors.firstName && <div className="field-error">{errors.firstName}</div>}
                </div>
                <div className="field">
                  <input className={errors.lastName? 'invalid':''} type="text" name="lastName" placeholder="Last Name*" />
                  {errors.lastName && <div className="field-error">{errors.lastName}</div>}
                </div>
              </div>

              <div className="demo-form-row">
                <div className="field">
                  <input className={errors.email? 'invalid':''} type="email" name="email" placeholder="Work Email*" />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>
                <div className="field"><input type="text" name="jobTitle" placeholder="Job Title" /></div>
              </div>

              <div className="demo-form-row">
                <div className="field"><input type="text" name="company" placeholder="Company Name" /></div>
                <div className="field"><input type="text" name="phone" placeholder="Phone Number" /></div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <textarea className={errors.message? 'invalid':''} name="message" placeholder="Message*" />
                {errors.message && <div className="field-error">{errors.message}</div>}
              </div>

              { (errors.firstName || errors.lastName || errors.email || errors.message) && (
                <div style={{ marginTop: '8px' }} className="form-errors">
                  {/* individual field errors are shown under inputs; this block can stay for summary if desired */}
                </div>
              ) }
              <p className="demo-legal">By filling in this form you agree to share your information with daisychained. We take privacy seriously, <Link to="/privacy">click here</Link> to read our privacy notice.</p>

              <div style={{ marginTop: '18px' }}>
                <button className="demo-submit" type="submit" disabled={loading || submitted}>{loading? 'Sending…' : (submitted? 'Sent' : 'Request demo')}</button>
              </div>
            </form>
            )}
            { serverError && <div className="server-error" role="alert">{serverError}</div> }
          </aside>
        </div>
      </section>

      <FooterAlt />
    </div>
  );
}
