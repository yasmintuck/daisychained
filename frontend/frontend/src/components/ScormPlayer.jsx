import { useParams, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";

const ScormPlayer = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { user, isLoading } = useAuth0();
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState("90vh");

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

  return (
    <div style={{ overflow: "hidden" }}>
        <iframe
            ref={iframeRef}
            src={scormUrl}
            title="SCORM Module"
            style={{
            width: "100%",
            height: iframeHeight,
            border: "none",
            display: "block"  // ← Removes tiny inline whitespace
            }}
        ></iframe>
    </div>
  );
};

export default ScormPlayer;
