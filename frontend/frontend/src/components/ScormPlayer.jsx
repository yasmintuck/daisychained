import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import './ScormPlayer.css';
import { X as XIcon } from 'lucide-react';

const ScormPlayer = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { user, isLoading } = useAuth0();
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState("90vh");
  const navigate = useNavigate();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showExitFallback, setShowExitFallback] = useState(false);

  const moduleId = location.state?.moduleId;

  useEffect(() => {
    if (!user || !moduleId) return;

    const updateIframeHeight = () => {
      const navbar = document.querySelector(".navbar");
      const navbarHeight = navbar?.offsetHeight || 70;
      const availableHeight = window.innerHeight - navbarHeight;
      setIframeHeight(`${availableHeight}px`);
    };

    updateIframeHeight();

    const resizeObserver = new ResizeObserver(updateIframeHeight);
    const navbar = document.querySelector(".navbar");
    if (navbar) resizeObserver.observe(navbar);

    window.addEventListener("resize", updateIframeHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIframeHeight);
    };
  }, [user, moduleId]);

  if (isLoading || !user || !moduleId) {
    return <p style={{ padding: "2rem" }}>Loading SCORM module...</p>;
  }

  const scormUrl = `/modules/${slug}/index.html?userId=${user.sub}&moduleId=${moduleId}`;

  useEffect(() => {
    // fallback: show exit control after 8s to avoid trapping user if iframe never loads
    const t = setTimeout(() => setShowExitFallback(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setShowExitFallback(false);
  };

  return (
    <div className="scorm-wrapper" style={{ overflow: "hidden", marginTop: "70px" }}>
        {(iframeLoaded || showExitFallback) && (
          <button
            className="scorm-exit-btn"
            aria-label="Close module and return to modules"
            onClick={() => navigate('/dashboard')}
          >
            <XIcon size={20} aria-hidden="true" />
          </button>
        )}

        <iframe
            ref={iframeRef}
            src={scormUrl}
            title="SCORM Module"
            onLoad={handleIframeLoad}
            style={{
              width: "100%",
              height: iframeHeight,
              border: "none",
              display: "block"  // ← Removes tiny inline whitespace
            }}
        />
    </div>
  );
};

export default ScormPlayer;
