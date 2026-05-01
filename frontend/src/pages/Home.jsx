import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import "../styles/Home.css";

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");
}

function radarData(cx, cy, r, ratios) {
  return ratios
    .map((ratio, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const d = r * ratio;
      return `${(cx + d * Math.cos(angle)).toFixed(2)},${(cy + d * Math.sin(angle)).toFixed(2)}`;
    })
    .join(" ");
}

const Home = () => {
  return (
    <div className="home">
      <nav className="hn">
        <div className="hn-inner">
          <div className="hn-brand">
            <Zap size={16} fill="currentColor" className="hn-icon" />
            <span>SkillPilot</span>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-dots" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-left">
            <p className="hero-kicker">Competitive learning platform</p>
            <h1 className="hero-h1">
              Learn, improve
              <br />
              <em>Compete in real time</em>
            </h1>
            <p className="hero-sub">
              A real-time quiz platform for engineers who want sharp skills and
              sharper instincts.
            </p>
            <Link to="/login" className="hero-cta">
              Start Learning <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hero-right" aria-hidden="true">
            <div className="hero-code-mockup">
              <div className="hcode-header">
                <div className="hcode-dots">
                  <span className="hcode-dot hcode-dot-red" />
                  <span className="hcode-dot hcode-dot-yel" />
                  <span className="hcode-dot hcode-dot-grn" />
                </div>
                <div className="hcode-tab">Solution.java</div>
                <div className="hcode-timer">00:42</div>
              </div>
              <div className="hcode-body">
                <pre><code>
                  <span className="code-kw">class</span> <span className="code-class">Solution</span> {'{'}<br />
                  {'  '}<span className="code-kw">public boolean</span> <span className="code-fn">isPalindrome</span>(<span className="code-class">String</span> <span className="code-var">s</span>) {'{'}<br />
                  {'    '}<span className="code-kw">int</span> left = <span className="code-num">0</span>, right = <span className="code-var">s</span>.<span className="code-fn">length</span>() - <span className="code-num">1</span>;<br />
                  {'    '}<span className="code-kw">while</span> (left {'<'} right) {'{'}<br />
                  {'      '}<span className="code-kw">if</span> (<span className="code-var">s</span>.<span className="code-fn">charAt</span>(left++) != <span className="code-var">s</span>.<span className="code-fn">charAt</span>(right--))<br />
                  {'        '}<span className="code-kw">return false</span>;<br />
                  {'    '}{'}'}<br />
                  {'    '}<span className="code-kw">return true</span>;<br />
                  {'  '}{'}'}<br />
                  {'}'}
                </code></pre>
              </div>
              <div className="hcode-footer">
                <div className="hcode-console">
                  <div className="hc-line hc-dim">{'>'} Running test cases...</div>
                  <div className="hc-line hc-success">✓ 55/55 test cases passed.</div>
                  <div className="hc-line hc-dim">{'>'} Runtime: <span className="hc-white">2 ms</span></div>
                </div>
                <div className="hcode-btn">Submit code</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feats" id="features">
        <div className="feats-inner">
          <div className="feat-row">
            <div className="feat-text">
              <span className="feat-num">01</span>
              <h2 className="feat-h2">Adaptive Solo Practice</h2>
              <p className="feat-p">
                Every session is unique. Questions adjust on-the-fly based on
                how you perform — harder where you slip, lighter where you're
                solid.
              </p>
            </div>
            <div className="feat-vis">
              <div className="vis-adaptive">
                <svg
                  viewBox="0 0 260 110"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="vis-svg"
                >
                  <path
                    d="M10 80 C40 80 40 40 70 40 C100 40 100 62 130 62 C160 62 160 20 190 20 C220 20 220 48 250 48"
                    stroke="var(--hm-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 80 C40 80 40 40 70 40 C100 40 100 62 130 62 C160 62 160 20 190 20 C220 20 220 48 250 48 L250 105 L10 105 Z"
                    fill="var(--hm-accent)"
                    opacity="0.07"
                  />
                  {[
                    { cx: 70, cy: 40 },
                    { cx: 130, cy: 62 },
                    { cx: 190, cy: 20 },
                  ].map((p, i) => (
                    <circle
                      key={i}
                      cx={p.cx}
                      cy={p.cy}
                      r="4.5"
                      fill="var(--hm-accent)"
                    />
                  ))}
                </svg>
                <div className="vis-wave-labels">
                  <span>Baseline</span>
                  <span>Adaptive</span>
                  <span>Peak</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feat-rule" />

          <div className="feat-row feat-flip">
            <div className="feat-text">
              <span className="feat-num">02</span>
              <h2 className="feat-h2">1v1 Real-Time Battles</h2>
              <p className="feat-p">
                Share an invite code, pick a topic, and go head-to-head. No
                delays, no replays — just you, your opponent, and the clock.
              </p>
            </div>
            <div className="feat-vis">
              <div className="vis-battle">
                <div className="vb-side vb-side-a">
                  <div className="vb-avatar vb-av-a" />
                  <div className="vb-stack">
                    <div className="vb-bar vb-bar-a" style={{ "--h": "72%" }} />
                    <div className="vb-bar vb-bar-a" style={{ "--h": "90%" }} />
                    <div className="vb-bar vb-bar-a" style={{ "--h": "55%" }} />
                  </div>
                </div>
                <div className="vb-vs">VS</div>
                <div className="vb-side vb-side-b">
                  <div className="vb-stack">
                    <div className="vb-bar vb-bar-b" style={{ "--h": "48%" }} />
                    <div className="vb-bar vb-bar-b" style={{ "--h": "62%" }} />
                    <div className="vb-bar vb-bar-b" style={{ "--h": "38%" }} />
                  </div>
                  <div className="vb-avatar vb-av-b" />
                </div>
              </div>
            </div>
          </div>

          <div className="feat-rule" />

          <div className="feat-row">
            <div className="feat-text">
              <span className="feat-num">03</span>
              <h2 className="feat-h2">Global Leaderboards</h2>
              <p className="feat-p">
                Every correct answer counts. Compete across Java, Python,
                JavaScript, AI/ML and more — climb the board, own your stack.
              </p>
            </div>
            <div className="feat-vis">
              <div className="vis-podium">
                <div className="vp-col">
                  <div className="vp-medal">2</div>
                  <div
                    className="vp-block"
                    style={{ "--ph": "70px", "--pc": "var(--hm-silver)" }}
                  />
                </div>
                <div className="vp-col">
                  <div className="vp-medal vp-medal-gold">1</div>
                  <div
                    className="vp-block"
                    style={{ "--ph": "100px", "--pc": "var(--hm-accent)" }}
                  />
                </div>
                <div className="vp-col">
                  <div className="vp-medal">3</div>
                  <div
                    className="vp-block"
                    style={{ "--ph": "50px", "--pc": "var(--hm-bronze)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="feat-rule" />

          <div className="feat-row feat-flip">
            <div className="feat-text">
              <span className="feat-num">04</span>
              <h2 className="feat-h2">Deep Skill Analytics</h2>
              <p className="feat-p">
                Know exactly where your gaps are — broken down by sub-topic.
                Surface weak spots before your next interview does it for you.
              </p>
            </div>
            <div className="feat-vis">
              <div className="vis-radar">
                <svg
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="vis-radar-svg"
                >
                  {[0.3, 0.55, 0.8, 1].map((r, i) => (
                    <polygon
                      key={i}
                      points={hexPoints(80, 80, 58 * r)}
                      stroke="var(--hm-border-strong)"
                      strokeWidth="1"
                      fill="none"
                    />
                  ))}
                  {hexPoints(80, 80, 58)
                    .split(" ")
                    .map((pt, i) => {
                      const [x, y] = pt.split(",").map(Number);
                      return (
                        <line
                          key={i}
                          x1="80"
                          y1="80"
                          x2={x}
                          y2={y}
                          stroke="var(--hm-border-strong)"
                          strokeWidth="1"
                        />
                      );
                    })}
                  <polygon
                    points={radarData(
                      80,
                      80,
                      58,
                      [0.85, 0.6, 0.45, 0.9, 0.7, 0.55],
                    )}
                    fill="var(--hm-accent)"
                    opacity="0.12"
                    stroke="var(--hm-accent)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {radarData(80, 80, 58, [0.85, 0.6, 0.45, 0.9, 0.7, 0.55])
                    .split(" ")
                    .map((pt, i) => {
                      const [x, y] = pt.split(",").map(Number);
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="var(--hm-accent)"
                        />
                      );
                    })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-dots" aria-hidden="true" />
        <div className="cta-inner">
          <h2 className="cta-h2">
            Ready to find out
            <br />
            where you stand?
          </h2>
          <Link to="/signup" className="hero-cta">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="hf">
        <div className="hf-inner">
          <div className="hf-brand">
            <Zap size={14} fill="currentColor" className="hn-icon" />
            <span>SkillPilot</span>
          </div>
          <div className="hf-links">
            <a href="https://github.com/Abhishek720777/SkillPilot" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a>
            <span>Developer Portfolio</span>
            <span>Contact</span>
          </div>
          <p className="hf-copy">© 2026 SkillPilot.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
