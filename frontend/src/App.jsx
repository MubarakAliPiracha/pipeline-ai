import { useState, useEffect, useRef, useMemo } from "react";
import "./App.css";

/* ── Professional SVG Icon System ── */
const I = ({ d, size = 16, color = "currentColor", stroke = 2, fill = "none", viewBox = "0 0 24 24", style = {} }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>{typeof d === "string" ? <path d={d} /> : d}</svg>
);

const Icons = {
  bolt: (p = {}) => <I {...p} d={<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" /></>} />,
  clock: (p = {}) => <I {...p} d={<><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" /><polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" /></>} />,
  search: (p = {}) => <I {...p} d={<><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" /></>} />,
  barChart: (p = {}) => <I {...p} d={<><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" /><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" /><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" /></>} />,
  fileCode: (p = {}) => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" /><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" /><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" /><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" /></>} />,
  alertTriangle: (p = {}) => <I {...p} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="none" stroke="currentColor" /><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" /></>} />,
  fileText: (p = {}) => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" /><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" /><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" /><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" /><polyline points="10 9 9 9 8 9" fill="none" stroke="currentColor" /></>} />,
  checkCircle: (p = {}) => <I {...p} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="none" stroke="currentColor" /><polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="currentColor" /></>} />,
  copy: (p = {}) => <I {...p} d={<><rect x="9" y="9" width="13" height="13" rx="2" ry="2" fill="none" stroke="currentColor" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" /></>} />,
  download: (p = {}) => <I {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="currentColor" /><polyline points="7 10 12 15 17 10" fill="none" stroke="currentColor" /><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" /></>} />,
  terminal: (p = {}) => <I {...p} d={<><polyline points="4 17 10 11 4 5" fill="none" stroke="currentColor" /><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" /></>} />,
  zap: (p = {}) => <I {...p} d={<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke="currentColor" /></>} />,
  sparkles: (p = {}) => <I {...p} d={<><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" fill="none" stroke="currentColor" /></>} />,
  play: (p = {}) => <I {...p} d={<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />} />,
  check: (p = {}) => <I {...p} d="M20 6L9 17l-5-5" />,
  github: (p = {}) => <I {...p} fill="currentColor" stroke="none" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" viewBox="0 0 16 16" />,
  chevronRight: (p = {}) => <I {...p} d="M9 18l6-6-6-6" />,
  rows: (p = {}) => <I {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" /><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" /><line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" /></>} />,
  columns: (p = {}) => <I {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" /><line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" /><line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" /></>} />,
  alertCircle: (p = {}) => <I {...p} d={<><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" /><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" /></>} />,
  activity: (p = {}) => <I {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />,
};

const EXAMPLE_CSV = `project_id,project_name,budget,spent,start_date,completion_pct,manager,status
1,Tower Block A,500000,487000,2024-01-15,94,John Smith,active
2,Bridge Repair,,320000,2024-02-01,67,,delayed
3,Highway Ext,750000,125000,2024/03/10,abc,Alice Wong,active
4,Tower Block A,500000,487000,2024-01-15,94,John Smith,active
5,Mall Renovation,300000,315000,2024-03-01,102,Bob,ACTIVE
6,School Build,450000,200000,,45,Charlie Brown,
7,,600000,0,2024-04-01,0,Diana Prince,planned`;

const MONO = "var(--font-mono)";
const SANS = "var(--font-sans)";

/* ── Python Syntax Highlighter ── */
function CodeLine({ line, comment }) {
  const kwRe = /\b(import|from|def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|with|as|pass|raise|lambda|yield|del|global|nonlocal|assert|break|continue)\b/;
  const strRe = /^("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/;
  const numRe = /^(\d+\.?\d*)\b/;
  const builtinRe = /\b(print|len|range|list|dict|set|tuple|str|int|float|bool|type|isinstance|enumerate|zip|map|filter|sorted|sum|min|max|abs|round|open|pd|df|np)\b/;
  const funcRe = /^([a-zA-Z_]\w*)\s*(?=\()/;
  const punctRe = /^([=\+\-\*\/\(\)\[\]\{\}:,\.<>!\&|%@])/;
  const decoratorRe = /^(@\w+)/;

  const tokens = [];
  let s = line;
  while (s.length > 0) {
    let m;
    if ((m = decoratorRe.exec(s))) {
      tokens.push(<span key={tokens.length} style={{ color: "#fbbf24" }}>{m[1]}</span>);
      s = s.slice(m[1].length);
    } else if ((m = strRe.exec(s))) {
      tokens.push(<span key={tokens.length} style={{ color: "#a3e635" }}>{m[1]}</span>);
      s = s.slice(m[1].length);
    } else if ((m = numRe.exec(s))) {
      tokens.push(<span key={tokens.length} style={{ color: "#fb923c" }}>{m[1]}</span>);
      s = s.slice(m[1].length);
    } else if ((m = kwRe.exec(s)) && s.startsWith(m[0])) {
      tokens.push(<span key={tokens.length} style={{ color: "#c084fc" }}>{m[0]}</span>);
      s = s.slice(m[0].length);
    } else if ((m = builtinRe.exec(s)) && s.startsWith(m[0])) {
      tokens.push(<span key={tokens.length} style={{ color: "#38bdf8" }}>{m[0]}</span>);
      s = s.slice(m[0].length);
    } else if ((m = funcRe.exec(s))) {
      tokens.push(<span key={tokens.length} style={{ color: "#60a5fa" }}>{m[1]}</span>);
      s = s.slice(m[1].length);
    } else if ((m = punctRe.exec(s))) {
      tokens.push(<span key={tokens.length} style={{ color: "#64748b" }}>{m[1]}</span>);
      s = s.slice(1);
    } else {
      tokens.push(<span key={tokens.length} style={{ color: "#cbd5e1" }}>{s[0]}</span>);
      s = s.slice(1);
    }
  }

  return (
    <>
      {tokens}
      {comment && <span style={{ color: "#475569", fontStyle: "italic" }}>{comment}</span>}
    </>
  );
}

function highlightPython(code) {
  const lines = code.split("\n");
  return lines.map((line, i) => {
    const commentIdx = line.indexOf("#");
    const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : "";

    return (
      <div key={i} style={{ display: "flex", minHeight: 24, alignItems: "center" }}>
        <span style={{
          color: "#2a3050", userSelect: "none", minWidth: 44, textAlign: "right",
          paddingRight: 16, fontSize: 11, fontFamily: MONO,
          borderRight: "1px solid rgba(255,255,255,0.04)", marginRight: 16,
        }}>
          {i + 1}
        </span>
        <span style={{ flex: 1 }}>
          <CodeLine line={codePart} comment={commentPart} />
        </span>
      </div>
    );
  });
}

/* ── Spinner ── */
function Spinner({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" />
      <path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" fill="none" stroke="url(#spinner-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="spinner-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Floating Particles ── */
function Particles({ count = 30 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? "#6366f1" : "#0ea5e9",
    })), [count]
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Ambient Glow Orbs ── */
function AmbientGlow() {
  return (
    <>
      <div className="glow-orb" style={{
        width: 400, height: 400, top: -100, right: -100,
        background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)",
        animationDelay: "0s",
      }} />
      <div className="glow-orb" style={{
        width: 300, height: 300, bottom: -50, left: "20%",
        background: "radial-gradient(circle, rgba(14,165,233,0.06), transparent 70%)",
        animationDelay: "3s",
      }} />
      <div className="glow-orb" style={{
        width: 250, height: 250, top: "40%", left: -80,
        background: "radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)",
        animationDelay: "1.5s",
      }} />
    </>
  );
}

/* ── Window Dots ── */
function WindowDots() {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[
        { bg: "#ef4444", shadow: "0 0 6px rgba(239,68,68,0.3)" },
        { bg: "#f59e0b", shadow: "0 0 6px rgba(245,158,11,0.3)" },
        { bg: "#22c55e", shadow: "0 0 6px rgba(34,197,94,0.3)" },
      ].map((d, i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: "50%",
          background: d.bg, boxShadow: d.shadow,
          transition: "transform 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
      ))}
    </div>
  );
}

const NAV_ITEMS = [
  { id: "generator",  label: "Generator",    icon: "bolt",     active: true,  color: "#818cf8" },
  { id: "history",    label: "History",       icon: "clock",    active: false, color: "#38bdf8" },
  { id: "schema",     label: "Schema Detect", icon: "search",  active: false, color: "#a78bfa" },
  { id: "preview",    label: "Data Preview",  icon: "barChart", active: false, color: "#34d399" },
];

/* ════════════════════════════════════════════════════════
   ██  MAIN APP COMPONENT
   ════════════════════════════════════════════════════════ */
export default function App() {
  const [csvData,     setCsvData]     = useState("");
  const [script,      setScript]      = useState("");
  const [explanation, setExplanation] = useState("");
  const [issues,      setIssues]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [activeTab,   setActiveTab]   = useState("script");
  const [copied,      setCopied]      = useState(false);
  const [bootDone,    setBootDone]    = useState(false);
  const [progress,    setProgress]    = useState(0);
  const outputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => p < 85 ? p + Math.random() * 4 : p);
      }, 200);
    } else {
      setProgress(script ? 100 : 0);
    }
    return () => clearInterval(interval);
  }, [loading, script]);

  const rowCount = csvData.trim() ? csvData.trim().split("\n").length - 1 : 0;
  const colCount = csvData.trim() ? csvData.trim().split("\n")[0]?.split(",").length || 0 : 0;

  const handleGenerate = async () => {
    if (!csvData.trim()) return;
    setLoading(true); setError(""); setScript(""); setExplanation(""); setIssues([]);
    try {
      const res = await fetch("/api/generate-pipeline", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_data: csvData }),
      });
      const data = await res.json();
      if (data.script) {
        setScript(data.script);
        setExplanation(data.explanation || "");
        setIssues(data.issues || []);
        setActiveTab("script");
        setTimeout(() => outputRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
      } else setError(data.error || "Something went wrong.");
    } catch { setError("Cannot connect to API. Please try again."); }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([script], { type: "text/plain" }));
    a.download = "pipeline.py"; a.click();
  };

  const isReady = !loading && !!script;
  const canGenerate = !loading && !!csvData.trim();

  const TABS = [
    { id: "script",      label: "pipeline.py",  icon: "fileCode" },
    { id: "issues",      label: "Issues",        icon: "alertTriangle", badge: issues.length > 0 ? issues.length : null },
    { id: "explanation", label: "Explanation",   icon: "fileText" },
  ];

  return (
    <>
      {/* ══════════════ BOOT SCREEN ══════════════ */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "var(--bg-void)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.8s",
        opacity: bootDone ? 0 : 1,
        visibility: bootDone ? "hidden" : "visible",
        pointerEvents: bootDone ? "none" : "all",
      }}>
        <Particles count={40} />

        <div style={{ width: 440, position: "relative", zIndex: 1 }}>
          {/* Animated logo */}
          <div style={{
            marginBottom: 40, display: "flex", alignItems: "center", gap: 14,
            animation: "fadeUp 0.6s ease both",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700,
              animation: "logo-glow 3s ease-in-out infinite",
              position: "relative", color: "#fff",
            }}>
              {Icons.bolt({ size: 22, color: "#fff" })}
              <div style={{
                position: "absolute", inset: -3,
                borderRadius: 16,
                background: "linear-gradient(135deg, #818cf8, #38bdf8, #22d3ee, #818cf8)",
                backgroundSize: "300% 300%",
                animation: "gradient-shift 3s ease infinite",
                zIndex: -1, opacity: 0.4, filter: "blur(6px)",
              }} />
            </div>
            <div>
              <div style={{
                fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px",
              }}>
                <span style={{ color: "var(--text-primary)" }}>Pipeline</span>
                <span className="gradient-text">AI</span>
              </div>
              <div style={{
                fontSize: 11, color: "var(--text-muted)",
                fontFamily: MONO, marginTop: 2,
              }}>
                AI-Powered Data Pipeline Generator
              </div>
            </div>
          </div>

          {/* Terminal boot lines */}
          <div style={{
            fontFamily: MONO, fontSize: 12.5, lineHeight: 2.4,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--glass-border)",
            borderRadius: 12, padding: "16px 20px",
            backdropFilter: "blur(8px)",
          }}>
            {[
              { cls: "b1", color: "var(--text-muted)", text: "→ Initializing pipeline engine..." },
              { cls: "b2", color: "var(--text-muted)", text: "→ Loading column type detector..." },
              { cls: "b3", color: "var(--text-muted)", text: "→ Connecting to Claude AI..." },
              { cls: "b4", color: "var(--text-muted)", text: "→ Mounting pandas runtime..." },
              { cls: "b5", color: "#10b981", text: "✓ System ready — all checks passed" },
            ].map(({ cls, color, text }) => (
              <div key={cls} className={`boot-line ${cls}`} style={{ color, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ opacity: 0.3 }}>$</span> {text}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop: 20, height: 3,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 3, overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #0ea5e9, #22d3ee)",
              backgroundSize: "200% 100%",
              animation: "progress-bar 2.4s ease forwards, shimmer 1.5s ease infinite",
              borderRadius: 3,
            }} />
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN APP ══════════════ */}
      <div className="bg-grid" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        background: "var(--bg-void)",
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: bootDone ? 1 : 0,
        position: "relative",
      }}>
        <AmbientGlow />

        {/* ── HEADER ── */}
        <header style={{
          height: 54,
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
          background: "rgba(3,3,8,0.8)",
          backdropFilter: "blur(20px) saturate(180%)",
          position: "sticky", top: 0, zIndex: 40,
          flexShrink: 0,
        }}>
          {/* Animated gradient border at bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(14,165,233,0.3), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 4s ease infinite",
          }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
              animation: "logo-glow 4s ease-in-out infinite",
            }}>
              {Icons.bolt({ size: 15, color: "#fff" })}
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.5px" }}>
              Pipeline<span className="gradient-text">AI</span>
            </span>
            <div style={{
              marginLeft: 2,
              fontSize: 10, color: "var(--text-dim)",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.15)",
              padding: "2px 8px", borderRadius: 5,
              fontFamily: MONO, fontWeight: 500,
            }}>
              v2.0
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Status indicator */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 12px", borderRadius: 8,
              background: loading ? "rgba(245,158,11,0.08)" : isReady ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${loading ? "rgba(245,158,11,0.15)" : isReady ? "rgba(16,185,129,0.15)" : "var(--border-subtle)"}`,
              transition: "all 0.3s ease",
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: loading ? "#f59e0b" : isReady ? "#10b981" : "var(--text-dim)",
                boxShadow: loading ? "0 0 10px rgba(245,158,11,0.5)" : isReady ? "0 0 10px rgba(16,185,129,0.5)" : "none",
                animation: loading ? "dot-pulse 1.2s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontSize: 11, color: loading ? "#f59e0b" : isReady ? "#10b981" : "var(--text-muted)", fontFamily: MONO, fontWeight: 500 }}>
                {loading ? "processing" : isReady ? "complete" : "idle"}
              </span>
            </div>

            <div style={{ width: 1, height: 18, background: "var(--border-subtle)" }} />

            <a
              href="https://github.com/MubarakAliPiracha/pipeline-ai"
              target="_blank" rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 12, color: "var(--text-muted)", textDecoration: "none",
                padding: "5px 12px", borderRadius: 8,
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.borderColor = "var(--border-medium)";
                e.currentTarget.style.background = "var(--glass-bg-hover)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--glass-border)";
                e.currentTarget.style.background = "var(--glass-bg)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {Icons.github({ size: 14 })}
              GitHub
            </a>
          </div>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── SIDEBAR ── */}
          <aside style={{
            width: 220,
            borderRight: "1px solid var(--border-subtle)",
            background: "rgba(255,255,255,0.008)",
            display: "flex", flexDirection: "column",
            flexShrink: 0,
            backdropFilter: "blur(8px)",
          }}>
            <nav style={{ flex: 1, padding: "18px 12px 12px" }}>
              <div style={{
                padding: "0 8px 12px",
                fontSize: 9, fontWeight: 700,
                color: "var(--text-dim)",
                textTransform: "uppercase", letterSpacing: "0.15em",
              }}>
                Workspace
              </div>

              {NAV_ITEMS.map(({ id, label, icon, active, color }) => (
                <div
                  key={id}
                  className="nav-item"
                  style={{
                    padding: "10px 12px",
                    display: "flex", alignItems: "center", gap: 10,
                    color: active ? "var(--accent-primary-light)" : "#64748b",
                    background: active ? "rgba(99,102,241,0.1)" : "transparent",
                    fontSize: 13, fontWeight: active ? 600 : 450,
                    cursor: "pointer", userSelect: "none",
                    marginBottom: 2,
                    position: "relative",
                  }}
                >
                  {active && (
                    <div style={{
                      position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3,
                      borderRadius: "0 3px 3px 0",
                      background: "linear-gradient(180deg, #6366f1, #0ea5e9)",
                      boxShadow: "0 0 8px rgba(99,102,241,0.5)",
                    }} />
                  )}
                  <span style={{ opacity: active ? 1 : 0.7 }}>{Icons[icon]({ size: 16, color: active ? "var(--accent-primary-light)" : color })}</span>
                  {label}
                  {active && (
                    <div style={{
                      marginLeft: "auto", width: 5, height: 5,
                      borderRadius: "50%",
                      background: "var(--accent-primary-light)",
                      boxShadow: "0 0 8px var(--accent-primary-glow)",
                      animation: "dot-pulse 2s ease-in-out infinite",
                    }} />
                  )}
                </div>
              ))}
            </nav>

            {/* Runtime panel */}
            <div style={{
              margin: "0 12px 14px",
              padding: "14px",
              background: "rgba(255,255,255,0.015)",
              border: "1px solid var(--glass-border)",
              borderRadius: 12,
              backdropFilter: "blur(8px)",
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: "var(--text-dim)",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12,
              }}>
                Runtime
              </div>
              {[
                { k: "Engine", v: "Claude AI", c: "#818cf8" },
                { k: "Model",  v: "Haiku 4.5",  c: "#38bdf8" },
                { k: "Output", v: "Python 3",   c: "#a3e635" },
              ].map(({ k, v, c }) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500 }}>{k}</span>
                  <span style={{
                    fontSize: 10, color: c,
                    background: `${c}12`,
                    padding: "3px 8px", borderRadius: 5,
                    fontFamily: MONO, fontWeight: 600,
                    border: `1px solid ${c}20`,
                  }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {/* Keyboard shortcut */}
            <div style={{
              margin: "0 12px 14px",
              padding: "10px 12px",
              background: "rgba(255,255,255,0.01)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>Generate</span>
              <div style={{ display: "flex", gap: 3 }}>
                <span className="kbd">⌘</span>
                <span className="kbd">↵</span>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main style={{
            flex: 1, padding: "22px 28px 28px",
            display: "flex", flexDirection: "column", gap: 18,
            overflow: "auto", minWidth: 0,
            position: "relative",
          }}>

            {/* Page title row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeUp 0.4s ease both" }}>
              <div>
                <h1 style={{
                  fontSize: 22, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 4,
                  background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  Pipeline Generator
                </h1>
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}>
                  Paste messy CSV data — get a production-ready Python cleaning script
                </p>
              </div>

              {(loading || isReady) && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 14px", borderRadius: 10,
                  background: loading ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
                  border: `1px solid ${loading ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`,
                  animation: "scale-in 0.3s ease",
                }}>
                  {loading && <Spinner />}
                  <span style={{
                    fontSize: 12, fontFamily: MONO, fontWeight: 500,
                    color: loading ? "#f59e0b" : "#10b981",
                  }}>
                    {loading ? "Analyzing CSV..." : `${issues.length} issues found`}
                  </span>
                </div>
              )}
            </div>

            {/* ── STATS BAR ── */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12, animation: "fadeUp 0.5s ease both",
              animationDelay: "0.1s",
            }}>
              {[
                { label: "Data Rows", val: rowCount || "—", sub: "records", color: rowCount > 0 ? "#818cf8" : "#4e5581", bg: rowCount > 0 ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.03)", accent: "#818cf8" },
                { label: "Columns", val: colCount || "—", sub: "fields", color: colCount > 0 ? "#38bdf8" : "#3d6b85", bg: colCount > 0 ? "rgba(56,189,248,0.06)" : "rgba(56,189,248,0.03)", accent: "#38bdf8" },
                { label: "Issues", val: issues.length > 0 ? issues.length : "—", sub: "detected", color: issues.length > 0 ? "#f59e0b" : "#6b5a3d", bg: issues.length > 0 ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.03)", accent: "#f59e0b" },
                { label: "Status", val: loading ? "Run" : isReady ? "Done" : "Idle", sub: "pipeline", color: loading ? "#f59e0b" : isReady ? "#10b981" : "#4a6b5d", bg: loading ? "rgba(245,158,11,0.04)" : isReady ? "rgba(16,185,129,0.04)" : "rgba(16,185,129,0.03)", accent: "#10b981" },
              ].map(({ label, val, sub, color, bg, accent }, i) => (
                <div key={label} className="stat-card" style={{
                  background: bg,
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12, padding: "14px 16px",
                  animation: "fadeUp 0.3s ease both",
                  animationDelay: `${0.1 + i * 0.05}s`,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: accent, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.5px", lineHeight: 1,
                    fontFamily: typeof val === "number" ? MONO : "inherit",
                  }}>
                    {val}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 6, fontWeight: 500 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{
              height: 2, background: "rgba(255,255,255,0.03)",
              borderRadius: 2, overflow: "hidden",
              opacity: loading || (progress > 0 && progress < 100) ? 1 : 0,
              transition: "opacity 0.4s",
            }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: "linear-gradient(90deg, #6366f1, #0ea5e9, #22d3ee)",
                backgroundSize: "200% 100%",
                animation: loading ? "shimmer 1.5s ease infinite" : "none",
                borderRadius: 2,
                transition: "width 0.3s ease",
                boxShadow: "0 0 8px rgba(99,102,241,0.4)",
              }} />
            </div>

            {/* ── PANELS ── */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 16, flex: 1, minHeight: 500,
              animation: "fadeUp 0.5s ease both",
              animationDelay: "0.2s",
            }}>

              {/* ──── INPUT PANEL ──── */}
              <div className="glass-panel" style={{
                display: "flex", flexDirection: "column",
                overflow: "hidden", position: "relative",
              }}>
                <div className="panel-glow" />

                {/* Panel header */}
                <div style={{
                  height: 42, padding: "0 16px",
                  background: "rgba(255,255,255,0.015)",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <WindowDots />
                    <span style={{
                      fontSize: 12, color: "var(--text-muted)", fontFamily: MONO,
                      marginLeft: 4, fontWeight: 500,
                    }}>
                      input.csv
                    </span>
                  </div>
                  <button
                    onClick={() => setCsvData(EXAMPLE_CSV)}
                    style={{
                      fontSize: 11, color: "var(--accent-primary)",
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.15)",
                      padding: "4px 10px", borderRadius: 6,
                      transition: "all 0.2s", fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                      e.currentTarget.style.color = "var(--accent-primary-light)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.2)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                      e.currentTarget.style.color = "var(--accent-primary)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    ✦ Load example
                  </button>
                </div>

                {/* Textarea */}
                <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
                  <textarea
                    id="csv-input"
                    style={{
                      flex: 1, background: "transparent",
                      border: "none", outline: "none",
                      padding: "16px 18px",
                      fontSize: 12.5, lineHeight: 2,
                      color: "var(--text-secondary)",
                      resize: "none", width: "100%",
                      caretColor: "var(--accent-primary-light)",
                      minHeight: 280,
                      letterSpacing: "0.2px",
                    }}
                    placeholder={"id,name,age,status\n1,John,,active\n2,,25,ACTIVE\n1,John,,active"}
                    value={csvData}
                    onChange={e => setCsvData(e.target.value)}
                  />
                </div>

                {error && (
                  <div style={{
                    margin: "0 14px 10px",
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 10,
                    fontSize: 12, color: "#f87171", lineHeight: 1.6,
                    flexShrink: 0,
                    display: "flex", alignItems: "flex-start", gap: 8,
                    animation: "scale-in 0.2s ease",
                  }}>
                    <span style={{ marginTop: 1, fontSize: 14 }}>⚠</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Footer */}
                <div style={{
                  padding: "8px 18px",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: MONO, fontWeight: 500 }}>
                    {csvData.trim()
                      ? `${rowCount} rows · ${colCount} cols · ${csvData.length} bytes`
                      : "No data loaded"}
                  </span>
                  <span style={{
                    fontSize: 9, color: "var(--accent-primary)",
                    background: "rgba(99,102,241,0.08)",
                    padding: "2px 8px", borderRadius: 4,
                    fontFamily: MONO, fontWeight: 700,
                    letterSpacing: "0.05em",
                    border: "1px solid rgba(99,102,241,0.12)",
                  }}>
                    CSV
                  </span>
                </div>

                {/* Run button */}
                <div style={{ padding: "10px 16px 16px", flexShrink: 0 }}>
                  <button
                    id="generate-btn"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="run-btn"
                    style={{
                      width: "100%", padding: "13px 18px",
                      background: canGenerate
                        ? "linear-gradient(135deg, #6366f1 0%, #0ea5e9 50%, #06b6d4 100%)"
                        : "rgba(255,255,255,0.03)",
                      backgroundSize: "200% 100%",
                      border: `1px solid ${canGenerate ? "rgba(99,102,241,0.3)" : "var(--border-subtle)"}`,
                      borderRadius: 10,
                      color: canGenerate ? "#fff" : "var(--text-dim)",
                      fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      letterSpacing: "-0.2px",
                      boxShadow: canGenerate ? "0 6px 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                      cursor: canGenerate ? "pointer" : "not-allowed",
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        <span style={{ animation: "shimmer 2s ease infinite", backgroundImage: "linear-gradient(90deg, #fff, #a5b4fc, #fff)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          Analyzing & generating pipeline...
                        </span>
                      </>
                    ) : (
                      <>
                        {Icons.bolt({ size: 16, color: canGenerate ? "#fff" : "var(--text-dim)" })}
                        Generate Pipeline
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ──── OUTPUT PANEL ──── */}
              <div className="glass-panel" style={{
                display: "flex", flexDirection: "column",
                overflow: "hidden", position: "relative",
              }}>
                <div className="panel-glow" />

                {/* Tab header */}
                <div style={{
                  height: 42,
                  background: "rgba(255,255,255,0.015)",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center",
                  flexShrink: 0, overflow: "hidden",
                }}>
                  <div style={{ display: "flex", gap: 6, padding: "0 16px", flexShrink: 0 }}>
                    <WindowDots />
                  </div>

                  {/* File tabs */}
                  <div style={{
                    display: "flex", flex: 1, height: "100%",
                    borderLeft: "1px solid var(--border-subtle)",
                  }}>
                    {TABS.map(tab => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => script && setActiveTab(tab.id)}
                          className={`tab-btn${isActive ? " tab-active" : ""}`}
                          style={{
                            padding: "0 16px",
                            height: "100%",
                            fontSize: 12,
                            color: isActive ? "var(--text-primary)" : "#64748b",
                            background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                            border: "none",
                            borderRight: "1px solid var(--border-subtle)",
                            display: "flex", alignItems: "center", gap: 7,
                            cursor: script ? "pointer" : "default",
                            fontWeight: isActive ? 600 : 450,
                            whiteSpace: "nowrap",
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center" }}>{Icons[tab.icon]({ size: 13, color: isActive ? "var(--accent-primary-light)" : "#64748b" })}</span>
                          {tab.label}
                          {tab.badge != null && (
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              color: "#f59e0b",
                              background: "rgba(245,158,11,0.12)",
                              padding: "2px 6px", borderRadius: 4,
                              border: "1px solid rgba(245,158,11,0.15)",
                            }}>
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isReady && (
                    <div style={{ padding: "0 14px", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#10b981",
                        boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                        animation: "dot-pulse 2s ease-in-out infinite",
                      }} />
                    </div>
                  )}
                </div>

                {/* Output area */}
                <div ref={outputRef} style={{ flex: 1, overflow: "auto", minHeight: 280, position: "relative" }}>
                  {!script ? (
                    <div style={{
                      height: "100%", minHeight: 280,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: 14, padding: 32,
                    }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: loading ? "rgba(245,158,11,0.08)" : "rgba(99,102,241,0.06)",
                        border: `1px solid ${loading ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.12)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        animation: loading ? "none" : "float 4s ease-in-out infinite",
                        transition: "all 0.3s ease",
                      }}>
                        {loading ? <Spinner size={20} /> : Icons.zap({ size: 24, color: "var(--accent-primary-light)" })}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                          {loading ? "Generating pipeline..." : "Awaiting input"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: MONO }}>
                          {loading ? "Claude is analyzing your CSV data" : "Paste CSV data and click Generate"}
                        </div>
                      </div>
                      {loading && (
                        <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                          {[0.0, 0.15, 0.3].map(d => (
                            <div key={d} style={{
                              width: 6, height: 6, borderRadius: "50%",
                              background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                              animation: `blink 1.2s ease-in-out ${d}s infinite`,
                              boxShadow: "0 0 6px rgba(99,102,241,0.4)",
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : activeTab === "script" ? (
                    <div style={{ padding: "14px 0 14px" }}>
                      <div style={{
                        padding: "0 18px 10px",
                        fontSize: 11, color: "var(--text-dim)",
                        fontFamily: MONO,
                        borderBottom: "1px solid var(--border-subtle)",
                        marginBottom: 4, fontWeight: 500,
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        {Icons.chevronRight({ size: 12, color: "var(--accent-primary)" })}
                        pipeline.py — generated by Claude AI
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9 }}>
                        {highlightPython(script)}
                      </div>
                    </div>
                  ) : activeTab === "issues" ? (
                    <div style={{ padding: "14px 16px" }}>
                      {issues.length === 0 ? (
                        <div style={{ padding: "40px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ marginBottom: 14, background: "rgba(16,185,129,0.08)", borderRadius: 16, width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(16,185,129,0.15)" }}>{Icons.checkCircle({ size: 28, color: "#10b981" })}</div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#10b981" }}>No issues found</div>
                          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, fontFamily: MONO }}>Your CSV data looks clean</div>
                        </div>
                      ) : (
                        issues.map((iss, i) => (
                          <div key={i} className="issue-item" style={{
                            display: "flex", gap: 10, alignItems: "flex-start",
                            marginBottom: 8, padding: "12px 14px",
                            background: "rgba(245,158,11,0.03)",
                            border: "1px solid rgba(245,158,11,0.08)",
                            borderRadius: 10,
                            animation: "fadeUp 0.3s ease both",
                            animationDelay: `${i * 0.05}s`,
                          }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: "#f59e0b",
                              background: "rgba(245,158,11,0.12)",
                              padding: "2px 8px", borderRadius: 5,
                              fontFamily: MONO, flexShrink: 0, marginTop: 2,
                              border: "1px solid rgba(245,158,11,0.15)",
                            }}>
                              #{i + 1}
                            </span>
                            <span style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>{iss}</span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "14px 18px" }}>
                      <div style={{
                        fontSize: 11, color: "var(--text-dim)", fontFamily: MONO,
                        marginBottom: 14,
                        padding: "0 0 10px",
                        borderBottom: "1px solid var(--border-subtle)",
                        display: "flex", alignItems: "center", gap: 6,
                        fontWeight: 500,
                      }}>
                        {Icons.chevronRight({ size: 12, color: "var(--accent-primary)" })}
                        explanation.md
                      </div>
                      <div style={{
                        fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 2,
                        whiteSpace: "pre-wrap",
                      }}>
                        {explanation || "No explanation available."}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                {script && (
                  <div style={{
                    padding: "12px 16px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex", gap: 10, flexShrink: 0,
                    background: "rgba(255,255,255,0.01)",
                  }}>
                    <button
                      id="copy-btn"
                      onClick={handleCopy}
                      className="action-btn"
                      style={{
                        flex: 1, padding: "10px 14px",
                        fontSize: 12, fontWeight: 700,
                        borderRadius: 9,
                        border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.2)"}`,
                        background: copied ? "rgba(16,185,129,0.1)" : "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(14,165,233,0.1))",
                        color: copied ? "#34d399" : "var(--accent-primary-light)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all 0.2s",
                      }}
                    >
                      {copied ? <>{Icons.check({ size: 14, color: "#34d399" })} Copied!</> : <>{Icons.copy({ size: 14 })} Copy Script</>}
                    </button>
                    <button
                      id="download-btn"
                      onClick={handleDownload}
                      className="action-btn"
                      style={{
                        flex: 1, padding: "10px 14px",
                        fontSize: 12, fontWeight: 700,
                        borderRadius: 9,
                        border: "1px solid var(--border-light)",
                        background: "var(--glass-bg)",
                        color: "var(--text-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.background = "var(--glass-bg-hover)";
                        e.currentTarget.style.borderColor = "var(--border-medium)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = "var(--text-muted)";
                        e.currentTarget.style.background = "var(--glass-bg)";
                        e.currentTarget.style.borderColor = "var(--border-light)";
                      }}
                    >
                      {Icons.download({ size: 14 })} Download .py
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* ── STATUS BAR FOOTER ── */}
        <footer style={{
          height: 28,
          background: "rgba(0,0,0,0.5)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center",
          padding: "0 20px", gap: 0,
          flexShrink: 0,
          backdropFilter: "blur(12px)",
          position: "relative",
        }}>
          {/* Gradient top line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(14,165,233,0.15), transparent)",
          }} />

          {[
            { label: loading ? "⚡ processing" : isReady ? "✓ complete" : "○ idle", color: loading ? "#f59e0b" : isReady ? "#10b981" : "var(--text-dim)" },
            { label: "claude-haiku-4-5", color: "var(--text-dim)" },
            { label: "python 3", color: "var(--text-dim)" },
          ].map(({ label, color }, i) => (
            <span key={i} style={{
              fontSize: 10, color,
              fontFamily: MONO, fontWeight: 500,
              paddingRight: 16, marginRight: 16,
              borderRight: i < 2 ? "1px solid var(--border-subtle)" : "none",
            }}>
              {label}
            </span>
          ))}
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 10, color: "var(--text-ghost)", fontFamily: MONO, fontWeight: 500 }}>
              PipelineAI — Mubarak Ali Piracha
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
