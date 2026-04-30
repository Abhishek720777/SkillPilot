import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const RANK_STYLE = {
  1: { bg: 'linear-gradient(135deg,#F59E0B22,#F59E0B08)', border: '#F59E0B55', glow: '0 0 24px #F59E0B33', medal: '🥇', badgeBg: '#F59E0B', badgeColor: '#000' },
  2: { bg: 'linear-gradient(135deg,#94A3B822,#94A3B808)', border: '#94A3B855', glow: '0 0 18px #94A3B833', medal: '🥈', badgeBg: '#94A3B8', badgeColor: '#fff' },
  3: { bg: 'linear-gradient(135deg,#CD7F3222,#CD7F3208)', border: '#CD7F3255', glow: '0 0 18px #CD7F3233', medal: '🥉', badgeBg: '#CD7F32', badgeColor: '#fff' },
};

const fmt = (s) => s != null ? `${Math.floor(s / 60)}m ${s % 60}s` : '—';

export default function BattleResultPage() {
  const { battleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/battle/${battleId}/result`)
      .then((r) => setResult(r.data))
      .catch(() => navigate("/battle"))
      .finally(() => setLoading(false));
  }, [battleId, navigate]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner spinner-primary" style={{ width: 28, height: 28 }} />
    </div>
  );
  if (!result) return null;

  const { results, battle } = result;
  const total = battle?.numQuestions || 5;

  // Sort: higher score first, then faster time
  const sorted = [...results].sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.timeTaken - b.timeTaken
  );

  const winnerId = sorted[0]?.userId;
  const myId = String(user?.id);
  const me = sorted.find(r => String(r.userId) === myId);
  const myRank = sorted.findIndex(r => String(r.userId) === myId) + 1;
  const iWon = String(winnerId) === myId;
  const isDraw = sorted.length >= 2 && sorted[0].score === sorted[1].score && sorted[0].timeTaken === sorted[1].timeTaken;

  const headline = isDraw ? "It's a Draw!" : iWon ? "Victory! 🎉" : `${sorted[0]?.username || 'Player'} Wins!`;
  const sub = isDraw ? "Perfectly matched — same score, same time."
    : iWon ? "Outstanding performance. Keep the streak!"
    : `You ranked #${myRank} out of ${sorted.length} players.`;

  return (
    <div className="page" style={{ minHeight: '100vh' }}>
      {/* ── Header outcome ── */}
      <div style={{
        textAlign: 'center', padding: '32px 0 24px',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {isDraw ? '🤝' : iWon ? '🏆' : '💪'}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6 }}>
          {headline}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{sub}</p>
        {me && (
          <div style={{
            display:'inline-flex', gap: 16, marginTop: 16,
            background: 'var(--primary-light)', border: '1px solid var(--primary)',
            borderRadius: 24, padding: '8px 24px',
          }}>
            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>
              Your score: <strong>{me.score}/{total}</strong>
            </span>
            <span style={{ fontSize: 13, color: 'var(--primary)', opacity: 0.8, fontWeight: 600 }}>
              Time: {fmt(me.timeTaken)}
            </span>
          </div>
        )}
      </div>

      {/* ── Rankings ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {sorted.map((player, idx) => {
          const rank = idx + 1;
          const rs = RANK_STYLE[rank] || { bg: 'transparent', border: 'var(--border)', glow: 'none', medal: `#${rank}`, badgeBg: 'var(--bg-subtle)', badgeColor: 'var(--text-muted)' };
          const isMe = String(player.userId) === myId;
          const acc = Math.round((player.score / total) * 100);

          return (
            <div key={player.userId} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px',
              background: isMe ? 'var(--primary-light)' : rs.bg,
              border: `1.5px solid ${isMe ? 'var(--primary)' : rs.border}`,
              borderRadius: 14,
              boxShadow: rank <= 3 ? rs.glow : 'none',
              animation: `fadeUp 0.3s ease ${idx * 60}ms both`,
            }}>
              {/* Rank medal */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: rs.badgeBg, color: rs.badgeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: rank <= 3 ? 18 : 14, fontWeight: 900,
              }}>
                {rank <= 3 ? rs.medal : rank}
              </div>

              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: player.avatarColor || '#4F46E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15, color: '#fff',
                border: rank <= 3 ? `2px solid ${rs.badgeBg}` : '2px solid var(--border)',
              }}>
                {player.username?.[0]?.toUpperCase() || '?'}
              </div>

              {/* Name + You badge */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                    {player.username}
                  </span>
                  {isMe && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                      background: 'var(--primary)', color: '#fff',
                    }}>You</span>
                  )}
                  {rank === 1 && !isDraw && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                      background: '#F59E0B', color: '#000',
                    }}>Winner</span>
                  )}
                </div>
                {/* Accuracy bar */}
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow:'hidden', maxWidth: 180 }}>
                  <div style={{
                    height: '100%', borderRadius: 4, transition: 'width 1s ease',
                    width: `${acc}%`,
                    background: rank === 1 ? '#F59E0B' : isMe ? 'var(--primary)' : '#94A3B8',
                  }} />
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', color: rank <= 3 ? rs.badgeBg : 'var(--text-primary)' }}>
                  {player.score}<span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>/{total}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{fmt(player.timeTaken)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', paddingBottom: 32 }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/battle')}>
          Play Again
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/leaderboard')}>
          Leaderboard
        </button>
      </div>
    </div>
  );
}
