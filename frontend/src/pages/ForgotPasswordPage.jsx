import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async e => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setMsg('Code sent! Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code.');
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async e => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    try {
      await api.post('/auth/verify-reset-code', { email, code });
      setStep(3);
      setMsg('Code verified. Enter new password.');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async e => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      setMsg('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
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
          <h1 className="auth-headline">Reset your<br/>password.</h1>
          <p className="auth-tagline">Enter your email and we'll send you a secure 6-digit verification code to get back into your account.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>Forgot Password</h2>
            <p>Remembered it? <Link to="/login">Sign in here</Link></p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {msg && <div className="alert alert-success" style={{background:'#ECFDF5',color:'#065F46',padding:'12px',borderRadius:'8px',marginBottom:'16px',fontSize:'13px',fontWeight:'500'}}>{msg}</div>}

          {step === 1 && (
            <form className="auth-form" onSubmit={handleSendCode}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
                {loading ? <><div className="spinner" /> Sending code…</> : 'Send Verification Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="auth-form" onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label className="form-label">6-Digit Code</label>
                <input className="form-input" type="text" placeholder="123456" maxLength="6" value={code} onChange={e => setCode(e.target.value)} required autoFocus style={{letterSpacing:'4px',fontSize:'18px',textAlign:'center',padding:'12px'}} />
                <div style={{fontSize:'12px',color:'var(--text-muted)',marginTop:'6px',textAlign:'center'}}>Sent to {email}</div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
                {loading ? <><div className="spinner" /> Verifying…</> : 'Verify Code'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Create new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoFocus minLength="6" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
                {loading ? <><div className="spinner" /> Saving…</> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
