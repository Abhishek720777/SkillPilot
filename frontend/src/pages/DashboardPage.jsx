import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quiz/stats')
      .then(r => {
        setStats(r.data);
        if (r.data?.expHistory?.length) {
          const latestExp = r.data.expHistory[r.data.expHistory.length - 1]?.exp ?? 0;
          updateUser({ exp: latestExp });
        }
      })
      .catch(e => console.error('stats error', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner spinner-primary" style={{ width: 28, height: 28 }} />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const topCards = [
    { label: 'Quizzes', value: stats?.totalQuizzes ?? 0, sub: 'completed', color: 'var(--primary)', bg: 'var(--primary-light)', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2.5" /></svg> },
    { label: 'Battles', value: stats?.totalBattles ?? 0, sub: 'played', color: 'var(--amber)', bg: 'var(--amber-light)', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 8h2.5l1.5-5 3 10 1.5-5H13" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg> },
    { label: 'Wins', value: stats?.battleWins ?? 0, sub: 'battles won', color: 'var(--green)', bg: 'var(--green-light)', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="7" width="3" height="8" rx="1" /><rect x="6" y="4" width="3" height="11" rx="1" /><rect x="11" y="1" width="3" height="14" rx="1" /></svg> },
    { label: 'Win Rate', value: `${stats?.winRate ?? 0}%`, sub: 'multi-player', color: 'var(--violet)', bg: 'var(--violet-light)', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 10l4-4 3 3 5-6" /></svg> },
  ];

  const rawHistory = stats?.expHistory || [];
  const expData = [
    { date: 'Start', exp: 0 },
    ...rawHistory.map(d => ({
      date: new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      exp: d.exp
    }))
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em' }}>{greeting}, {user?.username}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Here is your professional learning overview.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--primary-light)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--primary)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            E
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>EXP Level</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary-dark)', lineHeight: 1 }}>{stats?.expHistory?.length ? stats.expHistory[stats.expHistory.length - 1].exp : (user?.exp || 0)} <span style={{ fontSize: 12, fontWeight: 600 }}>XP</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }} className="stagger">
        {topCards.map(c => (
          <div key={c.label} className="card" style={{ padding: '18px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }} >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--text-primary)' }}>Topic Progression</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Your success rate mapping across individual concepts.</div>
          {!stats?.topicPerformance?.length ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <p>Complete challenges to map your skills.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.topicPerformance.map(t => (
                <div key={t.topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{t.topic}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{t.percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${t.percentage}%`, background: 'var(--primary)', transition: 'width 1s ease-in-out' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Weak areas</div>
            {stats?.weakAreas?.length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={() => navigate('/practice')}>Practice</button>
            )}
          </div>
          {!stats?.weakAreas?.length ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>🔥</div>
              <p>Looking sharp, no weakness</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.weakAreas.map(w => (
                <div key={w.subtopic} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 13px', borderRadius: 8,
                  background: 'var(--red-light)', borderLeft: '3px solid var(--red)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{w.subtopic}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{w.topic}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--red)' }}>{w.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, color: 'var(--text-primary)' }}>EXP</div>
          {!rawHistory.length ? (
            <div className="empty-state" style={{ padding: '20px 0' }}><p>Complete quizzes and battles to begin progressing your EXP rating</p></div>
          ) : (
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" hide />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} width={35} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, boxShadow: 'var(--shadow-md)' }} formatter={v => [`${v} XP`, 'Level']} />
                  <Line type="monotone" dataKey="exp" stroke="#F59E0B" strokeWidth={3}
                    dot={(props) => {
                      if (props.payload?.date === 'Start') return <g key={props.key} />;
                      return <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill="#F59E0B" stroke="none" />;
                    }}
                    activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, color: 'var(--text-primary)' }}>Recent activity</div>
          {!stats?.recentActivity?.length ? (
            <div className="empty-state" style={{ padding: '20px 0' }}><p>No activity yet. Start a quiz.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stats.recentActivity.map(a => {
                const pct = Math.round((a.score / a.total) * 100);
                const color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)';
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 8, background: 'var(--bg-subtle)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.topicName} &mdash; {a.subtopicName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.completedAt?.toString().slice(0, 10)}</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 13, color, flexShrink: 0 }}>{a.score}/{a.total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

