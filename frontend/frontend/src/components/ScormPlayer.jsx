import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";
import './ScormPlayer.css';
import { X as XIcon } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const ScormPlayer = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { user, isLoading, getAccessTokenSilently } = useAuth0();
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState("90vh");
  const navigate = useNavigate();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showExitFallback, setShowExitFallback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTriggered, setFeedbackTriggered] = useState(false);

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

  useEffect(() => {
    // Watch the iframe content for "Module Complete" text (modules are same-origin)
    if (!iframeLoaded || !iframeRef.current || feedbackTriggered) return;

    const iframe = iframeRef.current;
    let observer;
    let messageHandler;

    try {
      const body = iframe.contentDocument?.body;
      if (!body) return;

      const checkIfComplete = () => {
        try {
          const bodyText = body.innerText || body.textContent || '';
          if (bodyText.includes('Module Complete')) {
            setShowFeedback(true);
            setFeedbackTriggered(true);
          }
        } catch (err) {
          // access may fail if iframe navigates cross-origin; ignore
        }
      };

      // Initial check
      checkIfComplete();

      // Listen for postMessage from the iframe as a cross-origin-friendly signal
      messageHandler = (ev) => {
        try {
          const data = ev?.data;
          if (!data) return;
          if (typeof data === 'string' && data.includes('Module Complete')) {
            setShowFeedback(true);
            setFeedbackTriggered(true);
          }
          // optionally accept objects like { type: 'scorm', status: 'complete' }
          if (typeof data === 'object' && (data.type === 'scorm' || data.type === 'module') && (data.status === 'complete' || data.event === 'complete')) {
            setShowFeedback(true);
            setFeedbackTriggered(true);
          }
        } catch (err) { /* ignore */ }
      };
      window.addEventListener('message', messageHandler);

      // Observe mutations to detect when completion text appears
      observer = new MutationObserver(() => checkIfComplete());
      observer.observe(body, { childList: true, subtree: true, characterData: true });

      // Also poll occasionally as a fallback
      const t = setInterval(checkIfComplete, 2000);

      return () => {
        observer?.disconnect();
        clearInterval(t);
        window.removeEventListener('message', messageHandler);
      };
    } catch (err) {
      // ignore errors (cross-origin, etc.)
      console.debug('Could not observe iframe body for completion text', err);
    }
  }, [iframeLoaded, feedbackTriggered]);

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
        {/* Feedback modal — only shown when triggered by completion detection */}
  <FeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} moduleId={moduleId} getAccessTokenSilently={getAccessTokenSilently} />
    </div>
  );
};

export default ScormPlayer;
