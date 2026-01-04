import "./PublicPages.css";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="public-page">
      <div className="public-container">
        <div className="section-header"><div className="heading">Privacy Notice</div></div>

        <div className="public-body">
          <p style={{ padding: "1rem 0" }}>
            This is the Privacy Notice placeholder. Replace this text with the organisation's privacy policy content.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
