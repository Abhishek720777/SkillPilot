import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import api from '../api/client';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: 'JS', color: '#F7DF1E', bg: '#1a1a00' },
  { id: 'python',     label: 'Python',     icon: 'PY', color: '#3776AB', bg: '#001a2e' },
  { id: 'java',       label: 'Java',       icon: 'JV', color: '#ED8B00', bg: '#1a0e00' },
];

// Default boilerplate per language so users aren't starting from blank
const BOILERPLATE = {
  javascript: (snippet) => snippet || '// Write your solution here\n',
  python:     (snippet) => snippet
    ? `# Write your solution here\n\n` + toPythonBoilerplate(snippet)
    : '# Write your solution here\n',
  java:       (snippet) => snippet
    ? toPythonBoilerplate(snippet, 'java')
    : '    // Write your method(s) here\n    public static void yourMethod() {\n        \n    }',
};

function toPythonBoilerplate(snippet, lang) {
  // If the snippet is already in JS (starts with 'function'), convert hints
  if (lang === 'java') {
    return `    // Write your Java method(s) here\n    // The class wrapper is added automatically\n${snippet.split('\n').map(l => '    ' + l).join('\n')}`;
  }
  return `# Translate this to Python:\n${snippet.split('\n').map(l => '# ' + l).join('\n')}\n\n# Your Python solution:\n`;
}

export default function CodeEditor({ initialCode = '', language: defaultLang = 'javascript', onRun, testCases = [] }) {
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [codes, setCodes] = useState({
    javascript: BOILERPLATE.javascript(initialCode),
    python:     BOILERPLATE.python(initialCode),
    java:       BOILERPLATE.java(initialCode),
  });
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [passedResult, setPassedResult] = useState(false);

  useEffect(() => {
    if (testCases?.length > 0 && selectedLang !== 'javascript') {
      setSelectedLang('javascript');
    }
    setCodes({
      javascript: BOILERPLATE.javascript(initialCode),
      python:     BOILERPLATE.python(initialCode),
      java:       BOILERPLATE.java(initialCode),
    });
    setOutput(null);
    setPassedResult(false);
  }, [initialCode, testCases]);

  const currentCode = codes[selectedLang];

  const handleEditorChange = (value) => {
    setCodes(prev => ({ ...prev, [selectedLang]: value || '' }));
  };

  const handleLangSwitch = (langId) => {
    setSelectedLang(langId);
    setOutput(null);
    setPassedResult(false);
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const testInput = testCases?.length > 0 ? testCases[0].input : '';

      const res = await api.post('/execute/run', {
        language: selectedLang,
        code: currentCode,
        testInput,
      });

      const data = res.data;
      let actualOutput = '';
      let passed = false;

      if (data.success) {
        let fullOutput = data.stdout || '';
        if (data.stderr) fullOutput += '\n' + data.stderr;

        if (testCases?.length > 0) {
          const parts = fullOutput.split(/----TEST_RESULT----/);
          const userOutput = parts[0] ? parts[0].trim() : '';
          const testResult = parts.length > 1 ? parts[1].trim() : '';

          const expected = String(testCases[0].expectedOutput).trim();
          passed = testResult === expected || testResult === expected.replace(/^"|"$/g, '');

          actualOutput = userOutput
            ? userOutput + '\n\n--- Expected Output ---\n' + expected
            : (passed ? `✓ Output: ${testResult}` : `✗ Got: ${testResult} | Expected: ${expected}`);
        } else {
          actualOutput = fullOutput.trim();
          passed = true;
        }
      } else {
        actualOutput = data.stderr || data.error || 'Execution failed';
        passed = false;
      }

      setOutput(actualOutput.trim() || 'Executed with no output.');
      setPassedResult(passed);
    } catch (err) {
      setOutput('Failed to execute: ' + (err.response?.data?.error || err.message));
      setPassedResult(false);
    } finally {
      setIsRunning(false);
    }
  };

  const lang = LANGUAGES.find(l => l.id === selectedLang);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>

      {/* Language Selector */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4 }}>Language:</span>
        {LANGUAGES.map(l => {
          const isExecutionTask = testCases?.length > 0;
          const isDisabled = isExecutionTask && l.id !== 'javascript';
          return (
          <button
            key={l.id}
            onClick={() => !isDisabled && handleLangSwitch(l.id)}
            title={isDisabled ? "Automated testing is only supported in JavaScript for this problem." : ""}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              border: `1.5px solid ${selectedLang === l.id ? l.color : 'var(--border)'}`,
              background: selectedLang === l.id ? l.bg : 'transparent',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.4 : 1,
              transition: 'all 0.15s',
              fontSize: 12, fontWeight: 700,
              color: selectedLang === l.id ? l.color : 'var(--text-muted)',
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: 4, fontSize: 8, fontWeight: 900,
              background: l.color, color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{l.icon}</span>
            {l.label}
          </button>
        )})}
      </div>

      {/* Monaco Editor */}
      <div style={{ border: `1px solid ${lang.color}40`, borderRadius: 10, overflow: 'hidden', height: 420, flexShrink: 0 }}>
        <Editor
          height="100%"
          language={selectedLang}
          theme="vs-dark"
          value={currentCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: selectedLang === 'python' ? 4 : 2,
          }}
        />
      </div>

      {/* Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
          Output
          {passedResult && output !== null && (
            <span style={{ marginLeft: 8, color: '#28c840', fontSize: 11 }}>✓ Test Passed</span>
          )}
          {!passedResult && output !== null && (
            <span style={{ marginLeft: 8, color: '#ff5f57', fontSize: 11 }}>✗ Test Failed</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={executeCode} disabled={isRunning}>
            {isRunning
              ? <><div className="spinner" style={{ width: 12, height: 12 }} /> Running…</>
              : `▶ Run (${lang.label})`}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onRun && onRun(passedResult, output)}
            disabled={output === null || isRunning}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div style={{
        background: '#0f0f1a', color: passedResult ? '#28c840' : '#d4d4d4',
        padding: '12px 16px', borderRadius: 8,
        fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6,
        minHeight: 72, maxHeight: 200, overflowY: 'auto',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        border: output !== null
          ? `1px solid ${passedResult ? '#28c84055' : '#ff5f5733'}`
          : '1px solid #2d2d2d',
        transition: 'border-color 0.3s',
      }}>
        {output !== null ? output : <span style={{ color: '#5c6370' }}>Run your code to see output…</span>}
      </div>
    </div>
  );
}
