import { useState, useRef, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisResult {
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
  partial_skills?: string[]
  strengths: string[]
  gaps: string[]
  recommendation: string
  job_title?: string
}
interface ChatMessage { role: 'user' | 'assistant'; content: string }
interface Job { title: string; company: string; location: string; url?: string; apply_url?: string; salary?: string; description?: string }
type ActiveTab = 'cover' | 'resume' | 'jobs' | 'report'

// ─── API helpers ──────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function apiAnalyze(file: File, jd: string, token: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('job_description', jd)
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Analysis failed')
  return res.json()
}

async function apiChat(message: string, sessionId: string, token: string, raw: any) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      parsed_resume: raw?.parsed_resume,
      job_description: raw?.job_description || '',
      match_result: raw?.match_result,
    }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Chat failed')
  return res.json()
}

async function apiCoverLetter(token: string, raw: any) {
  const res = await fetch(`${API_BASE}/cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      parsed_resume: raw?.parsed_resume,
      job_description: raw?.job_description || '',
      match_result: raw?.match_result,
    }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Cover letter failed')
  return res.json()
}

async function apiJobs(token: string, country: string, raw: any) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      country,
      parsed_resume: raw?.parsed_resume,
      job_description: raw?.job_description || '',
      match_result: raw?.match_result,
    }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Jobs fetch failed')
  return res.json()
}

async function apiEnhanceResume(token: string, raw: any, chatMessages: ChatMessage[]) {
  const res = await fetch(`${API_BASE}/enhance-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      parsed_resume: raw?.parsed_resume,
      chat_messages: chatMessages,
    }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Resume enhancement failed')
  return res.json()
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const safeScore = !score || isNaN(score) ? 0 : score
  const r = 88, circ = 2 * Math.PI * r
  const color = safeScore >= 85 ? '#43e1ba' : safeScore >= 70 ? '#FFB347' : safeScore >= 50 ? '#FFB347' : '#ffb4ab'
  const label = safeScore >= 85 ? 'Strong Match' : safeScore >= 70 ? 'Good Match' : safeScore >= 50 ? 'Moderate Match' : 'Low Match'
  const [offset, setOffset] = useState(circ)
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (safeScore / 100) * circ), 120)
    return () => clearTimeout(t)
  }, [safeScore, circ])
  return (
    <div style={{ position: 'relative', width: 192, height: 192, margin: '0 auto 24px' }}>
      <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 208 208">
        <circle cx="104" cy="104" r={r} fill="transparent" stroke="#272a31" strokeWidth="12" />
        <circle cx="104" cy="104" r={r} fill="transparent" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 10px ${color}88)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 40, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{safeScore}%</span>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', marginTop: 4, letterSpacing: '.06em' }}>{label}</span>
      </div>
    </div>
  )
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────
function RadarChart({ data }: { data: { label: string; profile: number; role: number }[] }) {
  const cx = 100, cy = 100, r = 72, n = data.length
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (val: number, i: number) => ({ x: cx + r * (val / 100) * Math.cos(angle(i)), y: cy + r * (val / 100) * Math.sin(angle(i)) })
  const toPath = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      {[25, 50, 75, 100].map(g => (
        <polygon key={g} points={Array.from({ length: n }, (_, i) => { const p = pt(g, i); return `${p.x},${p.y}` }).join(' ')} fill="none" stroke="#272a31" strokeWidth="0.8" />
      ))}
      {Array.from({ length: n }, (_, i) => { const p = pt(100, i); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#272a31" strokeWidth="0.8" /> })}
      <path d={toPath(data.map((d, i) => pt(d.role, i)))} fill="#FFB3AE18" stroke="#FFB3AE" strokeWidth="1.5" />
      <path d={toPath(data.map((d, i) => pt(d.profile, i)))} fill="#43e1ba18" stroke="#43e1ba" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px #43e1ba66)' }} />
      {data.map((d, i) => { const lp = pt(118, i); return <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="7.5" fill="#ab8886" fontFamily="JetBrains Mono" fontWeight="700" style={{ textTransform: 'uppercase' }}>{d.label}</text> })}
    </svg>
  )
}

const PROMPTS = [
  "Rewrite my BT Group bullets for this role",
  "Rewrite my professional summary",
  "How do I fix my biggest skill gap?",
  "What salary should I negotiate?",
]

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const auth = useContext(AuthContext) as any
  const token = auth?.token || localStorage.getItem('token') || ''

  // Read directly from AuthContext — matches how Login.tsx stores the name
  const displayName = auth?.userName || localStorage.getItem('user_name') || 'User'
  const userEmail = auth?.userEmail || localStorage.getItem('user_email') || ''
  // ── UI state ────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('cover')
  const [showSettings, setShowSettings] = useState(false)   // ✅ correct position
  const [showSupport, setShowSupport] = useState(false)     // ✅ correct position

  // ── Analyze state ───────────────────────────────────────────────────────────
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [rawApiResponse, setRawApiResponse] = useState<any>(null)
  const [analyzeError, setAnalyzeError] = useState('')
  const [analyzed, setAnalyzed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [sessionId] = useState(() => `sess_${Date.now()}`)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Cover state ─────────────────────────────────────────────────────────────
  const [coverLetter, setCoverLetter] = useState('')
  const [coverLoading, setCoverLoading] = useState(false)
  const [coverError, setCoverError] = useState('')
  const [coverDone, setCoverDone] = useState(false)

  // ── Enhanced Resume state ───────────────────────────────────────────────────
  const [enhancing, setEnhancing] = useState(false)
  const [enhanceError, setEnhanceError] = useState('')
  const [enhancedSummary, setEnhancedSummary] = useState('')
  const [pdfBase64, setPdfBase64] = useState('')
  const [enhanceDone, setEnhanceDone] = useState(false)

  // ── Jobs state ──────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState('')
  const [country, setCountry] = useState<'in' | 'gb' | 'us'>('in')
  const [jobsDone, setJobsDone] = useState(false)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, chatLoading])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!resumeFile || !jdText.trim()) {
      setAnalyzeError('Please upload your resume PDF and paste the job description.')
      return
    }
    setAnalyzing(true); setAnalyzeError('')
    try {
      const raw = await apiAnalyze(resumeFile, jdText, token)
      
      const rawWithJD = { ...raw, job_description: jdText }
      setRawApiResponse(rawWithJD)
      const data = raw.match_result ? raw.match_result : raw
      const normalized: AnalysisResult = {
        ...data,
        match_score:    data.match_score    ?? 0,
        matched_skills: data.matched_skills ?? [],
        missing_skills: data.missing_skills ?? [],
        strengths:      data.strengths      ?? [],
        gaps:           data.gaps           ?? [],
        recommendation: data.recommendation ?? '',
        job_title:      data.job_title || raw.job_title || 'Target Role',
        partial_skills: data.partial_skills ?? [],
      }
      setAnalysis(normalized)
      setAnalyzed(true)
      setMessages([{
        role: 'assistant',
        content: `Hi ${displayName}! I've analysed your resume.\n\nMatch score: **${normalized.match_score}%**\n\n${normalized.missing_skills?.length || 0} skill gaps to address.\n\nTip: Ask me to rewrite your bullets — e.g. "Rewrite my BT Group bullets for this role" — then go to the Enhanced Resume tab to download your improved CV.`,
      }])
    } catch (e: any) {
      setAnalyzeError(e.message || 'Analysis failed.')
    } finally { setAnalyzing(false) }
  }

  const handleChat = async (override?: string) => {
    const msg = override || chatInput.trim()
    if (!msg || chatLoading) return
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setChatInput(''); setChatLoading(true)
    try {
      const data = await apiChat(msg, sessionId, token, rawApiResponse)
      const reply = data.response || data.message || data.reply || data.content || ''
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      const rewriteKeywords = ['rewritten', 'improved', 'stronger bullet', '•', 'here are your']
      const hasRewrites = rewriteKeywords.some(k => reply.toLowerCase().includes(k))
      if (hasRewrites) { setEnhanceDone(false); setPdfBase64(''); setEnhancedSummary('') }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${e.message || 'Unknown error'}` }])
    } finally { setChatLoading(false) }
  }

  const handleGenerateCover = async () => {
    setCoverLoading(true); setCoverError('')
    try {
      const data = await apiCoverLetter(token, rawApiResponse)
      setCoverLetter(data.cover_letter || data.content || data.letter || data.text || '')
      setCoverDone(true)
    } catch (e: any) {
      setCoverError(e.message || 'Failed to generate cover letter.')
    } finally { setCoverLoading(false) }
  }

  const handleEnhanceResume = async () => {
    if (messages.length === 0) { setEnhanceError('Chat with the AI coach first to rewrite your bullets.'); return }
    setEnhancing(true); setEnhanceError(''); setEnhanceDone(false)
    try {
      const data = await apiEnhanceResume(token, rawApiResponse, messages)
      setEnhancedSummary(data.summary || 'Resume enhanced successfully.')
      setPdfBase64(data.pdf_base64 || '')
      setEnhanceDone(true)
    } catch (e: any) {
      setEnhanceError(e.message || 'Failed to enhance resume.')
    } finally { setEnhancing(false) }
  }

  const handleDownloadPdf = () => {
    if (!pdfBase64) return
    const byteChars = atob(pdfBase64)
    const byteNumbers = Array.from(byteChars).map(c => c.charCodeAt(0))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Enhanced_Resume_${new Date().toISOString().slice(0, 10)}.pdf`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const handleFetchJobs = async () => {
    setJobsLoading(true); setJobsError('')
    try {
      const data = await apiJobs(token, country, rawApiResponse)
      setJobs(data.jobs || data.results || data || [])
      setJobsDone(true)
    } catch (e: any) {
      setJobsError(e.message || 'Failed to fetch jobs.')
    } finally { setJobsLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    auth?.logout?.(); window.location.href = '/'
  }

  const handleReset = () => {
    setAnalyzed(false); setAnalysis(null); setRawApiResponse(null)
    setMessages([]); setResumeFile(null); setJdText('')
    setCoverDone(false); setCoverLetter(''); setCoverError('')
    setEnhanceDone(false); setPdfBase64(''); setEnhancedSummary(''); setEnhanceError('')
    setJobsDone(false); setJobs([]); setJobsError('')
    setAnalyzeError('')
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const safeScore = !analysis?.match_score || isNaN(analysis.match_score) ? 0 : analysis.match_score
  const topActions = analysis ? [
    analysis.missing_skills?.[0] ? `Add "${analysis.missing_skills[0]}" with a concrete project example.` : '',
    analysis.gaps?.[0] || '',
    analysis.missing_skills?.[1] ? `Bridge the "${analysis.missing_skills[1]}" gap by reframing relevant work.` : '',
  ].filter(Boolean) : []
  const radarData = analysis ? [
    { label: 'Technical',  profile: Math.min(98, (analysis.matched_skills?.length || 0) * 7), role: 80 },
    { label: 'Strategy',   profile: Math.max(20, safeScore - 8),  role: 75 },
    { label: 'Data',       profile: Math.min(98, safeScore + 5),  role: 70 },
    { label: 'Domain',     profile: Math.max(15, safeScore - 28), role: 90 },
    { label: 'Leadership', profile: Math.min(98, safeScore + 10), role: 65 },
  ] : []
  const SIDEBAR_W = sidebarOpen ? 220 : 56

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#101319', color: '#e1e2eb', fontFamily: "'Inter',sans-serif", minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink    { 0%,100%{opacity:1;} 50%{opacity:.3;} }
        @keyframes dotPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.5);} }
        * { box-sizing: border-box; }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
        .mono    { font-family: 'JetBrains Mono', monospace; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { -ms-overflow-style:none; scrollbar-width:none; }
        .btn-coral { background: linear-gradient(135deg,#FFB3AE,#FF5351); color:#68000b; font-weight:700; border:none; cursor:pointer; transition:transform .15s, box-shadow .15s; }
        .btn-coral:hover    { transform:scale(1.02); box-shadow:0 8px 20px -4px rgba(255,83,81,.35); }
        .btn-coral:active   { transform:scale(0.98); }
        .btn-coral:disabled { opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }
        .card { background:#191C22; border:1px solid rgba(91,64,62,.13); border-radius:12px; }
        .skill-green { background:rgba(67,225,186,.1);  color:#43e1ba; border:1px solid rgba(67,225,186,.22);  border-radius:999px; padding:3px 10px; font-size:12px; display:inline-flex; align-items:center; gap:5px; }
        .skill-red   { background:rgba(255,180,171,.1); color:#ffb4ab; border:1px solid rgba(255,180,171,.22); border-radius:999px; padding:3px 10px; font-size:12px; display:inline-flex; align-items:center; gap:5px; }
        .skill-amber { background:rgba(255,179,71,.1);  color:#FFB347; border:1px solid rgba(255,179,71,.22);  border-radius:999px; padding:3px 10px; font-size:12px; display:inline-flex; align-items:center; gap:5px; }
        .tab-btn { padding:14px 20px; font-family:'JetBrains Mono',monospace; font-size:10px; text-transform:uppercase; letter-spacing:.08em; border:none; background:transparent; cursor:pointer; white-space:nowrap; border-bottom:2px solid transparent; transition:color .2s, border-color .2s; }
        .tab-btn.active   { color:#FFB3AE; border-bottom-color:#FF4B4B; }
        .tab-btn.inactive { color:#ab8886; }
        .tab-btn.inactive:hover { color:#e1e2eb; }
        .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; border:none; cursor:pointer; width:100%; text-align:left; transition:background .15s, color .15s; border-left:3px solid transparent; font-family:'JetBrains Mono',monospace; font-size:11px; text-transform:uppercase; letter-spacing:.05em; }
        .nav-item.active   { background:#272A31; color:#FFB3AE; border-left-color:#FF4B4B; }
        .nav-item.inactive { background:transparent; color:#E4BDBA; }
        .nav-item.inactive:hover { background:rgba(39,42,49,.5); }
        .collapse-btn { background:rgba(39,42,49,.8); border:1px solid rgba(91,64,62,.2); border-radius:6px; cursor:pointer; color:#ab8886; padding:4px 6px; transition:all .2s; display:flex; align-items:center; justify-content:center; }
        .collapse-btn:hover { color:#FFB3AE; border-color:rgba(255,75,75,.3); }
        .dot-typing span { width:7px; height:7px; border-radius:50%; background:#5b403e; display:inline-block; }
        .dot-typing span:nth-child(1) { animation:dotPulse 1.2s ease-in-out 0s   infinite; }
        .dot-typing span:nth-child(2) { animation:dotPulse 1.2s ease-in-out 0.2s infinite; }
        .dot-typing span:nth-child(3) { animation:dotPulse 1.2s ease-in-out 0.4s infinite; }
        .download-btn { background: linear-gradient(135deg,#43e1ba,#00c4a0); color:#002e25; font-weight:800; border:none; cursor:pointer; border-radius:10px; padding:14px 28px; font-size:14px; display:flex; align-items:center; gap:8px; transition:transform .15s, box-shadow .15s; box-shadow:0 4px 20px rgba(67,225,186,.3); }
        .download-btn:hover { transform:scale(1.03); box-shadow:0 8px 30px rgba(67,225,186,.5); }
        .step-badge { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; flex-shrink:0; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:100; display:flex; align-items:center; justify-content:center; animation:fadeUp .2s ease; }
        .modal-box { background:#191C22; border:1px solid rgba(91,64,62,.25); border-radius:14px; padding:32px; width:460px; max-width:92vw; max-height:88vh; overflow-y:auto; }
        input, textarea, select { font-family:'Inter',sans-serif; }
        input:focus, textarea:focus, select:focus { outline:none; }
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; }
          .metrics-grid { grid-template-columns: repeat(2,1fr) !important; }
          .main-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── TOP NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{ background:'#101319', borderBottom:'1px solid rgba(91,64,62,.15)', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', height:56, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="collapse-btn" onClick={() => setSidebarOpen(v => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span style={{ fontSize:18, fontWeight:800, letterSpacing:'-0.04em', color:'#FF4B4B' }}>AI Resume Coach</span>
          {sidebarOpen && <span className="mono" style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'.08em', color:'#E4BDBA' }}>Dashboard <span style={{ color:'#FFB3AE' }}>› Analysis</span></span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:13, color:'#e1e2eb' }}>{displayName}</span>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'#FF5351', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#68000b' }}>
            {displayName[0].toUpperCase()}
          </div>
          <button onClick={handleLogout} className="mono" style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, background:'none', border:'1px solid rgba(91,64,62,.2)', color:'#E4BDBA', cursor:'pointer', fontSize:10, textTransform:'uppercase' }}>
            ↩ Logout
          </button>
        </div>
      </nav>

      <div style={{ display:'flex', minHeight:'calc(100vh - 56px)' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
        <aside style={{ background:'#191C22', width:SIDEBAR_W, position:'fixed', left:0, top:56, height:'calc(100vh - 56px)', display:'flex', flexDirection:'column', padding:'20px 0', boxShadow:'4px 0 20px rgba(0,0,0,.4)', zIndex:40, transition:'width .25s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden' }}>

          {sidebarOpen && (
            <div style={{ padding:'0 12px', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:10, borderRadius:10, background:'rgba(39,42,49,.5)' }}>
                <div style={{ width:34, height:34, borderRadius:8, background:'rgba(255,83,81,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🧠</div>
                <div style={{ overflow:'hidden' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#e1e2eb', whiteSpace:'nowrap' }}>Precision Architect</div>
                  <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#ab8886', marginTop:3 }}>AI Career Mentor</div>
                </div>
              </div>
            </div>
          )}

          <nav style={{ flex:1, padding:'0 8px', display:'flex', flexDirection:'column', gap:3 }}>
            {([
              { tab:'report' as ActiveTab, emoji:'📊', label:'Analysis'        },
              { tab:'cover'  as ActiveTab, emoji:'📝', label:'Cover Letter'    },
              { tab:'resume' as ActiveTab, emoji:'📄', label:'Enhanced Resume' },
              { tab:'jobs'   as ActiveTab, emoji:'💼', label:'Job Listings'    },
            ]).map(item => (
              <button key={item.tab}
                className={`nav-item ${activeTab === item.tab ? 'active' : 'inactive'}`}
                onClick={() => setActiveTab(item.tab)}
                title={!sidebarOpen ? item.label : undefined}
                style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{item.emoji}</span>
                {sidebarOpen && <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* ── SIDEBAR BOTTOM ── */}
          <div style={{ padding:'0 8px', marginTop:'auto', display:'flex', flexDirection:'column', gap:3 }}>
            {sidebarOpen && (
              <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#4D5A72', padding:'0 12px', marginBottom:4, letterSpacing:'.08em' }}>Account</div>
            )}

            {/* ✅ SETTINGS BUTTON — correctly structured */}
            <button
              className="nav-item inactive"
              onClick={() => setShowSettings(true)}
              title={!sidebarOpen ? 'Settings' : undefined}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
              <span style={{ fontSize:15 }}>⚙️</span>
              {sidebarOpen && <span>Settings</span>}
            </button>

            {/* ✅ SUPPORT BUTTON — correctly structured */}
            <button
              className="nav-item inactive"
              onClick={() => setShowSupport(true)}
              title={!sidebarOpen ? 'Support' : undefined}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
              <span style={{ fontSize:15 }}>❓</span>
              {sidebarOpen && <span>Support</span>}
            </button>

            <button
              className="btn-coral"
              onClick={handleReset}
              style={{ marginTop:12, padding: sidebarOpen ? '10px' : '8px', borderRadius:8, fontSize: sidebarOpen ? 12 : 16, width:'100%' }}
              title={!sidebarOpen ? 'New Analysis' : undefined}>
              {sidebarOpen ? '+ New Analysis' : '+'}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
        <main className="main-content" style={{ flex:1, marginLeft:SIDEBAR_W, padding:'20px', overflowX:'hidden', minWidth:0, transition:'margin-left .25s cubic-bezier(0.4,0,0.2,1)' }}>

          {/* UPLOAD PANEL */}
          {!analyzed && (
            <div className="fade-up" style={{ maxWidth:640, margin:'0 auto' }}>
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontSize:22, fontWeight:800, color:'#e1e2eb', marginBottom:6, letterSpacing:'-0.02em' }}>
                  Hi {displayName}, let's find your best role fit 👋
                </h1>
                <p style={{ fontSize:14, color:'#ab8886' }}>Upload your resume and paste the job description to get your personalised match score.</p>
              </div>

              {analyzeError && (
                <div style={{ marginBottom:14, padding:14, borderRadius:10, background:'rgba(255,180,171,.1)', border:'1px solid rgba(255,180,171,.2)', color:'#ffb4ab', fontSize:13 }}>
                  ⚠ {analyzeError}
                </div>
              )}

              <div className="card" style={{ padding:20, marginBottom:14 }}>
                <div className="mono" style={{ fontSize:9, textTransform:'uppercase', color:'#ab8886', marginBottom:10, letterSpacing:'.08em' }}>Resume PDF</div>
                <div onClick={() => fileRef.current?.click()} style={{ border:`2px dashed ${resumeFile ? '#43e1ba55' : 'rgba(91,64,62,.35)'}`, borderRadius:10, padding:'32px 20px', textAlign:'center', cursor:'pointer', background: resumeFile ? 'rgba(67,225,186,.04)' : 'transparent', transition:'all .2s' }}>
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display:'none' }} onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                  {resumeFile ? (
                    <><div style={{ fontSize:24, marginBottom:6 }}>✅</div><div style={{ fontSize:13, fontWeight:700, color:'#43e1ba' }}>{resumeFile.name}</div><div style={{ fontSize:11, color:'#ab8886', marginTop:3 }}>{(resumeFile.size/1024).toFixed(0)} KB · Click to replace</div></>
                  ) : (
                    <><div style={{ fontSize:28, marginBottom:8 }}>📄</div><div style={{ fontSize:13, fontWeight:600, color:'#e1e2eb', marginBottom:3 }}>Click to upload your resume</div><div style={{ fontSize:11, color:'#ab8886' }}>PDF only · Max 10MB</div></>
                  )}
                </div>
              </div>

              <div className="card" style={{ padding:20, marginBottom:20 }}>
                <div className="mono" style={{ fontSize:9, textTransform:'uppercase', color:'#ab8886', marginBottom:10, letterSpacing:'.08em' }}>Job Description</div>
                <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here..." rows={8}
                  style={{ width:'100%', background:'#101319', border:'1px solid rgba(91,64,62,.3)', borderRadius:8, padding:14, fontSize:13, color:'#e1e2eb', resize:'vertical', lineHeight:1.6 }} />
                <div className="mono" style={{ fontSize:9, color:'#4D5A72', marginTop:5, textAlign:'right' }}>{jdText.length} chars</div>
              </div>

              <button onClick={handleAnalyze} disabled={analyzing} className="btn-coral"
                style={{ width:'100%', padding:'14px', borderRadius:10, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {analyzing
                  ? <><svg width="16" height="16" viewBox="0 0 24 24" style={{ animation:'spin .8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round"/></svg>Analysing…</>
                  : '🔍 Analyse My Resume'}
              </button>
            </div>
          )}

          {/* FULL DASHBOARD */}
          {analyzed && analysis && (
            <div className="fade-up">

              <div className="metrics-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
                {[
                  { label:'Match Score',     value:`${safeScore}%`,                              color: safeScore >= 70 ? '#43e1ba' : '#FFB347' },
                  { label:'Matched Skills',  value:String(analysis.matched_skills?.length || 0), color:'#43e1ba' },
                  { label:'Missing Skills',  value:String(analysis.missing_skills?.length || 0), color:'#ffb4ab' },
                  { label:'Strengths Found', value:String(analysis.strengths?.length || 0),      color:'#FFB3AE' },
                ].map(m => (
                  <div key={m.label} className="card" style={{ padding:'16px 18px' }}>
                    <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#ab8886', marginBottom:6, letterSpacing:'.08em' }}>{m.label}</div>
                    <div className="mono" style={{ fontSize:26, fontWeight:800, color:m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {topActions.length > 0 && (
                <div className="card" style={{ padding:20, marginBottom:20, border:'1px solid rgba(255,75,75,.18)', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, background:'rgba(255,75,75,.04)', borderRadius:'50%', filter:'blur(20px)', pointerEvents:'none' }} />
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <span style={{ color:'#FFB3AE' }}>⚡</span>
                    <h2 style={{ fontSize:14, fontWeight:700, color:'#e1e2eb', margin:0 }}>Top {topActions.length} Actions to Reach 100% Match</h2>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(topActions.length,3)},1fr)`, gap:10 }}>
                    {topActions.slice(0,3).map((a,i) => (
                      <div key={i} style={{ background:'#1d2026', padding:14, borderRadius:8, border:'1px solid rgba(91,64,62,.1)', display:'flex', alignItems:'flex-start', gap:10 }}>
                        <span className="mono step-badge" style={{ background:'rgba(255,75,75,.1)', color:'#FFB3AE' }}>{i+1}</span>
                        <p style={{ fontSize:12, lineHeight:1.5, color:'#e1e2eb', margin:0 }}>{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="main-grid" style={{ display:'grid', gridTemplateColumns:'5fr 6fr', gap:20, alignItems:'start' }}>

                {/* LEFT COLUMN */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div className="card" style={{ padding:24, textAlign:'center' }}>
                    <ScoreRing score={safeScore} />
                    <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6, color:'#e1e2eb' }}>{analysis.job_title || 'Target Role'}</h3>
                    <p style={{ fontSize:12, color:'#ab8886', marginBottom:20, lineHeight:1.6 }}>
                      {(analysis.recommendation || '').slice(0, 120)}{(analysis.recommendation?.length || 0) > 120 ? '…' : ''}
                    </p>
                    <button className="btn-coral" style={{ width:'100%', padding:'12px', borderRadius:10, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
                      onClick={() => { setActiveTab('cover'); handleGenerateCover() }}>
                      ✨ Start Tailoring Resume
                    </button>
                  </div>

                  <div className="card" style={{ padding:20 }}>
                    <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#ab8886', marginBottom:16, paddingBottom:8, borderBottom:'1px solid rgba(91,64,62,.1)', letterSpacing:'.08em' }}>Skills Delta</div>
                    {(analysis.matched_skills?.length || 0) > 0 && (
                      <div style={{ marginBottom:14 }}>
                        <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#43e1ba', marginBottom:8 }}>✅ Matched</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{analysis.matched_skills.map(s => <span key={s} className="skill-green">✓ {s}</span>)}</div>
                      </div>
                    )}
                    {(analysis.partial_skills?.length || 0) > 0 && (
                      <div style={{ marginBottom:14 }}>
                        <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#FFB347', marginBottom:8 }}>⚠ Partial</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{analysis.partial_skills!.map(s => <span key={s} className="skill-amber">~ {s}</span>)}</div>
                      </div>
                    )}
                    {(analysis.missing_skills?.length || 0) > 0 && (
                      <div>
                        <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#ffb4ab', marginBottom:8 }}>❌ Missing</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{analysis.missing_skills.map(s => <span key={s} className="skill-red">✗ {s}</span>)}</div>
                      </div>
                    )}
                  </div>

                  {radarData.length > 0 && (
                    <div className="card" style={{ padding:20 }}>
                      <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#ab8886', marginBottom:12 }}>Competency Radar</div>
                      <div style={{ width:'100%', maxWidth:240, margin:'0 auto', aspectRatio:'1' }}><RadarChart data={radarData} /></div>
                      <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:10 }}>
                        <div className="mono" style={{ display:'flex', alignItems:'center', gap:5, fontSize:8, textTransform:'uppercase' }}><span style={{ width:8, height:8, borderRadius:'50%', background:'#43e1ba', display:'inline-block' }} /> Your Profile</div>
                        <div className="mono" style={{ display:'flex', alignItems:'center', gap:5, fontSize:8, textTransform:'uppercase', color:'#ab8886' }}><span style={{ width:8, height:8, borderRadius:'50%', background:'#FFB3AE', display:'inline-block' }} /> Role Required</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                  {/* Chat */}
                  <div className="card" style={{ display:'flex', flexDirection:'column', height:480 }}>
                    <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(91,64,62,.1)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:7, height:7, borderRadius:'50%', background:'#43e1ba', display:'inline-block', animation:'blink 2s ease-in-out infinite' }} />
                        <span style={{ fontWeight:700, fontSize:13 }}>AI Career Coach</span>
                      </div>
                      <span className="mono" style={{ padding:'2px 7px', borderRadius:4, background:'rgba(67,225,186,.1)', color:'#43e1ba', fontSize:8, textTransform:'uppercase' }}>Context Loaded</span>
                    </div>
                    <div className="no-scroll" style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
                      {messages.map((msg, i) => (
                        <div key={i} style={{ display:'flex', gap:8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth:'90%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          {msg.role === 'assistant' && <div style={{ width:28, height:28, borderRadius:7, background:'#272a31', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🤖</div>}
                          <div style={{ padding:'10px 14px', borderRadius:12, fontSize:12, lineHeight:1.65, whiteSpace:'pre-wrap', borderTopLeftRadius: msg.role === 'assistant' ? 3 : 12, borderTopRightRadius: msg.role === 'user' ? 3 : 12, background: msg.role === 'assistant' ? '#272a31' : 'rgba(255,75,75,.1)', border: msg.role === 'user' ? '1px solid rgba(255,75,75,.2)' : 'none', color:'#e1e2eb' }}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div style={{ display:'flex', gap:8, alignSelf:'flex-start' }}>
                          <div style={{ width:28, height:28, borderRadius:7, background:'#272a31', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🤖</div>
                          <div style={{ padding:'12px 16px', borderRadius:12, borderTopLeftRadius:3, background:'#272a31', display:'flex', gap:5, alignItems:'center' }} className="dot-typing"><span /><span /><span /></div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="no-scroll" style={{ padding:'6px 12px', display:'flex', gap:6, overflowX:'auto', flexShrink:0 }}>
                      {PROMPTS.map(p => (
                        <button key={p} onClick={() => handleChat(p)} style={{ flexShrink:0, padding:'5px 10px', borderRadius:999, background:'#272a31', border:'1px solid rgba(91,64,62,.15)', color:'#ab8886', fontSize:9, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", whiteSpace:'nowrap' }}>"{p}"</button>
                      ))}
                    </div>
                    <div style={{ padding:'10px 14px', background:'#101319', borderTop:'1px solid rgba(91,64,62,.1)', borderRadius:'0 0 12px 12px', flexShrink:0 }}>
                      <div style={{ position:'relative' }}>
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat() } }}
                          placeholder="Ask your career coach…" disabled={chatLoading}
                          style={{ width:'100%', background:'#272a31', border:'1px solid rgba(91,64,62,.2)', borderRadius:8, padding:'10px 44px 10px 14px', fontSize:13, color:'#e1e2eb' }} />
                        <button onClick={() => handleChat()} disabled={chatLoading || !chatInput.trim()}
                          style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', padding:7, borderRadius:7, background:'none', border:'none', color:'#FFB3AE', cursor:'pointer', fontSize:16, opacity: chatLoading || !chatInput.trim() ? 0.4 : 1 }}>↑</button>
                      </div>
                    </div>
                  </div>

                  {analysis.recommendation && (
                    <div style={{ borderLeft:'4px solid #FF4B4B', padding:'14px 18px', borderRadius:'0 10px 10px 0', background:'rgba(255,75,75,.07)' }}>
                      <div style={{ display:'flex', gap:10 }}>
                        <span style={{ color:'#FFB3AE', fontSize:16, flexShrink:0 }}>💡</span>
                        <p style={{ fontSize:12, lineHeight:1.7, color:'#e1e2eb', margin:0 }}>{analysis.recommendation}</p>
                      </div>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="card" style={{ overflow:'hidden' }}>
                    <div className="no-scroll" style={{ display:'flex', borderBottom:'1px solid rgba(91,64,62,.1)', overflowX:'auto' }}>
                      {(['cover','resume','jobs','report'] as ActiveTab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'active' : 'inactive'}`}>
                          {tab === 'cover' ? '📝 Cover' : tab === 'resume' ? '📄 Resume' : tab === 'jobs' ? '💼 Jobs' : '📊 Report'}
                        </button>
                      ))}
                    </div>
                    <div style={{ padding:22 }}>

                      {activeTab === 'cover' && (
                        <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <div><h3 style={{ fontSize:16, fontWeight:700, color:'#e1e2eb', margin:0 }}>Cover Letter</h3><div className="mono" style={{ fontSize:8, color:'#ab8886', textTransform:'uppercase', marginTop:3 }}>Personalised for this role</div></div>
                            {coverDone && <button onClick={() => navigator.clipboard.writeText(coverLetter)} style={{ padding:'6px 10px', borderRadius:7, background:'#272a31', border:'none', color:'#ab8886', cursor:'pointer', fontSize:12 }}>📋</button>}
                          </div>
                          {coverError && <div style={{ padding:12, borderRadius:8, background:'rgba(255,180,171,.1)', border:'1px solid rgba(255,180,171,.2)', color:'#ffb4ab', fontSize:12 }}>⚠ {coverError}</div>}
                          {!coverDone ? (
                            <div style={{ textAlign:'center', padding:'30px 16px' }}>
                              <div style={{ fontSize:36, marginBottom:12 }}>✉️</div>
                              <p style={{ fontSize:13, color:'#ab8886', marginBottom:20, lineHeight:1.6 }}>Generate a personalised cover letter highlighting your strengths and addressing gaps honestly.</p>
                              <button onClick={handleGenerateCover} disabled={coverLoading} className="btn-coral" style={{ padding:'10px 28px', borderRadius:8, fontSize:13, display:'inline-flex', alignItems:'center', gap:7 }}>
                                {coverLoading ? <><svg width="14" height="14" viewBox="0 0 24 24" style={{ animation:'spin .8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round"/></svg>Generating…</> : '✨ Generate Cover Letter'}
                              </button>
                            </div>
                          ) : (
                            <div className="no-scroll" style={{ background:'#101319', padding:16, borderRadius:8, border:'1px solid rgba(91,64,62,.1)', fontSize:12, lineHeight:1.75, color:'#ab8886', maxHeight:240, overflowY:'auto', whiteSpace:'pre-wrap' }}>{coverLetter}</div>
                          )}
                        </div>
                      )}

                      {activeTab === 'resume' && (
                        <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
                          <div>
                            <h3 style={{ fontSize:16, fontWeight:700, color:'#e1e2eb', margin:0 }}>Enhanced Resume</h3>
                            <div className="mono" style={{ fontSize:8, color:'#ab8886', textTransform:'uppercase', marginTop:3, letterSpacing:'.05em' }}>AI-rewritten bullets → downloadable PDF</div>
                          </div>
                          {!enhanceDone && (
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                              {[
                                { n:1, color:'#FFB3AE', bg:'rgba(255,75,75,.1)',    text:'Ask the coach to rewrite your bullets — e.g. "Rewrite my BT Group bullets for Flipkart"' },
                                { n:2, color:'#FFB347', bg:'rgba(255,179,71,.1)',   text:'The coach rewrites them in the chat using your resume and job context' },
                                { n:3, color:'#43e1ba', bg:'rgba(67,225,186,.1)',   text:'Click "Apply & Download PDF" — the app extracts rewrites and generates your enhanced resume' },
                              ].map(step => (
                                <div key={step.n} style={{ display:'flex', alignItems:'flex-start', gap:12, background:'#1d2026', padding:14, borderRadius:8, border:`1px solid ${step.color}22` }}>
                                  <span className="step-badge" style={{ background:step.bg, color:step.color }}>{step.n}</span>
                                  <p style={{ fontSize:12, color:'#e1e2eb', margin:0, lineHeight:1.55 }}>{step.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {!enhanceDone && (
                            <div>
                              <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#ab8886', marginBottom:8, letterSpacing:'.06em' }}>Quick Rewrite Prompts</div>
                              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                                {['Rewrite my BT Group bullets for this role','Rewrite my professional summary','Strengthen my most recent role bullets','Make my experience sound more product-led'].map(p => (
                                  <button key={p} onClick={() => handleChat(p)} style={{ padding:'7px 12px', borderRadius:999, background:'#272a31', border:'1px solid rgba(91,64,62,.2)', color:'#E4BDBA', fontSize:11, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", whiteSpace:'nowrap' }}>{p}</button>
                                ))}
                              </div>
                            </div>
                          )}
                          {enhanceError && <div style={{ padding:12, borderRadius:8, background:'rgba(255,180,171,.1)', border:'1px solid rgba(255,180,171,.2)', color:'#ffb4ab', fontSize:12 }}>⚠ {enhanceError}</div>}
                          {!enhanceDone && (
                            <button onClick={handleEnhanceResume} disabled={enhancing || messages.length === 0} className="btn-coral"
                              style={{ padding:'14px', borderRadius:10, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4 }}>
                              {enhancing
                                ? <><svg width="16" height="16" viewBox="0 0 24 24" style={{ animation:'spin .8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round"/></svg>Extracting rewrites & generating PDF…</>
                                : messages.length === 0 ? '💬 Chat with the coach first' : '🚀 Apply Rewrites & Generate PDF'}
                            </button>
                          )}
                          {enhanceDone && (
                            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14 }}>
                              <div style={{ background:'rgba(67,225,186,.06)', border:'1px solid rgba(67,225,186,.2)', borderRadius:10, padding:16 }}>
                                <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#43e1ba', marginBottom:8, letterSpacing:'.06em' }}>✅ Enhancement Summary</div>
                                <p style={{ fontSize:12, color:'#e1e2eb', margin:0, lineHeight:1.65, whiteSpace:'pre-line' }}>{enhancedSummary}</p>
                              </div>
                              <button onClick={handleDownloadPdf} className="download-btn" style={{ width:'100%', justifyContent:'center' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Download Enhanced Resume PDF
                              </button>
                              <button onClick={() => { setEnhanceDone(false); setPdfBase64(''); setEnhancedSummary('') }}
                                style={{ background:'none', border:'1px solid rgba(91,64,62,.2)', borderRadius:8, padding:'8px 14px', color:'#ab8886', cursor:'pointer', fontSize:11, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'.05em' }}>
                                ↩ Chat more & regenerate
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'jobs' && (
                        <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                            <div><h3 style={{ fontSize:16, fontWeight:700, color:'#e1e2eb', margin:0 }}>Live Job Listings</h3><div className="mono" style={{ fontSize:8, color:'#ab8886', textTransform:'uppercase', marginTop:3 }}>Matched to your profile</div></div>
                            <div style={{ display:'flex', gap:8 }}>
                              <select value={country} onChange={e => setCountry(e.target.value as any)} style={{ background:'#272a31', border:'1px solid rgba(91,64,62,.2)', borderRadius:7, padding:'7px 10px', fontSize:11, color:'#e1e2eb', fontFamily:"'JetBrains Mono',monospace" }}>
                                <option value="in">🇮🇳 India</option><option value="gb">🇬🇧 UK</option><option value="us">🇺🇸 USA</option>
                              </select>
                              <button onClick={handleFetchJobs} disabled={jobsLoading} className="btn-coral" style={{ padding:'7px 14px', borderRadius:7, fontSize:11, display:'inline-flex', alignItems:'center', gap:5 }}>
                                {jobsLoading ? <><svg width="11" height="11" viewBox="0 0 24 24" style={{ animation:'spin .8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round"/></svg>Searching…</> : '🔍 Search'}
                              </button>
                            </div>
                          </div>
                          {jobsError && <div style={{ padding:12, borderRadius:8, background:'rgba(255,180,171,.1)', border:'1px solid rgba(255,180,171,.2)', color:'#ffb4ab', fontSize:12 }}>⚠ {jobsError}</div>}
                          {!jobsDone && !jobsLoading && <div style={{ textAlign:'center', padding:'30px 0' }}><div style={{ fontSize:32, marginBottom:10 }}>🔍</div><p style={{ fontSize:12, color:'#ab8886' }}>Select a region and search for live job matches.</p></div>}
                          {jobsDone && jobs.length === 0 && <div style={{ textAlign:'center', padding:'24px 0', color:'#ab8886', fontSize:12 }}>No jobs found. Try a different region.</div>}
                          <div className="no-scroll" style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:260, overflowY:'auto' }}>
                            {jobs.map((job, i) => (
                              <a key={i} href={job.apply_url} target="_blank" rel="noopener noreferrer"
                                style={{ display:'block', background:'#1d2026', padding:'12px 14px', borderRadius:8, border:'1px solid rgba(91,64,62,.1)', textDecoration:'none', transition:'border-color .2s' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,75,75,.3)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(91,64,62,.1)')}>
                                <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontWeight:700, fontSize:12, color:'#FFB3AE', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{job.title}</div>
                                    <div style={{ fontSize:11, color:'#ab8886' }}>{job.company} · {job.location}</div>
                                    {job.salary && <div className="mono" style={{ fontSize:10, color:'#43e1ba', marginTop:3 }}>{job.salary}</div>}
                                  </div>
                                  <span style={{ color:'#FFB3AE', fontSize:16, flexShrink:0 }}>→</span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'report' && (
                        <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <div><h3 style={{ fontSize:16, fontWeight:700, color:'#e1e2eb', margin:0 }}>Analysis Report</h3><div className="mono" style={{ fontSize:8, color:'#ab8886', textTransform:'uppercase', marginTop:3 }}>Full breakdown</div></div>
                            <button onClick={() => navigator.clipboard.writeText(JSON.stringify(analysis, null, 2))} style={{ padding:'6px 10px', borderRadius:7, background:'#272a31', border:'none', color:'#ab8886', cursor:'pointer', fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>📋 Copy JSON</button>
                          </div>
                          <div style={{ background:'#1d2026', padding:16, borderRadius:8, border:'1px solid rgba(91,64,62,.1)' }}>
                            <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#43e1ba', marginBottom:10 }}>Strengths</div>
                            {analysis.strengths?.map((s, i) => <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:6 }}><span style={{ color:'#43e1ba', flexShrink:0 }}>✓</span><span style={{ fontSize:12, color:'#e1e2eb', lineHeight:1.5 }}>{s}</span></div>)}
                          </div>
                          <div style={{ background:'#1d2026', padding:16, borderRadius:8, border:'1px solid rgba(91,64,62,.1)' }}>
                            <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#ffb4ab', marginBottom:10 }}>Gaps to Address</div>
                            {analysis.gaps?.map((g, i) => <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:6 }}><span style={{ color:'#ffb4ab', flexShrink:0 }}>!</span><span style={{ fontSize:12, color:'#e1e2eb', lineHeight:1.5 }}>{g}</span></div>)}
                          </div>
                          <div style={{ borderLeft:'4px solid #FF4B4B', padding:'14px 18px', borderRadius:'0 10px 10px 0', background:'rgba(255,75,75,.07)' }}>
                            <div className="mono" style={{ fontSize:8, textTransform:'uppercase', color:'#FFB3AE', marginBottom:6 }}>AI Recommendation</div>
                            <p style={{ fontSize:12, lineHeight:1.7, color:'#e1e2eb', margin:0 }}>{analysis.recommendation}</p>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── SETTINGS MODAL — at root level, outside sidebar ── */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#e1e2eb', marginBottom:24, marginTop:0 }}>⚙️ Settings</h2>
            <div style={{ marginBottom:20 }}>
              <div className="mono" style={{ fontSize:9, textTransform:'uppercase', color:'#ab8886', marginBottom:8, letterSpacing:'.08em' }}>Account</div>
              <div style={{ background:'#101319', borderRadius:8, padding:16, fontSize:13, color:'#e1e2eb' }}>
                <div><span style={{ color:'#ab8886' }}>Name: </span>{displayName}</div>
                <div><span style={{ color:'#ab8886' }}>Email: </span>{userEmail || '—'}</div>
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <div className="mono" style={{ fontSize:9, textTransform:'uppercase', color:'#ab8886', marginBottom:8, letterSpacing:'.08em' }}>Preferences</div>
              <div style={{ background:'#101319', borderRadius:8, padding:16, fontSize:13, color:'#ab8886', display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>🔍 Live Job Listings</span>
              <span style={{ color:'#43e1ba', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>✅ Active</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>✉️ Cover Letter Generator</span>
              <span style={{ color:'#43e1ba', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>✅ Active</span>
             </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>📄 Enhanced Resume Download</span>
              <span style={{ color:'#43e1ba', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>✅ Active</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', opacity:0.5 }}>
             <span>🔔 Job Alerts</span>
            <span style={{ color:'#FFB347', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>Coming V2</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', opacity:0.5 }}>
            <span>📁 Resume History</span>
            <span style={{ color:'#FFB347', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>Coming V2</span>
            </div>
            </div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={handleLogout} style={{ padding:'8px 16px', borderRadius:8, background:'rgba(255,75,75,.1)', border:'1px solid rgba(255,75,75,.2)', color:'#ffb4ab', cursor:'pointer', fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
                ↩ Logout
              </button>
              <button onClick={() => setShowSettings(false)} className="btn-coral" style={{ padding:'8px 20px', borderRadius:8, fontSize:12 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUPPORT MODAL — at root level, outside sidebar ── */}
      {showSupport && (
        <div className="modal-overlay" onClick={() => setShowSupport(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#e1e2eb', marginBottom:24, marginTop:0 }}>❓ Support</h2>
            {[
              { q:'Why is my match score the same each time?',   a:'Click "+ New Analysis" to reset the session and upload a fresh resume with a new job description.' },
              { q:'Why is the chat not responding?',             a:'Make sure the FastAPI backend is running: cd resume-ai-coach && source venv_ai/bin/activate && python api.py' },
              { q:'How do I download my enhanced resume?',       a:'Ask the coach to rewrite your bullets in chat, then go to the 📄 Resume tab and click "Apply Rewrites & Generate PDF".' },
              { q:'Cover letter generation fails?',              a:'Cover letter requires a completed analysis first. Run the analysis, then generate.' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom:14, background:'#101319', borderRadius:8, padding:14 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#FFB3AE', marginBottom:6 }}>Q: {item.q}</div>
                <div style={{ fontSize:12, color:'#ab8886', lineHeight:1.6 }}>A: {item.a}</div>
              </div>
            ))}
            <div style={{ marginTop:8, padding:14, background:'rgba(67,225,186,.06)', border:'1px solid rgba(67,225,186,.15)', borderRadius:8, fontSize:12, color:'#43e1ba' }}>
              📧 Contact: <a href="mailto:bhardwajvaishali47@gmail.com" style={{ color:'#43e1ba' }}>bhardwajvaishali47@gmail.com</a>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}>
              <button onClick={() => setShowSupport(false)} className="btn-coral" style={{ padding:'8px 20px', borderRadius:8, fontSize:12 }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
