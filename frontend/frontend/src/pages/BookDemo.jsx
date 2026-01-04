import React, { useState } from 'react';
import Footer from '../components/Footer';
import './BookDemo.css';
import { Link } from 'react-router-dom';

export default function BookDemo(){
  const [errors, setErrors] = useState({});
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
            <p>Request a free demo. We’ll get back to you.</p>

            <form className="demo-form" onSubmit={(e)=>{
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
              if (Object.keys(newErrors).length === 0) {
                // submit (currently local)
                alert('Thanks — demo request sent (local).');
                form.reset();
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
                <button className="demo-submit" type="submit">Request demo</button>
              </div>
            </form>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
