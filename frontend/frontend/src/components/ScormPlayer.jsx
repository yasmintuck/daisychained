import { useParams, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const ScormPlayer = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { user, isLoading } = useAuth0();

  const moduleId = location.state?.moduleId;

  if (isLoading || !user || !moduleId) {
    return <p style={{ padding: "2rem" }}>Loading SCORM module...</p>;
  }

  const userId = user.sub.split("|")[1]; // Adjust this if needed for your Auth0 setup
  const scormUrl = `/Modules/${slug}/index.html?userId=${userId}&moduleId=${moduleId}`;

  return (
    <iframe
      src={scormUrl}
      title="SCORM Module"
      style={{ width: "100%", height: "90vh", border: "none" }}
    ></iframe>
  );
};

export default ScormPlayer;
