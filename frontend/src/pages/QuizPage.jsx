import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import CodeBlock from '../components/CodeBlock';

// Lazy load the heavy code editor
const CodeEditor = lazy(() => import('../components/CodeEditor'));

const KEYS = ['A','B','C','D'];

export default function QuizPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [questions] = useState(location.state?.questions || []);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const isFinished = useRef(false); // set true only when we've navigated to result

  const q = questions[current];
  const total = questions.length;
  const selected = answers[q?.id];
  const isFirst = current === 0;
  const isLast = current === total - 1;

  // ── Guard: warn on browser refresh / tab close ──────────────────────────
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (isFinished.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // ── Guard: in-app navigation during quiz ─────────────────────────────
  useEffect(() => {
    const origPush = window.history.pushState.bind(window.history);
    window.history.pushState = (...args) => {
      if (isFinished.current) { origPush(...args); return; }
      const ok = window.confirm('Leaving now will end your quiz and submit your current answers. Continue?');
      if (!ok) return;
      isFinished.current = true;
      api.post(`/quiz/session/${sessionId}/submit`, {
        answers,
        time_taken: Math.round((Date.now() - startTime) / 1000),
      }).finally(() => origPush(...args));
    };
    return () => { window.history.pushState = origPush; };
  }, [answers, sessionId, startTime]);

  // ── Anti-Cheat: Visibility Change (New Tab) ──────────────────────────
  useEffect(() => {
    if (isFinished.current) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && !isFinished.current) {
        alert('Anti-cheat: Switching tabs is not allowed during a session. You have been disqualified.');
        isFinished.current = true;
        api.post(`/quiz/session/${sessionId}/submit`, {
          answers: {}, // 0 score
          time_taken: Math.round((Date.now() - startTime) / 1000),
        }).finally(() => navigate(`/quiz/${sessionId}/result`, { replace: true }));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [sessionId, startTime, navigate]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelect = useCallback((i) => {
    if (!q || q.isExecutionTask) return;
    setAnswers(prev => ({ ...prev, [q.id]: i }));
  }, [q]);

  const handleCodeRun = useCallback((passed) => {
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: passed ? 1 : -1 }));
  }, [q]);

  const handlePrev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleNext = useCallback(async () => {
    if (selected === undefined) return;
    if (isLast) {
      setSubmitting(true);
      isFinished.current = true;
      try {
        await api.post(`/quiz/session/${sessionId}/submit`, {
          answers, time_taken: Math.round((Date.now() - startTime) / 1000),
        });
      } catch { /* silent */ }
      navigate(`/quiz/${sessionId}/result`);
      return;
    }
    setCurrent(c => c + 1);
  }, [selected, isLast, answers, sessionId, startTime, navigate]);

  if (!questions.length) return (
    <div className="page" style={{textAlign:'center',paddingTop:80}}>
      <h2 style={{marginBottom:16}}>Session not found.</h2>
      <button className="btn btn-primary" onClick={() => navigate('/practice')}>Back to Practice</button>
    </div>
  );

  const progress = (current / total) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="quiz-wrap no-select" 
      onContextMenu={e => e.preventDefault()}
      onCopy={e => e.preventDefault()}>
      {/* Header */}
      <div className="quiz-header">
        <span className="quiz-counter">Question {current+1} of {total}</span>
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{width:`${progress}%`}} />
        </div>
        <span className={`badge ${q?.difficulty === 'easy' ? 'badge-green' : q?.difficulty === 'hard' ? 'badge-red' : 'badge-amber'}`}>
          {q?.difficulty}
        </span>
      </div>

      {/* Card */}
      <div className="quiz-card" style={{ display:'flex', gap:'20px', flexDirection:'column' }}>
        <div className="quiz-question">{q?.question}</div>

        {q?.codeSnippet && !q?.isExecutionTask && (
          <CodeBlock code={q.codeSnippet} langHint={q.topic || q.langHint || ''} />
        )}

        {!q?.isExecutionTask && (
          <div className="quiz-options">
            {q?.options.map((opt, i) => (
              <button key={i} className={`quiz-opt${selected === i ? ' selected' : ''}`}
                onClick={() => handleSelect(i)}>
                <span className="opt-key">{KEYS[i]}</span>
                <span className="opt-text">{opt}</span>
              </button>
            ))}
          </div>
        )}

        {q?.isExecutionTask && (
          <div style={{ height:'560px', width:'100%', borderTop:'1px solid var(--border)', paddingTop:'16px' }}>
            <Suspense fallback={<div className="empty-state">Loading Code Engine...</div>}>
              <CodeEditor
                initialCode={q.codeSnippet || '// Write your solution here'}
                testCases={q.testCases}
                onRun={handleCodeRun}
                language={q.language || 'javascript'}
              />
            </Suspense>
          </div>
        )}

        {/* Navigation row */}
        <div className="quiz-nav">
          {/* Answered count pill */}
          <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginRight:'auto' }}>
            {answeredCount}/{total} answered
          </span>

          {/* Previous */}
          {!isFirst && (
            <button className="btn btn-ghost btn-sm" onClick={handlePrev} style={{minWidth:80}}>
              ← Previous
            </button>
          )}

          {/* Skip & submit on last if unanswered */}
          {isLast && selected === undefined && (
            <button className="btn btn-ghost btn-sm" onClick={() => {
              isFinished.current = true;
              navigate(`/quiz/${sessionId}/result`);
            }}>
              Skip & submit
            </button>
          )}

          {/* Next / Submit */}
          <button className="btn btn-primary" onClick={handleNext}
            disabled={selected === undefined || submitting}
            style={{minWidth:90}}>
            {submitting
              ? <><div className="spinner" style={{width:13,height:13}} /> Saving…</>
              : isLast ? 'Submit' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Dot nav — clickable */}
      <div className="quiz-dots" style={{ cursor:'pointer' }}>
        {questions.map((qItem, i) => (
          <div
            key={i}
            className={`quiz-dot${i < current ? ' answered' : i === current ? ' current' : ''}`}
            title={`Q${i+1}${answers[qItem.id] !== undefined ? ' (answered)' : ''}`}
            onClick={() => setCurrent(i)}
            style={{ cursor:'pointer', width: i === current ? 18 : 7, borderRadius: i === current ? 4 : '50%', transition:'all 0.2s' }}
          />
        ))}
      </div>
    </div>
  );
}
