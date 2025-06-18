import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Weather from './pages/Weather';
import Modules from './pages/Modules'; // <- you’ll create this if you haven’t yet

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Weather />} />
        <Route path="/modules" element={<Modules />} />
      </Routes>
    </Router>
  );
}

export default App;
