import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../styles/auth.css';

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '', color: 'var(--border)' },
    { label: 'Weak', color: 'var(--red)' },
    { label: 'Fair', color: 'var(--amber)' },
    { label: 'Good', color: '#3B82F6' },
    { label: 'Strong', color: 'var(--green)' },
  ];
  return { score, ...map[score] };
}

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const strength = getStrength(form.password);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { username: form.username, email: form.email, password: form.password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
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
          <p className="auth-tagline">Practice adaptive quizzes. Battle friends in real time. Track every improvement.</p>
          <ul className="auth-features">
            {['Non-repeating questions based on your history','Real-time battles with score and timing','Weak area detection per subtopic','Global leaderboard rankings'].map(f => (
              <li key={f}><span className="auth-feat-dot" />{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>Create account</h2>
            <p>Already have one? <Link to="/login">Sign in</Link></p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" type="text" placeholder="e.g. alex_dev" value={form.username} onChange={set('username')} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
              {form.password && (
                <div className="pw-strength">
                  <div className="pw-bars">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="pw-bar" style={{ background: i <= strength.score ? strength.color : 'var(--border)' }} />
                    ))}
                  </div>
                  {strength.label && <span style={{ color: strength.color, fontSize: 11, fontWeight: 600 }}>{strength.label}</span>}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
              {form.confirm && form.password !== form.confirm && (
                <span style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>Passwords do not match</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? <><div className="spinner" /> Creating account…</> : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
