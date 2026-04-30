import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../styles/leaderboard.css';

const MEDAL = [
  { color: '#FBBF24', bg: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.02))', border: 'rgba(251,191,36,0.4)', emoji: '🥇', label: '1st' },
  { color: '#E2E8F0', bg: 'linear-gradient(135deg, rgba(226,232,240,0.15), rgba(226,232,240,0.02))', border: 'rgba(226,232,240,0.4)', emoji: '🥈', label: '2nd' },
  { color: '#F59E0B', bg: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.02))', border: 'rgba(245,158,11,0.4)', emoji: '🥉', label: '3rd' },
];

function PodiumCard({ player, rank, heightClass }) {
  if (!player) return <div className="lb-podium-card" style={{ visibility: 'hidden' }} />;
  const m = MEDAL[rank - 1];
  const isFirst = rank === 1;

  return (
    <div className={`lb-podium-card anim-stagger-${rank}`}>
      <div className="lb-podium-avatar-wrap">
        <div className="lb-podium-avatar" style={{
          width: isFirst ? 76 : 60, 
          height: isFirst ? 76 : 60,
          background: player.avatarColor || '#4F46E5',
          fontSize: isFirst ? 30 : 24,
          border: `4px solid ${m.color}`,
          boxShadow: `0 0 20px ${m.color}66`
        }}>
          {player.username?.[0]?.toUpperCase()}
        </div>
        <div className="lb-podium-badge">{m.emoji}</div>
        {player.isMe && <div className="lb-you-badge">YOU</div>}
      </div>

      <div className="lb-podium-name">{player.username}</div>

      <div className="lb-podium-bar" style={{
        height: heightClass,
        background: m.bg,
        border: `1px solid ${m.border}`
      }}>
        <div className="lb-podium-rank" style={{ color: m.color }}>{m.label}</div>
        <div className="lb-podium-exp" style={{ color: m.color, fontSize: isFirst ? 24 : 20 }}>
          {(player.exp || 0).toLocaleString()}
        </div>
        <div className="lb-podium-exp-label" style={{ color: m.color }}>XP</div>
        
        <div className="lb-podium-stats">
          <div className="lb-podium-stat-item">
            <div className="lb-podium-stat-val">{player.totalBattles}</div>
            <div className="lb-podium-stat-label">Battles</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div className="lb-podium-stat-item">
            <div className="lb-podium-stat-val">{player.totalQuizzes}</div>
            <div className="lb-podium-stat-label">Quizzes</div>
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
      <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
    </div>
  );

  const maxExp = leaders[0]?.exp || 1;

  return (
    <div className="page">
      <div className="lb-header">
        <div className="lb-title-wrap">
          <h1>🏆 Leaderboard</h1>
          <p>Global rankings by total EXP earned across all topics.</p>
        </div>
        
        <div className="lb-pill-toggle">
          {['global', 'friends'].map(t => (
            <button 
              key={t} 
              className={`lb-pill-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {leaders.length === 0 && !loading ? (
        <div className="lb-empty anim-fade-up">
          <span className="lb-empty-emoji">🚀</span>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>No rankings yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Complete quizzes and battles to earn XP and appear on the leaderboard.</p>
        </div>
      ) : (
        <>
          {top3.length > 0 && (
            <div className="lb-podium-wrap">
              <div className="lb-podium-bg-glow" />
              <div className="lb-podium-container">
                <PodiumCard player={podium[0]} rank={2} heightClass="165px" />
                <PodiumCard player={podium[1]} rank={1} heightClass="200px" />
                <PodiumCard player={podium[2]} rank={3} heightClass="150px" />
              </div>

              {me && (
                <div className="lb-me-highlight anim-stagger-row" style={{ animationDelay: '300ms' }}>
                  <div className="lb-me-pill">
                    You are ranked <strong>#{me.rank}</strong> with <span className="highlight">{(me.exp || 0).toLocaleString()} XP</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {rest.length > 0 && (
            <div className="lb-list-wrap">
              <div className="lb-list-header">Full Rankings</div>
              {rest.map((l, idx) => {
                const pct = Math.round((l.exp / maxExp) * 100);
                return (
                  <div 
                    key={l.id || l._id} 
                    className={`lb-row ${l.isMe ? 'is-me' : ''} anim-stagger-row`}
                    style={{ animationDelay: `${(idx % 10) * 40 + 200}ms` }}
                  >
                    <div className="lb-row-bg-rank">{l.rank}</div>
                    
                    <div className="lb-row-rank">{l.rank}</div>
                    <div className="lb-row-avatar" style={{ background: l.avatarColor || '#4F46E5' }}>
                      {l.username?.[0]?.toUpperCase()}
                    </div>
                    
                    <div className="lb-row-info">
                      <div className="lb-row-name-wrap">
                        <span className="lb-row-name">{l.username}</span>
                        {l.isMe && <span className="lb-row-tag">YOU</span>}
                      </div>
                    </div>

                    <div className="lb-row-stats">
                      <div className="lb-row-stat-box">
                        <div className="lb-row-stat-val">{l.totalQuizzes}</div>
                        <div className="lb-row-stat-label">Quizzes</div>
                      </div>
                      <div className="lb-row-stat-box">
                        <div className="lb-row-stat-val">{l.totalBattles}</div>
                        <div className="lb-row-stat-label">Battles</div>
                      </div>
                    </div>
                    
                    <div className="lb-row-total-xp">
                      <div className="lb-row-total-xp-val">{(l.exp || 0).toLocaleString()}</div>
                      <div className="lb-row-total-xp-label">XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {loading && leaders.length > 0 && (
        <div className="lb-loading-toast">
          <div className="spinner spinner-primary" style={{ width: 14, height: 14 }} />
          Updating rankings…
        </div>
      )}
    </div>
  );
}
