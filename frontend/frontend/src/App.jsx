import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import Weather from "./pages/Weather";
import CallbackHandler from "./components/CallbackHandler";
import PrivateRoute from "./components/PrivateRoute"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<CallbackHandler />} />

        {/* Protected Routes */}
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
      </Routes>
    </Router>
  );
}

export default App;