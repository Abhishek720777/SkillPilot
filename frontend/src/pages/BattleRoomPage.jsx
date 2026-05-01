import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getSocket } from '../socket/socket';
import CodeEditor from '../components/CodeEditor';
import CodeBlock from '../components/CodeBlock';

const KEYS = ['A','B','C','D'];

export default function BattleRoomPage() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [battle, setBattle] = useState(null);
  const [lobbyUsers, setLobbyUsers] = useState([]);
  const [creatorId, setCreatorId] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('loading');
  const [finishedPlayers, setFinishedPlayers] = useState([]); // array of {userId, username, score}
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const startRef = useRef(Date.now());
  const timerRef = useRef(null);
  const isFinished = useRef(false); // true after submit/result redirect

  useEffect(() => {
    api.get(`/battle/${battleId}`).then(r => {
      setBattle(r.data);
      if (r.data.status === 'active') {
        setQuestions(r.data.questions);
        setTimeLeft(r.data.timerSeconds);
        setStatus('active');
      } else {
        setStatus('waiting');
      }
    });

    const socket = getSocket();
    socket.emit('battle:join_room', { battleId: battleId });

    socket.on('battle:lobby_update', ({ users, creatorId }) => {
      setLobbyUsers(users);
      setCreatorId(creatorId);
    });

    socket.on('battle:start', ({ questions: qs, timerSeconds, startedAt }) => {
      setQuestions(qs); setTimeLeft(timerSeconds);
      startRef.current = startedAt || Date.now();
      setStatus('active');
    });

    socket.on('battle:player_finished', (player) => {
      setFinishedPlayers(prev => {
         const exists = prev.find(p => p.userId === player.userId);
         if (exists) return prev;
         const next = [...prev, player];
         next.sort((a,b) => b.score - a.score || a.timeTaken - b.timeTaken);
         return next;
      });
    });

    socket.on('battle:results', () => navigate(`/battle/${battleId}/result`));
    
    socket.on('battle:discarded', () => {
      alert('The host has discarded this room.');
      navigate('/battle', { replace: true });
    });
    
    // For simplicity, we just remove them if disconnect
    socket.on('battle:opponent_disconnected', ({ userId }) => {
      setLobbyUsers(prev => prev.filter(u => String(u._id) !== String(userId)));
    });

    return () => { 
      socket.off('battle:lobby_update');
      socket.off('battle:start'); 
      socket.off('battle:player_finished'); 
      socket.off('battle:results'); 
      socket.off('battle:discarded');
      socket.off('battle:opponent_disconnected'); 
    };
  }, [battleId, navigate]);

  // ── Guard: browser refresh/close during active battle ─────────────────
  useEffect(() => {
    const handler = (e) => {
      if (isFinished.current) return;
      if (status !== 'active') return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [status]);

  useEffect(() => {
    if (status !== 'active' || timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleTimeout = useCallback(() => {
    if (submitted) return;
    getSocket().emit('battle:timeout', { battleId: battleId });
    isFinished.current = true;
    setSubmitted(true); setStatus('done');
  }, [battleId, submitted]);

  const submitBattle = useCallback((finalAnswers = null) => {
    if (submitted) return;
    isFinished.current = true;
    setSubmitted(true);
    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startRef.current) / 1000);
    getSocket().emit('battle:submit', { battleId: battleId, answers: finalAnswers || answers, timeTaken });
    setStatus('done');
  }, [battleId, answers, submitted]);

  // ── Guard: in-app navigation during active battle ───────────────────────
  useEffect(() => {
    if (status !== 'active') return;
    const origPush = window.history.pushState.bind(window.history);
    window.history.pushState = (...args) => {
      if (isFinished.current) { origPush(...args); return; }
      const ok = window.confirm('Leaving will end your battle and submit your current answers. Continue?');
      if (!ok) return; // stay
      isFinished.current = true;
      submitBattle();
      origPush(...args);
    };
    return () => { window.history.pushState = origPush; };
  }, [status, submitBattle]);

  // ── Anti-Cheat: Visibility Change (New Tab) ──────────────────────────
  useEffect(() => {
    if (status !== 'active' || isFinished.current) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && !isFinished.current) {
        alert('Anti-cheat: Switching tabs is not allowed during a battle. You have been disqualified.');
        submitBattle({}); // Empty answers = 0 score
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [status, submitBattle]);

  // Save answer without auto-advancing — player manually navigates
  const handleSelect = (i) => {
    const q = questions[current];
    if (!q || q.isExecutionTask) return;
    setAnswers(prev => ({ ...prev, [q.id]: i }));
  };

  const handleCodeRun = (passed) => {
    const q = questions[current];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: passed ? 1 : -1 }));
  };

  const handlePrev = () => { if (current > 0) setCurrent(c => c - 1); };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      // Last question — submit
      submitBattle();
    } else {
      setCurrent(c => c + 1);
    }
  };

  const handleAdminStart = () => {
    getSocket().emit('battle:admin_start', { battleId });
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this room?')) {
      getSocket().emit('battle:discard', { battleId });
    }
  };

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      getSocket().emit('battle:leave', { battleId }, () => {
        navigate('/battle', { replace: true });
      });
    }
  };

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const isLow = timeLeft !== null && timeLeft <= 30;
  const q = questions[current];

  if (status === 'loading') return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div className="spinner spinner-primary" style={{width:28,height:28}}/>
    </div>
  );

  if (status === 'waiting') {
    const isCreator = user?.id === creatorId || (battle && String(battle.creatorId) === String(user?.id));
    const handleCopy = () => {
      navigator.clipboard.writeText(battle.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <div className="page">
        <div className="battle-form" style={{maxWidth: 600}}>
          <h2 className="battle-form-title">Battle Lobby</h2>
          <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>Share the room code below. The creator can start when ready.</p>
          
          {battle && isCreator && (
            <div className="room-code-box" style={{marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <div className="room-code-label">Room code</div>
                <div className="room-code-value">{battle.roomCode}</div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCopy}
                style={{ minWidth: 90, transition: 'all 0.2s' }}
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
          )}

          <div style={{marginBottom: 8, fontSize: 13, fontWeight: 'bold'}}>
            Players in room ({lobbyUsers.length}/{battle?.maxPlayers || 10}):
          </div>
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 20}}>
            {lobbyUsers.map(u => (
              <div key={u._id} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)',
                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
              }}>
                <div style={{width:16,height:16,borderRadius:'50%',background:u.avatarColor}}/>
                {u.username} {String(u._id) === String(creatorId) && '(Host)'}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isCreator ? (
              <>
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--error)', color: 'var(--error)' }} onClick={handleDiscard}>
                  Discard Room
                </button>
                <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleAdminStart}>
                  Start Battle Now
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--error)', color: 'var(--error)' }} onClick={handleLeave}>
                  Leave Room
                </button>
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-subtle)', borderRadius: 8 }}>
                  <div className="waiting-dots"><span/><span/><span/></div>
                  Waiting for host
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'done') return (
    <div className="page" style={{display: 'flex', gap: 20, flexWrap: 'wrap'}}>
      <div className="battle-form" style={{textAlign:'center', flex: 1, minWidth: 300}}>
        <div style={{width:44,height:44,borderRadius:12,background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm1 11H9v-2h2v2zm0-4H9V6h2v3z"/></svg>
        </div>
        <h2 className="battle-form-title" style={{marginBottom:6}}>Answers submitted</h2>
        <p style={{fontSize:13,color:'var(--text-muted)'}}>
          Waiting for others to finish...
        </p>
        <div style={{display:'flex',justifyContent:'center',marginTop:16}}>
          <div className="waiting-dots"><span/><span/><span/></div>
        </div>
      </div>

      <div className="card" style={{flex: 1, minWidth: 300, padding: 20}}>
        <h3 style={{marginBottom: 16, fontSize: 16, fontWeight: 700}}>Live Rankings</h3>
        {finishedPlayers.length === 0 ? (
          <p style={{fontSize: 13, color: 'var(--text-muted)'}}>Nobody has finished yet.</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {finishedPlayers.map((p, idx) => (
               <div key={p.userId} style={{
                 display: 'flex', justifyContent: 'space-between', padding: '10px',
                 background: 'var(--bg-subtle)', borderRadius: 8, fontSize: 13, fontWeight: 600
               }}>
                  <span>{idx + 1}. {p.username} {p.userId === user?.id ? '(You)' : ''}</span>
                  <span>Score: {p.score}/{questions.length} ({p.timeTaken}s)</span>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="battle-room no-select" 
      style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}
      onContextMenu={e => e.preventDefault()}
      onCopy={e => e.preventDefault()}>
      {/* Players bar */}
      <div className="battle-players-bar" style={{marginBottom: 20}}>
        <div className="battle-player-side">
          <div className="avatar" style={{background:user?.avatarColor||'#4F46E5',width:34,height:34,fontSize:13}}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="battle-player-name">{user?.username} <span style={{fontSize:10,color:'var(--primary)',fontWeight:700}}>(You)</span></div>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>{Object.keys(answers).length}/{questions.length} answered</div>
          </div>
        </div>

        <div style={{textAlign:'center',flexShrink:0}}>
          <div className={`battle-timer${isLow?' low':''}`}>{timeLeft !== null ? fmt(timeLeft) : '--:--'}</div>
        </div>

        <div className="battle-player-side right">
          {/* We simplify opponent view since it's 1vsMany. Just showing player count */}
          <div style={{textAlign:'right'}}>
            <div className="battle-player-name">{lobbyUsers.length} Players</div>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>
              {finishedPlayers.length} finished
            </div>
          </div>
        </div>
      </div>

      {/* Quiz */}
      {q && (
        <div className="quiz-wrap" style={{padding:0, maxWidth: '100%', width: '100%'}}>
          <div className="quiz-header">
            <span className="quiz-counter">Question {current+1} of {questions.length}</span>
            <div className="quiz-progress-track">
              <div className="quiz-progress-fill" style={{width:`${(current/questions.length)*100}%`}}/>
            </div>
            <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>
              {Object.keys(answers).length}/{questions.length} answered
            </span>
          </div>
          <div className="quiz-card" style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <div className="quiz-question">{q.question}</div>
              
              {q.codeSnippet && !q.isExecutionTask && (
                <CodeBlock code={q.codeSnippet} langHint={q.topic || q.langHint || ''} />
              )}

              {!q.isExecutionTask && (
                <div className="quiz-options">
                  {q.options.map((opt, i) => (
                    <button key={i} className={`quiz-opt${answers[q.id]===i?' selected':''}`} onClick={() => handleSelect(i)}>
                      <span className="opt-key">{KEYS[i]}</span>
                      <span className="opt-text">{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {q.isExecutionTask && (
               <div style={{ height: '560px', flex: 1, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <CodeEditor 
                    initialCode={q.codeSnippet || '// Write your solution here'} 
                    testCases={q.testCases}
                    onRun={handleCodeRun}
                  />
               </div>
            )}

            {/* Navigation row */}
            <div className="quiz-nav">
              {current > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={handlePrev} style={{minWidth:80}}>
                  ← Previous
                </button>
              )}
              <span style={{ marginRight:'auto' }} />
              <button
                className="btn btn-primary"
                onClick={handleNext}
                style={{ minWidth:90 }}
              >
                {current + 1 >= questions.length ? 'Submit' : 'Next →'}
              </button>
            </div>
          </div>

          {/* Clickable dot navigation */}
          <div className="quiz-dots" style={{ cursor:'pointer' }}>
            {questions.map((qItem, i) => (
              <div
                key={i}
                className={`quiz-dot${i < current ? ' answered' : i === current ? ' current' : ''}`}
                onClick={() => setCurrent(i)}
                title={`Q${i+1}${answers[qItem.id] !== undefined ? ' ✓' : ''}`}
                style={{
                  cursor:'pointer',
                  width: i === current ? 18 : 7,
                  borderRadius: i === current ? 4 : '50%',
                  transition:'all 0.2s',
                  background: answers[qItem.id] !== undefined && i !== current ? 'var(--green)' : undefined,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
