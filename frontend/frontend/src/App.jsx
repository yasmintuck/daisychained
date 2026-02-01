import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import Navbar from "./components/Navbar";
import CallbackHandler from "./components/CallbackHandler";
import PrivateRoute from "./components/PrivateRoute";
import './index.css';

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Faq from "./pages/Faq";
import BookDemo from "./pages/BookDemo";
import CustomContent from "./pages/CustomContent";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import Badges from "./pages/Badges";
import ScormPlayer from './components/ScormPlayer';
// Blog pages removed from public MVP


function App() {
  const location = useLocation();

  // Handle scrolling on route changes:
  // - If the location includes a hash (e.g. /#features) scroll to the target
  //   with an offset for the fixed navbar and move focus for accessibility.
  // - Otherwise, scroll to the top of the page when navigating to a new route.
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // small delay to allow the destination element to mount
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const nav = document.querySelector('.navbar');
          const navH = nav ? nav.getBoundingClientRect().height : 0;
          const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
          window.scrollTo({ top, behavior: 'smooth' });
          // for accessibility, move focus to the target
          el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: true });
        }
      }, 90);
      return () => clearTimeout(t);
    }

    // No hash — ensure we start at the top of the new page when navigating.
    // Use smooth behaviour for nicer UX; adjust to 'auto' if instant jump is preferred.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  return (
    <div className="app-wrapper">
    <>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/faq" element={<Faq />} />
  <Route path="/book-demo" element={<BookDemo />} />
  <Route path="/custom-content" element={<CustomContent />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/cookie-policy" element={<CookiePolicy />} />
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
