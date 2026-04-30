import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getSocket } from '../socket/socket';

export default function BattlePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [topics, setTopics] = useState([]);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ topic_id: '', difficulty: 'medium', num_questions: 10, timer_seconds: 120 });

  useEffect(() => { api.get('/quiz/topics').then(r => setTopics(r.data)); }, []);

  useEffect(() => {
  }, [created, navigate]);

  const copy = (code) => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.topic_id) return setError('Select a topic to continue.');
    setError(''); setCreating(true);
    try {
      const { data } = await api.post('/battle/create', form);
      navigate(`/battle/${data.battleId}`);
    } catch (e) { setError(e.response?.data?.error || 'Failed to create battle.'); }
    finally { setCreating(false); }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return setError('Enter a room code.');
    setError(''); setJoining(true);
    try {
      const { data } = await api.post('/battle/join', { room_code: roomCode.trim().toUpperCase() });
      navigate(`/battle/${data.battleId}`);
    } catch (e) { setError(e.response?.data?.error || 'Failed to join battle.'); }
    finally { setJoining(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Battle</h1>
        <p className="page-subtitle">Challenge someone to a real-time quiz battle.</p>
      </div>

      <div className="battle-tabs">
        <button className={`battle-tab${tab === 'create' ? ' active' : ''}`} onClick={() => { setTab('create'); setCreated(null); setError(''); }}>Create room</button>
        <button className={`battle-tab${tab === 'join' ? ' active' : ''}`} onClick={() => { setTab('join'); setError(''); }}>Join room</button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 18, maxWidth: 480 }}>{error}</div>}

      {tab === 'create' && !created && (
        <div className="battle-form">
          <h2 className="battle-form-title">New battle room</h2>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Topic</label>
            <select className="form-input" value={form.topic_id} onChange={set('topic_id')}>
              <option value="">Select a topic…</option>
              {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="battle-form-grid">
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-input" value={form.difficulty} onChange={set('difficulty')}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Questions</label>
              <select className="form-input" value={form.num_questions} onChange={set('num_questions')}>
                {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Timer</label>
            <select className="form-input" value={form.timer_seconds} onChange={set('timer_seconds')}>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
            </select>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreate} disabled={creating}>
            {creating ? <><div className="spinner" />Creating room…</> : 'Create battle room'}
          </button>
        </div>
      )}



      {tab === 'join' && (
        <div className="battle-form">
          <h2 className="battle-form-title">Join a room</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Enter the 6-character code your opponent shared with you.</p>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Room code</label>
            <input className="form-input" type="text" placeholder="e.g. AB3X7K"
              value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6} autoFocus
              style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, letterSpacing: '0.18em', padding: '12px' }}
            />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleJoin} disabled={joining}>
            {joining ? <><div className="spinner" />Joining…</> : 'Join battle'}
          </button>
        </div>
      )}
    </div>
  );
}
