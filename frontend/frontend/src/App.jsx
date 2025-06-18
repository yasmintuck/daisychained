import { useEffect, useState } from 'react';
import { getWeather } from './api';
import './App.css';

function App() {
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getWeather()
      .then(data => setForecast(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <>
      <h1>daisychained Weather</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {forecast.map((entry, i) => (
          <li key={i}>
            {entry.date}: {entry.summary} ({entry.temperatureC}°C)
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
