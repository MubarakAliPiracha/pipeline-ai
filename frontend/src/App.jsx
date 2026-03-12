import { useState, useEffect } from "react";
 
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
  const [time, setTime] = useState(new Date());
 
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
 
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
 
  const statusColor = loading ? "#3b82f6" : script ? "#10b981" : "#475569";
  const statusLabel = loading ? "Processing" : script ? "Ready" : "Standby";
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #0f1117; color: #f1f5f9; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .app { animation: fadeUp 0.5s ease; }
        button { font-family: 'DM Sans', sans-serif; }
        textarea { font-family: 'DM Mono', monospace !important; }
        textarea::placeholder { color: #1e293b !important; }
        .sidebar-item:hover { background: #1a1f2e !important; color: #94a3b8 !important; }
        .action-btn:hover { background: rgba(59,130,246,0.15) !important; border-color: rgba(59,130,246,0.3) !important; color: #3b82f6 !important; }
        .secondary-btn:hover { background: #1e293b !important; color: #94a3b8 !important; }
        .nav-link:hover { border-color: #334155 !important; color: #94a3b8 !important; }
        .stat-card { transition: border-color 0.2s !important; }
        .stat-card:hover { border-color: #334155 !important; }
        .panel { transition: border-color 0.2s !important; }
        .panel:focus-within { border-color: #334155 !important; }
      `}</style>
 
      <div className="app" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
 
        {/* ── HEADER ── */}
        <header style={{
          height: 54, borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", background: "#0f1117",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Logo mark */}
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect width="26" height="26" rx="7" fill="#1d4ed8"/>
              <rect x="5" y="7" width="5" height="4" rx="1" fill="white" opacity="0.9"/>
              <rect x="5" y="13" width="5" height="4" rx="1" fill="white" opacity="0.5"/>
              <rect x="5" y="19" width="5" height="2" rx="1" fill="white" opacity="0.3"/>
              <rect x="12" y="7" width="9" height="2" rx="1" fill="white" opacity="0.7"/>
              <rect x="12" y="11" width="6" height="2" rx="1" fill="white" opacity="0.4"/>
              <rect x="12" y="15" width="8" height="2" rx="1" fill="white" opacity="0.5"/>
              <rect x="12" y="19" width="4" height="2" rx="1" fill="white" opacity="0.3"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>PipelineAI</span>
            <span style={{ background: "#172554", color: "#60a5fa", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>BETA</span>
          </div>
 
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, boxShadow: `0 0 8px ${statusColor}55` }} />
              <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{statusLabel}</span>
            </div>
            <span style={{ fontSize: 12, color: "#1e293b", fontFamily: "'DM Mono', monospace" }}>
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </span>
            <a href="https://github.com/MubarakAliPiracha/pipeline-ai" target="_blank" rel="noreferrer"
              className="nav-link"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "#475569", padding: "5px 12px", border: "1px solid #1e293b", borderRadius: 8, textDecoration: "none", transition: "all 0.15s" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                <path d="M6.5.5C3.19.5.5 3.19.5 6.5c0 2.65 1.72 4.9 4.1 5.7.3.06.41-.13.41-.29v-1c-1.67.36-2.02-.8-2.02-.8-.27-.69-.67-.87-.67-.87-.55-.37.04-.36.04-.36.6.04.92.62.92.62.54.92 1.41.65 1.76.5.05-.39.21-.65.38-.8-1.34-.15-2.75-.67-2.75-2.97 0-.65.23-1.19.61-1.61-.06-.15-.27-.76.06-1.59 0 0 .5-.16 1.65.62.48-.13.99-.2 1.5-.2.51 0 1.02.07 1.5.2 1.15-.78 1.65-.62 1.65-.62.33.83.12 1.44.06 1.59.38.42.61.96.61 1.61 0 2.31-1.41 2.82-2.75 2.97.22.19.41.55.41 1.11v1.64c0 .17.11.36.41.3C10.78 11.4 12.5 9.15 12.5 6.5 12.5 3.19 9.81.5 6.5.5z"/>
              </svg>
              GitHub
            </a>
          </div>
        </header>
 
        <div style={{ display: "flex", flex: 1 }}>
 
          {/* ── SIDEBAR ── */}
          <aside style={{ width: 214, borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", flexShrink: 0, background: "#0c0f1a" }}>
            <nav style={{ padding: "20px 0", flex: 1 }}>
              <div style={{ padding: "0 14px 8px", fontSize: 10, fontWeight: 600, color: "#1e293b", letterSpacing: "0.14em", textTransform: "uppercase" }}>Pipeline</div>
 
              <div className="sidebar-item" style={{ padding: "9px 14px", cursor: "pointer", borderLeft: "2px solid #3b82f6", background: "#1a1f2e", transition: "all 0.15s" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>Generator</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>Build cleaning scripts</div>
              </div>
 
              <div className="sidebar-item" style={{ padding: "9px 14px", cursor: "pointer", borderLeft: "2px solid transparent", transition: "all 0.15s" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>History</div>
                <div style={{ fontSize: 11, color: "#1e293b", marginTop: 1 }}>Past runs</div>
              </div>
 
              <div style={{ padding: "20px 14px 8px", fontSize: 10, fontWeight: 600, color: "#1e293b", letterSpacing: "0.14em", textTransform: "uppercase" }}>Tools</div>
 
              {["Schema Detect", "Data Preview", "Type Validator"].map(label => (
                <div key={label} className="sidebar-item" style={{ padding: "8px 14px", cursor: "pointer", borderLeft: "2px solid transparent", transition: "all 0.15s" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{label}</div>
                </div>
              ))}
            </nav>
 
            <div style={{ padding: "14px", borderTop: "1px solid #1e293b" }}>
              <div style={{ background: "#1a1f2e", borderRadius: 10, padding: "14px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Runtime</div>
                {[["Engine", "Claude AI"], ["Model", "Sonnet 4"], ["Status", "Active"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#334155" }}>{k}</span>
                    <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
 
          {/* ── CONTENT ── */}
          <main style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: 20, overflow: "auto", minWidth: 0 }}>
 
            {/* Page header */}
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 6 }}>
                Data Pipeline Generator
              </h1>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                Paste messy CSV data. Claude AI detects every issue and generates a production-ready Python cleaning script.
              </p>
            </div>
 
            {/* ── STATS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Input Rows", value: rowCount || "—", blue: rowCount > 0 },
                { label: "Columns", value: colCount || "—", blue: colCount > 0 },
                { label: "Issues Found", value: issues.length || "—", amber: issues.length > 0 },
                { label: "Pipeline State", value: statusLabel, custom: statusColor },
              ].map(({ label, value, blue, amber, custom }) => (
                <div key={label} className="stat-card" style={{ background: "#131929", border: "1px solid #1e293b", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{label}</div>
                  <div style={{ fontSize: typeof value === "string" && value.length > 5 ? 14 : 24, fontWeight: 700, letterSpacing: "-0.4px", color: custom || (amber ? "#f59e0b" : blue ? "#3b82f6" : "#1e293b") }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
 
            {/* ── PANELS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1, minHeight: 480 }}>
 
              {/* INPUT PANEL */}
              <div className="panel" style={{ background: "#131929", border: "1px solid #1e293b", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "13px 18px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em" }}>CSV Input</span>
                  </div>
                  <button onClick={() => setCsvData(EXAMPLE_CSV)} style={{ fontSize: 12, fontWeight: 500, color: "#3b82f6", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)", padding: "5px 12px", borderRadius: 6, cursor: "pointer" }}>
                    Load example
                  </button>
                </div>
 
                <textarea
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "16px 18px", fontSize: 12, lineHeight: 1.85, color: "#64748b", resize: "none", width: "100%", minHeight: 280 }}
                  placeholder={"Paste your CSV here...\n\nid,name,age,status\n1,John,,active\n2,,25,ACTIVE\n1,John,,active"}
                  value={csvData}
                  onChange={e => setCsvData(e.target.value)}
                />
 
                {error && (
                  <div style={{ margin: "0 18px 14px", padding: "10px 14px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8, fontSize: 12, color: "#f87171", fontFamily: "'DM Mono', monospace" }}>
                    {error}
                  </div>
                )}
 
                <div style={{ padding: "10px 18px", borderTop: "1px solid #1e293b" }}>
                  <span style={{ fontSize: 11, color: "#1e293b", fontFamily: "'DM Mono', monospace" }}>
                    {csvData ? `${rowCount} rows · ${colCount} columns · ${csvData.length} chars` : "Awaiting input"}
                  </span>
                </div>
 
                <div style={{ padding: "12px 18px 18px" }}>
                  <button onClick={handleGenerate} disabled={loading || !csvData.trim()} style={{
                    width: "100%", padding: "13px",
                    background: loading || !csvData.trim() ? "#1a1f2e" : "#2563eb",
                    border: `1px solid ${loading || !csvData.trim() ? "#1e293b" : "transparent"}`,
                    borderRadius: 9, color: loading || !csvData.trim() ? "#334155" : "white",
                    fontSize: 14, fontWeight: 600, cursor: loading || !csvData.trim() ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    letterSpacing: "-0.1px",
                  }}>
                    {loading ? (
                      <>
                        <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "#60a5fa", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Analyzing data...
                      </>
                    ) : "Generate Pipeline"}
                  </button>
                </div>
              </div>
 
              {/* OUTPUT PANEL */}
              <div className="panel" style={{ background: "#131929", border: "1px solid #1e293b", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
                  {[
                    { id: "script", label: "Script" },
                    { id: "issues", label: "Issues", count: issues.length },
                    { id: "explanation", label: "Explanation" },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                      padding: "12px 18px", fontSize: 12, fontWeight: 600,
                      color: activeTab === tab.id ? "#f1f5f9" : "#334155",
                      background: "none", border: "none",
                      borderBottom: `2px solid ${activeTab === tab.id ? "#3b82f6" : "transparent"}`,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      marginBottom: "-1px",
                    }}>
                      {tab.label}
                      {tab.count > 0 && (
                        <span style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", padding: "0 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
                      <span style={{ fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace" }}>{statusLabel}</span>
                    </div>
                  </div>
                </div>
 
                <div style={{ flex: 1, padding: "16px 18px", overflow: "auto", minHeight: 280 }}>
                  {!script ? (
                    <div style={{ height: "100%", minHeight: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                      <svg width="52" height="44" viewBox="0 0 52 44" fill="none" opacity="0.12">
                        <rect x="0" y="2" width="18" height="5" rx="2.5" fill="#3b82f6"/>
                        <rect x="0" y="11" width="12" height="5" rx="2.5" fill="#3b82f6"/>
                        <rect x="0" y="20" width="15" height="5" rx="2.5" fill="#3b82f6"/>
                        <rect x="0" y="29" width="10" height="5" rx="2.5" fill="#3b82f6"/>
                        <rect x="0" y="38" width="13" height="5" rx="2.5" fill="#3b82f6"/>
                        <path d="M28 22h6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="40" cy="22" r="10" stroke="#3b82f6" strokeWidth="2"/>
                        <path d="M37 22h6M40 19v6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>No output yet</div>
                        <div style={{ fontSize: 12, color: "#0f1729" }}>Paste CSV data and generate your pipeline</div>
                      </div>
                    </div>
                  ) : activeTab === "script" ? (
                    <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 1.85, color: "#4ade80", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{script}</pre>
                  ) : activeTab === "issues" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {issues.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 10 }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity="0.25">
                            <circle cx="20" cy="20" r="18" stroke="#10b981" strokeWidth="2"/>
                            <path d="M12 20l5.5 5.5L28 14" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <div style={{ fontSize: 13, color: "#1e293b" }}>No issues detected</div>
                        </div>
                      ) : issues.map((iss, i) => (
                        <div key={i} style={{ padding: "10px 13px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", marginTop: 7, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono', monospace", lineHeight: 1.7 }}>{iss}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 16, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 10, fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
                      {explanation || "No explanation available."}
                    </div>
                  )}
                </div>
 
                {script && (
                  <div style={{ padding: "12px 18px", borderTop: "1px solid #1e293b", display: "flex", gap: 8 }}>
                    <button onClick={handleCopy} className="action-btn" style={{ flex: 1, padding: "9px", fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: "pointer", border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.08)", color: "#3b82f6", transition: "all 0.15s" }}>
                      {copied ? "Copied!" : "Copy Script"}
                    </button>
                    <button onClick={handleDownload} className="secondary-btn" style={{ flex: 1, padding: "9px", fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: "pointer", border: "1px solid #1e293b", background: "transparent", color: "#475569", transition: "all 0.15s" }}>
                      Download .py
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
 
        {/* ── STATUS BAR ── */}
        <footer style={{ height: 28, background: "#0a0c14", borderTop: "1px solid #1e293b", display: "flex", alignItems: "center", padding: "0 24px", gap: 20 }}>
          {[
            { dot: statusColor, label: statusLabel },
            { label: "claude-sonnet-4" },
            { label: "PipelineAI v1.0" },
          ].map(({ dot, label }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: dot ? "#475569" : "#1e293b", fontFamily: "'DM Mono', monospace" }}>
              {dot && <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot }} />}
              {label}
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 10, color: "#1a2540", fontFamily: "'DM Mono', monospace" }}>
            Mubarak Ali Piracha · UWaterloo
          </div>
        </footer>
 
      </div>
    </>
  );
}