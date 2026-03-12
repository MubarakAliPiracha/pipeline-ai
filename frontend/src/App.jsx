import { useState } from "react";

const EXAMPLE_CSV = `project_id,project_name,budget,spent,start_date,completion_pct,manager,status
1,Tower Block A,500000,487000,2024-01-15,94,John Smith,active
2,Bridge Repair,,320000,2024-02-01,67,,delayed
3,Highway Ext,750000,125000,2024/03/10,abc,Alice Wong,active
4,Tower Block A,500000,487000,2024-01-15,94,John Smith,active
5,Mall Renovation,300000,315000,2024-03-01,102,Bob,ACTIVE
6,School Build,450000,200000,,45,Charlie Brown,
7,,600000,0,2024-04-01,0,Diana Prince,planned`;

export default function App() {
  const [csvData, setCsvData] = useState("");
  const [script, setScript] = useState("");
  const [explanation, setExplanation] = useState("");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("script");
  const [copied, setCopied] = useState(false);

  const rowCount = csvData.trim() ? csvData.trim().split("\n").length : 0;
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
      } else setError(data.error || "Something went wrong.");
    } catch { setError("Cannot connect. Please try again."); }
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

  const statusColor = loading ? "#8b5cf6" : script ? "#10b981" : "#334155";
  const statusLabel = loading ? "Processing" : script ? "Ready" : "Standby";
  const isActive = !loading && !!csvData.trim();

  const TABS = [
    { id: "script", label: "Script" },
    { id: "issues", label: "Issues", badge: issues.length > 0 ? issues.length : null },
    { id: "explanation", label: "Explanation" },
  ];

  const STATS = [
    { label: "Input Rows", value: rowCount || "—", lit: rowCount > 0 },
    { label: "Columns", value: colCount || "—", lit: colCount > 0 },
    { label: "Issues Found", value: issues.length > 0 ? issues.length : "—", amber: issues.length > 0 },
    { label: "Pipeline State", value: statusLabel, custom: statusColor },
  ];

  const glassBorder = "linear-gradient(rgba(13,13,26,0.75),rgba(13,13,26,0.75)) padding-box, linear-gradient(135deg,rgba(139,92,246,0.35),rgba(6,182,212,0.18),rgba(139,92,246,0.12)) border-box";
  const glassBorderHover = "linear-gradient(rgba(13,13,26,0.75),rgba(13,13,26,0.75)) padding-box, linear-gradient(135deg,rgba(139,92,246,0.55),rgba(6,182,212,0.35),rgba(139,92,246,0.25)) border-box";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          height: 100%;
          background: #080810;
          color: #f8fafc;
          font-family: 'Inter', -apple-system, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 4px; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 1; transform: translate(-50%,-55%) scale(1); }
          50%       { opacity: 0.75; transform: translate(-50%,-55%) scale(1.12); }
        }
        @keyframes borderGlow {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes btnShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        button { font-family: 'Inter', sans-serif; cursor: pointer; }
        textarea { font-family: 'JetBrains Mono', monospace !important; }

        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          animation: fadeUp 0.5s ease both;
        }

        /* Fixed background blobs */
        .blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(80px);
        }
        .blob-purple {
          width: 700px; height: 700px;
          top: -200px; left: -150px;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%);
          animation: orbPulse 8s ease-in-out infinite;
        }
        .blob-cyan {
          width: 500px; height: 500px;
          top: -100px; right: -100px;
          background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%);
          animation: orbPulse 10s ease-in-out infinite reverse;
        }
        .blob-bottom {
          width: 400px; height: 400px;
          bottom: -100px; right: 30%;
          background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%);
        }

        /* Header */
        .header {
          height: 54px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px;
          position: sticky; top: 0; z-index: 100;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(8,8,16,0.8);
          border-bottom: 1px solid rgba(139,92,246,0.12);
          flex-shrink: 0;
        }

        .logo-mark {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(139,92,246,0.4);
          flex-shrink: 0;
        }

        .gh-btn {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: #64748b;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: rgba(139,92,246,0.06) padding-box,
                      linear-gradient(135deg,rgba(139,92,246,0.2),rgba(6,182,212,0.1)) border-box;
          transition: all 0.2s;
        }
        .gh-btn:hover {
          color: #a78bfa;
          background: rgba(139,92,246,0.12) padding-box,
                      linear-gradient(135deg,rgba(139,92,246,0.4),rgba(6,182,212,0.2)) border-box;
        }

        /* Hero */
        .hero {
          text-align: center;
          padding: 72px 24px 56px;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        .hero-orb {
          position: absolute;
          top: 50%; left: 50%;
          width: 700px; height: 360px;
          background: radial-gradient(ellipse, rgba(139,92,246,0.22) 0%, rgba(6,182,212,0.08) 40%, transparent 70%);
          transform: translate(-50%,-55%);
          pointer-events: none;
          animation: orbPulse 5s ease-in-out infinite;
          z-index: 0;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #a78bfa;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
          padding: 5px 14px; border-radius: 20px;
          margin-bottom: 28px;
          position: relative; z-index: 1;
        }
        .hero-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #8b5cf6;
          box-shadow: 0 0 6px rgba(139,92,246,0.8);
        }
        .hero-title {
          font-size: clamp(52px, 8vw, 80px);
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 1;
          margin-bottom: 24px;
          position: relative; z-index: 1;
          background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 30%, #67e8f9 75%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 17px; font-weight: 400; color: #64748b;
          line-height: 1.6; max-width: 480px; margin: 0 auto;
          position: relative; z-index: 1;
        }
        .hero-sub strong { color: #94a3b8; font-weight: 500; }

        /* Content wrapper */
        .content {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px 60px;
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* Stat cards */
        .stat-card {
          border-radius: 12px;
          padding: 18px 22px;
          border: 1px solid transparent;
          background: ${glassBorder};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.2s;
        }
        .stat-card:hover {
          background: ${glassBorderHover};
        }

        /* Glass panel */
        .panel {
          border-radius: 14px;
          border: 1px solid transparent;
          background: ${glassBorder};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex; flex-direction: column; overflow: hidden;
          transition: background 0.2s;
        }
        .panel:focus-within {
          background: ${glassBorderHover};
        }

        .panel-header {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(139,92,246,0.1);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }

        /* Tabs */
        .tab-btn {
          padding: 13px 18px;
          font-size: 12px; font-weight: 600;
          background: none; border: none;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: -1px;
          transition: color 0.15s;
        }
        .tab-btn:hover { color: #c4b5fd !important; }

        /* Generate button */
        .btn-generate {
          width: 100%; padding: 13px;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 700;
          letter-spacing: -0.1px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: box-shadow 0.2s, transform 0.15s, opacity 0.15s;
          position: relative; overflow: hidden;
        }
        .btn-generate.active {
          background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #7c3aed 100%);
          background-size: 200% auto;
          color: white;
          box-shadow: 0 0 20px rgba(139,92,246,0.45), 0 0 40px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
          animation: btnShimmer 3s linear infinite;
        }
        .btn-generate.active:hover {
          box-shadow: 0 0 30px rgba(139,92,246,0.65), 0 0 60px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }
        .btn-generate.inactive {
          background: rgba(139,92,246,0.06);
          border: 1px solid rgba(139,92,246,0.1);
          color: #334155;
        }

        /* Small buttons */
        .btn-example {
          font-size: 12px; font-weight: 500;
          padding: 6px 13px; border-radius: 7px;
          color: #a78bfa;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
          transition: all 0.15s;
        }
        .btn-example:hover {
          background: rgba(139,92,246,0.16);
          border-color: rgba(139,92,246,0.4);
          color: #c4b5fd;
        }
        .btn-copy {
          flex: 1; padding: 9px 14px;
          font-size: 12px; font-weight: 600;
          border-radius: 8px;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.25);
          color: #a78bfa;
          transition: all 0.15s;
        }
        .btn-copy:hover {
          background: rgba(139,92,246,0.2);
          border-color: rgba(139,92,246,0.45);
          color: #c4b5fd;
          box-shadow: 0 0 12px rgba(139,92,246,0.2);
        }
        .btn-download {
          flex: 1; padding: 9px 14px;
          font-size: 12px; font-weight: 600;
          border-radius: 8px;
          background: transparent;
          border: 1px solid rgba(139,92,246,0.12);
          color: #475569;
          transition: all 0.15s;
        }
        .btn-download:hover {
          border-color: rgba(139,92,246,0.25);
          color: #64748b;
          background: rgba(139,92,246,0.05);
        }

        /* Footer */
        .footer {
          height: 32px;
          display: flex; align-items: center;
          padding: 0 32px; gap: 24px;
          flex-shrink: 0;
          position: relative; z-index: 1;
          background: rgba(8,8,16,0.9);
          border-top: 1px solid transparent;
          background:
            rgba(8,8,16,0.9) padding-box,
            linear-gradient(90deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1), rgba(139,92,246,0.05)) border-box;
        }
      `}</style>

      <div className="app-root">

        {/* BACKGROUND BLOBS */}
        <div className="blob blob-purple" />
        <div className="blob blob-cyan" />
        <div className="blob blob-bottom" />

        {/* HEADER */}
        <header className="header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="logo-mark">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="4" height="4" rx="1.2" fill="white" opacity="0.95" />
                <rect x="2" y="8" width="4" height="3" rx="1" fill="white" opacity="0.55" />
                <rect x="8" y="2" width="6" height="1.5" rx="0.75" fill="white" opacity="0.8" />
                <rect x="8" y="5.5" width="4" height="1.5" rx="0.75" fill="white" opacity="0.5" />
                <rect x="8" y="9" width="5" height="1.5" rx="0.75" fill="white" opacity="0.6" />
                <rect x="8" y="12.5" width="3" height="1.5" rx="0.75" fill="white" opacity="0.35" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.4px", color: "#f8fafc" }}>
              PipelineAI
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
              color: "#8b5cf6",
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.25)",
              padding: "2px 8px", borderRadius: 20,
            }}>
              BETA
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}88`,
              }} />
              <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
                {statusLabel}
              </span>
            </div>
            <a
              href="https://github.com/MubarakAliPiracha/pipeline-ai"
              target="_blank"
              rel="noreferrer"
              className="gh-btn"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M7 0C3.13 0 0 3.13 0 7c0 3.09 2.01 5.72 4.79 6.65.35.06.48-.15.48-.34v-1.19c-1.95.42-2.36-.94-2.36-.94-.32-.81-.78-1.02-.78-1.02-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.93-1.55-.18-3.18-.77-3.18-3.44 0-.76.27-1.38.72-1.87-.07-.18-.31-.88.07-1.84 0 0 .58-.19 1.91.71A6.63 6.63 0 017 3.44c.59 0 1.18.08 1.74.23 1.32-.9 1.9-.71 1.9-.71.38.96.14 1.66.07 1.84.45.49.72 1.11.72 1.87 0 2.68-1.63 3.26-3.19 3.43.25.22.47.64.47 1.29v1.91c0 .19.13.41.48.34A7.003 7.003 0 0014 7c0-3.87-3.13-7-7-7z" />
              </svg>
              GitHub
            </a>
          </div>
        </header>

        {/* HERO */}
        <section className="hero">
          <div className="hero-orb" />
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            Claude-Powered Data Pipeline
          </div>
          <h1 className="hero-title">PipelineAI</h1>
          <p className="hero-sub">
            Drop messy CSV. Get <strong>production-ready Python</strong> in seconds.
          </p>
        </section>

        {/* CONTENT */}
        <div className="content">

          {/* STATS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {STATS.map(({ label, value, lit, amber, custom }) => (
              <div key={label} className="stat-card">
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(139,92,246,0.5)",
                  marginBottom: 10,
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: typeof value === "string" && value.length > 7 ? 15 : 26,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: custom || (amber ? "#f59e0b" : lit ? "#f8fafc" : "#1e293b"),
                  fontFamily: typeof value === "number" ? "'JetBrains Mono', monospace" : "inherit",
                  textShadow: custom && custom !== "#334155" ? `0 0 20px ${custom}44` : "none",
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* PANELS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, minHeight: 500 }}>

            {/* INPUT PANEL */}
            <div className="panel">
              <div className="panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    boxShadow: "0 0 8px rgba(245,158,11,0.5)",
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    CSV Input
                  </span>
                </div>
                <button className="btn-example" onClick={() => setCsvData(EXAMPLE_CSV)}>
                  Load example
                </button>
              </div>

              <textarea
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  padding: "18px 20px",
                  fontSize: 12,
                  lineHeight: 1.8,
                  color: "#475569",
                  resize: "none",
                  width: "100%",
                  minHeight: 260,
                }}
                placeholder={"Paste your CSV here...\n\nid,name,age,status\n1,John,,active\n2,,25,ACTIVE\n1,John,,active"}
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
              />

              {error && (
                <div style={{
                  margin: "0 20px 14px",
                  padding: "11px 15px",
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#f87171",
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.6,
                  flexShrink: 0,
                }}>
                  {error}
                </div>
              )}

              <div style={{
                padding: "9px 20px",
                borderTop: "1px solid rgba(139,92,246,0.08)",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, color: "#1e293b", fontFamily: "'JetBrains Mono', monospace" }}>
                  {csvData.trim() ? `${rowCount} rows · ${colCount} cols · ${csvData.length} chars` : "Awaiting input"}
                </span>
              </div>

              <div style={{ padding: "10px 20px 20px", flexShrink: 0 }}>
                <button
                  onClick={handleGenerate}
                  disabled={!isActive}
                  className={`btn-generate ${isActive ? "active" : "inactive"}`}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 14, height: 14,
                        border: "2px solid rgba(255,255,255,0.2)",
                        borderTopColor: "#c4b5fd",
                        borderRadius: "50%",
                        animation: "spin 0.65s linear infinite",
                        display: "inline-block",
                        flexShrink: 0,
                      }} />
                      Analyzing data...
                    </>
                  ) : "Generate Pipeline"}
                </button>
              </div>
            </div>

            {/* OUTPUT PANEL */}
            <div className="panel">
              <div style={{
                display: "flex", alignItems: "center",
                borderBottom: "1px solid rgba(139,92,246,0.1)",
                flexShrink: 0,
              }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="tab-btn"
                    style={{
                      color: activeTab === tab.id ? "#c4b5fd" : "#334155",
                      borderBottom: `2px solid ${activeTab === tab.id ? "#8b5cf6" : "transparent"}`,
                    }}
                  >
                    {tab.label}
                    {tab.badge != null && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: "#f59e0b",
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        padding: "1px 7px", borderRadius: 4,
                      }}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
                <div style={{ marginLeft: "auto", padding: "0 18px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: statusColor,
                    boxShadow: statusColor !== "#334155" ? `0 0 6px ${statusColor}88` : "none",
                  }} />
                  <span style={{ fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, padding: "18px 20px", overflow: "auto", minHeight: 260 }}>
                {!script ? (
                  <div style={{
                    height: "100%", minHeight: 240,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: "rgba(139,92,246,0.06)",
                      border: "1px solid rgba(139,92,246,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" opacity="0.4">
                        <path d="M3 6h18M3 12h12M3 18h8" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="19" cy="17" r="4" stroke="#06b6d4" strokeWidth="1.5" />
                        <path d="M17 17h4M19 15v4" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 5 }}>
                        No output yet
                      </div>
                      <div style={{ fontSize: 12, color: "#0f172a" }}>
                        Paste CSV data and generate your pipeline
                      </div>
                    </div>
                  </div>
                ) : activeTab === "script" ? (
                  <pre style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12, lineHeight: 1.8,
                    color: "#4ade80",
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    margin: 0,
                    textShadow: "0 0 20px rgba(74,222,128,0.15)",
                  }}>
                    {script}
                  </pre>
                ) : activeTab === "issues" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {issues.length === 0 ? (
                      <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        minHeight: 200, gap: 12,
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: "rgba(16,185,129,0.08)",
                          border: "1px solid rgba(16,185,129,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5 10l3.5 3.5L15 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span style={{ fontSize: 12, color: "#1e293b" }}>No issues detected</span>
                      </div>
                    ) : issues.map((iss, i) => (
                      <div key={i} style={{
                        padding: "11px 15px",
                        background: "rgba(245,158,11,0.04)",
                        border: "1px solid rgba(245,158,11,0.12)",
                        borderRadius: 8,
                        display: "flex", alignItems: "flex-start", gap: 10,
                      }}>
                        <div style={{
                          width: 4, height: 4, borderRadius: "50%",
                          background: "#f59e0b", marginTop: 8, flexShrink: 0,
                          boxShadow: "0 0 6px rgba(245,158,11,0.5)",
                        }} />
                        <span style={{
                          fontSize: 12, color: "#64748b",
                          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7,
                        }}>
                          {iss}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: "16px 18px",
                    background: "rgba(6,182,212,0.04)",
                    border: "1px solid rgba(6,182,212,0.1)",
                    borderRadius: 10,
                    fontSize: 13, color: "#475569", lineHeight: 1.85,
                  }}>
                    {explanation || "No explanation available."}
                  </div>
                )}
              </div>

              {script && (
                <div style={{
                  padding: "12px 20px",
                  borderTop: "1px solid rgba(139,92,246,0.08)",
                  display: "flex", gap: 8, flexShrink: 0,
                }}>
                  <button onClick={handleCopy} className="btn-copy">
                    {copied ? "Copied" : "Copy Script"}
                  </button>
                  <button onClick={handleDownload} className="btn-download">
                    Download .py
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: statusColor,
              boxShadow: statusColor !== "#334155" ? `0 0 5px ${statusColor}` : "none",
            }} />
            <span style={{ fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>
              {statusLabel}
            </span>
          </div>
          <span style={{ fontSize: 10, color: "#1e293b", fontFamily: "'JetBrains Mono', monospace" }}>
            claude-haiku-4-5
          </span>
          <span style={{ fontSize: 10, color: "#1e293b", fontFamily: "'JetBrains Mono', monospace" }}>
            PipelineAI v1.0
          </span>
          <div style={{ marginLeft: "auto", fontSize: 10, color: "#1a1a2e", fontFamily: "'JetBrains Mono', monospace" }}>
            Mubarak Ali Piracha · UWaterloo
          </div>
        </footer>

      </div>
    </>
  );
}
