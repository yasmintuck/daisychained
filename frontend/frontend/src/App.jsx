import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CallbackHandler from "./components/CallbackHandler";
import PrivateRoute from "./components/PrivateRoute";
import './index.css';

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Faq from "./pages/Faq";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import Badges from "./pages/Badges";
import ScormPlayer from './components/ScormPlayer';
// Blog pages removed from public MVP


function App() {
  return (
    <div className="app-wrapper">
    <>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/callback" element={<CallbackHandler />} />
  {/* Blog routes removed from public MVP */}


        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/modules"
          element={
            <PrivateRoute>
              <Modules />
            </PrivateRoute>
          }
        />
        <Route
          path="/badges"
          element={
            <PrivateRoute>
              <Badges />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/:slug"
          element={
            <PrivateRoute>
              <ScormPlayer />
            </PrivateRoute>
          }
        />
        {/* dev feedback page removed - feedback modal is integrated into the SCORM player */}
      </Routes>
    </>
    </div>
  );
}

export default App;
