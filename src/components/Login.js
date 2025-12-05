import React, { useState } from 'react';
import '../App.css'; 

function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); 
  
  // ⬇️ NEW: Loading State
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 LIVE BACKEND URL
  const API_BASE_URL = "https://cinevault-api-mcpa.onrender.com";

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true); // ⬅️ Start Loading

    const url = isSignup 
      ? `${API_BASE_URL}/api/register/` 
      : `${API_BASE_URL}/api/token/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignup) {
            setSuccessMsg("Account created! Logging you in...");
            setIsSignup(false); 
            setTimeout(() => {
                handleAuth(e); 
            }, 1000);
        } else {
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            onLoginSuccess();
        }
      } else {
        setIsLoading(false); // ⬅️ Stop Loading on API Error
        if (data.username) setError(data.username[0]);
        else if (data.detail) setError(data.detail);
        else setError("Invalid credentials");
      }
    } catch (err) {
      setIsLoading(false); // ⬅️ Stop Loading on Network Error
      setError('Server is waking up... please try again in 10 seconds.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 style={{ marginBottom: '20px' }}>
          {isSignup ? '🚀 Create Account' : '🍿 Welcome Back'}
        </h2>
        
        <form onSubmit={handleAuth}>
          <input
            className="login-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading} // ⬅️ Disable input while loading
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading} // ⬅️ Disable input while loading
            required
          />
          
          {/* ⬇️ ANIMATED BUTTON */}
          <button 
            type="submit" 
            className="btn btn-logout" 
            style={{marginTop: '10px', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer'}}
            disabled={isLoading}
          >
            {isLoading ? (
                <>
                    <span className="spinner"></span> Connecting...
                </>
            ) : (
                isSignup ? 'Sign Up' : 'Login'
            )}
          </button>
        </form>

        {successMsg && <p style={{ color: '#46d369', marginTop: '15px' }}>{successMsg}</p>}
        {error && <p style={{ color: '#e50914', marginTop: '15px' }}>{error}</p>}

        <span className="toggle-link" onClick={() => {
            if(!isLoading) {
                setIsSignup(!isSignup);
                setError('');
                setSuccessMsg('');
            }
        }}>
          {isSignup ? 'Already have an account? Login' : 'New here? Create an account'}
        </span>
      </div>
    </div>
  );
}

export default Login;