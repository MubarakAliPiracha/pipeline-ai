import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useAnimation,
} from "framer-motion";
import "./App.css";

/* ════════════════════════════════════════
   ICON SYSTEM
════════════════════════════════════════ */
const I = ({ d, size = 16, color = "currentColor", stroke = 2, fill = "none", viewBox = "0 0 24 24", style = {} }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);
const Icons = {
  bolt:          (p={}) => <I {...p} d={<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />} />,
  clock:         (p={}) => <I {...p} d={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />,
  search:        (p={}) => <I {...p} d={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />,
  barChart:      (p={}) => <I {...p} d={<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>} />,
  fileCode:      (p={}) => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>} />,
  alertTriangle: (p={}) => <I {...p} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>} />,
  fileText:      (p={}) => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>} />,
  checkCircle:   (p={}) => <I {...p} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>} />,
  copy:          (p={}) => <I {...p} d={<><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />,
  download:      (p={}) => <I {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} />,
  chevronRight:  (p={}) => <I {...p} d="M9 18l6-6-6-6" />,
  check:         (p={}) => <I {...p} d="M20 6L9 17l-5-5" />,
  zap:           (p={}) => <I {...p} d={<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />} />,
  github:        (p={}) => <I {...p} fill="currentColor" stroke="none" viewBox="0 0 16 16" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />,
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

/* ════════════════════════════════════════
   PYTHON SYNTAX HIGHLIGHTER
════════════════════════════════════════ */
function CodeLine({ line, comment }) {
  const kwRe      = /\b(import|from|def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|with|as|pass|raise|lambda|yield|del|global|nonlocal|assert|break|continue)\b/;
  const strRe     = /^("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/;
  const numRe     = /^(\d+\.?\d*)\b/;
  const builtinRe = /\b(print|len|range|list|dict|set|tuple|str|int|float|bool|type|isinstance|enumerate|zip|map|filter|sorted|sum|min|max|abs|round|open|pd|df|np)\b/;
  const funcRe    = /^([a-zA-Z_]\w*)\s*(?=\()/;
  const punctRe   = /^([=+\-*/()[\]{}:,.<>!&|%@])/;
  const decoRe    = /^(@\w+)/;

  const tokens = [];
  let s = line;
  while (s.length > 0) {
    let m;
    if ((m = decoRe.exec(s)))      { tokens.push(<span key={tokens.length} style={{ color: "#fbbf24" }}>{m[1]}</span>); s = s.slice(m[1].length); }
    else if ((m = strRe.exec(s)))  { tokens.push(<span key={tokens.length} style={{ color: "#86efac" }}>{m[1]}</span>); s = s.slice(m[1].length); }
    else if ((m = numRe.exec(s)))  { tokens.push(<span key={tokens.length} style={{ color: "#fb923c" }}>{m[1]}</span>); s = s.slice(m[1].length); }
    else if ((m = kwRe.exec(s)) && s.startsWith(m[0]))  { tokens.push(<span key={tokens.length} style={{ color: "#c084fc" }}>{m[0]}</span>); s = s.slice(m[0].length); }
    else if ((m = builtinRe.exec(s)) && s.startsWith(m[0])) { tokens.push(<span key={tokens.length} style={{ color: "#38bdf8" }}>{m[0]}</span>); s = s.slice(m[0].length); }
    else if ((m = funcRe.exec(s))) { tokens.push(<span key={tokens.length} style={{ color: "#60a5fa" }}>{m[1]}</span>); s = s.slice(m[1].length); }
    else if ((m = punctRe.exec(s))){ tokens.push(<span key={tokens.length} style={{ color: "#64748b" }}>{m[1]}</span>); s = s.slice(1); }
    else { tokens.push(<span key={tokens.length} style={{ color: "#cbd5e1" }}>{s[0]}</span>); s = s.slice(1); }
  }
  return <>{tokens}{comment && <span style={{ color: "#475569", fontStyle: "italic" }}>{comment}</span>}</>;
}

function highlightPython(code) {
  return code.split("\n").map((line, i) => {
    const ci = line.indexOf("#");
    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.008, duration: 0.2 }}
        style={{ display: "flex", minHeight: 24, alignItems: "center" }}
      >
        <span style={{
          color: "#1e2a40", userSelect: "none", minWidth: 44, textAlign: "right",
          paddingRight: 16, fontSize: 11, fontFamily: MONO,
          borderRight: "1px solid rgba(255,255,255,0.04)", marginRight: 16, flexShrink: 0,
        }}>{i + 1}</span>
        <span style={{ flex: 1 }}>
          <CodeLine line={ci >= 0 ? line.slice(0, ci) : line} comment={ci >= 0 ? line.slice(ci) : ""} />
        </span>
      </motion.div>
    );
  });
}

