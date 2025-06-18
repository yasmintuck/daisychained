import React, { useEffect, useState } from 'react';

function Modules() {
  const [modules, setModules] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/modules`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setModules(data))
      .catch(err => setError(err.message));
      console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Available Modules</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {modules.length === 0 && !error && <p>No modules found.</p>}
      <ul>
        {modules.map((mod) => (
          <li key={mod.moduleId}>
            <strong>{mod.moduleTitle}</strong>: {mod.moduleDescription}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Modules;