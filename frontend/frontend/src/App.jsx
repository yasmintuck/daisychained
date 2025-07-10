import { Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "./components/Navbar";
import CallbackHandler from "./components/CallbackHandler";
import PrivateRoute from "./components/PrivateRoute";
import './index.css';

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Faq from "./pages/Faq";
import Blog from "./pages/Blog";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import Weather from "./pages/Weather";
import Badges from "./pages/Badges";

function App() {
  // const { isLoading } = useAuth0();

  // if (isLoading) {
  //   return (
  //     <div className="spinner-wrapper">
  //       <img src="/logo.png" alt="Loading..." className="spinner" />
  //     </div>
  //   );
  // }  
  const { isLoading } = useAuth0();

  return (
    <div className="app-wrapper">
    <>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/callback" element={<CallbackHandler />} />

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
          path="/weather"
          element={
            <PrivateRoute>
              <Weather />
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
      </Routes>
    </>
    </div>
  );
}

export default App;
