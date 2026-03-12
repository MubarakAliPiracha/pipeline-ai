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

  const statusLabel = loading ? "PROCESSING" : script ? "READY" : "STANDBY";
  const statusDot = loading ? "#a3a3a3" : script ? "#4ade80" : "#333333";
  const canGenerate = !loading && !!csvData.trim();

  const TABS = [
    { id: "script",      label: "SCRIPT" },
    { id: "issues",      label: "ISSUES", count: issues.length },
    { id: "explanation", label: "EXPLANATION" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          height: 100%;
          background: #080808;
          color: #ffffff;
          font-family: 'Space Grotesk', sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #111111; }
        ::-webkit-scrollbar-thumb { background: #333333; border-radius: 0; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        button { font-family: 'Space Mono', monospace; cursor: pointer; }
        textarea { font-family: 'Space Mono', monospace !important; }
        pre { font-family: 'Space Mono', monospace !important; }

        /* HEADER */
        .header {
          height: 52px;
          position: sticky; top: 0; z-index: 100;
          background: #080808;
          border-bottom: 1px solid #1a1a1a;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px;
          flex-shrink: 0;
        }
        .wordmark {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffffff;
        }
        .gh-link {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #555555;
          text-decoration: none;
          letter-spacing: 0.06em;
          transition: color 0.15s;
        }
        .gh-link:hover { color: #ffffff; }

        /* HERO */
        .hero {
          text-align: center;
          padding: 80px 40px 60px;
          position: relative;
          overflow: hidden;
        }
        .hero-glow {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 400px;
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,255,0.055) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-line1 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(64px, 12vw, 120px);
          letter-spacing: -0.04em;
          line-height: 0.95;
          color: #ffffff;
          position: relative; z-index: 1;
        }
        .hero-line2 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(64px, 12vw, 120px);
          letter-spacing: -0.04em;
          line-height: 0.95;
          color: #555555;
          position: relative; z-index: 1;
          margin-bottom: 28px;
        }
        .hero-sub {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          color: #444444;
          letter-spacing: 0.04em;
          position: relative; z-index: 1;
        }
        .hero-rule {
          border: none;
          border-top: 1px solid #1a1a1a;
          margin: 48px 0 0;
        }

        /* STAT BAR */
        .stat-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-bottom: 1px solid #1a1a1a;
        }
        .stat-item {
          padding: 20px 32px;
          border-right: 1px solid #1a1a1a;
          transition: background 0.15s;
        }
        .stat-item:last-child { border-right: none; }
        .stat-item:hover { background: #0d0d0d; }
        .stat-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #333333;
          margin-bottom: 8px;
        }
        .stat-value {
          font-family: 'Space Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #333333;
        }
        .stat-value.lit   { color: #e5e5e5; }
        .stat-value.ready { color: #4ade80; }
        .stat-value.warn  { color: #ef4444; }
        .stat-value.processing { color: #a3a3a3; }

        /* PANELS AREA */
        .panels-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          flex: 1;
          min-height: 0;
        }

        /* PANEL */
        .panel {
          border-right: 1px solid #1a1a1a;
          display: flex;
          flex-direction: column;
          min-height: 520px;
          transition: box-shadow 0.15s;
        }
        .panel:last-child { border-right: none; }
        .panel:focus-within { box-shadow: inset 0 0 0 1px #2a2a2a; }

        .panel-head {
          padding: 0 24px;
          height: 44px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #1a1a1a;
          flex-shrink: 0;
        }
        .panel-label {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #333333;
        }

        /* TEXTAREA */
        .csv-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 20px 24px;
          font-size: 12px;
          line-height: 1.9;
          color: #555555;
          resize: none;
          width: 100%;
          min-height: 300px;
          caret-color: #ffffff;
        }
        .csv-textarea::placeholder { color: #222222; }
        .csv-textarea:focus { color: #a3a3a3; }

        /* META BAR */
        .meta-bar {
          padding: 0 24px;
          height: 36px;
          display: flex; align-items: center;
          border-top: 1px solid #1a1a1a;
          flex-shrink: 0;
        }
        .meta-text {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: #2a2a2a;
          letter-spacing: 0.04em;
        }

        /* GENERATE BUTTON */
        .btn-generate-wrap {
          padding: 16px 24px 24px;
          flex-shrink: 0;
        }
        .btn-generate {
          width: 100%;
          padding: 13px 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border-radius: 2px;
          border: 1px solid transparent;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .btn-generate.on {
          background: #ffffff;
          color: #080808;
          border-color: #ffffff;
        }
        .btn-generate.on:hover {
          background: #080808;
          color: #ffffff;
          border-color: #ffffff;
        }
        .btn-generate.off {
          background: #111111;
          color: #2a2a2a;
          border-color: #1a1a1a;
        }
        .cursor-blink {
          display: inline-block;
          width: 8px; height: 14px;
          background: #a3a3a3;
          animation: blink 1s step-end infinite;
          vertical-align: middle;
          border-radius: 1px;
        }

        /* ERROR */
        .error-box {
          margin: 0 24px 16px;
          padding: 12px 16px;
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 2px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #ef4444;
          line-height: 1.6;
          flex-shrink: 0;
        }

        /* EXAMPLE BUTTON */
        .btn-example {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #444444;
          background: transparent;
          border: 1px solid #222222;
          padding: 5px 12px;
          border-radius: 2px;
          transition: color 0.15s, border-color 0.15s;
        }
        .btn-example:hover { color: #ffffff; border-color: #444444; }

        /* TAB BAR */
        .tab-bar {
          display: flex;
          border-bottom: 1px solid #1a1a1a;
          flex-shrink: 0;
        }
        .tab-btn {
          padding: 0 20px;
          height: 44px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: none;
          border: none;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          display: flex; align-items: center; gap: 7px;
          transition: color 0.15s, border-color 0.15s;
        }
        .tab-btn.active { color: #ffffff; border-bottom-color: #ffffff; }
        .tab-btn.inactive { color: #333333; }
        .tab-btn.inactive:hover { color: #666666; }
        .tab-badge {
          font-size: 9px;
          font-family: 'Space Mono', monospace;
          color: #ef4444;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          padding: 1px 6px;
          border-radius: 2px;
        }
        .tab-status {
          margin-left: auto;
          padding: 0 20px;
          display: flex; align-items: center; gap: 7px;
        }

        /* OUTPUT */
        .output-area {
          flex: 1;
          padding: 20px 24px;
          overflow: auto;
          min-height: 300px;
        }
        .output-empty {
          height: 100%; min-height: 260px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          color: #222222;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .output-empty-line {
          width: 32px;
          height: 1px;
          background: #1a1a1a;
        }
        .script-pre {
          font-size: 12px;
          line-height: 1.9;
          color: #4ade80;
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
        }
        .issue-item {
          padding: 12px 16px;
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-left: 2px solid #ef4444;
          margin-bottom: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #555555;
          line-height: 1.7;
          border-radius: 0;
        }
        .no-issues {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 220px; gap: 10px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #222222;
        }
        .explanation-box {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          color: #555555;
          line-height: 1.85;
          padding: 16px;
          border: 1px solid #1a1a1a;
          border-radius: 0;
          background: #0d0d0d;
        }

        /* COPY/DOWNLOAD */
        .action-bar {
          padding: 12px 24px;
          border-top: 1px solid #1a1a1a;
          display: flex; gap: 8px;
          flex-shrink: 0;
        }
        .btn-action {
          flex: 1; padding: 9px 14px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          border-radius: 2px;
          transition: all 0.15s;
        }
        .btn-copy {
          background: #ffffff;
          border: 1px solid #ffffff;
          color: #080808;
        }
        .btn-copy:hover {
          background: #080808;
          color: #ffffff;
          border-color: #ffffff;
        }
        .btn-download {
          background: transparent;
          border: 1px solid #222222;
          color: #444444;
        }
        .btn-download:hover {
          border-color: #444444;
          color: #ffffff;
        }

        /* STATUS BAR */
        .status-bar {
          height: 32px;
          border-top: 1px solid #1a1a1a;
          display: flex; align-items: center;
          padding: 0 40px; gap: 24px;
          flex-shrink: 0;
          background: #080808;
        }
        .status-item {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: #2a2a2a;
          letter-spacing: 0.06em;
          display: flex; align-items: center; gap: 6px;
        }
        .status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease both" }}>

        {/* HEADER */}
        <header className="header">
          <span className="wordmark">Pipeline AI</span>
          <a
            href="https://github.com/MubarakAliPiracha/pipeline-ai"
            target="_blank"
            rel="noreferrer"
            className="gh-link"
          >
            github
          </a>
        </header>

        {/* HERO */}
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-line1">PIPELINE</div>
          <div className="hero-line2">AI</div>
          <p className="hero-sub">Drop messy CSV. Get production-ready Python. Instantly.</p>
          <hr className="hero-rule" />
        </section>

        {/* STAT BAR */}
        <div className="stat-bar">
          {[
            {
              label: "Input Rows",
              value: rowCount || "—",
              cls: rowCount > 0 ? "lit" : "",
            },
            {
              label: "Columns",
              value: colCount || "—",
              cls: colCount > 0 ? "lit" : "",
            },
            {
              label: "Issues Found",
              value: issues.length > 0 ? issues.length : "—",
              cls: issues.length > 0 ? "warn" : "",
            },
            {
              label: "Status",
              value: statusLabel,
              cls: loading ? "processing" : script ? "ready" : "",
            },
          ].map(({ label, value, cls }) => (
            <div key={label} className="stat-item">
              <div className="stat-label">{label}</div>
              <div className={`stat-value ${cls}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* PANELS */}
        <div className="panels-row" style={{ flex: 1 }}>

          {/* INPUT PANEL */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-label">Input</span>
              <button className="btn-example" onClick={() => setCsvData(EXAMPLE_CSV)}>
                Load Example
              </button>
            </div>

            <textarea
              className="csv-textarea"
              placeholder={"Paste your CSV here...\n\nid,name,age,status\n1,John,,active\n2,,25,ACTIVE"}
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
            />

            {error && <div className="error-box">{error}</div>}

            <div className="meta-bar">
              <span className="meta-text">
                {csvData.trim()
                  ? `${rowCount} rows / ${colCount} cols / ${csvData.length} chars`
                  : "awaiting_input"}
              </span>
            </div>

            <div className="btn-generate-wrap">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`btn-generate ${canGenerate ? "on" : "off"}`}
              >
                {loading ? (
                  <>
                    <span className="cursor-blink" />
                    Analyzing data
                  </>
                ) : (
                  "Generate Pipeline"
                )}
              </button>
            </div>
          </div>

          {/* OUTPUT PANEL */}
          <div className="panel">
            <div className="tab-bar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn ${activeTab === tab.id ? "active" : "inactive"}`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="tab-badge">{tab.count}</span>
                  )}
                </button>
              ))}
              <div className="tab-status">
                <div className="status-dot" style={{ background: statusDot }} />
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  color: "#2a2a2a",
                  letterSpacing: "0.1em",
                }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="output-area">
              {!script ? (
                <div className="output-empty">
                  <div className="output-empty-line" />
                  No output yet
                  <div className="output-empty-line" />
                </div>
              ) : activeTab === "script" ? (
                <pre className="script-pre">{script}</pre>
              ) : activeTab === "issues" ? (
                issues.length === 0 ? (
                  <div className="no-issues">
                    <div className="output-empty-line" />
                    No issues detected
                  </div>
                ) : (
                  issues.map((iss, i) => (
                    <div key={i} className="issue-item">{iss}</div>
                  ))
                )
              ) : (
                <div className="explanation-box">
                  {explanation || "No explanation available."}
                </div>
              )}
            </div>

            {script && (
              <div className="action-bar">
                <button onClick={handleCopy} className="btn-action btn-copy">
                  {copied ? "Copied" : "Copy Script"}
                </button>
                <button onClick={handleDownload} className="btn-action btn-download">
                  Download .py
                </button>
              </div>
            )}
          </div>

        </div>

        {/* STATUS BAR */}
        <div className="status-bar">
          <div className="status-item">
            <div className="status-dot" style={{ background: statusDot }} />
            {statusLabel}
          </div>
          <div className="status-item">claude-haiku-4-5</div>
          <div className="status-item">pipeline-ai v1.0</div>
          <div style={{ marginLeft: "auto" }} className="status-item">
            Mubarak Ali Piracha · UWaterloo
          </div>
        </div>

      </div>
    </>
  );
}
