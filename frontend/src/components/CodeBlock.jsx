import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';

// Register only the languages we actually need (keeps bundle tiny)
import javascript from 'highlight.js/lib/languages/javascript';
import java       from 'highlight.js/lib/languages/java';
import python     from 'highlight.js/lib/languages/python';
import sql        from 'highlight.js/lib/languages/sql';
import xml        from 'highlight.js/lib/languages/xml'; // HTML
import css        from 'highlight.js/lib/languages/css';
import bash       from 'highlight.js/lib/languages/bash';
import cpp        from 'highlight.js/lib/languages/cpp';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('java',       java);
hljs.registerLanguage('python',     python);
hljs.registerLanguage('sql',        sql);
hljs.registerLanguage('html',       xml);
hljs.registerLanguage('css',        css);
hljs.registerLanguage('bash',       bash);
hljs.registerLanguage('cpp',        cpp);

// Auto-detect language from topic name or explicit hint
function detectLang(hint) {
  if (!hint) return null;
  const h = hint.toLowerCase();
  if (h.includes('java') && !h.includes('script')) return 'java';
  if (h.includes('javascript') || h.includes('js'))  return 'javascript';
  if (h.includes('python'))     return 'python';
  if (h.includes('sql'))        return 'sql';
  if (h.includes('css'))        return 'css';
  if (h.includes('html'))       return 'html';
  if (h.includes('bash') || h.includes('shell')) return 'bash';
  if (h.includes('c++') || h.includes('cpp'))   return 'cpp';
  return null;
}

const LANG_LABEL = {
  java: 'Java', javascript: 'JavaScript', python: 'Python',
  sql: 'SQL', css: 'CSS', html: 'HTML', bash: 'Shell', cpp: 'C++',
};

export default function CodeBlock({ code, langHint }) {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const lang = detectLang(langHint) || 'java'; // default to java since most questions will be

  useEffect(() => {
    if (!codeRef.current) return;
    codeRef.current.removeAttribute('data-highlighted'); // allow re-highlight on code change
    codeRef.current.className = `language-${lang}`;
    codeRef.current.textContent = code;
    hljs.highlightElement(codeRef.current);
  }, [code, lang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{
      position: 'relative',
      margin: '14px 0 20px',
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid #2d2d2d',
      boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#1a1a2e', padding: '7px 14px',
        borderBottom: '1px solid #2d2d2d',
      }}>
        {/* Traffic-light dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
        </div>
        {/* Language label */}
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          color: '#8b8bbd', textTransform: 'uppercase',
        }}>
          {LANG_LABEL[lang] || lang}
        </span>
        {/* Copy button */}
        <button
          onClick={handleCopy}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: copied ? '#28c840' : '#6b6b8d', fontSize: 11, fontWeight: 600,
            padding: '2px 6px', borderRadius: 4,
            transition: 'color 0.2s',
          }}
          title="Copy code"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Code body */}
      <div style={{ background: '#0f0f1a', overflowX: 'auto' }}>
        <pre style={{ margin: 0, padding: '16px 18px', fontSize: 13.5, lineHeight: 1.65 }}>
          <code ref={codeRef} />
        </pre>
      </div>

      {/* Inline style injection for hljs theme (One Dark Pro inspired) */}
      <style>{`
        .hljs { background: transparent; color: #abb2bf; }
        .hljs-keyword  { color: #c678dd; font-weight: 600; }
        .hljs-built_in { color: #e5c07b; }
        .hljs-type     { color: #e5c07b; }
        .hljs-literal  { color: #56b6c2; }
        .hljs-number   { color: #d19a66; }
        .hljs-string   { color: #98c379; }
        .hljs-comment  { color: #5c6370; font-style: italic; }
        .hljs-doctag   { color: #5c6370; font-style: italic; }
        .hljs-meta     { color: #61afef; }
        .hljs-function { color: #61afef; }
        .hljs-title    { color: #61afef; }
        .hljs-params   { color: #abb2bf; }
        .hljs-attr     { color: #e06c75; }
        .hljs-name     { color: #e06c75; }
        .hljs-variable { color: #e06c75; }
        .hljs-class    { color: #e5c07b; }
        .hljs-operator { color: #56b6c2; }
        .hljs-punctuation { color: #abb2bf; }
      `}</style>
    </div>
  );
}
