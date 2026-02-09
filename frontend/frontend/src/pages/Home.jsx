import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import "./PublicPages.css";
import { Plug, Smartphone, Accessibility, Users, BarChart3, Bell, CheckCircle } from 'lucide-react';
import Feature1 from "../assets/hero/features1.svg";
import Feature2 from "../assets/hero/features2.svg";
import Feature3 from "../assets/hero/features3.svg";
import Feature4 from "../assets/hero/features4.svg";
import Feature5 from "../assets/hero/features5.svg";
import DaisyApp from "../assets/hero/daisy-app.svg";
import SparkingTile from "../assets/hero/sparking-conversations.svg";
import Daisy1 from "../assets/hero/daisy-app-1.svg";
import Daisy2 from "../assets/hero/daisy-app-2.svg";
import Daisy3 from "../assets/hero/daisy-app-3.svg";
import Sc1 from "../assets/hero/sc-1.svg";
import Sc2 from "../assets/hero/sc-2.svg";
import Sc3 from "../assets/hero/sc-3.svg";

import BgDoodle from "../assets/hero/background-doodle.svg";
import Footer from "../components/Footer";
import TestimonialCarousel from "../components/TestimonialCarousel";


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
          <div className="ac-item reveal" key={i}>
            <button
              className="ac-trigger"
              aria-expanded={isOpen}
              aria-controls={`ac-panel-${i}`}
              onClick={() => toggle(i)}
            >
              <span>{item.q}</span>
              <span className="ac-icon" aria-hidden="true">{isOpen ? "–" : "+"}</span>
            </button>
            {isOpen && (
              <div id={`ac-panel-${i}`} className="ac-panel">{item.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const studentQs = [
  { q: "How do I log in to daisychained?", a: "Click log in in the top right and continue with your school/college/work Microsoft or Google account. If your organisation uses single sign-on, you’ll be taken straight to your dashboard." },
  { q: "Can I use my school/college/work Microsoft or Google account?", a: "Yes. We support sign‑in with Microsoft and Google accounts. Use the account provided by your organisation so your progress and certificates are linked correctly." },
  { q: "What devices can I use to access daisychained?", a: "Any modern browser on laptop, Chromebook, tablet, or mobile works. For the best experience, keep your browser up to date and enable cookies." },
  { q: "How do I view my daisychained digital badges?", a: "Once you finish a module, your certificate will appear in your dashboard under Badges & Certificates. You can open it to view, download, or share whenever you like." },
  { q: "How do I access my daisychained certificates?", a: "Certificates live in your dashboard under Badges & Certificates. You can download them as PDF to upload or share." },
  { q: "Do I have to complete modules in one go?", a: "No. You can complete modules in stages, and your progress will be saved." },
  { q: "How long does a daisychained module take to complete?", a: "Modules are designed to be completed in a short sitting. Exact timings vary, but most can be finished in under 15 minutes." },
];

const orgQs = [
  { q: "How does licensing and pricing work?", a: "We license to organisations. Pricing scales with the number of learners and the module bundle you select. Fill out the book a demo form or email humans@daisychained.co.uk for a quick quote and options." },
  { q: "How do we get started as an organisation/college/school?", a: "We’ll onboard your organisation, working alongside your IT team to activate your users' accounts. You’ll receive an organisational dashboard to track uptake and progress." },
  { q: "Is daisychained an LMS?", a: "No. daisychained complements existing systems by focusing on short, human learning and clear oversight, without replacing your core platforms." },
  { q: "What data and reporting do we get?", a: "Organisations have access to clear reporting on engagement, progress, and completion at individual, team, or cohort level." },
];

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const featureRefs = useRef([]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // simple intersection to add visible class for feature cards
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // add a tiny delay so the browser paints the initial off-screen
          // state; use a double rAF for more reliable frame timing than
          // setTimeout so the CSS transition will animate smoothly.
          requestAnimationFrame(() => requestAnimationFrame(() => {
            e.target.classList.add('visible');
          }));
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    featureRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // global reveal observer: sweeps elements up as they enter the viewport
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // ensure initial state is painted, then add visible using
          // double rAF to guarantee the transition animates
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

  // Scroll when navigated with either a fragment hash or a location.state request.
  // Using navigation state allows the footer to request a scroll-with-offset
  // while avoiding the browser's native fragment jump which can override JS scrolling.
  useEffect(() => {
    const targetFromState = location && location.state && location.state.scrollTo ? `#${location.state.scrollTo}` : null;
    const anchor = targetFromState || (location && location.hash ? location.hash : null);
    if (!anchor) return;

    let cancelled = false;

    const performScroll = () => {
        // wait for paint/layout to stabilise
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (cancelled) return;
        const el = document.querySelector(anchor);
        if (!el) return;
        // compute header height dynamically to avoid hard-coded offsets
        const header = document.querySelector('.navbar') || document.querySelector('header') || null;
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const extra = 8; // small breathing room
        const offset = Math.max(0, headerH + extra);
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        // a follow-up retry after layout changes (e.g. sticky headers, curves)
        setTimeout(() => {
          if (cancelled) return;
          const el2 = document.querySelector(anchor);
          if (!el2) return;
          const header2 = document.querySelector('.navbar') || document.querySelector('header') || null;
          const headerH2 = header2 ? header2.getBoundingClientRect().height : 0;
          const offset2 = Math.max(0, headerH2 + 8);
          const top2 = el2.getBoundingClientRect().top + window.pageYOffset - offset2;
          window.scrollTo({ top: top2, behavior: 'smooth' });
        }, 300);
        // clear the navigation state so subsequent navigations don't re-trigger
        if (targetFromState) {
          navigate(location.pathname, { replace: true, state: {} });
        }
      }));
    };

    // attempt initial scroll after a tiny timeout too (covers route transition)
    const t = setTimeout(performScroll, 60);
    return () => { cancelled = true; clearTimeout(t); };
  }, [location, navigate]);

  

  // curated module highlights (keeps `quote`/`who` keys so carousel remains compatible)
  const moduleHighlights = [
    { quote: "Human skills that make people effective at work, not just qualified.", who: "Employability" },
    { quote: "Behaviour, boundaries, and judgement in digital spaces.", who: "Life online" },
    { quote: "Skills for handling pressure, change, and real-world demands.", who: "Wellbeing & resilience" },
    { quote: "Clear, respectful communication in work and everyday life.", who: "Relationships & communication" },
    { quote: "Understanding who we are and how we show up with others.", who: "Identity & belonging" },
    { quote: "Thinking clearly when situations are complex or uncomfortable.", who: "Judgement & decision-making" },
    { quote: "Skills for navigating transitions, uncertainty, and new expectations.", who: "Change & adaptation" },
  ];

  const features = [
    {
      Icon: Smartphone,
      img: Feature1,
      title: 'mobile first',
      text: 'Built for how people actually live and learn. Accessible anytime, anywhere, without specialist kit or fixed spaces.'
    },
    {
      Icon: Accessibility,
      img: Feature2,
      title: 'flexible by design',
      text: 'Accessibility, usability, and inclusive language aren’t add-ons. They’re built in from the start, so learning works for more people, more often.'
    },
    {
      Icon: Users,
      img: Feature3,
      title: 'designed for you, not off the shelf',
      text: 'We work with you to curate and structure material around your context, your people, and your priorities.'
    },
    {
      Icon: BarChart3,
      img: Feature4,
      title: 'simple reporting that works',
      text: 'Clear visibility of engagement and progress, without extra admin or complexity.'
    },
    {
      Icon: Bell,
      img: Feature5,
      title: 'nudges and pokes',
      text: 'A structured reminder approach that balances encouragement with urgency when timing matters.'
    },
  ];

  return (
    <div className="public-page" id="top">

      {/* Hero / banner - full width dark band with rounded bottom edge */}
  <section className="public-hero homepage-hero">
        <div className="public-hero-inner">
          <div className={`hero-left ${loaded ? 'visible' : ''}`}>
            <h1 className="hero-title reveal">Sparking conversations</h1>
            <p className="lead reveal">The most powerful learning rarely comes from textbooks. It comes from lived experience, honest conversations, and topics traditional education often overlooks. <span className="brand-accent">daisychained</span> delivers bite-sized learning that builds employable, resilient human skills for real life.</p>
            <div className="hero-cta reveal">
              <a href="/book-demo" className="primary-cta">Book a demo</a>
            </div>
          </div>

          <div className="hero-right">
            {/* placeholder app visual */}
            <div className={`hero-visual ${loaded ? 'visible' : ''}`} aria-hidden>
              <div className="hero-visual-inner">
                <img src={DaisyApp} alt="DaisyChained app preview" className="hero-visual-img" />
                {/* decorative overlay graphics that animate in after the phone */}
                <img src={Daisy1} alt="" aria-hidden="true" className="hero-overlay overlay-1" />
                <img src={Daisy2} alt="" aria-hidden="true" className="hero-overlay overlay-2" />
                <img src={Daisy3} alt="" aria-hidden="true" className="hero-overlay overlay-3" />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* SVG curve placed outside the hero so it cleanly separates the hero from the next section */}
      <svg className="hero-curve" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,0 C360,200 1080,200 1440,0 L1440,220 L0,220 Z" />
      </svg>

      {/* What is daisychained? */}
      <section className="public-body section-pt-2">
        {/* decorative background doodle placed behind the container so it can be
            full-bleed; positioned absolute relative to the section */}
        <div className="sc-bg" aria-hidden="true" style={{ backgroundImage: `url(${BgDoodle})` }} />
        <div className="public-container">
          <div className="section-header heading-large reveal">
            {/*<img src={SparkingTile} alt="Sparking conversations" className="section-tile" />*/}
            <div className="heading">Tackling taboo topics</div>
          </div>
          <p className="center-muted reveal">Some topics don’t fit neatly into traditional education or training, but they shape how people think, behave, and connect with the world around them. These short modules tackle and confront real issues head-on, creating space for honest, informed conversations about life on and offline.</p>

          <div className="three-grid">
            <div aria-hidden="true" className="reveal">
              <img src={Sc1} alt="" aria-hidden="true" />
            </div>
            <div aria-hidden="true" className="reveal">
              <img src={Sc2} alt="" aria-hidden="true" />
            </div>
            <div aria-hidden="true" className="reveal">
              <img src={Sc3} alt="" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* Founder / experience section (full-bleed black) - constrained content only */}
      <section id="founder-section" className="public-body founder-band" aria-labelledby="founder-heading">
        {/* subtle top wave to give the band slightly wonky edges */}
        <svg className="founder-curve top" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C240,28 600,30 900,32 C1180,34 1320,36 1440,40 L1440,0 L0,0 Z" />
        </svg>
        <div className="public-container">
          <div className="founder-columns">
            <div className="founder-left reveal" aria-hidden>
              <img src="/images/deb-millar-headshot.png" alt="Debo Millar OBE" className="founder-headshot" />
              <h3 className="founder-left-name reveal">Deb Millar OBE</h3>
              <div className="founder-left-nickname reveal">keynote speaker | educator | co-Founder</div>
            </div>
            <div className="founder-right reveal">
              <h2 id="founder-heading" className="founder-title">We’re new here, but this isn’t new to us</h2>
              <div className="founder-body">
                  <p><span className="brand-accent">daisychained</span> is shaped by decades of work at the sharp end of education and digital change. We’ve designed and delivered large-scale programmes, worked with national partners, and built tools that stand up in real-world learning, not just on paper.</p>

                  <p>Co-founded by Deb Millar, the platform is grounded in ethical, inclusive practice, focused on removing barriers and helping people build confidence and capability through learning that’s handled with care.</p>
                </div>

                <h3 className="trust-heading reveal">Why organisations choose to work with us</h3>
                <ul className="trust-bullets reveal">
                  <li><CheckCircle className="trust-icon" /> Built by educators with decades of experience at the sharp end of digital change</li>
                  <li><CheckCircle className="trust-icon" /> Proven delivery across large-scale programmes and national partnerships</li>
                  <li><CheckCircle className="trust-icon" /> Designed for real-world learning, not theory or tick-box training</li>
                  <li><CheckCircle className="trust-icon" /> Grounded in ethical, inclusive practice that removes barriers and builds confidence</li>
                </ul>
            </div>
          </div>
        </div>
        {/* subtle bottom wave overlapping into the following white section */}
        <svg className="founder-curve bottom" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,0 C240,8 600,16 900,18 C1180,20 1320,14 1440,0 L1440,40 L0,40 Z" />
        </svg>
      </section>




      {/* Key features */}
      <section className="public-body">
        <div className="public-container" id="features">
          <div className="section-header heading-large reveal"><div className="heading">Designed by educators...</div></div>

          {/* Top row: 2 columns, centered and sized to match one-third column width */}
          <div className="features-grid-top">
            {features.slice(0,2).map((f, i) => {
              const idx = i; // preserve mapping into featureRefs
              return (
                <div key={idx} ref={el => featureRefs.current[idx] = el} className="feature-card reveal">
                  <div className="feature-icon">
                    {f.img ? (
                      <img src={f.img} alt={`${f.title} icon`} aria-hidden="false" />
                    ) : (
                      <f.Icon size={100} />
                    )}
                  </div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.text}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom row: 3 columns - matches standard features grid */}
          <div className="features-grid">
            {features.slice(2).map((f, i) => {
              const idx = i + 2;
              return (
                <div key={idx} ref={el => featureRefs.current[idx] = el} className="feature-card reveal">
                  <div className="feature-icon">
                    {f.img ? (
                      <img src={f.img} alt={`${f.title} icon`} aria-hidden="false" />
                    ) : (
                      <f.Icon size={100} />
                    )}
                  </div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="public-body testimonial-band">
        {/* decorative top curve that overlaps the previous section */}
        <svg className="testimonial-curve top" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,80 C160,20 360,0 720,18 C1060,36 1180,70 1440,30 L1440,0 L0,0 Z" />
        </svg>
        <div className="public-container">
          <div className="section-header heading-large reveal"><div className="heading">Learning that bites</div></div>
          <p className="center-muted reveal">Short, focused learning built for real life. Designed to fit, not overwhelm.</p>
          <div className="section-gap">
            <TestimonialCarousel testimonials={moduleHighlights} speed={60} ariaLabel="Module themes and learning types" />
          </div>
        </div>
        {/* decorative bottom curve that overlaps into the next section; using a different, asymmetric path */}
        <svg className="testimonial-curve bottom" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,0 C120,20 320,60 680,32 C1040,6 1220,28 1440,48 L1440,100 L0,100 Z" />
        </svg>
      </section>

      {/* FAQs */}
      <section className="public-body" id="faqs">
        <div className="public-container">
          <div className="section-header heading-large reveal"><div className="heading">FAQs</div></div>
          <div className="section-gap">
            <div className="section-gap-md">
              <div className="faq-heading reveal">For daisychained students</div>
              <Accordion items={studentQs} />
            </div>

            <div>
              <div className="faq-heading reveal">For organisations</div>
              <Accordion items={orgQs} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