/* ════════════════════════════════════════
   SPINNER
════════════════════════════════════════ */
function Spinner({ size = 16 }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 16 16"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      style={{ flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" />
      <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="url(#sg)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

/* ════════════════════════════════════════
   3D TILT CARD — mouse-reactive perspective
════════════════════════════════════════ */
function TiltCard({ children, className = "", style = {}, intensity = 8 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-intensity, intensity]);
  const glowX   = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const glowY   = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`glass-panel ${className}`}
      style={{
        rotateX, rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
        ...style,
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{ scale: 1.005 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Dynamic spotlight */}
      <motion.div
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          background: "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(99,102,241,0.06), transparent 60%)",
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <div style={{ position: "relative", zIndex: 2, display: "contents" }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   FLOATING PARTICLES
════════════════════════════════════════ */
function FloatingParticles({ count = 25 }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 12 + 8,
    delay: Math.random() * 8,
    color: ["#6366f1", "#0ea5e9", "#8b5cf6", "#22d3ee"][Math.floor(Math.random() * 4)],
    opacity: Math.random() * 0.35 + 0.1,
    drift: (Math.random() - 0.5) * 80,
  })), [count]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`, bottom: -10,
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{
            y: [0, -window.innerHeight - 20],
            x: [0, p.drift],
            opacity: [0, p.opacity, p.opacity, 0],
            scale: [0.5, 1, 0.8, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   AMBIENT GLOW ORBS
════════════════════════════════════════ */
function AmbientOrbs() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {[
        { w: 500, h: 500, top: -150, right: -150, color: "rgba(99,102,241,0.07)", dur: 8 },
        { w: 350, h: 350, bottom: -80, left: "15%", color: "rgba(14,165,233,0.05)", dur: 11 },
        { w: 280, h: 280, top: "35%", left: -80, color: "rgba(139,92,246,0.06)", dur: 9 },
      ].map((o, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: o.w, height: o.h,
            top: o.top, right: o.right, bottom: o.bottom, left: o.left,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   WINDOW DOTS
════════════════════════════════════════ */
function WindowDots() {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[
        { bg: "#ef4444", sh: "rgba(239,68,68,0.4)" },
        { bg: "#f59e0b", sh: "rgba(245,158,11,0.4)" },
        { bg: "#22c55e", sh: "rgba(34,197,94,0.4)" },
      ].map(({ bg, sh }, i) => (
        <motion.div
          key={i}
          style={{ width: 10, height: 10, borderRadius: "50%", background: bg, boxShadow: `0 0 6px ${sh}` }}
          whileHover={{ scale: 1.25, boxShadow: `0 0 10px ${sh}` }}
          transition={{ type: "spring", stiffness: 400 }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   ANIMATED COUNTER
════════════════════════════════════════ */
function AnimCounter({ value }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (typeof value !== "number") { setDisplay(value); return; }
    let start = 0;
    const end = value;
    const dur = 600;
    const step = (end / dur) * 16;
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(t); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  return display;
}

/* ════════════════════════════════════════
   NAV CONFIG
════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "generator", label: "Generator", icon: "bolt", active: true, color: "#818cf8" },
];

const SPRING = { type: "spring", stiffness: 300, damping: 25 };
const EASE   = { type: "tween", ease: [0.4, 0, 0.2, 1] };

/* ════════════════════════════════════════
   MAIN APP
════════════════════════════════════════ */
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
    const t = setTimeout(() => setBootDone(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let iv;
    if (loading) {
      setProgress(5);
      iv = setInterval(() => setProgress(p => p < 82 ? p + Math.random() * 3 : p), 180);
    } else {
      setProgress(script ? 100 : 0);
    }
    return () => clearInterval(iv);
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
        setScript(data.script); setExplanation(data.explanation || ""); setIssues(data.issues || []);
        setActiveTab("script");
        setTimeout(() => outputRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
      } else setError(data.error || "Something went wrong.");
    } catch { setError("Cannot connect to API. Please try again."); }
    setLoading(false);
  };

  const handleCopy = () => { navigator.clipboard.writeText(script); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([script], { type: "text/plain" }));
    a.download = "pipeline.py"; a.click();
  };

  const isReady = !loading && !!script;
  const canGenerate = !loading && !!csvData.trim();

  const TABS = [
    { id: "script",      label: "pipeline.py",  icon: "fileCode" },
    { id: "issues",      label: "Issues",        icon: "alertTriangle", badge: issues.length || null },
    { id: "explanation", label: "Explanation",   icon: "fileText" },
  ];

  /* ── Animation variants ── */
  const containerV = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const itemV = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING } },
  };
  const tabContentV = {
    hidden:  { opacity: 0, y: 10, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2 } },
  };

  return (
    <>
      {/* ════════════════ BOOT SCREEN ════════════════ */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div
            key="boot"
            exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "var(--bg-void)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <FloatingParticles count={40} />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              style={{ width: 460, position: "relative", zIndex: 1 }}
            >
              {/* Logo */}
              <motion.div
                style={{ marginBottom: 40, display: "flex", alignItems: "center", gap: 16 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, ...SPRING }}
              >
                <motion.div
                  style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(99,102,241,0.3), 0 0 60px rgba(14,165,233,0.1)",
                      "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(14,165,233,0.2)",
                      "0 0 20px rgba(99,102,241,0.3), 0 0 60px rgba(14,165,233,0.1)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute", inset: -3, borderRadius: 18,
                      background: "conic-gradient(#818cf8, #38bdf8, #22d3ee, #818cf8)",
                      opacity: 0.35, filter: "blur(4px)",
                    }}
                  />
                  {Icons.bolt({ size: 24, color: "#fff" })}
                </motion.div>
                <div>
                  <motion.div
                    style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>Pipeline</span>
                    <span className="gradient-text">AI</span>
                  </motion.div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: MONO, marginTop: 2 }}>
                    AI-Powered Data Pipeline Generator
                  </div>
                </div>
              </motion.div>

              {/* Boot terminal */}
              <motion.div
                style={{
                  fontFamily: MONO, fontSize: 13, lineHeight: 2.3,
                  background: "rgba(255,255,255,0.015)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 14, padding: "18px 22px",
                  backdropFilter: "blur(12px)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[
                  { t: "→ Initializing pipeline engine...", d: 0.4 },
                  { t: "→ Loading column type detector...", d: 0.9 },
                  { t: "→ Connecting to Claude AI...",      d: 1.4 },
                  { t: "→ Mounting pandas runtime...",      d: 1.9 },
                  { t: "✓ System ready — all checks passed", d: 2.4, ok: true },
                ].map(({ t, d, ok }) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: d, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    style={{ color: ok ? "#10b981" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ opacity: 0.3 }}>$</span> {t}
                  </motion.div>
                ))}
              </motion.div>

              {/* Progress */}
              <motion.div
                style={{ marginTop: 20, height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #0ea5e9, #22d3ee)", borderRadius: 3 }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════ MAIN APP ════════════════ */}
      <motion.div
        className="bg-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: bootDone ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          background: "var(--bg-void)", position: "relative",
        }}
      >
        <AmbientOrbs />

        {/* ── HEADER ── */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: bootDone ? 0 : -60, opacity: bootDone ? 1 : 0 }}
          transition={{ delay: 0.1, ...SPRING }}
          style={{
            height: 56,
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px",
            background: "rgba(3,3,8,0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            position: "sticky", top: 0, zIndex: 40,
            flexShrink: 0,
          }}
        >
          {/* Shimmer bottom line */}
          <motion.div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(14,165,233,0.4), transparent)",
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo */}
          <motion.div style={{ display: "flex", alignItems: "center", gap: 10 }} whileHover={{ scale: 1.02 }}>
            <motion.div
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              animate={{
                boxShadow: [
                  "0 0 12px rgba(99,102,241,0.3)",
                  "0 0 24px rgba(99,102,241,0.5)",
                  "0 0 12px rgba(99,102,241,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {Icons.bolt({ size: 16, color: "#fff" })}
            </motion.div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.5px" }}>
              Pipeline<span className="gradient-text">AI</span>
            </span>
            <motion.div
              style={{
                fontSize: 10, color: "var(--text-dim)",
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.15)",
                padding: "2px 8px", borderRadius: 5,
                fontFamily: MONO, fontWeight: 500,
              }}
              whileHover={{ scale: 1.05, color: "#818cf8" }}
            >
              v2.0
            </motion.div>
          </motion.div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Status pill */}
            <motion.div
              layout
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "5px 12px", borderRadius: 20,
                background: loading ? "rgba(245,158,11,0.08)" : isReady ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${loading ? "rgba(245,158,11,0.2)" : isReady ? "rgba(16,185,129,0.2)" : "var(--border-subtle)"}`,
              }}
              transition={{ ...SPRING }}
            >
              <motion.div
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: loading ? "#f59e0b" : isReady ? "#10b981" : "var(--text-dim)",
                }}
                animate={loading ? { scale: [1, 1.5, 1], opacity: [1, 0.6, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span style={{ fontSize: 11, color: loading ? "#f59e0b" : isReady ? "#10b981" : "var(--text-muted)", fontFamily: MONO, fontWeight: 500 }}>
                {loading ? "processing" : isReady ? "complete" : "idle"}
              </span>
            </motion.div>

            <div style={{ width: 1, height: 18, background: "var(--border-subtle)" }} />

            <motion.a
              href="https://github.com/MubarakAliPiracha/pipeline-ai"
              target="_blank" rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 12, color: "var(--text-muted)", textDecoration: "none",
                padding: "5px 12px", borderRadius: 8,
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
              }}
              whileHover={{ y: -1, color: "var(--text-secondary)", borderColor: "var(--border-medium)", background: "var(--glass-bg-hover)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ ...SPRING }}
            >
              {Icons.github({ size: 14 })} GitHub
            </motion.a>
          </div>
        </motion.header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}>

          {/* ── SIDEBAR ── */}
          <motion.aside
            initial={{ x: -220, opacity: 0 }}
            animate={{ x: bootDone ? 0 : -220, opacity: bootDone ? 1 : 0 }}
            transition={{ delay: 0.15, ...SPRING }}
            style={{
              width: 220,
              borderRight: "1px solid var(--border-subtle)",
              background: "rgba(255,255,255,0.008)",
              display: "flex", flexDirection: "column", flexShrink: 0,
              backdropFilter: "blur(12px)",
            }}
          >
            <nav style={{ flex: 1, padding: "20px 12px 12px" }}>
              <div style={{ padding: "0 8px 12px", fontSize: 9, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                Workspace
              </div>

              {NAV_ITEMS.map(({ id, label, icon }, i) => (
                <motion.div
                  key={id}
                  className="nav-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, ...SPRING }}
                  style={{
                    padding: "11px 12px",
                    display: "flex", alignItems: "center", gap: 10,
                    color: "var(--accent-primary-light)",
                    background: "rgba(99,102,241,0.1)",
                    fontSize: 13, fontWeight: 600,
                    cursor: "default", userSelect: "none",
                    marginBottom: 2, position: "relative",
                    borderRadius: 10,
                  }}
                >
                  {/* Active indicator bar */}
                  <motion.div
                    style={{
                      position: "absolute", left: 0, top: "18%", bottom: "18%", width: 3,
                      borderRadius: "0 3px 3px 0",
                      background: "linear-gradient(180deg, #6366f1, #0ea5e9)",
                      boxShadow: "0 0 10px rgba(99,102,241,0.7)",
                    }}
                  />
                  {/* Icon with gradient glow */}
                  <motion.div
                    style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(14,165,233,0.15))",
                      border: "1px solid rgba(99,102,241,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    animate={{ boxShadow: ["0 0 6px rgba(99,102,241,0.2)", "0 0 14px rgba(99,102,241,0.45)", "0 0 6px rgba(99,102,241,0.2)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    {Icons[icon]({ size: 14, color: "#a5b4fc" })}
                  </motion.div>
                  {label}
                  <motion.div
                    style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg, #818cf8, #38bdf8)" }}
                    animate={{ boxShadow: ["0 0 4px rgba(129,140,248,0.4)", "0 0 12px rgba(129,140,248,0.9)", "0 0 4px rgba(129,140,248,0.4)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </nav>

            {/* Runtime panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ...SPRING }}
              style={{
                margin: "0 12px 12px",
                padding: "14px",
                background: "rgba(255,255,255,0.015)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12, backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
                Runtime
              </div>
              {[
                { k: "Engine", v: "Claude AI", c: "#818cf8" },
                { k: "Model",  v: "Haiku 4.5",  c: "#38bdf8" },
                { k: "Output", v: "Python 3",   c: "#a3e635" },
              ].map(({ k, v, c }, i) => (
                <motion.div
                  key={k}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500 }}>{k}</span>
                  <motion.span
                    style={{
                      fontSize: 10, color: c, background: `${c}12`,
                      padding: "3px 8px", borderRadius: 5, fontFamily: MONO, fontWeight: 600,
                      border: `1px solid ${c}20`,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >{v}</motion.span>
                </motion.div>
              ))}
            </motion.div>

            {/* Shortcut */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                margin: "0 12px 14px", padding: "10px 12px",
                background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-subtle)",
                borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>Generate</span>
              <div style={{ display: "flex", gap: 3 }}>
                {["⌘", "↵"].map(k => (
                  <span key={k} className="kbd">{k}</span>
                ))}
              </div>
            </motion.div>
          </motion.aside>

          {/* ── MAIN ── */}
          <main style={{
            flex: 1, padding: "22px 28px 28px",
            display: "flex", flexDirection: "column", gap: 18,
            overflow: "auto", minWidth: 0,
          }}>

            {/* Title row */}
            <motion.div
              variants={containerV} initial="hidden"
              animate={bootDone ? "visible" : "hidden"}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <motion.div variants={itemV}>
                <h1 style={{
                  fontSize: 24, fontWeight: 800, letterSpacing: "-0.6px", marginBottom: 4,
                  background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  Pipeline Generator
                </h1>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Paste messy CSV data — get a production-ready Python cleaning script
                </p>
              </motion.div>

              <AnimatePresence>
                {(loading || isReady) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, x: 20 }}
                    animate={{ opacity: 1, scale: 1,    x: 0 }}
                    exit={{   opacity: 0, scale: 0.85, x: 20 }}
                    transition={{ ...SPRING }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 14px", borderRadius: 12,
                      background: loading ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
                      border: `1px solid ${loading ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`,
                    }}
                  >
                    {loading && <Spinner size={13} />}
                    <span style={{ fontSize: 12, fontFamily: MONO, fontWeight: 500, color: loading ? "#f59e0b" : "#10b981" }}>
                      {loading ? "Analyzing CSV..." : `${issues.length} issues found`}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* STATS */}
            <motion.div
              variants={containerV} initial="hidden"
              animate={bootDone ? "visible" : "hidden"}
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}
            >
              {[
                { label: "Data Rows", val: rowCount || "—", num: rowCount, sub: "records", color: rowCount > 0 ? "#818cf8" : "#4e5581", bg: rowCount > 0 ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.03)" },
                { label: "Columns",   val: colCount || "—", num: colCount, sub: "fields",  color: colCount > 0 ? "#38bdf8" : "#3d6b85", bg: colCount > 0 ? "rgba(56,189,248,0.06)" : "rgba(56,189,248,0.03)" },
                { label: "Issues",    val: issues.length > 0 ? issues.length : "—", num: issues.length, sub: "detected", color: issues.length > 0 ? "#f59e0b" : "#6b5a3d", bg: issues.length > 0 ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.03)" },
                { label: "Status",    val: loading ? "Run" : isReady ? "Done" : "Idle", sub: "pipeline", color: loading ? "#f59e0b" : isReady ? "#10b981" : "#4a6b5d", bg: loading ? "rgba(245,158,11,0.05)" : isReady ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.03)" },
              ].map(({ label, val, num, sub, color, bg }) => (
                <motion.div
                  key={label}
                  variants={itemV}
                  className="stat-card"
                  style={{ background: bg, border: "1px solid var(--glass-border)", borderRadius: 13, padding: "15px 16px" }}
                  whileHover={{ y: -4, transition: SPRING }}
                >
                  <div style={{ fontSize: 9, fontWeight: 700, color, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.5px", lineHeight: 1 }}>
                    {typeof num === "number" && num > 0 ? <AnimCounter value={num} /> : val}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 6, fontWeight: 500 }}>{sub}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Progress bar */}
            <AnimatePresence>
              {(loading || (progress > 0 && progress < 100)) && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ height: 2, background: "rgba(255,255,255,0.03)", borderRadius: 2, overflow: "hidden" }}
                >
                  <motion.div
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #6366f1, #0ea5e9, #22d3ee)",
                      backgroundSize: "200% 100%",
                      borderRadius: 2,
                      boxShadow: "0 0 8px rgba(99,102,241,0.5)",
                    }}
                    animate={{ width: `${progress}%`, backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ width: { duration: 0.4 }, backgroundPosition: { duration: 1.5, repeat: Infinity } }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── PANELS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1, minHeight: 520 }}>

              {/* INPUT PANEL */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 8 }}
                animate={bootDone ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ display: "contents" }}
              >
                <TiltCard style={{ display: "flex", flexDirection: "column" }}>
                  {/* Header */}
                  <div style={{
                    height: 44, padding: "0 16px",
                    background: "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexShrink: 0,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <WindowDots />
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: MONO, marginLeft: 4, fontWeight: 500 }}>
                        input.csv
                      </span>
                    </div>
                    <motion.button
                      onClick={() => setCsvData(EXAMPLE_CSV)}
                      style={{
                        fontSize: 11, color: "var(--accent-primary)",
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.15)",
                        padding: "4px 10px", borderRadius: 6,
                        fontWeight: 600, cursor: "pointer",
                      }}
                      whileHover={{ scale: 1.04, y: -1, background: "rgba(99,102,241,0.15)", color: "var(--accent-primary-light)" }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ ...SPRING }}
                    >
                      ✦ Load example
                    </motion.button>
                  </div>

                  {/* Textarea */}
                  <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
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
                        minHeight: 280, letterSpacing: "0.2px",
                      }}
                      placeholder={"id,name,age,status\n1,John,,active\n2,,25,ACTIVE\n1,John,,active"}
                      value={csvData}
                      onChange={e => setCsvData(e.target.value)}
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ ...SPRING }}
                        style={{
                          margin: "0 14px 10px",
                          padding: "10px 14px",
                          background: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.15)",
                          borderRadius: 10,
                          fontSize: 12, color: "#f87171", lineHeight: 1.6,
                          display: "flex", alignItems: "flex-start", gap: 8,
                        }}
                      >
                        <span>⚠</span><span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <div style={{
                    padding: "8px 18px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: MONO }}>
                      {csvData.trim() ? `${rowCount} rows · ${colCount} cols · ${csvData.length} bytes` : "No data loaded"}
                    </span>
                    <span style={{
                      fontSize: 9, color: "var(--accent-primary)",
                      background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)",
                      padding: "2px 8px", borderRadius: 4, fontFamily: MONO, fontWeight: 700,
                    }}>CSV</span>
                  </div>

                  {/* Run button */}
                  <div style={{ padding: "10px 16px 16px", flexShrink: 0 }}>
                    <motion.button
                      id="generate-btn"
                      onClick={handleGenerate}
                      disabled={!canGenerate}
                      className="run-btn"
                      style={{
                        width: "100%", padding: "13px 18px",
                        background: canGenerate
                          ? "linear-gradient(135deg, #6366f1 0%, #0ea5e9 60%, #06b6d4 100%)"
                          : "rgba(255,255,255,0.03)",
                        backgroundSize: "200% 100%",
                        border: `1px solid ${canGenerate ? "rgba(99,102,241,0.3)" : "var(--border-subtle)"}`,
                        borderRadius: 11,
                        color: canGenerate ? "#fff" : "var(--text-dim)",
                        fontSize: 13, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                        letterSpacing: "-0.2px",
                        boxShadow: canGenerate ? "0 6px 20px rgba(99,102,241,0.3)" : "none",
                        cursor: canGenerate ? "pointer" : "not-allowed",
                      }}
                      whileHover={canGenerate ? {
                        scale: 1.01,
                        y: -2,
                        boxShadow: "0 12px 40px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.3)",
                      } : {}}
                      whileTap={canGenerate ? { scale: 0.98, y: 0 } : {}}
                      transition={{ ...SPRING }}
                    >
                      {loading ? (
                        <><Spinner size={15} />
                          <motion.span
                            animate={{ opacity: [1, 0.6, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            Analyzing & generating pipeline...
                          </motion.span>
                        </>
                      ) : (
                        <>
                          {Icons.bolt({ size: 16, color: canGenerate ? "#fff" : "var(--text-dim)" })}
                          Generate Pipeline
                        </>
                      )}
                    </motion.button>
                  </div>
                </TiltCard>
              </motion.div>

              {/* OUTPUT PANEL */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 8 }}
                animate={bootDone ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ display: "contents" }}
              >
                <TiltCard style={{ display: "flex", flexDirection: "column" }}>
                  {/* Tab header */}
                  <div style={{
                    height: 44,
                    background: "rgba(255,255,255,0.015)",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex", alignItems: "center",
                    flexShrink: 0, overflow: "hidden",
                  }}>
                    <div style={{ display: "flex", gap: 6, padding: "0 16px", flexShrink: 0 }}>
                      <WindowDots />
                    </div>
                    <div style={{ display: "flex", flex: 1, height: "100%", borderLeft: "1px solid var(--border-subtle)" }}>
                      {TABS.map(({ id, label, icon, badge }) => {
                        const isActive = activeTab === id;
                        return (
                          <motion.button
                            key={id}
                            onClick={() => script && setActiveTab(id)}
                            className={`tab-btn${isActive ? " tab-active" : ""}`}
                            style={{
                              padding: "0 16px", height: "100%",
                              fontSize: 12,
                              color: isActive ? "var(--text-primary)" : "#4a5568",
                              background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                              border: "none", borderRight: "1px solid var(--border-subtle)",
                              display: "flex", alignItems: "center", gap: 7,
                              cursor: script ? "pointer" : "default",
                              fontWeight: isActive ? 600 : 450, whiteSpace: "nowrap",
                            }}
                            whileHover={script && !isActive ? { background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)" } : {}}
                            transition={{ duration: 0.15 }}
                          >
                            <span>{Icons[icon]({ size: 13, color: isActive ? "var(--accent-primary-light)" : "#4a5568" })}</span>
                            {label}
                            {badge != null && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                                style={{
                                  fontSize: 10, fontWeight: 700, color: "#f59e0b",
                                  background: "rgba(245,158,11,0.12)",
                                  padding: "2px 6px", borderRadius: 4,
                                  border: "1px solid rgba(245,158,11,0.15)",
                                }}
                              >{badge}</motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {isReady && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          style={{ padding: "0 14px", flexShrink: 0, display: "flex", alignItems: "center" }}
                        >
                          <motion.div
                            style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}
                            animate={{ boxShadow: ["0 0 4px #10b981", "0 0 12px #10b981", "0 0 4px #10b981"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Output content */}
                  <div ref={outputRef} style={{ flex: 1, overflow: "auto", minHeight: 280, position: "relative" }}>
                    <AnimatePresence mode="wait">
                      {!script ? (
                        <motion.div
                          key="empty"
                          variants={tabContentV} initial="hidden" animate="visible" exit="exit"
                          style={{
                            height: "100%", minHeight: 280,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 14, padding: 32,
                          }}
                        >
                          <motion.div
                            style={{
                              width: 60, height: 60, borderRadius: 18,
                              background: loading ? "rgba(245,158,11,0.08)" : "rgba(99,102,241,0.06)",
                              border: `1px solid ${loading ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.12)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            animate={loading ? {} : { y: [0, -8, 0], rotate: [-2, 2, -2] }}
                            transition={loading ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          >
                            {loading ? <Spinner size={22} /> : Icons.zap({ size: 26, color: "var(--accent-primary-light)" })}
                          </motion.div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                              {loading ? "Generating pipeline..." : "Awaiting input"}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: MONO }}>
                              {loading ? "Claude is analyzing your CSV data" : "Paste CSV data and click Generate"}
                            </div>
                          </div>
                          {loading && (
                            <div style={{ display: "flex", gap: 6 }}>
                              {[0, 0.2, 0.4].map(d => (
                                <motion.div
                                  key={d}
                                  style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #0ea5e9)" }}
                                  animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 0.9, delay: d, repeat: Infinity }}
                                />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ) : activeTab === "script" ? (
                        <motion.div
                          key="script"
                          variants={tabContentV} initial="hidden" animate="visible" exit="exit"
                          style={{ padding: "14px 0" }}
                        >
                          <div style={{
                            padding: "0 18px 10px", fontSize: 11, color: "var(--text-dim)", fontFamily: MONO,
                            borderBottom: "1px solid var(--border-subtle)", marginBottom: 4, fontWeight: 500,
                            display: "flex", alignItems: "center", gap: 6,
                          }}>
                            {Icons.chevronRight({ size: 12, color: "var(--accent-primary)" })}
                            pipeline.py — generated by Claude AI
                          </div>
                          <div style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9 }}>
                            {highlightPython(script)}
                          </div>
                        </motion.div>
                      ) : activeTab === "issues" ? (
                        <motion.div
                          key="issues"
                          variants={tabContentV} initial="hidden" animate="visible" exit="exit"
                          style={{ padding: "14px 16px" }}
                        >
                          {issues.length === 0 ? (
                            <motion.div
                              style={{ padding: "40px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}
                              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING }}
                            >
                              <motion.div
                                style={{
                                  marginBottom: 14, background: "rgba(16,185,129,0.08)", borderRadius: 16,
                                  width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center",
                                  border: "1px solid rgba(16,185,129,0.15)",
                                }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                              >
                                {Icons.checkCircle({ size: 28, color: "#10b981" })}
                              </motion.div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#10b981" }}>No issues found</div>
                              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, fontFamily: MONO }}>Your CSV data looks clean</div>
                            </motion.div>
                          ) : issues.map((iss, i) => (
                            <motion.div
                              key={i}
                              className="issue-item"
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06, ...SPRING }}
                              style={{
                                display: "flex", gap: 10, alignItems: "flex-start",
                                marginBottom: 8, padding: "12px 14px",
                                background: "rgba(245,158,11,0.03)",
                                border: "1px solid rgba(245,158,11,0.08)",
                                borderRadius: 10,
                              }}
                            >
                              <span style={{
                                fontSize: 10, fontWeight: 700, color: "#f59e0b",
                                background: "rgba(245,158,11,0.12)",
                                padding: "2px 8px", borderRadius: 5,
                                fontFamily: MONO, flexShrink: 0, marginTop: 2,
                                border: "1px solid rgba(245,158,11,0.15)",
                              }}>#{i + 1}</span>
                              <span style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>{iss}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="explanation"
                          variants={tabContentV} initial="hidden" animate="visible" exit="exit"
                          style={{ padding: "14px 18px" }}
                        >
                          <div style={{
                            fontSize: 11, color: "var(--text-dim)", fontFamily: MONO, marginBottom: 14,
                            padding: "0 0 10px", borderBottom: "1px solid var(--border-subtle)",
                            display: "flex", alignItems: "center", gap: 6, fontWeight: 500,
                          }}>
                            {Icons.chevronRight({ size: 12, color: "var(--accent-primary)" })}
                            explanation.md
                          </div>
                          <motion.div
                            style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 2, whiteSpace: "pre-wrap" }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                          >
                            {explanation || "No explanation available."}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action bar */}
                  <AnimatePresence>
                    {script && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ ...SPRING }}
                        style={{
                          padding: "12px 16px",
                          borderTop: "1px solid var(--border-subtle)",
                          display: "flex", gap: 10, flexShrink: 0,
                          background: "rgba(255,255,255,0.01)",
                        }}
                      >
                        <motion.button
                          onClick={handleCopy}
                          className="action-btn"
                          style={{
                            flex: 1, padding: "10px 14px",
                            fontSize: 12, fontWeight: 700, borderRadius: 9,
                            border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.2)"}`,
                            background: copied ? "rgba(16,185,129,0.1)" : "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(14,165,233,0.1))",
                            color: copied ? "#34d399" : "var(--accent-primary-light)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            cursor: "pointer",
                          }}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ ...SPRING }}
                        >
                          <AnimatePresence mode="wait">
                            {copied ? (
                              <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {Icons.check({ size: 14, color: "#34d399" })} Copied!
                              </motion.span>
                            ) : (
                              <motion.span key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {Icons.copy({ size: 14 })} Copy Script
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        <motion.button
                          onClick={handleDownload}
                          className="action-btn"
                          style={{
                            flex: 1, padding: "10px 14px",
                            fontSize: 12, fontWeight: 700, borderRadius: 9,
                            border: "1px solid var(--border-light)",
                            background: "var(--glass-bg)",
                            color: "var(--text-muted)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            cursor: "pointer",
                          }}
                          whileHover={{ scale: 1.02, y: -1, color: "var(--text-secondary)", background: "var(--glass-bg-hover)" }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ ...SPRING }}
                        >
                          {Icons.download({ size: 14 })} Download .py
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TiltCard>
              </motion.div>

            </div>{/* /panels */}
          </main>
        </div>

        {/* ── STATUS BAR ── */}
        <motion.footer
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: bootDone ? 0 : 30, opacity: bootDone ? 1 : 0 }}
          transition={{ delay: 0.5, ...SPRING }}
          style={{
            height: 28,
            background: "rgba(0,0,0,0.5)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center",
            padding: "0 20px",
            flexShrink: 0, backdropFilter: "blur(12px)",
            position: "relative",
          }}
        >
          <motion.div
            style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.2), rgba(14,165,233,0.2), transparent)",
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          {[
            { label: loading ? "⚡ processing" : isReady ? "✓ complete" : "○ idle", color: loading ? "#f59e0b" : isReady ? "#10b981" : "var(--text-dim)" },
            { label: "claude-haiku-4-5", color: "var(--text-dim)" },
            { label: "python 3",         color: "var(--text-dim)" },
          ].map(({ label, color }, i) => (
            <span key={i} style={{
              fontSize: 10, color, fontFamily: MONO, fontWeight: 500,
              paddingRight: 16, marginRight: 16,
              borderRight: i < 2 ? "1px solid var(--border-subtle)" : "none",
            }}>{label}</span>
          ))}
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 10, color: "var(--text-ghost)", fontFamily: MONO, fontWeight: 500 }}>
              PipelineAI — Mubarak Ali Piracha
            </span>
          </div>
        </motion.footer>

      </motion.div>
    </>
  );
}
