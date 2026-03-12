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
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 3500);
    return () => clearTimeout(t);
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

  const statusColor = loading ? "#2563eb" : script ? "#10b981" : "#334155";
  const statusLabel = loading ? "Processing" : script ? "Ready" : "Standby";

  const TABS = [
    { id: "script",      label: "Script" },
    { id: "issues",      label: "Issues", badge: issues.length > 0 ? issues.length : null },
    { id: "explanation", label: "Explanation" },
  ];

  const STATS = [
    { label: "Input Rows",    value: rowCount || "—",  lit: rowCount > 0 },
    { label: "Columns",       value: colCount || "—",  lit: colCount > 0 },
    { label: "Issues Found",  value: issues.length > 0 ? issues.length : "—", amber: issues.length > 0 },
    { label: "Pipeline State", value: statusLabel, custom: statusColor },
  ];

  const NAV = [
    { label: "Generator",     active: true },
    { label: "History",       active: false },
    { label: "Schema Detect", active: false },
    { label: "Data Preview",  active: false },
    { label: "Type Validator",active: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeInLine {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bootFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes appFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        html, body {
          height: 100%;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        textarea { font-family: 'DM Mono', monospace !important; }

        /* Boot lines */
        .boot-line { opacity: 0; animation: fadeInLine 0.4s ease both; }
        .boot-line-1 { animation-delay: 0s; }
        .boot-line-2 { animation-delay: 0.8s; }
        .boot-line-3 { animation-delay: 1.6s; }
        .boot-line-4 { animation-delay: 2.4s; }

        /* Nav items */
        .nav-item { transition: background 0.12s, color 0.12s; }
        .nav-item:hover { background: #131929 !important; color: #cbd5e1 !important; }

        /* Tab buttons */
        .tab-btn { transition: color 0.12s, border-color 0.12s; }
        .tab-btn:hover { color: #cbd5e1 !important; }

        /* Panel hover */
        .panel { transition: border-color 0.12s; }
        .panel:focus-within { border-color: #334155 !important; }

        /* Stat card */
        .stat-card { transition: border-color 0.12s; }
        .stat-card:hover { border-color: #334155 !important; }

        /* Ghost button */
        .btn-ghost { transition: background 0.12s, color 0.12s, border-color 0.12s; }
        .btn-ghost:hover { background: #1e293b !important; color: #cbd5e1 !important; border-color: #334155 !important; }

        /* Primary button */
        .btn-primary { transition: background 0.12s; }
        .btn-primary:not(:disabled):hover { background: #1d4ed8 !important; }

        /* Action button */
        .btn-action { transition: background 0.12s, color 0.12s, border-color 0.12s; }
        .btn-action:hover { background: rgba(37,99,235,0.1) !important; color: #60a5fa !important; border-color: rgba(37,99,235,0.3) !important; }

        /* Header link */
        .header-link { transition: background 0.12s, color 0.12s, border-color 0.12s; }
        .header-link:hover { background: #1e293b !important; color: #f1f5f9 !important; border-color: #334155 !important; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}</style>

      {/* ── BOOT SCREEN ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: "#080808",
          transition: "opacity 0.6s ease",
          opacity: bootDone ? 0 : 1,
          pointerEvents: bootDone ? "none" : "all",
        }}
      >
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, lineHeight: 2.2 }}>
          <div className="boot-line boot-line-1" style={{ color: "#6b7280" }}>$ initializing pipeline engine...</div>
          <div className="boot-line boot-line-2" style={{ color: "#6b7280" }}>$ loading column type detector...</div>
          <div className="boot-line boot-line-3" style={{ color: "#6b7280" }}>$ connecting to claude-sonnet-4...</div>
          <div className="boot-line boot-line-4" style={{ color: "#4ade80" }}>$ ready.</div>
        </div>
      </div>

      {/* ── MAIN APP ── */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#0f1117",
          color: "#f1f5f9",
          transition: "opacity 0.6s ease",
          opacity: bootDone ? 1 : 0,
        }}
      >
        {/* HEADER */}
        <header style={{
          height: 52,
          borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
          background: "#0f1117",
          position: "sticky", top: 0, zIndex: 40,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: "#2563eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="4" height="3" rx="0.8" fill="white" opacity="0.9" />
                <rect x="1" y="6" width="4" height="3" rx="0.8" fill="white" opacity="0.5" />
                <rect x="7" y="1" width="6" height="1.5" rx="0.6" fill="white" opacity="0.8" />
                <rect x="7" y="4" width="4" height="1.5" rx="0.6" fill="white" opacity="0.5" />
                <rect x="7" y="7" width="5" height="1.5" rx="0.6" fill="white" opacity="0.6" />
                <rect x="7" y="10" width="3" height="1.5" rx="0.6" fill="white" opacity="0.35" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px", color: "#f1f5f9" }}>
              PipelineAI
            </span>
          </div>
          <a
            href="https://github.com/MubarakAliPiracha/pipeline-ai"
            target="_blank" rel="noreferrer"
            className="header-link"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 500, color: "#475569",
              textDecoration: "none",
              padding: "5px 12px",
              border: "1px solid #1e293b",
              borderRadius: 6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.5.5C3.19.5.5 3.19.5 6.5c0 2.65 1.72 4.9 4.1 5.7.3.06.41-.13.41-.29v-1c-1.67.36-2.02-.8-2.02-.8-.27-.69-.67-.87-.67-.87-.55-.37.04-.36.04-.36.6.04.92.62.92.62.54.92 1.41.65 1.76.5.05-.39.21-.65.38-.8-1.34-.15-2.75-.67-2.75-2.97 0-.65.23-1.19.61-1.61-.06-.15-.27-.76.06-1.59 0 0 .5-.16 1.65.62.48-.13.99-.2 1.5-.2.51 0 1.02.07 1.5.2 1.15-.78 1.65-.62 1.65-.62.33.83.12 1.44.06 1.59.38.42.61.96.61 1.61 0 2.31-1.41 2.82-2.75 2.97.22.19.41.55.41 1.11v1.64c0 .17.11.36.41.3C11.28 11.4 12.5 9.15 12.5 6.5 12.5 3.19 9.81.5 6.5.5z" />
            </svg>
            GitHub
          </a>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* SIDEBAR */}
          <aside style={{
            width: 210,
            borderRight: "1px solid #1e293b",
            background: "#0c0f1a",
            display: "flex", flexDirection: "column",
            flexShrink: 0,
            overflow: "auto",
          }}>
            <nav style={{ flex: 1, padding: "14px 0" }}>
              {[
                { section: "Pipeline", items: ["Generator", "History"] },
                { section: "Tools",    items: ["Schema Detect", "Data Preview", "Type Validator"] },
              ].map(({ section, items }) => (
                <div key={section} style={{ marginBottom: 6 }}>
                  <div style={{
                    padding: "6px 16px 4px",
                    fontSize: 9, fontWeight: 600, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "#1e293b",
                  }}>
                    {section}
                  </div>
                  {items.map((item) => {
                    const active = item === "Generator";
                    return (
                      <div
                        key={item}
                        className="nav-item"
                        style={{
                          padding: "8px 16px",
                          borderLeft: `2px solid ${active ? "#2563eb" : "transparent"}`,
                          background: active ? "#131929" : "transparent",
                          color: active ? "#f1f5f9" : "#334155",
                          fontSize: 13,
                          fontWeight: active ? 600 : 400,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        {item}
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Sidebar system info */}
            <div style={{ padding: 12, borderTop: "1px solid #1e293b" }}>
              <div style={{
                background: "#131929",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: "12px 14px",
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 600, color: "#1e293b",
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10,
                }}>
                  System
                </div>
                {[["Engine", "Claude AI"], ["Model", "Sonnet 4"], ["Status", "Active"]].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: 7,
                  }}>
                    <span style={{ fontSize: 11, color: "#334155" }}>{k}</span>
                    <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main style={{
            flex: 1, padding: 28,
            display: "flex", flexDirection: "column", gap: 20,
            overflow: "auto", minWidth: 0,
          }}>

            {/* PAGE TITLE */}
            <div>
              <h1 style={{
                fontSize: 20, fontWeight: 700,
                letterSpacing: "-0.4px", marginBottom: 6, color: "#f1f5f9",
              }}>
                Data Pipeline Generator
              </h1>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                Paste messy CSV data. Claude AI detects every issue and generates a production-ready Python cleaning script.
              </p>
            </div>

            {/* STATS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {STATS.map(({ label, value, lit, amber, custom }) => (
                <div key={label} className="stat-card" style={{
                  background: "#131929",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  padding: "14px 18px",
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 600, color: "#334155",
                    textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: typeof value === "string" && value.length > 7 ? 14 : 22,
                    fontWeight: 700, letterSpacing: "-0.5px",
                    color: custom || (amber ? "#f59e0b" : lit ? "#f1f5f9" : "#1e293b"),
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* PANELS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1, minHeight: 480 }}>

              {/* INPUT PANEL */}
              <div className="panel" style={{
                background: "#131929",
                border: "1px solid #1e293b",
                borderRadius: 10,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid #1e293b",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>
                      CSV Input
                    </span>
                  </div>
                  <button
                    onClick={() => setCsvData(EXAMPLE_CSV)}
                    className="btn-ghost"
                    style={{
                      fontSize: 12, fontWeight: 500, color: "#2563eb",
                      background: "rgba(37,99,235,0.08)",
                      border: "1px solid rgba(37,99,235,0.2)",
                      padding: "5px 12px", borderRadius: 6,
                    }}
                  >
                    Load example
                  </button>
                </div>

                <textarea
                  style={{
                    flex: 1, background: "transparent",
                    border: "none", outline: "none",
                    padding: "16px 18px",
                    fontSize: 12, lineHeight: 1.8, color: "#64748b",
                    resize: "none", width: "100%", minHeight: 260,
                    caretColor: "#f1f5f9",
                  }}
                  placeholder={"Paste your CSV here...\n\nid,name,age,status\n1,John,,active\n2,,25,ACTIVE\n1,John,,active"}
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                />

                {error && (
                  <div style={{
                    margin: "0 18px 14px",
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.18)",
                    borderRadius: 6,
                    fontSize: 12, color: "#f87171",
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: 1.6, flexShrink: 0,
                  }}>
                    {error}
                  </div>
                )}

                <div style={{
                  padding: "8px 18px",
                  borderTop: "1px solid #1e293b",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 11, color: "#1e293b", fontFamily: "'DM Mono', monospace" }}>
                    {csvData.trim()
                      ? `${rowCount} rows · ${colCount} cols · ${csvData.length} chars`
                      : "Awaiting input"}
                  </span>
                </div>

                <div style={{ padding: "10px 18px 18px", flexShrink: 0 }}>
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !csvData.trim()}
                    className="btn-primary"
                    style={{
                      width: "100%", padding: "11px",
                      background: loading || !csvData.trim() ? "#1a1f2e" : "#2563eb",
                      border: `1px solid ${loading || !csvData.trim() ? "#1e293b" : "transparent"}`,
                      borderRadius: 7,
                      color: loading || !csvData.trim() ? "#334155" : "white",
                      fontSize: 13, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{
                          width: 13, height: 13,
                          border: "2px solid rgba(255,255,255,0.15)",
                          borderTopColor: "#93c5fd",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                          display: "inline-block", flexShrink: 0,
                        }} />
                        Analyzing data...
                      </>
                    ) : "Generate Pipeline"}
                  </button>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="panel" style={{
                background: "#131929",
                border: "1px solid #1e293b",
                borderRadius: 10,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  borderBottom: "1px solid #1e293b",
                  flexShrink: 0,
                }}>
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="tab-btn"
                      style={{
                        padding: "12px 16px",
                        fontSize: 12, fontWeight: 600,
                        color: activeTab === tab.id ? "#f1f5f9" : "#334155",
                        background: "none", border: "none",
                        borderBottom: `2px solid ${activeTab === tab.id ? "#2563eb" : "transparent"}`,
                        display: "flex", alignItems: "center", gap: 6,
                        marginBottom: "-1px",
                      }}
                    >
                      {tab.label}
                      {tab.badge != null && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: "#f59e0b",
                          background: "rgba(245,158,11,0.12)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          padding: "1px 6px", borderRadius: 4,
                        }}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
                    <span style={{ fontSize: 10, color: "#334155", fontFamily: "'DM Mono', monospace" }}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1, padding: "16px 18px", overflow: "auto", minHeight: 260 }}>
                  {!script ? (
                    <div style={{
                      height: "100%", minHeight: 220,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 12,
                    }}>
                      <svg width="44" height="38" viewBox="0 0 44 38" fill="none" opacity="0.1">
                        <rect x="0" y="2" width="15" height="4" rx="2" fill="#3b82f6" />
                        <rect x="0" y="10" width="10" height="4" rx="2" fill="#3b82f6" />
                        <rect x="0" y="18" width="13" height="4" rx="2" fill="#3b82f6" />
                        <rect x="0" y="26" width="8"  height="4" rx="2" fill="#3b82f6" />
                        <path d="M24 19h5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="34" cy="19" r="8" stroke="#3b82f6" strokeWidth="2" />
                        <path d="M31 19h6M34 16v6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                          No output yet
                        </div>
                        <div style={{ fontSize: 12, color: "#0f172a" }}>
                          Paste CSV and generate your pipeline
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "script" ? (
                    <pre style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12, lineHeight: 1.8,
                      color: "#4ade80",
                      whiteSpace: "pre-wrap", wordBreak: "break-word",
                      margin: 0,
                    }}>
                      {script}
                    </pre>
                  ) : activeTab === "issues" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {issues.length === 0 ? (
                        <div style={{
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          minHeight: 200, gap: 10,
                        }}>
                          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" opacity="0.2">
                            <circle cx="17" cy="17" r="15" stroke="#10b981" strokeWidth="2" />
                            <path d="M10 17l5 5L24 11" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span style={{ fontSize: 12, color: "#1e293b" }}>No issues detected</span>
                        </div>
                      ) : issues.map((iss, i) => (
                        <div key={i} style={{
                          padding: "10px 14px",
                          background: "rgba(245,158,11,0.05)",
                          border: "1px solid rgba(245,158,11,0.12)",
                          borderRadius: 6,
                          display: "flex", alignItems: "flex-start", gap: 10,
                        }}>
                          <div style={{
                            width: 4, height: 4, borderRadius: "50%",
                            background: "#f59e0b", marginTop: 8, flexShrink: 0,
                          }} />
                          <span style={{
                            fontSize: 12, color: "#64748b",
                            fontFamily: "'DM Mono', monospace", lineHeight: 1.7,
                          }}>
                            {iss}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: "14px 16px",
                      background: "rgba(37,99,235,0.04)",
                      border: "1px solid rgba(37,99,235,0.1)",
                      borderRadius: 8,
                      fontSize: 13, color: "#475569", lineHeight: 1.8,
                    }}>
                      {explanation || "No explanation available."}
                    </div>
                  )}
                </div>

                {script && (
                  <div style={{
                    padding: "12px 18px",
                    borderTop: "1px solid #1e293b",
                    display: "flex", gap: 8, flexShrink: 0,
                  }}>
                    <button
                      onClick={handleCopy}
                      className="btn-action"
                      style={{
                        flex: 1, padding: "8px 12px",
                        fontSize: 12, fontWeight: 600,
                        borderRadius: 6,
                        border: "1px solid rgba(37,99,235,0.25)",
                        background: "rgba(37,99,235,0.08)",
                        color: "#3b82f6",
                      }}
                    >
                      {copied ? "Copied" : "Copy Script"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn-ghost"
                      style={{
                        flex: 1, padding: "8px 12px",
                        fontSize: 12, fontWeight: 600,
                        borderRadius: 6,
                        border: "1px solid #1e293b",
                        background: "transparent",
                        color: "#475569",
                      }}
                    >
                      Download .py
                    </button>
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>

        {/* STATUS BAR */}
        <footer style={{
          height: 28,
          background: "#090c14",
          borderTop: "1px solid #1e293b",
          display: "flex", alignItems: "center",
          padding: "0 20px", gap: 20,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
            <span style={{ fontSize: 10, color: "#334155", fontFamily: "'DM Mono', monospace" }}>
              {statusLabel}
            </span>
          </div>
          <span style={{ fontSize: 10, color: "#1e293b", fontFamily: "'DM Mono', monospace" }}>
            claude-haiku-4-5
          </span>
          <span style={{ fontSize: 10, color: "#1e293b", fontFamily: "'DM Mono', monospace" }}>
            PipelineAI v1.0
          </span>
          <div style={{ marginLeft: "auto", fontSize: 10, color: "#1a2540", fontFamily: "'DM Mono', monospace" }}>
            Mubarak Ali Piracha · UWaterloo
          </div>
        </footer>

      </div>
    </>
  );
}
