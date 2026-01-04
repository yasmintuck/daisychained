import "./PublicPages.css";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    <div className="public-page">
      <div className="public-container">
        <div className="section-header"><div className="heading">Terms & Conditions</div></div>

        <div className="public-body">
          <p style={{ padding: "1rem 0" }}>
            This is the Terms and Conditions placeholder. Replace this text with the website terms.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
