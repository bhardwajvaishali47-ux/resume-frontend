import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-surface text-on-surface font-body" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body { background: #101319; }

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
          font-style: normal;
          display: inline-block;
          line-height: 1;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
        }

        .hero-gradient {
          background: linear-gradient(135deg, #ffb3ae 0%, #ff5351 100%);
        }

        .ai-glow {
          box-shadow: 0 0 20px rgba(67, 225, 186, 0.15);
        }

        /* Tailwind-style utility classes for Snitch tokens */
        .bg-surface              { background-color: #101319; }
        .bg-surface-container    { background-color: #1d2026; }
        .bg-surface-container-high { background-color: #272a31; }
        .bg-surface-container-low  { background-color: #191c22; }
        .bg-surface-container-lowest { background-color: #0b0e14; }
        .bg-surface-bright       { background-color: #363940; }
        .text-on-surface         { color: #e1e2eb; }
        .text-on-surface-variant { color: #e4bdba; }
        .text-primary            { color: #ffb3ae; }
        .text-secondary          { color: #43e1ba; }
        .text-tertiary           { color: #ffb95a; }
        .text-on-primary         { color: #68000b; }
        .border-outline-variant  { border-color: #5b403e; }

        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-headline { font-family: 'Inter', sans-serif; }

        .hover-scale:hover { transform: scale(1.05); }
        .active-scale:active { transform: scale(0.95); }
        .transition-all { transition: all 0.2s ease; }

        .feature-card:hover { border-color: rgba(255, 179, 174, 0.2); }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(67,225,186,0.1); }
          50%       { box-shadow: 0 0 30px rgba(67,225,186,0.25); }
        }

        .skill-bar {
          width: 88%;
          height: 6px;
          border-radius: 999px;
          background: #43e1ba;
          box-shadow: 0 0 8px rgba(67,225,186,0.5);
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .hero-flex  { flex-direction: column !important; }
          .metrics-flex { flex-direction: column !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
          .footer-flex { flex-direction: column !important; }
          .footer-links { grid-template-columns: 1fr 1fr; }
          .nav-links { display: none !important; }
        }
      `}</style>

      {/* ── TOP NAV ──────────────────────────────────────────────────────────── */}
      <header style={{ background: '#101319', borderBottom: '1px solid rgba(91,64,62,0.15)', position: 'sticky', top: 0, zIndex: 50 }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 32px', height: 80, maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.04em', color: '#FF4B4B' }}>
            AI Resume Coach
          </div>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              { label: 'Features',     id: 'features'      },
              { label: 'How It Works', id: 'how-it-works'  },
              { label: 'About',        action: 'login'      },
            ].map(link => (
            <a key={link.label}
             onClick={() => {
              if (link.action === 'login') navigate('/login')
              else document.getElementById(link.id!)?.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{ color: '#E4BDBA', fontWeight: 500, padding: '6px 12px', borderRadius: 4, cursor: 'pointer', transition: 'background 0.2s', fontSize: 14 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#272A31')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            {link.label}
            </a>
))}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="hero-gradient"
            style={{ color: '#68000b', fontWeight: 700, padding: '10px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
            Get Started
          </button>
        </nav>
      </header>

      <main>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 128, padding: '80px 32px 128px', overflow: 'hidden' }}>
          <div className="hero-flex" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 64 }}>

            {/* Left — copy */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              {/* Badge */}
              <div style={{ display: 'inline-block', padding: '4px 12px', marginBottom: 24, borderRadius: 4, background: '#272a31', border: '1px solid rgba(91,64,62,0.2)' }}>
                <span className="font-mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffb3ae' }}>
                  System Online: v2.0.0
                </span>
              </div>

              <h1 className="hero-title font-headline" style={{ fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#e1e2eb', marginBottom: 24, lineHeight: 1.1 }}>
                Accelerate Your Career<br />with{' '}
                <span style={{ color: '#ffb3ae', fontStyle: 'italic' }}>Precision AI</span>
              </h1>

              <p style={{ fontSize: 18, color: '#e4bdba', maxWidth: 520, marginBottom: 40, lineHeight: 1.7, fontWeight: 400 }}>
                A personal career coach that analyses your resume against any job description, identifies skill gaps, rewrites your bullets, and downloads your improved CV — all in one session.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/login')}
                  className="hero-gradient"
                  style={{ color: '#68000b', fontWeight: 700, fontSize: 17, padding: '16px 32px', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(255,179,174,0.15)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.filter = 'brightness(1.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)' }}>
                  Get Started Free
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ color: '#e1e2eb', fontWeight: 600, fontSize: 17, padding: '16px 32px', borderRadius: 8, border: '1px solid rgba(91,64,62,0.3)', background: '#272a31', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#363940')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#272a31')}>
                  See How It Works
                </button>
              </div>
            </div>

            {/* Right — dashboard preview card */}
            <div style={{ flex: 1, width: '100%', position: 'relative' }}>
              {/* Back decorative layer */}
              <div style={{ position: 'absolute', top: -24, right: -24, width: '100%', height: '100%', background: '#272a31', borderRadius: 12, border: '1px solid rgba(91,64,62,0.1)', zIndex: 0 }} />

              {/* Main card */}
              <div style={{ background: '#0b0e14', borderRadius: 12, padding: 16, border: '1px solid rgba(91,64,62,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }}>
                {/* Fake window chrome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '0 8px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#93000a' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#c68315' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#02c49f' }} />
                  <span className="font-mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(228,189,186,0.4)', textTransform: 'uppercase' }}>Dashboard_Preview</span>
                </div>

                {/* Mini dashboard preview */}
                <div style={{ borderRadius: 8, overflow: 'hidden', background: '#101319', border: '1px solid rgba(91,64,62,0.15)', padding: 20 }}>
                  {/* Metrics row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                      { label: 'Match Score', value: '72%',  color: '#FFB347' },
                      { label: 'Matched',     value: '13',   color: '#43e1ba' },
                      { label: 'Missing',     value: '6',    color: '#ffb4ab' },
                    ].map(m => (
                      <div key={m.label} style={{ background: '#191c22', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(91,64,62,0.1)' }}>
                        <div className="font-mono" style={{ fontSize: 8, textTransform: 'uppercase', color: '#ab8886', marginBottom: 4, letterSpacing: '0.06em' }}>{m.label}</div>
                        <div className="font-mono" style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Score ring placeholder */}
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ flex: 1, background: '#191c22', borderRadius: 8, padding: 16, border: '1px solid rgba(91,64,62,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#272a31" strokeWidth="8" />
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#FFB347" strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 30}`}
                          strokeDashoffset={`${2 * Math.PI * 30 * (1 - 0.72)}`}
                          strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px #FFB34788)' }} />
                      </svg>
                      <div className="font-mono" style={{ fontSize: 10, color: '#FFB347', textTransform: 'uppercase', marginTop: -52, letterSpacing: '0.04em' }}>72%</div>
                    </div>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Product Roadmap',   pct: 90, color: '#43e1ba' },
                        { label: 'GCP & BigQuery',    pct: 85, color: '#43e1ba' },
                        { label: 'PRD Writing',       pct: 30, color: '#ffb4ab' },
                        { label: 'Ecommerce Exp',     pct: 10, color: '#ffb4ab' },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 9, color: '#ab8886' }}>{s.label}</span>
                            <span className="font-mono" style={{ fontSize: 9, color: s.color }}>{s.pct}%</span>
                          </div>
                          <div style={{ background: '#272a31', borderRadius: 999, height: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 999, boxShadow: `0 0 6px ${s.color}66` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat preview */}
                  <div style={{ marginTop: 12, background: '#191c22', borderRadius: 8, padding: 12, border: '1px solid rgba(91,64,62,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#43e1ba' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#e1e2eb' }}>AI Career Coach</span>
                      <span className="font-mono" style={{ marginLeft: 'auto', fontSize: 8, color: '#43e1ba', textTransform: 'uppercase' }}>Context Loaded</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#6B7A8D', lineHeight: 1.6, borderLeft: '2px solid rgba(255,83,81,0.3)', paddingLeft: 8 }}>
                      "Your GCP credentials are strong — let's reframe your BT Group experience to bridge the ecommerce gap before you apply..."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── METRICS / SOCIAL PROOF ────────────────────────────────────────── */}
        <section style={{ background: '#191c22', padding: '48px 32px', borderTop: '1px solid rgba(91,64,62,0.05)', borderBottom: '1px solid rgba(91,64,62,0.05)' }}>
          <div className="metrics-flex" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, opacity: 0.85 }}>
            {[
              { label: 'GenAI Concepts', value: '10+',      sub: 'implemented end-to-end',    color: '#ffb3ae' },
              { label: 'Context Window', value: '200k',     sub: 'tokens — Claude Sonnet',    color: '#43e1ba' },
              { label: 'Countries',      value: 'India · UK · USA', sub: 'live job listings', color: '#ffb95a' },
              { label: 'Resume Output',  value: '1-click',  sub: 'enhanced PDF download',     color: '#ffb3ae' },
            ].map((m, i) => (
              <div key={m.label} style={{ textAlign: 'center', flex: 1 }}>
                <div className="font-mono" style={{ fontSize: 10, color: m.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#e1e2eb', marginBottom: 2 }}>{m.value}</div>
                <div style={{ fontSize: 12, color: '#e4bdba' }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES BENTO ────────────────────────────────────────────────── */}
        <section id="features" style={{ padding: '100px 32px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 700, color: '#e1e2eb', marginBottom: 16, letterSpacing: '-0.02em' }}>Architected for Success</h2>
            <div style={{ width: 80, height: 4, background: 'linear-gradient(135deg, #ffb3ae, #ff5351)', borderRadius: 999 }} />
          </div>

          <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>

            {/* Large — AI Coach */}
            <div className="feature-card" style={{ gridColumn: 'span 8', background: '#1d2026', padding: 40, borderRadius: 12, border: '1px solid rgba(91,64,62,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color 0.25s' }}>
              <div>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#43e1ba', display: 'block', marginBottom: 24 }}>psychology</span>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#e1e2eb', marginBottom: 16, letterSpacing: '-0.01em' }}>AI Career Coach</h3>
                <p style={{ color: '#e4bdba', lineHeight: 1.7, maxWidth: 520, fontSize: 14 }}>
                  Chat with an AI that already knows your full resume and the job description. It remembers everything said in the conversation, rewrites your bullet points specifically for the target company, and gives advice grounded in a RAG knowledge base of career expertise.
                </p>
              </div>
              <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="font-mono" style={{ fontSize: 10, color: 'rgba(228,189,186,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>LangChain · FAISS · Claude Sonnet</div>
                <div style={{ flex: 1, height: 1, background: 'rgba(91,64,62,0.2)' }} />
              </div>
            </div>

            {/* Small — Skill Gap */}
            <div className="feature-card" style={{ gridColumn: 'span 4', background: '#272a31', padding: 32, borderRadius: 12, border: '1px solid rgba(91,64,62,0.2)', display: 'flex', flexDirection: 'column', transition: 'border-color 0.25s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#ffb3ae', display: 'block', marginBottom: 24 }}>radar</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e1e2eb', marginBottom: 12 }}>Skill Gap Analysis</h3>
              <p style={{ fontSize: 13, color: '#e4bdba', lineHeight: 1.6, marginBottom: 32 }}>
                Visual competency radar, colour-coded skill pills, and ranked action items telling you exactly what to fix first.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(91,64,62,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                  <span className="font-mono" style={{ fontSize: 9, color: '#e4bdba', textTransform: 'uppercase' }}>Match Confidence</span>
                  <span className="font-mono" style={{ fontSize: 9, color: '#43e1ba' }}>72%</span>
                </div>
                <div style={{ background: '#0b0e14', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                  <div className="skill-bar" />
                </div>
              </div>
            </div>

            {/* Small — Bullet Rewriter */}
            <div className="feature-card" style={{ gridColumn: 'span 4', background: '#272a31', padding: 32, borderRadius: 12, border: '1px solid rgba(91,64,62,0.2)', display: 'flex', flexDirection: 'column', transition: 'border-color 0.25s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#ffb95a', display: 'block', marginBottom: 24 }}>auto_fix_high</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e1e2eb', marginBottom: 12 }}>Bullet Rewriter + PDF</h3>
              <p style={{ fontSize: 13, color: '#e4bdba', lineHeight: 1.6 }}>
                The coach rewrites your experience bullets for the target role. One click extracts them, rebuilds your resume, and downloads a formatted PDF.
              </p>
            </div>

            {/* Small — Cover Letter */}
            <div className="feature-card" style={{ gridColumn: 'span 4', background: '#272a31', padding: 32, borderRadius: 12, border: '1px solid rgba(91,64,62,0.2)', display: 'flex', flexDirection: 'column', transition: 'border-color 0.25s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#43e1ba', display: 'block', marginBottom: 24 }}>description</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e1e2eb', marginBottom: 12 }}>Cover Letter Generator</h3>
              <p style={{ fontSize: 13, color: '#e4bdba', lineHeight: 1.6 }}>
                Generates a personalised cover letter that opens with your strongest achievement and honestly addresses domain gaps — specific to the company and role.
              </p>
            </div>

            {/* Wide — Live Jobs */}
            <div className="feature-card" style={{ gridColumn: 'span 4', background: '#272a31', padding: 32, borderRadius: 12, border: '1px solid rgba(91,64,62,0.2)', display: 'flex', flexDirection: 'column', transition: 'border-color 0.25s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#ffb3ae', display: 'block', marginBottom: 24 }}>work</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e1e2eb', marginBottom: 12 }}>Live Job Listings</h3>
              <p style={{ fontSize: 13, color: '#e4bdba', lineHeight: 1.6 }}>
                Real live openings matched to your profile via Adzuna API. Covers India 🇮🇳, UK 🇬🇧, and USA 🇺🇸 — updated in real time.
              </p>
            </div>

          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section id="how-it-works" style={{ padding: '0 32px 100px', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 700, color: '#e1e2eb', marginBottom: 16, letterSpacing: '-0.02em' }}>How It Works</h2>
            <div style={{ width: 80, height: 4, background: 'linear-gradient(135deg, #43e1ba, #02c49f)', borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '01', title: 'Upload your resume + paste the JD',  desc: 'Drop your resume PDF and paste any job description. Our Claude-powered parser extracts every skill, bullet, and qualification automatically.', color: '#FF4B4B' },
              { n: '02', title: 'Get your precision match analysis',   desc: 'Receive a match score, skills delta (matched / partial / missing), competency radar chart, and 3 ranked action items showing exactly what to fix first.', color: '#FFB347' },
              { n: '03', title: 'Chat with your AI career coach',      desc: 'The coach already knows your full resume and the JD. Ask it to rewrite your bullets, explain gaps, draft talking points, or suggest salary ranges.', color: '#43e1ba' },
              { n: '04', title: 'Download your enhanced resume PDF',   desc: 'The app scans your chat for rewritten bullets, merges them into your original resume structure, and generates a clean formatted PDF in one click.', color: '#FFB3AE' },
              { n: '05', title: 'Generate your tailored cover letter', desc: 'A personalised cover letter that opens with your strongest achievement, addresses your domain gaps honestly, and sounds human — not templated.', color: '#FF4B4B' },
            ].map((step, i) => (
              <div key={step.n} style={{ position: 'relative', display: 'flex', gap: 24, paddingBottom: i < 4 ? 40 : 0 }}>
                {i < 4 && <div style={{ position: 'absolute', left: 19, top: 44, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${step.color}44, transparent)` }} />}
                <div className="font-mono" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${step.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: step.color, flexShrink: 0 }}>{step.n}</div>
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e1e2eb', marginBottom: 8, letterSpacing: '-0.01em' }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B7A8D', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section style={{ padding: '0 32px 100px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', background: '#272a31', borderRadius: 20, padding: '80px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(91,64,62,0.2)' }}>
            {/* Decorative icon */}
            <div style={{ position: 'absolute', top: 0, right: 0, padding: 16, opacity: 0.05, fontSize: 200, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 200, fontVariationSettings: "'FILL' 1" }}>architecture</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#e1e2eb', marginBottom: 20, letterSpacing: '-0.03em', position: 'relative', zIndex: 1 }}>
              Stop guessing.{' '}
              <span style={{ color: '#ffb3ae' }}>Start getting hired.</span>
            </h2>
            <p style={{ fontSize: 16, color: '#e4bdba', marginBottom: 40, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
              Upload your resume and any job description. Get a precise match score, an AI coach that rewrites your bullets, and a download-ready enhanced resume — all in one session.
            </p>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <button
                onClick={() => navigate('/login')}
                className="hero-gradient"
                style={{ color: '#68000b', fontWeight: 700, fontSize: 18, padding: '20px 56px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 20px 60px rgba(255,179,174,0.25)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                Create Your Free Account
              </button>
              <div className="font-mono" style={{ marginTop: 20, fontSize: 10, color: 'rgba(228,189,186,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                No Credit Card Required · Instant Setup
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#191C22', borderTop: '1px solid rgba(91,64,62,0.1)', padding: '48px 32px' }}>
        <div className="footer-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1280, margin: '0 auto', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#FF4B4B', marginBottom: 8, letterSpacing: '-0.03em' }}>AI Resume Coach</div>
            <p className="font-mono" style={{ color: '#E4BDBA', fontSize: 11, maxWidth: 280, lineHeight: 1.6 }}>
              Built by Vaishali Bhardwaj — AI Product Manager.<br />
              Powered by Claude AI · LangChain · FastAPI · React.
            </p>
          </div>

          <div className="footer-links" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: '#ffb3ae', letterSpacing: '0.1em', marginBottom: 4 }}>Project</span>
              <a href="https://github.com/bhardwajvaishali47-ux/resume-ai-coach" target="_blank" rel="noopener noreferrer"
                style={{ color: '#E4BDBA', fontSize: 13, transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#E4BDBA')}>
                Backend (GitHub)
              </a>
              <a href="https://github.com/bhardwajvaishali47-ux/resume-frontend" target="_blank" rel="noopener noreferrer"
                style={{ color: '#E4BDBA', fontSize: 13, transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#E4BDBA')}>
                Frontend (GitHub)
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: '#ffb3ae', letterSpacing: '0.1em', marginBottom: 4 }}>Connect</span>
              <a href="https://linkedin.com/in/vaishalibhardwaj" target="_blank" rel="noopener noreferrer"
                style={{ color: '#E4BDBA', fontSize: 13, transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#E4BDBA')}>
                LinkedIn
              </a>
              <span
                onClick={() => navigate('/login')}
                style={{ color: '#E4BDBA', fontSize: 13, transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#E4BDBA')}>
                Sign In →
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
