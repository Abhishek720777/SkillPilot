import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const TOPIC_META = {
  Java:     { color: '#E85D04', bg: '#FFF4E6', border: '#FFD8A8', desc: 'OOP, Collections, Exceptions' },
  Python:   { color: '#2D6A4F', bg: '#E9F5EE', border: '#B7DFC8', desc: 'Basics, OOP, Data Structures' },
  Database: { color: '#1565C0', bg: '#E3F0FF', border: '#AACCF5', desc: 'SQL Joins, Indexing, Normalization' },
  Aptitude: { color: '#6B21A8', bg: '#F3E8FF', border: '#D8B4FE', desc: 'Quantitative, Logical Reasoning' },
};

export default function PracticePage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [step, setStep] = useState(1); // 1=topic, 2=subtopic, 3=count
  const [sel, setSel] = useState({ topic: null, subtopic: null, num: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/quiz/topics').then(r => setTopics(r.data)); }, []);

  const pickTopic = (t) => {
    setSel({ topic: t, subtopic: null, num: 10 });
    setStep(2);
  };

  const pickSubtopic = (s) => {
    setSel(p => ({ ...p, subtopic: s }));
    setStep(3);
  };

  const handleStart = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/quiz/session/start', {
        topic_id: sel.topic._id,
        subtopic_id: sel.subtopic._id,
        num_questions: sel.num,
      });
      navigate(`/quiz/${data.sessionId}`, { state: { questions: data.questions } });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to start. Try again.');
      setLoading(false);
    }
  };

  const th = sel.topic ? (TOPIC_META[sel.topic.name] || { color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', desc: '' }) : null;

  return (
    <div className="page">

      {/* Header with breadcrumb */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em' }}>Practice</h1>
        {/* Breadcrumb trail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <span
            onClick={() => { if (step > 1) { setStep(1); setSel({ topic: null, subtopic: null, num: 10 }); } }}
            style={{ fontSize: 12, color: step === 1 ? 'var(--text-muted)' : 'var(--primary)', fontWeight: 500, cursor: step > 1 ? 'pointer' : 'default' }}
          >
            Topic
          </span>
          {sel.topic && <>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2l4 3-4 3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span
              onClick={() => { if (step > 2) { setStep(2); setSel(p => ({ ...p, subtopic: null })); } }}
              style={{ fontSize: 12, color: step === 2 ? 'var(--text-muted)' : step > 2 ? 'var(--primary)' : th?.color, fontWeight: 600, cursor: step > 2 ? 'pointer' : 'default' }}
            >
              {sel.topic.name}
            </span>
          </>}
          {sel.subtopic && <>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2l4 3-4 3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 12, color: step === 3 ? 'var(--text-muted)' : th?.color, fontWeight: 600 }}>
              {sel.subtopic.name}
            </span>
          </>}
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* ── STEP 1: Topic ── */}
      {step === 1 && (
        <div style={{ animation: 'fadeUp 0.2s ease both' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Choose a topic to practice.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10, maxWidth: 860 }}>
            {topics.map(t => {
              const m = TOPIC_META[t.name] || { color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', desc: '' };
              return (
                <button key={t._id} onClick={() => pickTopic(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 18px',
                    background: 'white', border: '1.5px solid var(--border)',
                    borderRadius: 12, cursor: 'pointer',
                    transition: 'all 0.15s', textAlign: 'left', outline: 'none',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = m.color;
                    e.currentTarget.style.background = m.bg;
                    e.currentTarget.style.transform = 'translateX(3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {/* Color swatch */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: m.bg, border: `1.5px solid ${m.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 900, color: m.color, letterSpacing: '0.02em',
                  }}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.desc}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.subtopics?.length} subtopics</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 2: Subtopic ── */}
      {step === 2 && sel.topic && (
        <div style={{ animation: 'fadeUp 0.2s ease both', maxWidth: 560 }}>
          {/* Topic context chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 20,
            background: th.bg, border: `1px solid ${th.border}`,
            marginBottom: 18,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5,
              background: th.color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white',
            }}>
              {sel.topic.name.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: th.color }}>{sel.topic.name}</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Which subtopic do you want to focus on?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sel.topic.subtopics.map((s, i) => (
              <button key={s._id} onClick={() => pickSubtopic(s)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', background: 'white',
                  border: '1.5px solid var(--border)', borderRadius: 10,
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  outline: 'none', width: '100%',
                  animationDelay: `${i * 40}ms`,
                  animation: 'fadeUp 0.2s ease both',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = th.color;
                  e.currentTarget.style.background = th.bg;
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', background: th.color, flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{s.name}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: Count + Start ── */}
      {step === 3 && sel.subtopic && (
        <div style={{ animation: 'fadeUp 0.2s ease both', maxWidth: 500 }}>
          {/* Context chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {[sel.topic.name, sel.subtopic.name].map((label, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 11px', borderRadius: 20,
                background: th.bg, border: `1px solid ${th.border}`,
                fontSize: 12, fontWeight: 600, color: th.color,
              }}>
                {i === 0 && <div style={{ width: 16, height: 16, borderRadius: 4, background: th.color, display:'flex',alignItems:'center',justifyContent:'center', fontSize:8, fontWeight:900, color:'white' }}>
                  {sel.topic.name.slice(0,2).toUpperCase()}
                </div>}
                {label}
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>How many questions do you want to answer?</p>

          {/* Number selector — horizontal, larger */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
            {[5, 10, 15, 20].map(n => {
              const active = sel.num === n;
              return (
                <button key={n} onClick={() => setSel(s => ({ ...s, num: n }))}
                  style={{
                    padding: '18px 0', borderRadius: 10, textAlign: 'center',
                    border: `2px solid ${active ? th.color : 'var(--border)'}`,
                    background: active ? th.bg : 'white',
                    cursor: 'pointer', transition: 'all 0.15s', outline: 'none',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 900, color: active ? th.color : 'var(--text-primary)', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>questions</div>
                </button>
              );
            })}
          </div>

          {/* Start button */}
          <button onClick={handleStart} disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 10,
              background: th.color, color: 'white', border: 'none',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              letterSpacing: '-0.01em',
            }}
          >
            {loading
              ? <><div className="spinner" style={{ width: 15, height: 15 }} /> Starting…</>
              : <>Start {sel.num}-question session</>
            }
          </button>

          <button onClick={() => { setStep(2); setSel(p => ({ ...p, subtopic: null })); }}
            style={{
              width: '100%', padding: '10px', marginTop: 10, borderRadius: 10,
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
