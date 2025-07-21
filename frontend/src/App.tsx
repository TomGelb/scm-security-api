import React, { useState } from 'react';
import './App.css';

const PROJECT_NAME = 'SCM Security Scanner';

function App() {
  const [scmUrl, setScmUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScmUrl(e.target.value);
  };

  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/scm-scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scmUrl }),
      });
      if (!response.ok) {
        const errorText = `${response?.status} ${response?.statusText}`;
        throw new Error(errorText ?? `API request failed` );
      }
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <img src={process.env.PUBLIC_URL + '/stevejobsouija.jpg'} alt="Ghost Steve Jobs Ouija Logo" className="custom-logo" />
      <header className="project-label">{PROJECT_NAME}</header>
      <div className="input-section">
        <input
          type="text"
          className="scm-input"
          placeholder="Paste SCM URL here..."
          value={scmUrl}
          onChange={handleInputChange}
        />
        <button className="scan-btn" onClick={handleScan} disabled={loading || !scmUrl}>
          Gitleaks
        </button>
      </div>
      {loading && <div className="loading-bar">Scanning...</div>}
      {error && <div className="error-msg">{error}</div>}
      {result && (
        <pre className="result-display">{result}</pre>
      )}
    </div>
  );
}

export default App;
