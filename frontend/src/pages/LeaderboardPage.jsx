import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const MEDAL = [
  { color: '#F59E0B', glow: '0 0 30px #F59E0B44', bg: 'linear-gradient(135deg,#F59E0B18,#F59E0B06)', border: '#F59E0B44', emoji: '🥇', label: '1st' },
  { color: '#94A3B8', glow: '0 0 20px #94A3B833', bg: 'linear-gradient(135deg,#94A3B818,#94A3B806)', border: '#94A3B844', emoji: '🥈', label: '2nd' },
  { color: '#CD7F32', glow: '0 0 20px #CD7F3233', bg: 'linear-gradient(135deg,#CD7F3218,#CD7F3206)', border: '#CD7F3244', emoji: '🥉', label: '3rd' },
];

function XpBar({ pct, color }) {
  return (
    <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 1s ease' }} />
    </div>
  );
}

function PodiumCard({ player, rank, height }) {
  if (!player) return <div style={{ flex: 1 }} />;
  const m = MEDAL[rank - 1];
  const isFirst = rank === 1;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      animation: `fadeUp 0.4s ease ${(rank - 1) * 80}ms both`,
    }}>
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <div style={{
          width: isFirst ? 76 : 60, height: isFirst ? 76 : 60, borderRadius: '50%',
          background: player.avatarColor || '#4F46E5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: isFirst ? 28 : 22, color: '#fff',
          border: `3px solid ${m.color}`,
          boxShadow: m.glow,
        }}>
          {player.username?.[0]?.toUpperCase()}
        </div>
        <div style={{
          position: 'absolute', bottom: -4, right: -4,
          fontSize: isFirst ? 22 : 18,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
        }}>{m.emoji}</div>
        {player.isMe && (
          <div style={{
            position: 'absolute', top: -4, left: -4,
            background: 'var(--primary)', color: '#fff',
            fontSize: 8, fontWeight: 900, padding: '1px 5px', borderRadius: 6,
          }}>YOU</div>
        )}
      </div>

      <div style={{ fontWeight: 800, fontSize: isFirst ? 15 : 13, textAlign: 'center', marginBottom: 2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {player.username}
      </div>

      <div style={{
        width: '100%', height: height, marginTop: 10,
        background: m.bg,
        border: `1.5px solid ${m.border}`,
        borderRadius: 12,
        boxShadow: m.glow,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        padding: '0 8px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {m.label}
        </div>
        <div style={{ fontWeight: 900, fontSize: isFirst ? 22 : 18, color: m.color, letterSpacing: '-0.03em' }}>
          {(player.exp || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: m.color, opacity: 0.6, fontWeight: 700 }}>XP</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>{player.totalBattles}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Battles</div>
          </div>
          <div style={{ width: 1, background: m.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>{player.totalQuizzes}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Quizzes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('global');

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard/global${tab === 'friends' ? '?filter=friends' : ''}`)
      .then(r => setLeaders(r.data))
      .finally(() => setLoading(false));
  }, [tab]);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const me = leaders.find(l => l.isMe);
  const podium = [top3[1], top3[0], top3[2]];

  if (loading && leaders.length === 0) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner spinner-primary" style={{ width: 28, height: 28 }} />
    </div>
  );

  const maxExp = leaders[0]?.exp || 1;

  return (
    <div className="page">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em' }}>🏆 Leaderboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Rankings by total EXP earned.</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', padding: 4, borderRadius: 10 }}>
          {['global', 'friends'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              minWidth: 90, padding: '6px 16px', borderRadius: 7,
              border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: tab === t ? 'var(--primary)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {leaders.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No rankings yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Complete quizzes and battles to appear here.</p>
        </div>
      ) : (
        <>
          {top3.length > 0 && (
            <div style={{
              background: 'linear-gradient(170deg, #FFFBEB 0%, #FEF3C7 30%, #ffffff 65%)',
              borderRadius: 20, padding: '32px 24px 24px', marginBottom: 16,
              border: '1px solid #FDE68A',
              boxShadow: '0 4px 24px rgba(245,158,11,0.10)',
              overflow: 'hidden', position: 'relative',
            }}>
              {[[8, '#F59E0B', 0.15], [18, '#EF4444', 0.08], [72, '#10B981', 0.08], [82, '#6366F1', 0.08], [45, '#F59E0B', 0.06], [60, '#EC4899', 0.07]].map(([l, c, o], i) => (
                <div key={i} style={{ position: 'absolute', top: `${10 + i * 10}%`, left: `${l}%`, width: 6, height: 6, borderRadius: '50%', background: c, opacity: o }} />
              ))}

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                <PodiumCard player={podium[0]} rank={2} height={100} />
                <PodiumCard player={podium[1]} rank={1} height={130} />
                <PodiumCard player={podium[2]} rank={3} height={80} />
              </div>

              {me && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 0' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'var(--primary-light)', border: '1px solid var(--primary)',
                    borderRadius: 24, padding: '7px 20px', fontSize: 13, fontWeight: 600,
                    color: 'var(--primary)',
                  }}>
                    You are ranked <strong style={{ fontSize: 15 }}>#{me.rank}</strong> with{' '}
                    <strong style={{ color: '#F59E0B' }}>{(me.exp || 0).toLocaleString()} XP</strong>{' '}
                    out of <strong>{leaders.length}</strong> players
                  </div>
                </div>
              )}
            </div>
          )}

          {rest.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 4px', marginBottom: 4 }}>
                Full Rankings
              </div>
              {rest.map((l, idx) => {
                const pct = Math.round((l.exp / maxExp) * 100);
                return (
                  <div key={l.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 14,
                    background: l.isMe ? 'var(--primary-light)' : 'white',
                    border: `1.5px solid ${l.isMe ? 'var(--primary)' : 'var(--border)'}`,
                    borderLeft: `4px solid ${l.isMe ? 'var(--primary)' : '#E2E8F0'}`,
                    transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
                    animation: `fadeUp 0.3s ease ${idx * 40}ms both`,
                    boxShadow: l.isMe ? '0 2px 12px rgba(79,70,229,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                    onMouseEnter={e => { if (!l.isMe) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderLeftColor = '#94A3B8'; } }}
                    onMouseLeave={e => { if (!l.isMe) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderLeftColor = '#E2E8F0'; } }}
                  >
                    <div style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 52, fontWeight: 900, color: l.isMe ? 'rgba(79,70,229,0.06)' : 'rgba(0,0,0,0.04)',
                      lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                    }}>{l.rank}</div>

                    <div style={{ width: 32, fontWeight: 900, fontSize: 18, color: 'var(--text-secondary)', textAlign: 'center', flexShrink: 0 }}>
                      {l.rank}
                    </div>

                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: l.avatarColor || '#4F46E5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 14, color: '#fff',
                      border: '2px solid var(--border)',
                    }}>
                      {l.username?.[0]?.toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.username}
                        </span>
                        {l.isMe && (
                          <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 7px', borderRadius: 8, background: 'var(--primary)', color: '#fff', flexShrink: 0 }}>YOU</span>
                        )}
                      </div>
                      <XpBar pct={pct} color={l.isMe ? 'var(--primary)' : '#CBD5E1'} />
                    </div>

                    <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{l.totalQuizzes}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quizzes</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{l.totalBattles}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Battles</div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 64 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#F59E0B' }}>{(l.exp || 0).toLocaleString()}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>XP</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {loading && leaders.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20,
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 16px',
          display: 'flex', gap: 8, alignItems: 'center',
          fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-md)',
        }}>
          <div className="spinner spinner-primary" style={{ width: 14, height: 14 }} />
          Updating…
        </div>
      )}
    </div>
  );
}
