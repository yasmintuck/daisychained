import { useEffect, useRef, useState } from "react";
import "./PublicPages.css";
import { Plug, Smartphone, Accessibility, Users, BarChart3, Bell } from 'lucide-react';
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
  { q: "Who do I contact if I have a problem logging in?", a: "Start with your organisation’s IT/service desk. If needed, contact our support team and include your name, organisation, and a short description of the issue." },
];

const orgQs = [
  { q: "How does licensing and pricing work?", a: "We license to organisations. Pricing scales with the number of learners and the module bundle you select. Get in touch for a quick quote and options." },
  { q: "How do we get started as an organisation/college/school?", a: "We’ll onboard your organisation, enable SSO (Microsoft or Google), and activate your chosen module packages. You’ll receive an admin view to track uptake and progress." },
];

export default function Home() {
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

  

  // sample testimonials for testing the carousel
  const testimonials = [
    { quote: "Daisychained helped our students engage with sensitive topics in a safe way.", who: "Head of Pastoral, Example School" },
    { quote: "Great UX and clear analytics for our cohort leads.", who: "Head of Digital Learning" },
    { quote: "Modules are concise, modern and co-created with educators.", who: "Deputy Principal" },
    { quote: "A brilliant resource for guided conversations — quick to assign and easy to track.", who: "Pastoral Lead" },
    { quote: "Learners actually complete the modules and reflect on the topics — meaningful outcomes.", who: "Assistant Head" },
    { quote: "Saved our team hours on classroom prep while improving participation.", who: "Head of Year" },
    { quote: "Clear structure and lovely design; students found it approachable.", who: "PE Teacher" },
    { quote: "Integrates well with our LMS and gives great insights into student progress.", who: "Digital Learning Manager" },
    { quote: "Supports sensitive conversations with care and practical guidance.", who: "School Counsellor" },
    { quote: "Quick to deploy and adaptable to our whole-school approach.", who: "Deputy Principal (Operations)" },
  ];

  const features = [
    {
      Icon: Smartphone,
      img: Feature1,
      title: 'mobile first',
      text: 'Designed for how learners actually learn. No waiting for computer rooms or specialist devices - accessible anytime, anywhere.'
    },
    {
      Icon: Accessibility,
      img: Feature2,
      title: 'flexible by design',
      text: 'Because access isn’t optional. Built with accessibility, usability, and inclusive language at the core, from the start.'
    },
    {
      Icon: Users,
      img: Feature3,
      title: 'your personal development team',
      text: 'Tell us the problem - we design the learning. Bespoke content built around your context, ready for you to deliver with confidence.'
    },
    {
      Icon: BarChart3,
      img: Feature4,
      title: 'smart reporting',
      text: 'If there’s no evidence, did it even happen? Track engagement, completions, and progress clearly, without spreadsheets or guesswork.'
    },
    {
      Icon: Bell,
      img: Feature5,
      title: 'nudge n pokes',
      text: 'Structure without pressure. Set deadlines, send reminders, and gently nudge learners to stay on track.'
    },
  ];

  return (
    <div className="public-page" id="top">

      {/* Hero / banner - full width dark band with rounded bottom edge */}
  <section className="public-hero homepage-hero">
        <div className="public-hero-inner">
          <div className={`hero-left ${loaded ? 'visible' : ''}`}>
            <h1 className="hero-title reveal">Tackling taboo topics</h1>
            <p className="lead reveal">At <span className="brand-accent">daisychained</span>, we believe that the best learning happens in the gaps... in the spaces traditional education often overlooks. We’re educators first, and we’re building a future where everyone can access bite-sized, brilliant learning that’s human, hopeful, and full of joy.</p>
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
            <img src={SparkingTile} alt="Sparking conversations" className="section-tile" />
            <div className="heading">Sparking conversations</div>
          </div>
          <p className="center-muted reveal">Some topics don’t fit neatly into lessons, but they shape how young people think, behave, and relate to the world around them. These short modules are designed to open up honest, informed conversations around the real issues influencing life online and offline.</p>

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
      <section className="public-body founder-band" aria-labelledby="founder-heading">
        {/* subtle top wave to give the band slightly wonky edges */}
        <svg className="founder-curve top" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C240,28 600,30 900,32 C1180,34 1320,36 1440,40 L1440,0 L0,0 Z" />
        </svg>
        <div className="public-container">
          <div className="founder-columns">
            <div className="founder-left reveal" aria-hidden>
              <img src="/images/deb-millar-headshot.png" alt="Deborah Millar OBE" className="founder-headshot" />
              <h3 className="founder-left-name reveal">Deborah Millar OBE</h3>
              <div className="founder-left-nickname reveal">keynote speaker | educator | co-Founder</div>
            </div>
            <div className="founder-right reveal">
              <h2 id="founder-heading" className="founder-title">We’re new here, but this isn’t new to us...</h2>
              <div className="founder-body">
                <p><b>daisychained</b> is a new platform, shaped by decades of experience at the sharp end of education and digital change. We’ve built and led large-scale programmes, worked with national funding bodies, and delivered tools that hold up in real classrooms, not just on pa per.</p>

                <p>It’s co-founded by <span className="brand-accent">Deborah Millar OBE</span>, a nationally recognised digital leader whose work has been acknowledged through numerous major personal awards, including the Global EdTech Lifetime Achievement Award (2024), Pearson Digital Innovator of the Year (2024), and multiple Association of Colleges (AOC) Beacon Awards for Effective Use of Digital Technology.</p>

                <p>Deb is known for leading inclusive, ethical digital change - removing barriers, widening access, and helping educators use technology in ways that genuinely improve learning and confidence. Her work has influenced practice across 100+ education and training organisations nationwide.</p>

                <p><b>daisychained</b> grew out of that experience. From seeing the same gaps appear again and again - the conversations that matter, the skills learners are expected to just "pick up", and the moments education doesn’t always make space for.</p>

                <p>This platform exists to make those moments easier to open, easier to trust, and easier to deliver well.</p>
              </div>
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
          <div className="section-header heading-large reveal"><div className="heading">What our customers say...</div></div>
          <p className="center-muted reveal">Check out some of our favourite comments and mentions from the daisy community.</p>
          <div className="section-gap">
            <TestimonialCarousel testimonials={testimonials} speed={60} />
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
          <div className="section-header heading-large reveal"><div className="heading">faqs</div></div>
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
