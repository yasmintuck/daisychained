import { useState } from "react";
import "./PublicPages.css";

const studentQs = [
  { q: "How do I log in to daisychained?", a: "Click log in in the top right and continue with your school/college/work Microsoft or Google account. If your organisation uses single sign-on, you’ll be taken straight to your dashboard." },
  { q: "Can I use my school/college/work Microsoft or Google account?", a: "Yes. We support sign‑in with Microsoft and Google accounts. Use the account provided by your organisation so your progress and certificates are linked correctly." },
  { q: "What devices can I use to access daisychained?", a: "Any modern browser on laptop, Chromebook, tablet, or mobile works. For the best experience, keep your browser up to date and enable cookies." },
  { q: "How do I view my daisychained digital badges?", a: "Once you finish a module, your certificate will appear in your dashboard under Badges & Certificates. You can open it to view, download, or share whenever you like." },
  { q: "How do I access my daisychained certificates?", a: "Certificates live in your dashboard under Badges & Certificates. You can download them as PDF to upload or share." },
  { q: "Who do I contact if I have a problem logging in?", a: "Start with your organisation’s IT/service desk. If needed, contact our support team and include your name, organisation, and a short description of the issue." },
];

const orgQs = [
  { q: "How does licensing and pricing work?", a: "We license to organisations. Pricing scales with the number of learners and the module bundle you select. Get in touch for a quick quote and options." },
  { q: "How do we get started as an organisation/college/school?", a: "We’ll onboard your organisation, enable SSO (Microsoft or Google), and activate your chosen module packages. You’ll receive an admin view to track uptake and progress." },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(() => new Set());

  const toggle = (i) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="accordion" role="region">
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <div className="ac-item" key={i}>
            <button
              className="ac-trigger"
              aria-expanded={isOpen}
              aria-controls={`ac-panel-${i}`}
              onClick={() => toggle(i)}
            >
              <span>{item.q}</span>
              <span className="ac-icon" aria-hidden="true">
                {isOpen ? "–" : "+"}
              </span>
            </button>
            {isOpen && (
              <div id={`ac-panel-${i}`} className="ac-panel">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Faq() {
  const [searchTerm, setSearchTerm] = useState(""); // ✅ moved inside component

  return (
    <div className="public-page">
      <div className="public-nav-divider" />

      <section className="public-hero">
        <div className="public-container">
          <div className="public-hero-grid">
            <h1 className="hero-title">
              <span className="h1-line1">hey there,</span><br />
              <span className="h1-line2">how can we help?</span>
            </h1>

            <div className="public-search">
              <div className="public-search-wrap">
                <input
                  type="search"
                  className="public-search-input public-search-input--underline"
                  placeholder="search for a question"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") setSearchTerm(""); }}
                  autoComplete="off"
                />
                {searchTerm.length ? (
                  <button
                    type="button"
                    className="public-search-action"
                    aria-label="Clear search"
                    onClick={() => setSearchTerm("")}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M6 6L18 18M18 6L6 18" stroke="#808285" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : (
                  <span className="public-search-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7.5" stroke="#808285" strokeWidth="2" />
                      <path d="M20 20L16.65 16.65" stroke="#808285" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="public-body">
        <div className="public-container">
          <div className="section-header">
            <div className="heading">for daisychained students</div>
          </div>
          <Accordion items={studentQs} />

          <div className="section-header">
            <div className="heading">for organisations</div>
          </div>
          <Accordion items={orgQs} />
        </div>
      </section>
    </div>
  );
}
