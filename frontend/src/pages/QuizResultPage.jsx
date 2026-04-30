import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

const KEYS = ['A','B','C','D'];
const R = '--r-md';

export default function QuizResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api.get(`/quiz/session/${sessionId}/result`).then(r => setResult(r.data)).finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div className="spinner spinner-primary" style={{width:28,height:28}}/>
    </div>
  );
  if (!result) return <div className="page"><h2>Result not found.</h2></div>;

  const pct = Math.round((result.score / result.total) * 100);
  const gradeColor = pct>=80?'var(--green)':pct>=60?'var(--primary)':pct>=40?'var(--amber)':'var(--red)';
  const gradeBg = pct>=80?'var(--green-light)':pct>=60?'var(--primary-light)':pct>=40?'var(--amber-light)':'var(--red-light)';
  const gradeBorder = pct>=80?'#A7F3D0':pct>=60?'#C7D2FE':pct>=40?'#FDE68A':'#FECACA';
  const gradeLabel = pct>=80?'Excellent':pct>=60?'Good':pct>=40?'Fair':'Needs work';

  const results = result.results || [];
  const shown = showAll ? results : results.slice(0, 5);
  const correct = results.filter(r => r.isCorrect).length;
  const wrong = results.filter(r => !r.isCorrect).length;
  const timeFmt = t => t ? `${Math.floor(t/60)}m ${t%60}s` : '—';
  const circumference = 2 * Math.PI * 34;

  return (
    <div className="page" style={{maxWidth:700}}>
      {/* Score hero */}
      <div className="card" style={{padding:24,marginBottom:20,display:'flex',alignItems:'center',gap:24,flexWrap:'wrap'}}>
        <div style={{position:'relative',width:80,height:80,flexShrink:0}}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="8"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke={gradeColor} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference*(1-pct/100)}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{transition:'stroke-dashoffset 0.8s ease'}}
            />
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
            <span style={{fontSize:17,fontWeight:900,color:gradeColor,lineHeight:1}}>{pct}</span>
            <span style={{fontSize:9,fontWeight:600,color:'var(--text-muted)'}}>%</span>
          </div>
        </div>

        <div style={{flex:1,minWidth:120}}>
          <div style={{marginBottom:6}}>
            <span className="badge" style={{background:gradeBg,color:gradeColor,border:`1px solid ${gradeBorder}`}}>{gradeLabel}</span>
          </div>
          <div style={{fontWeight:800,fontSize:20,letterSpacing:'-0.03em',marginBottom:2}}>
            {result.score} / {result.total} correct
          </div>
          <div style={{fontSize:13,color:'var(--text-muted)'}}>
            {result.topic?.name} &middot; {result.subtopic?.name}
          </div>
        </div>

        <div style={{display:'flex',gap:1,background:'var(--border)',borderRadius:10,overflow:'hidden',flexShrink:0}}>
          {[
            {label:'Correct',val:correct,color:'var(--green)'},
            {label:'Wrong',val:wrong,color:'var(--red)'},
            {label:'Time',val:timeFmt(result.timeTaken),color:'var(--amber)'},
          ].map(s => (
            <div key={s.label} style={{padding:'10px 14px',textAlign:'center',background:'var(--bg-card)',minWidth:60}}>
              <div style={{fontWeight:800,fontSize:16,color:s.color}}>{s.val}</div>
              <div style={{fontSize:10,color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review */}
      <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:'var(--text-secondary)'}}>Answer review</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {shown.map((r, i) => (
          <div key={i} style={{
            background:'var(--bg-card)',border:'1px solid var(--border)',
            borderLeft:`3px solid ${r.isCorrect?'var(--green)':'var(--red)'}`,
            borderRadius:12,padding:'16px 18px',
          }}>
            <div style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
              <div style={{
                width:18,height:18,borderRadius:'50%',flexShrink:0,marginTop:1,
                background:r.isCorrect?'var(--green-light)':'var(--red-light)',
                color:r.isCorrect?'var(--green)':'var(--red)',
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                {r.isCorrect
                  ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                }
              </div>
              <span style={{fontWeight:600,fontSize:14,lineHeight:1.5,flex:1}}>{r.question}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {r.options?.map((opt,j) => {
                const isCorrect = j === r.correctAnswer;
                const isUser = j === r.userAnswer;
                const bg = isCorrect?'var(--green-light)':isUser&&!isCorrect?'var(--red-light)':'var(--bg-subtle)';
                const bdr = isCorrect?'#A7F3D0':isUser&&!isCorrect?'#FECACA':'var(--border)';
                const col = isCorrect?'var(--green)':isUser&&!isCorrect?'var(--red)':'var(--text-secondary)';
                return (
                  <div key={j} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 11px',borderRadius:7,background:bg,border:`1px solid ${bdr}`}}>
                    <span style={{fontWeight:800,fontSize:11,minWidth:16,color:col}}>{KEYS[j]}</span>
                    <span style={{fontSize:13,flex:1,color:col}}>{opt}</span>
                    {isCorrect && <span style={{fontSize:10,fontWeight:700,color:'var(--green)',marginLeft:'auto'}}>Correct</span>}
                    {isUser&&!isCorrect && <span style={{fontSize:10,fontWeight:700,color:'var(--red)',marginLeft:'auto'}}>Your answer</span>}
                  </div>
                );
              })}
            </div>
            {r.explanation && (
              <div style={{fontSize:12,color:'var(--text-tertiary)',marginTop:10,paddingTop:10,borderTop:'1px dashed var(--border)',lineHeight:1.6}}>
                {r.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {results.length > 5 && !showAll && (
        <button className="btn btn-ghost" style={{width:'100%',marginTop:8,justifyContent:'center'}}
          onClick={() => setShowAll(true)}>
          Show all {results.length} questions
        </button>
      )}

      <div style={{display:'flex',gap:10,marginTop:24}}>
        <button className="btn btn-primary btn-lg" style={{flex:1,justifyContent:'center'}} onClick={() => navigate('/practice')}>Practice again</button>
        <button className="btn btn-ghost btn-lg" style={{flex:1,justifyContent:'center'}} onClick={() => navigate('/dashboard')}>Dashboard</button>
      </div>
    </div>
  );
}
