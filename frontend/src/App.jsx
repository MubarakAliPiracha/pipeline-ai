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
  const [csvData,     setCsvData]     = useState("");
  const [script,      setScript]      = useState("");
  const [explanation, setExplanation] = useState("");
  const [issues,      setIssues]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [activeTab,   setActiveTab]   = useState("script");
  const [copied,      setCopied]      = useState(false);
  const [bootDone,    setBootDone]    = useState(false);

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

  const statusColor = loading ? "#3b82f6" : script ? "#34d399" : "#374151";
  const statusLabel = loading ? "Processing" : script ? "Ready" : "Standby";
  const canGenerate = !loading && !!csvData.trim();

  const TABS = [
    { id: "script",      label: "Script" },
    { id: "issues",      label: "Issues", badge: issues.length > 0 ? issues.length : null },
    { id: "explanation", label: "Explanation" },
  ];

  // Stat value colors
  const statColor = (type, hasData) => {
    if (type === "rows" || type === "cols") return hasData ? "#3b82f6" : "#1f2937";
    if (type === "issues") return hasData ? "#f59e0b" : "#1f2937";
    if (type === "state") return statusColor;
    return "#1f2937";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          height: 100%;
          background: #0a0a0f;
          color: #f1f5f9;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f1f2e; border-radius: 4px; }

        @keyframes fadeInLine {
          from { opacity: 0; transform: translateX(-5px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        button { font-family: 'Inter', sans-serif; cursor: pointer; }
        textarea { font-family: 'JetBrains Mono', monospace !important; }

        /* Boot */
        .boot-line { opacity: 0; animation: fadeInLine 0.4s ease both; }
        .l1 { animation-delay: 0s; }
        .l2 { animation-delay: 0.8s; }
        .l3 { animation-delay: 1.6s; }
        .l4 { animation-delay: 2.4s; }

        /* Nav */
        .nav-item { transition: color 0.15s, background 0.15s; }
        .nav-item:hover { color: #64748b !important; }

        /* Tabs */
        .tab-btn { transition: color 0.15s, border-color 0.15s; }
        .tab-btn:hover { color: #94a3b8 !important; }

        /* Panel */
        .panel {
          transition: border-color 0.15s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .panel:hover { border-color: #2a2a3e !important; }

        /* Stat card */
        .stat-card { transition: border-color 0.15s; }
        .stat-card:hover { border-color: #2a2a3e !important; }

        /* Generate button */
        .btn-generate { transition: background 0.15s, color 0.15s; }
        .btn-generate.active:hover { background: #1e40af !important; }

        /* Load example */
        .btn-load { transition: color 0.15s; }
        .btn-load:hover { color: #60a5fa !important; }

        /* GitHub link */
        .gh-link { transition: color 0.15s; }
        .gh-link:hover { color: #f1f5f9 !important; }

        /* Copy button */
        .btn-copy { transition: background 0.15s, color 0.15s, border-color 0.15s; }
        .btn-copy:hover {
          background: rgba(59,130,246,0.12) !important;
          border-color: rgba(59,130,246,0.4) !important;
          color: #60a5fa !important;
        }

        /* Download button */
        .btn-dl { transition: border-color 0.15s, color 0.15s; }
        .btn-dl:hover { border-color: #2a2a3e !important; color: #94a3b8 !important; }

        /* Textarea placeholder */
        textarea::placeholder { color: #1a1a28; }
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
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 13,
          lineHeight: 2.4,
        }}>
          <div className="boot-line l1" style={{ color: "#4b5563" }}>$ initializing pipeline engine...</div>
          <div className="boot-line l2" style={{ color: "#4b5563" }}>$ loading column type detector...</div>
          <div className="boot-line l3" style={{ color: "#4b5563" }}>$ connecting to claude-sonnet-4...</div>
          <div className="boot-line l4" style={{ color: "#4ade80" }}>$ ready.</div>
        </div>
      </div>

      {/* ── MAIN APP ── */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0f",
        transition: "opacity 0.6s ease",
        opacity: bootDone ? 1 : 0,
      }}>

        {/* HEADER */}
        <header style={{
          height: 52,
          borderBottom: "1px solid #1f1f2e",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
          background: "#0a0a0f",
          position: "sticky", top: 0, zIndex: 40,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Logo mark: dark blue square, 2×2 white dot grid */}
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: "#1e3a8a",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
              padding: 7,
              flexShrink: 0,
            }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.85)",
                }} />
              ))}
            </div>
            <span style={{
              fontWeight: 600, fontSize: 14,
              letterSpacing: "-0.2px", color: "#f1f5f9",
            }}>
              PipelineAI
            </span>
          </div>

          <a
            href="https://github.com/MubarakAliPiracha/pipeline-ai"
            target="_blank" rel="noreferrer"
            className="gh-link"
            style={{
              fontSize: 13, fontWeight: 500,
              color: "#4b5563",
              textDecoration: "none",
            }}
          >
            GitHub
          </a>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* SIDEBAR */}
          <aside style={{
            width: 200,
            borderRight: "1px solid #1f1f2e",
            background: "#0d0d14",
            display: "flex", flexDirection: "column",
            flexShrink: 0,
            overflow: "auto",
          }}>
            <nav style={{ flex: 1, padding: "16px 0 0" }}>
              {/* Section label */}
              <div style={{
                padding: "0 16px 8px",
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#1f2937",
              }}>
                Workspace
              </div>

              {["Generator", "History", "Schema Detect", "Data Preview"].map((item) => {
                const active = item === "Generator";
                return (
                  <div
                    key={item}
                    className="nav-item"
                    style={{
                      padding: "8px 16px",
                      borderLeft: `2px solid ${active ? "#3b82f6" : "transparent"}`,
                      background: active ? "#13131e" : "transparent",
                      color: active ? "#f1f5f9" : "#2d3748",
                      fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </nav>

            {/* Runtime info */}
            <div style={{ padding: "16px", borderTop: "1px solid #1f1f2e" }}>
              <div style={{
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#1f2937",
                marginBottom: 10,
              }}>
                Runtime
              </div>
              {[["Engine", "Claude AI"], ["Model", "Sonnet 4"]].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 7,
                }}>
                  <span style={{
                    fontSize: 11,
                    color: "#374151",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {k}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: "#4b5563",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main style={{
            flex: 1, padding: "28px 28px 28px",
            display: "flex", flexDirection: "column", gap: 20,
            overflow: "auto", minWidth: 0,
          }}>

            {/* PAGE TITLE */}
            <div>
              <h1 style={{
                fontSize: 20, fontWeight: 700,
                letterSpacing: "-0.4px",
                color: "#f1f5f9", marginBottom: 6,
              }}>
                Data Pipeline Generator
              </h1>
              <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>
                Paste messy CSV data. Claude AI detects every issue and generates a production-ready Python cleaning script.
              </p>
            </div>

            {/* STATS ROW */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[
                { label: "Input Rows",    val: rowCount || "—",  color: statColor("rows",   rowCount > 0) },
                { label: "Columns",       val: colCount || "—",  color: statColor("cols",   colCount > 0) },
                { label: "Issues Found",  val: issues.length > 0 ? issues.length : "—",
                                                                  color: statColor("issues", issues.length > 0) },
                { label: "Pipeline State",val: statusLabel,      color: statColor("state",  true) },
              ].map(({ label, val, color }) => (
                <div key={label} className="stat-card" style={{
                  background: "#16161f",
                  border: "1px solid #1f1f2e",
                  borderRadius: 8,
                  padding: "16px 18px",
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600,
                    color: "#2d3748",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    marginBottom: 8,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: typeof val === "string" && val.length > 7 ? 14 : 22,
                    fontWeight: 700, letterSpacing: "-0.4px",
                    color,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>

            {/* PANELS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1, minHeight: 480 }}>

              {/* ── LEFT: INPUT PANEL ── */}
              <div className="panel" style={{
                background: "#111118",
                border: "1px solid #1f1f2e",
                borderRadius: 12,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                {/* Panel header */}
                <div style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #1f1f2e",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: "#2d3748",
                      textTransform: "uppercase", letterSpacing: "0.12em",
                    }}>
                      CSV Input
                    </span>
                  </div>
                  <button
                    onClick={() => setCsvData(EXAMPLE_CSV)}
                    className="btn-load"
                    style={{
                      fontSize: 12, fontWeight: 500,
                      color: "#3b82f6",
                      background: "none", border: "none",
                      padding: "2px 0",
                    }}
                  >
                    Load example
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  style={{
                    flex: 1, background: "transparent",
                    border: "none", outline: "none",
                    padding: "16px",
                    fontSize: 12, lineHeight: 1.85,
                    color: "#4b5563",
                    resize: "none", width: "100%",
                    minHeight: 260,
                    caretColor: "#f1f5f9",
                  }}
                  placeholder={"Paste your CSV here...\n\nid,name,age,status\n1,John,,active\n2,,25,ACTIVE\n1,John,,active"}
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                />

                {/* Error */}
                {error && (
                  <div style={{
                    margin: "0 16px 12px",
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 6,
                    fontSize: 11, color: "#f87171",
                    fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1.6, flexShrink: 0,
                  }}>
                    {error}
                  </div>
                )}

                {/* Footer meta */}
                <div style={{
                  padding: "8px 16px",
                  borderTop: "1px solid #1f1f2e",
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontSize: 11, color: "#1f2937",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {csvData.trim()
                      ? `${rowCount} rows · ${colCount} cols · ${csvData.length} chars`
                      : "awaiting input"}
                  </span>
                </div>

                {/* Generate button */}
                <div style={{ padding: "10px 16px 18px", flexShrink: 0 }}>
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className={`btn-generate ${canGenerate ? "active" : ""}`}
                    style={{
                      width: "100%", padding: "13px",
                      background: canGenerate ? "#1d4ed8" : "#111118",
                      border: canGenerate ? "none" : "1px solid #1f1f2e",
                      borderRadius: 8,
                      color: canGenerate ? "#ffffff" : "#1f2937",
                      fontSize: 14, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      letterSpacing: "-0.1px",
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{
                          width: 14, height: 14,
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

              {/* ── RIGHT: OUTPUT PANEL ── */}
              <div className="panel" style={{
                background: "#111118",
                border: "1px solid #1f1f2e",
                borderRadius: 12,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                {/* Tab bar */}
                <div style={{
                  display: "flex", alignItems: "center",
                  borderBottom: "1px solid #1f1f2e",
                  flexShrink: 0,
                }}>
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="tab-btn"
                      style={{
                        padding: "11px 16px",
                        fontSize: 12, fontWeight: 500,
                        color: activeTab === tab.id ? "#f1f5f9" : "#2d3748",
                        background: "none", border: "none",
                        borderBottom: `2px solid ${activeTab === tab.id ? "#3b82f6" : "transparent"}`,
                        display: "flex", alignItems: "center", gap: 6,
                        marginBottom: "-1px",
                      }}
                    >
                      {tab.label}
                      {tab.badge != null && (
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: "#f59e0b",
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.18)",
                          padding: "1px 6px", borderRadius: 4,
                        }}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", padding: "0 14px", display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
                    <span style={{
                      fontSize: 10, color: "#374151",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Output content */}
                <div style={{ flex: 1, padding: "16px", overflow: "auto", minHeight: 260 }}>
                  {!script ? (
                    <div style={{
                      height: "100%", minHeight: 240,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 10,
                    }}>
                      <svg width="40" height="34" viewBox="0 0 40 34" fill="none" opacity="0.07">
                        <rect x="0" y="1"  width="14" height="4" rx="2" fill="#f1f5f9" />
                        <rect x="0" y="9"  width="9"  height="4" rx="2" fill="#f1f5f9" />
                        <rect x="0" y="17" width="12" height="4" rx="2" fill="#f1f5f9" />
                        <rect x="0" y="25" width="7"  height="4" rx="2" fill="#f1f5f9" />
                        <path d="M22 17h4" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="31" cy="17" r="7" stroke="#f1f5f9" strokeWidth="1.5" />
                        <path d="M28.5 17h5M31 14.5v5" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>
                        No output yet
                      </div>
                      <div style={{ fontSize: 12, color: "#111118" }}>
                        Paste CSV data and generate your pipeline
                      </div>
                    </div>
                  ) : activeTab === "script" ? (
                    <pre style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12, lineHeight: 1.85,
                      color: "#34d399",
                      whiteSpace: "pre-wrap", wordBreak: "break-word",
                      margin: 0,
                    }}>
                      {script}
                    </pre>
                  ) : activeTab === "issues" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {issues.length === 0 ? (
                        <div style={{
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          minHeight: 200, gap: 10,
                        }}>
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.18">
                            <circle cx="16" cy="16" r="14" stroke="#34d399" strokeWidth="1.5" />
                            <path d="M10 16l4.5 4.5L22 10" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span style={{ fontSize: 12, color: "#1f2937" }}>No issues detected</span>
                        </div>
                      ) : issues.map((iss, i) => (
                        <div key={i} style={{
                          padding: "9px 12px",
                          background: "rgba(245,158,11,0.04)",
                          border: "1px solid rgba(245,158,11,0.1)",
                          borderRadius: 6,
                          display: "flex", alignItems: "flex-start", gap: 9,
                        }}>
                          <div style={{
                            width: 4, height: 4, borderRadius: "50%",
                            background: "#f59e0b", marginTop: 7, flexShrink: 0,
                          }} />
                          <span style={{
                            fontSize: 11, color: "#4b5563",
                            fontFamily: "'JetBrains Mono', monospace",
                            lineHeight: 1.7,
                          }}>
                            {iss}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: "14px 16px",
                      background: "rgba(59,130,246,0.03)",
                      border: "1px solid rgba(59,130,246,0.08)",
                      borderRadius: 8,
                      fontSize: 13, color: "#4b5563", lineHeight: 1.8,
                    }}>
                      {explanation || "No explanation available."}
                    </div>
                  )}
                </div>

                {/* Action bar */}
                {script && (
                  <div style={{
                    padding: "10px 16px",
                    borderTop: "1px solid #1f1f2e",
                    display: "flex", gap: 8, flexShrink: 0,
                  }}>
                    <button
                      onClick={handleCopy}
                      className="btn-copy"
                      style={{
                        flex: 1, padding: "8px 12px",
                        fontSize: 12, fontWeight: 600,
                        borderRadius: 8,
                        border: "1px solid rgba(59,130,246,0.2)",
                        background: "rgba(59,130,246,0.07)",
                        color: "#3b82f6",
                      }}
                    >
                      {copied ? "Copied" : "Copy Script"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn-dl"
                      style={{
                        flex: 1, padding: "8px 12px",
                        fontSize: 12, fontWeight: 600,
                        borderRadius: 8,
                        border: "1px solid #1f1f2e",
                        background: "transparent",
                        color: "#4b5563",
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
          height: 26,
          background: "#08080d",
          borderTop: "1px solid #1f1f2e",
          display: "flex", alignItems: "center",
          padding: "0 24px", gap: 20,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
            <span style={{
              fontSize: 10, color: "#374151",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {statusLabel}
            </span>
          </div>
          <span style={{
            fontSize: 10, color: "#1f2937",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            claude-sonnet-4
          </span>
          <div style={{ marginLeft: "auto" }}>
            <span style={{
              fontSize: 10, color: "#111118",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              PipelineAI v1.0
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
