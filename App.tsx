import { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setMessage("Server Status: " + data.status))
      .catch(() => setMessage("Server error"));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Meri Website</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
