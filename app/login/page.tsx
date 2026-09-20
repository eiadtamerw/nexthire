'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const url = setupMode ? '/api/auth/setup' : '/api/auth/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (!data.ok) {
        setError(data.error || 'Failed');
        return;
      }

      if (setupMode) {
        setSuccess('✅ Admin created! You can login now.');
        setSetupMode(false);
        setPassword('');
        return;
      }

      localStorage.setItem('staffToken', data.token);
      localStorage.setItem('staffExpires', String(data.expiresAt));
      router.push('/dashboard');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Network error');
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-bg-logo">
        <svg viewBox="0 0 130 115" fill="none">
          <circle cx="20" cy="12" r="8" fill="currentColor"/>
          <path d="M 6 26 L 6 92 L 24 92 L 24 56 L 56 92 L 74 92 L 74 26 L 56 26 L 56 62 L 24 26 Z" fill="currentColor"/>
          <path d="M 112 26 L 112 78 Q 112 92 126 92" stroke="currentColor" strokeWidth="18" fill="none" strokeLinecap="round"/>
          <rect x="88" y="52" width="42" height="14" fill="currentColor"/>
          <circle cx="122" cy="108" r="8" fill="currentColor"/>
        </svg>
      </div>

      <div className="login-card">
        <div className="login-icon">
          <svg viewBox="0 0 130 115" fill="none">
            <circle cx="20" cy="12" r="8" fill="currentColor"/>
            <path d="M 6 26 L 6 92 L 24 92 L 24 56 L 56 92 L 74 92 L 74 26 L 56 26 L 56 62 L 24 26 Z" fill="currentColor"/>
            <path d="M 112 26 L 112 78 Q 112 92 126 92" stroke="currentColor" strokeWidth="18" fill="none" strokeLinecap="round"/>
            <rect x="88" y="52" width="42" height="14" fill="currentColor"/>
            <circle cx="122" cy="108" r="8" fill="currentColor"/>
          </svg>
        </div>

        <h1>{setupMode ? 'Create Admin' : 'Staff Login'}</h1>
        <p className="sub">
          {setupMode
            ? 'First-time setup — create the admin account'
            : 'Enter your credentials to access the Dashboard'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Please wait…' : setupMode ? 'Create Admin' : 'Login →'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setSetupMode(!setupMode);
            setError('');
            setSuccess('');
          }}
          style={{
            width: '100%',
            marginTop: 16,
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            fontSize: 12,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {setupMode ? 'Already have an account? Login' : 'First time? Create admin account'}
        </button>
      </div>
    </div>
  );
}