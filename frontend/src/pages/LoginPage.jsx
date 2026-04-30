import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../styles/auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <svg viewBox="0 0 20 20" fill="white" width="18" height="18"><path d="M10 1L12.5 7.5H19L13.5 11.5L15.5 18.5L10 14.5L4.5 18.5L6.5 11.5L1 7.5H7.5L10 1Z"/></svg>
            </div>
            <span className="auth-brand-name">QuizBattle</span>
          </div>
          <h1 className="auth-headline">Learn, compete,<br/>improve.</h1>
          <p className="auth-tagline">The platform built for learners who want to measure and beat their limits.</p>
          <ul className="auth-features">
            {['Java, Python, Databases, Aptitude & more','Live battle rooms — same questions, different speeds','Per-subtopic accuracy tracking','Global rankings and challenge history'].map(f => (
              <li key={f}><span className="auth-feat-dot" />{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>Sign in</h2>
            <p>New here? <Link to="/register">Create an account</Link></p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <input className="form-input" type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? <><div className="spinner" /> Signing in…</> : 'Sign in'}
            </button>

            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
              <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: '500' }}>or</span>
              <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
