import { useState } from "react";

const EXAMPLE_CSV = `project_id,project_name,budget,spent,start_date,completion_pct,manager,status
1,Tower Block A,500000,487000,2024-01-15,94,John Smith,active
2,Bridge Repair,,320000,2024-02-01,67,,delayed
3,Highway Ext,750000,125000,2024/03/10,abc,Alice Wong,active
4,Tower Block A,500000,487000,2024-01-15,94,John Smith,active
5,Mall Renovation,300000,315000,2024-03-01,102,Bob,ACTIVE
6,School Build,450000,200000,,45,Charlie Brown,
7,,600000,0,2024-04-01,0,Diana Prince,planned`;

const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: ["Generator", "History"],
  },
  {
    label: "Tools",
    items: ["Schema Detect", "Data Preview", "Type Validator"],
  },
];

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

  const statusColor = loading ? "#2563eb" : script ? "#10b981" : "#334155";
  const statusLabel = loading ? "Processing" : script ? "Ready" : "Standby";

  const TABS = [
    { id: "script", label: "Script" },
    { id: "issues", label: "Issues", badge: issues.length > 0 ? issues.length : null },
    { id: "explanation", label: "Explanation" },
  ];

  const STATS = [
    { label: "Input Rows", value: rowCount || "—", accent: rowCount > 0 ? "#f1f5f9" : null },
    { label: "Columns", value: colCount || "—", accent: colCount > 0 ? "#f1f5f9" : null },
    { label: "Issues Found", value: issues.length > 0 ? issues.length : "—", accent: issues.length > 0 ? "#f59e0b" : null },
    { label: "Pipeline State", value: statusLabel, accent: statusColor },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #0f1117; color: #f1f5f9; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        textarea { font-family: 'DM Mono', monospace !important; }
        .nav-item { transition: background 0.12s, color 0.12s, border-color 0.12s; }
        .nav-item:hover { background: #131929 !important; color: #cbd5e1 !important; }
        .nav-item.active { background: #131929 !important; color: #f1f5f9 !important; border-left-color: #2563eb !important; }
        .tab-btn { transition: color 0.12s, border-color 0.12s; }
        .tab-btn:hover { color: #cbd5e1 !important; }
        .btn-primary { transition: background 0.12s, opacity 0.12s; }
        .btn-primary:not(:disabled):hover { background: #1d4ed8 !important; }
        .btn-ghost { transition: background 0.12s, color 0.12s, border-color 0.12s; }
        .btn-ghost:hover { background: #131929 !important; color: #cbd5e1 !important; border-color: #334155 !important; }
        .stat-card { transition: border-color 0.12s; }
        .stat-card:hover { border-color: #334155 !important; }
        .panel { transition: border-color 0.12s; }
        .panel:focus-within { border-color: #334155 !important; }
        .icon-btn { transition: background 0.12s, color 0.12s, border-color 0.12s; }
        .icon-btn:hover { background: rgba(37,99,235,0.1) !important; color: #60a5fa !important; border-color: rgba(37,99,235,0.3) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>

        {/* HEADER */}
        <header style={{
          height: 52,
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          background: "#0f1117",
          position: "sticky",
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "#1d4ed8",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="4" height="3" rx="1" fill="white" opacity="0.9" />
                <rect x="2" y="8" width="4" height="3" rx="1" fill="white" opacity="0.5" />
                <rect x="8" y="3" width="6" height="1.5" rx="0.75" fill="white" opacity="0.7" />
                <rect x="8" y="6" width="4" height="1.5" rx="0.75" fill="white" opacity="0.45" />
                <rect x="8" y="9" width="5" height="1.5" rx="0.75" fill="white" opacity="0.55" />
                <rect x="8" y="12" width="3" height="1.5" rx="0.75" fill="white" opacity="0.3" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px", color: "#f1f5f9" }}>
              PipelineAI
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#60a5fa",
              background: "rgba(37,99,235,0.15)",
              border: "1px solid rgba(37,99,235,0.25)",
              padding: "2px 7px", borderRadius: 20, letterSpacing: "0.04em",
            }}>
              BETA
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 4 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 6px ${statusColor}66`,
              }} />
              <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace" }}>
                {statusLabel}
              </span>
            </div>
            <a
              href="https://github.com/MubarakAliPiracha/pipeline-ai"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 500, color: "#64748b",
                textDecoration: "none",
                padding: "5px 12px",
                border: "1px solid #1e293b",
                borderRadius: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M7 0C3.13 0 0 3.13 0 7c0 3.09 2.01 5.72 4.79 6.65.35.06.48-.15.48-.34v-1.19c-1.95.42-2.36-.94-2.36-.94-.32-.81-.78-1.02-.78-1.02-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.93-1.55-.18-3.18-.77-3.18-3.44 0-.76.27-1.38.72-1.87-.07-.18-.31-.88.07-1.84 0 0 .58-.19 1.91.71A6.63 6.63 0 017 3.44c.59 0 1.18.08 1.74.23 1.32-.9 1.9-.71 1.9-.71.38.96.14 1.66.07 1.84.45.49.72 1.11.72 1.87 0 2.68-1.63 3.26-3.19 3.43.25.22.47.64.47 1.29v1.91c0 .19.13.41.48.34A7.003 7.003 0 0014 7c0-3.87-3.13-7-7-7z" />
              </svg>
              GitHub
            </a>
          </div>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* SIDEBAR */}
          <aside style={{
            width: 210,
            borderRight: "1px solid #1e293b",
            background: "#0c0f1a",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflow: "auto",
          }}>
            <nav style={{ flex: 1, padding: "12px 0" }}>
              {NAV_SECTIONS.map((section) => (
                <div key={section.label} style={{ marginBottom: 4 }}>
                  <div style={{
                    padding: "8px 16px 4px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#1e293b",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}>
                    {section.label}
                  </div>
                  {section.items.map((item) => {
                    const isActive = item === "Generator";
                    return (
                      <div
                        key={item}
                        className={`nav-item${isActive ? " active" : ""}`}
                        style={{
                          padding: "8px 16px",
                          borderLeft: `2px solid ${isActive ? "#2563eb" : "transparent"}`,
                          color: isActive ? "#f1f5f9" : "#334155",
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
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

            <div style={{ padding: 12, borderTop: "1px solid #1e293b" }}>
              <div style={{
                background: "#131929",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: "12px 14px",
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: "#1e293b",
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10,
                }}>
                  Runtime
                </div>
                {[["Model", "Haiku 4.5"], ["Provider", "Anthropic"], ["Version", "v1.0"]].map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7,
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
            flex: 1,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            overflow: "auto",
            minWidth: 0,
          }}>

            {/* PAGE TITLE */}
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 6, color: "#f1f5f9" }}>
                Data Pipeline Generator
              </h1>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, maxWidth: 600 }}>
                Paste messy CSV data. Claude AI detects every issue and generates a production-ready Python cleaning script.
              </p>
            </div>

            {/* STATS ROW */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {STATS.map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="stat-card"
                  style={{
                    background: "#131929",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "14px 18px",
                  }}
                >
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: "#334155",
                    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: typeof value === "string" && value.length > 7 ? 14 : 22,
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    color: accent || "#1e293b",
                    fontFamily: typeof value === "number" ? "'DM Mono', monospace" : "inherit",
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* PANELS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1, minHeight: 460 }}>

              {/* INPUT PANEL */}
              <div className="panel" style={{
                background: "#131929",
                border: "1px solid #1e293b",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid #1e293b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "16px 18px",
                    fontSize: 12,
                    lineHeight: 1.8,
                    color: "#64748b",
                    resize: "none",
                    width: "100%",
                    minHeight: 240,
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
                    fontSize: 12,
                    color: "#f87171",
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: 1.6,
                    flexShrink: 0,
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ padding: "10px 18px", borderTop: "1px solid #1e293b", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "#1e293b", fontFamily: "'DM Mono', monospace" }}>
                    {csvData.trim() ? `${rowCount} rows · ${colCount} cols · ${csvData.length} chars` : "Awaiting input"}
                  </span>
                </div>

                <div style={{ padding: "10px 18px 18px", flexShrink: 0 }}>
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !csvData.trim()}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "11px",
                      background: loading || !csvData.trim() ? "#1a1f2e" : "#2563eb",
                      border: `1px solid ${loading || !csvData.trim() ? "#1e293b" : "transparent"}`,
                      borderRadius: 7,
                      color: loading || !csvData.trim() ? "#334155" : "white",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      letterSpacing: "-0.1px",
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
                          display: "inline-block",
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
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
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
                        fontSize: 12,
                        fontWeight: 600,
                        color: activeTab === tab.id ? "#f1f5f9" : "#334155",
                        background: "none",
                        border: "none",
                        borderBottom: `2px solid ${activeTab === tab.id ? "#2563eb" : "transparent"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: "-1px",
                      }}
                    >
                      {tab.label}
                      {tab.badge != null && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: "#f59e0b",
                          background: "rgba(245,158,11,0.12)",
                          padding: "1px 6px", borderRadius: 4,
                        }}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
                    <span style={{ fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace" }}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div style={{
                  flex: 1,
                  padding: "16px 18px",
                  overflow: "auto",
                  minHeight: 240,
                }}>
                  {!script ? (
                    <div style={{
                      height: "100%", minHeight: 220,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 12,
                    }}>
                      <svg width="48" height="40" viewBox="0 0 48 40" fill="none" opacity="0.1">
                        <rect x="0" y="2" width="16" height="4" rx="2" fill="#3b82f6" />
                        <rect x="0" y="10" width="11" height="4" rx="2" fill="#3b82f6" />
                        <rect x="0" y="18" width="14" height="4" rx="2" fill="#3b82f6" />
                        <rect x="0" y="26" width="9" height="4" rx="2" fill="#3b82f6" />
                        <rect x="0" y="34" width="12" height="4" rx="2" fill="#3b82f6" />
                        <path d="M26 20h5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="37" cy="20" r="9" stroke="#3b82f6" strokeWidth="2" />
                        <path d="M34 20h6M37 17v6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>No output yet</div>
                        <div style={{ fontSize: 12, color: "#0f1729" }}>Paste CSV and generate your pipeline</div>
                      </div>
                    </div>
                  ) : activeTab === "script" ? (
                    <pre style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      lineHeight: 1.8,
                      color: "#4ade80",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
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
                          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity="0.22">
                            <circle cx="18" cy="18" r="16" stroke="#10b981" strokeWidth="2" />
                            <path d="M11 18l5 5L25 12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span style={{ fontSize: 12, color: "#1e293b" }}>No issues detected</span>
                        </div>
                      ) : (
                        issues.map((iss, i) => (
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
                        ))
                      )}
                    </div>
                  ) : (
                    <div style={{
                      padding: "14px 16px",
                      background: "rgba(37,99,235,0.04)",
                      border: "1px solid rgba(37,99,235,0.1)",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#475569",
                      lineHeight: 1.8,
                    }}>
                      {explanation || "No explanation available."}
                    </div>
                  )}
                </div>

                {script && (
                  <div style={{
                    padding: "12px 18px",
                    borderTop: "1px solid #1e293b",
                    display: "flex",
                    gap: 8,
                    flexShrink: 0,
                  }}>
                    <button
                      onClick={handleCopy}
                      className="icon-btn"
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

        {/* FOOTER */}
        <footer style={{
          height: 28,
          background: "#090c14",
          borderTop: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 20,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: statusColor,
              boxShadow: `0 0 5px ${statusColor}55`,
            }} />
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
