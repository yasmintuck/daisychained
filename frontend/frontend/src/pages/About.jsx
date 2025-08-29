// src/pages/About.jsx
import "./PublicPages.css";

export default function About() {
  return (
    <div className="public-page about-page">
      <div className="public-team-container">
        {/* HERO */}
        <div className="team-hero">
          <div className="public-container-team team-hero-inner">
            <p className="team-heading">meet the team</p>

            <div className="team-hero-art">
              {/* image is in public/, so reference by absolute path */}
              {/* <img src="/images/meet-the-team2.png" alt="daisychained team line illustration" /> */}
              <img
                className="team-hero-img"
                src="/images/meet-the-team2.png"
                alt="daisychained team line illustration"
                width="1665"            // intrinsic size of the source image
                height="344"
                fetchpriority="high"    // load ASAP (avoid late pop-in)
                decoding="async"
              />
            </div>
          </div>
        </div>
        <div className="team-grid">
          {/* Deb */}
          <article className="team-card">
            <img className="team-avatar" src="/images/deb.png" alt="Deb — line illustration" />
            <h3 className="team-name">deb millar</h3>
            <p className="team-role">
              co-founder <span style={{ color: "white" }}>/</span> educator{" "}
              <span style={{ color: "white" }}>/</span> digital instigator
            </p>
            <p className="team-body">
              Spent over 30 years in education, teaching, leading, and challenging the status quo when it holds people back. She
              co-founded <b>daisychained</b> to create the kind of learning that actually sticks: short, smart, and made for real life.
            </p>
            <p className="team-body">
              Known across the sector as DigiDeb, she’s spent years helping educators and learners navigate the digital shift,
              not with jargon, but with practical tools, bold thinking, and a lot of heart.
            </p>
            <p className="team-body">
              You’ll usually find her testing new ideas, mentoring teams, or cutting through the noise about what education really
              needs… always with purpose, and usually with a mug of hot water and lemon.
            </p>
          </article>

          {/* San */}
          <article className="team-card">
            <img className="team-avatar" src="/images/san.png" alt="San — line illustration" />
            <h3 className="team-name">san stapleton</h3>
            <p className="team-role">
              co-founder <span style={{ color: "white" }}>/</span> educator{" "}
              <span style={{ color: "white" }}>/</span> digital instigator
            </p>
            <p className="team-body">Blurb required…</p>
          </article>

          {/* Yas */}
          <article className="team-card">
            <img className="team-avatar" src="/images/yas.png" alt="Yas — line illustration with daisy" />
            <h3 className="team-name">yas tuck</h3>
            <p className="team-role">
              co-founder <span style={{ color: "white" }}>/</span> educator{" "}
              <span style={{ color: "white" }}>/</span> digital instigator
            </p>
            <p className="team-body">
              Born and raised in the north-east of England and growing up seeing first-hand how limited opportunities can shape
              young people’s futures. She co-founded <b>daisychained</b> to give something back, creating learning that fills the gaps,
              sparks curiosity, and helps young people see the potential they didn’t know they had.
            </p>
            <p className="team-body">
              With a background in computer and data science, and over a decade in education as a teacher, technologist, and
              instructional designer, she leads the tech side of <b>daisychained</b>. She brings together digital innovation, design, and
              a knack for making complex things simple, building products that are smart, accessible, and designed to make
              learning feel easy and enjoyable.
            </p>
            <p className="team-body">
              For her, it’s all about connection — between people, ideas, and opportunities — and making sure no one is left behind.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
