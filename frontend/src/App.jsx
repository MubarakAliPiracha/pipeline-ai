import { useState, useEffect } from "react";

const EXAMPLE_CSV = `project_id,project_name,budget,spent,start_date,completion_pct,manager,status
1,Tower Block A,500000,487000,2024-01-15,94,John Smith,active
2,Bridge Repair,,320000,2024-02-01,67,,delayed
3,Highway Ext,750000,125000,2024/03/10,abc,Alice Wong,active
4,Tower Block A,500000,487000,2024-01-15,94,John Smith,active
5,Mall Renovation,300000,315000,2024-03-01,102,Bob,ACTIVE
6,School Build,450000,200000,,45,Charlie Brown,
7,,600000,0,2024-04-01,0,Diana Prince,planned`;

const MONO = "'JetBrains Mono', 'Fira Code', monospace";

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

  const statusLabel = loading ? "running" : script ? "done" : "idle";
  const statusDot   = loading ? "#4ade80" : script ? "#4ade80" : "#3f3f3f";
  const canGenerate = !loading && !!csvData.trim();

  const TABS = [
    { id: "script",      label: "output.py" },
    { id: "issues",      label: "issues.log", badge: issues.length > 0 ? issues.length : null },
    { id: "explanation", label: "readme.md" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          height: 100%;
          background: #0c0c0c;
          color: #d4d4d4;
          font-family: ${MONO};
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

        @keyframes fadeInLine {
          from { opacity: 0; transform: translateX(-4px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes blink  { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        button { font-family: ${MONO}; cursor: pointer; }
        textarea { font-family: ${MONO} !important; }

        /* Boot */
        .bl { opacity: 0; animation: fadeInLine 0.35s ease both; }
        .l1 { animation-delay: 0s;   }
        .l2 { animation-delay: 0.8s; }
        .l3 { animation-delay: 1.6s; }
        .l4 { animation-delay: 2.4s; }

        /* Sidebar nav */
        .nav-row { transition: color 0.12s, background 0.12s; }
        .nav-row:hover { color: #a3a3a3 !important; background: #161616 !important; }

        /* Tab */
        .tab { transition: color 0.12s, border-color 0.12s, background 0.12s; }
        .tab:hover { color: #a3a3a3 !important; background: #1a1a1a !important; }

        /* Buttons */
        .btn-run        { transition: background 0.12s, box-shadow 0.12s; }
        .btn-run:hover  { background: #166534 !important; box-shadow: 0 0 0 1px #16a34a44; }
        .btn-copy       { transition: background 0.12s, color 0.12s; }
        .btn-copy:hover { background: #1a2e1a !important; color: #4ade80 !important; }
        .btn-dl         { transition: background 0.12s, color 0.12s; }
        .btn-dl:hover   { background: #1c1c1c !important; color: #a3a3a3 !important; }
        .btn-load       { transition: color 0.12s; }
        .btn-load:hover { color: #a3a3a3 !important; }

        /* Window panel */
        .win { transition: border-color 0.15s; }
        .win:focus-within { border-color: #2a2a2a !important; }

        /* Blink cursor */
        .cursor { display: inline-block; width: 7px; height: 13px; background: #4ade80; border-radius: 1px; animation: blink 1s step-end infinite; vertical-align: middle; }

        textarea::placeholder { color: #2a2a2a; }
      `}</style>

      {/* ── BOOT SCREEN ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: "#080808",
          transition: "opacity 0.5s ease",
          opacity: bootDone ? 0 : 1,
          pointerEvents: bootDone ? "none" : "all",
        }}
      >
        <div style={{ fontSize: 13, lineHeight: 2.2 }}>
          <div className="bl l1" style={{ color: "#4b5563" }}>$ initializing pipeline engine...</div>
          <div className="bl l2" style={{ color: "#4b5563" }}>$ loading column type detector...</div>
          <div className="bl l3" style={{ color: "#4b5563" }}>$ connecting to claude-sonnet-4...</div>
          <div className="bl l4" style={{ color: "#4ade80" }}>$ ready.</div>
        </div>
      </div>

      {/* ── MAIN APP ── */}
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        background: "#0c0c0c",
        transition: "opacity 0.5s ease",
        opacity: bootDone ? 1 : 0,
      }}>

        {/* ── HEADER ── */}
        <header style={{
          height: 44,
          borderBottom: "1px solid #1c1c1c",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
          background: "#0c0c0c",
          position: "sticky", top: 0, zIndex: 40,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Terminal prompt mark */}
            <span style={{ color: "#4ade80", fontSize: 14, fontWeight: 700, letterSpacing: "-0.5px" }}>~/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e5e5", letterSpacing: "-0.3px" }}>
              pipeline-ai
            </span>
            <span style={{
              fontSize: 10, color: "#3f3f3f",
              borderLeft: "1px solid #222", paddingLeft: 10, marginLeft: 2,
            }}>
              v1.0
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: statusDot,
                boxShadow: statusDot === "#4ade80" ? "0 0 6px #4ade8066" : "none",
              }} />
              <span style={{ fontSize: 11, color: "#3f3f3f" }}>{statusLabel}</span>
            </div>
            <a
              href="https://github.com/MubarakAliPiracha/pipeline-ai"
              target="_blank" rel="noreferrer"
              style={{
                fontSize: 11, color: "#4b5563", textDecoration: "none",
                transition: "color 0.12s",
              }}
              onMouseEnter={e => e.target.style.color = "#a3a3a3"}
              onMouseLeave={e => e.target.style.color = "#4b5563"}
            >
              github
            </a>
          </div>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── SIDEBAR ── */}
          <aside style={{
            width: 196,
            borderRight: "1px solid #1c1c1c",
            background: "#0e0e0e",
            display: "flex", flexDirection: "column",
            flexShrink: 0, overflow: "auto",
          }}>
            <nav style={{ flex: 1, padding: "14px 0" }}>
              <div style={{
                padding: "0 14px 6px",
                fontSize: 9, color: "#2a2a2a",
                textTransform: "uppercase", letterSpacing: "0.14em",
              }}>
                workspace
              </div>

              {[
                { label: "generator",     active: true  },
                { label: "history",       active: false },
                { label: "schema-detect", active: false },
                { label: "data-preview",  active: false },
              ].map(({ label, active }) => (
                <div
                  key={label}
                  className="nav-row"
                  style={{
                    padding: "7px 14px",
                    display: "flex", alignItems: "center", gap: 8,
                    color: active ? "#e5e5e5" : "#3f3f3f",
                    background: active ? "#161616" : "transparent",
                    borderLeft: `2px solid ${active ? "#4ade80" : "transparent"}`,
                    fontSize: 12,
                    cursor: "pointer", userSelect: "none",
                  }}
                >
                  <span style={{ color: active ? "#4ade80" : "#2a2a2a", fontSize: 11 }}>
                    {active ? ">" : " "}
                  </span>
                  {label}
                </div>
              ))}
            </nav>

            {/* Runtime info */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid #1c1c1c" }}>
              <div style={{ fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                runtime
              </div>
              {[
                ["engine",  "claude-ai"],
                ["model",   "sonnet-4"],
                ["lang",    "python 3"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "#2a2a2a" }}>{k}</span>
                  <span style={{ fontSize: 10, color: "#4b5563" }}>{v}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main style={{
            flex: 1, padding: "20px 24px 24px",
            display: "flex", flexDirection: "column", gap: 16,
            overflow: "auto", minWidth: 0,
          }}>

            {/* Breadcrumb / title */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#3f3f3f" }}>~/pipeline-ai/</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e5e5", letterSpacing: "-0.3px" }}>
                generator
              </span>
              <span style={{ fontSize: 11, color: "#2a2a2a", marginLeft: 4 }}>
                — paste csv, get clean python
              </span>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{
              display: "flex", alignItems: "center",
              background: "#111111",
              border: "1px solid #1c1c1c",
              borderRadius: 6,
              padding: "8px 16px",
              gap: 0,
            }}>
              {[
                { key: "rows",   label: "rows",   val: rowCount || "—",  color: rowCount > 0 ? "#4ade80" : "#2a2a2a" },
                { key: "cols",   label: "cols",   val: colCount || "—",  color: colCount > 0 ? "#4ade80" : "#2a2a2a" },
                { key: "issues", label: "issues", val: issues.length > 0 ? issues.length : "—", color: issues.length > 0 ? "#f59e0b" : "#2a2a2a" },
                { key: "status", label: "status", val: statusLabel,      color: statusDot },
              ].map(({ key, label, val, color }, i, arr) => (
                <div key={key} style={{
                  flex: 1,
                  display: "flex", flexDirection: "column", gap: 2,
                  paddingRight: i < arr.length - 1 ? 16 : 0,
                  marginRight: i < arr.length - 1 ? 16 : 0,
                  borderRight: i < arr.length - 1 ? "1px solid #1c1c1c" : "none",
                }}>
                  <span style={{ fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color, letterSpacing: "-0.3px" }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* ── PANELS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1, minHeight: 460 }}>

              {/* INPUT WINDOW */}
              <div className="win" style={{
                background: "#111111",
                border: "1px solid #1c1c1c",
                borderRadius: 8,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                {/* Window chrome */}
                <div style={{
                  height: 36, padding: "0 14px",
                  background: "#161616",
                  borderBottom: "1px solid #1c1c1c",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.8 }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.8 }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} />
                    <span style={{ marginLeft: 8, fontSize: 11, color: "#3f3f3f" }}>input.csv</span>
                  </div>
                  <button
                    onClick={() => setCsvData(EXAMPLE_CSV)}
                    className="btn-load"
                    style={{
                      fontSize: 10, color: "#3f3f3f",
                      background: "none", border: "none", padding: 0,
                      textDecoration: "underline", textDecorationColor: "#2a2a2a",
                    }}
                  >
                    load example
                  </button>
                </div>

                {/* Prompt line */}
                <div style={{
                  padding: "8px 14px 0",
                  display: "flex", alignItems: "center", gap: 6,
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 12, color: "#4ade80", userSelect: "none" }}>$</span>
                  <span style={{ fontSize: 11, color: "#2a2a2a" }}>cat input.csv</span>
                </div>

                <textarea
                  style={{
                    flex: 1, background: "transparent",
                    border: "none", outline: "none",
                    padding: "6px 14px 14px",
                    fontSize: 12, lineHeight: 1.85,
                    color: "#6b7280",
                    resize: "none", width: "100%", minHeight: 240,
                    caretColor: "#4ade80",
                  }}
                  placeholder={"id,name,age,status\n1,John,,active\n2,,25,ACTIVE\n1,John,,active"}
                  value={csvData}
                  onChange={e => setCsvData(e.target.value)}
                />

                {error && (
                  <div style={{
                    margin: "0 14px 10px",
                    padding: "8px 12px",
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 4,
                    fontSize: 11, color: "#f87171", lineHeight: 1.6,
                    flexShrink: 0,
                  }}>
                    error: {error}
                  </div>
                )}

                {/* Footer meta */}
                <div style={{
                  padding: "6px 14px",
                  borderTop: "1px solid #1c1c1c",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, color: "#2a2a2a" }}>
                    {csvData.trim()
                      ? `${rowCount} lines, ${colCount} fields, ${csvData.length}B`
                      : "empty buffer"}
                  </span>
                  <span style={{ fontSize: 10, color: "#2a2a2a" }}>csv</span>
                </div>

                {/* Run button */}
                <div style={{ padding: "8px 14px 14px", flexShrink: 0 }}>
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="btn-run"
                    style={{
                      width: "100%", padding: "11px 14px",
                      background: canGenerate ? "#14532d" : "#111111",
                      border: `1px solid ${canGenerate ? "#16a34a44" : "#1c1c1c"}`,
                      borderRadius: 6,
                      color: canGenerate ? "#4ade80" : "#2a2a2a",
                      fontSize: 13, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="cursor" />
                        running pipeline...
                      </>
                    ) : (
                      <>
                        <span style={{ color: canGenerate ? "#4ade80" : "#2a2a2a", fontWeight: 700 }}>
                          {canGenerate ? ">_" : " _"}
                        </span>
                        run pipeline
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* OUTPUT WINDOW */}
              <div className="win" style={{
                background: "#111111",
                border: "1px solid #1c1c1c",
                borderRadius: 8,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}>
                {/* Window chrome */}
                <div style={{
                  height: 36, padding: "0 0 0 14px",
                  background: "#161616",
                  borderBottom: "1px solid #1c1c1c",
                  display: "flex", alignItems: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.8 }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.8 }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} />
                  </div>
                  {/* File tabs */}
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="tab"
                      style={{
                        padding: "0 14px",
                        height: 36,
                        fontSize: 11,
                        color: activeTab === tab.id ? "#d4d4d4" : "#3f3f3f",
                        background: activeTab === tab.id ? "#111111" : "transparent",
                        border: "none",
                        borderRight: "1px solid #1c1c1c",
                        borderBottom: activeTab === tab.id ? "1px solid #111111" : "none",
                        marginBottom: activeTab === tab.id ? "-1px" : 0,
                        display: "flex", alignItems: "center", gap: 6,
                        zIndex: activeTab === tab.id ? 1 : 0,
                        position: "relative",
                      }}
                    >
                      {tab.label}
                      {tab.badge != null && (
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          color: "#f59e0b",
                          background: "rgba(245,158,11,0.1)",
                          padding: "1px 5px", borderRadius: 3,
                        }}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", padding: "0 14px", display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: statusDot,
                      boxShadow: statusDot === "#4ade80" ? "0 0 5px #4ade8066" : "none",
                    }} />
                  </div>
                </div>

                {/* Output area */}
                <div style={{ flex: 1, overflow: "auto", minHeight: 260, position: "relative" }}>
                  {!script ? (
                    <div style={{
                      height: "100%", minHeight: 260,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 8,
                      padding: 24,
                    }}>
                      <div style={{ fontSize: 12, color: "#2a2a2a", lineHeight: 2 }}>
                        <div><span style={{ color: "#3f3f3f" }}>$</span> waiting for input...</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "#3f3f3f" }}>$</span>
                          <span className="cursor" style={{ width: 6, height: 12 }} />
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "script" ? (
                    <div style={{ padding: "8px 14px 14px" }}>
                      <div style={{ fontSize: 10, color: "#2a2a2a", marginBottom: 8 }}>
                        # pipeline.py — generated by claude-sonnet-4
                      </div>
                      <pre style={{
                        fontSize: 12, lineHeight: 1.85,
                        color: "#4ade80",
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                        margin: 0,
                      }}>
                        {script}
                      </pre>
                    </div>
                  ) : activeTab === "issues" ? (
                    <div style={{ padding: "10px 14px 14px" }}>
                      {issues.length === 0 ? (
                        <div style={{ padding: "40px 0", textAlign: "center" }}>
                          <div style={{ fontSize: 12, color: "#2a2a2a" }}>
                            <div>$ lint input.csv</div>
                            <div style={{ color: "#4ade80", marginTop: 4 }}>✓ no issues found</div>
                          </div>
                        </div>
                      ) : issues.map((iss, i) => (
                        <div key={i} style={{
                          display: "flex", gap: 10, alignItems: "flex-start",
                          marginBottom: 6,
                          padding: "6px 0",
                          borderBottom: "1px solid #161616",
                        }}>
                          <span style={{ color: "#f59e0b", fontSize: 11, flexShrink: 0 }}>
                            [{String(i + 1).padStart(2, "0")}]
                          </span>
                          <span style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.7 }}>{iss}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "10px 14px 14px" }}>
                      <div style={{ fontSize: 10, color: "#2a2a2a", marginBottom: 8 }}>
                        # readme.md
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.9 }}>
                        {explanation || "no explanation available."}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                {script && (
                  <div style={{
                    padding: "8px 14px",
                    borderTop: "1px solid #1c1c1c",
                    display: "flex", gap: 8, flexShrink: 0,
                    background: "#161616",
                  }}>
                    <button
                      onClick={handleCopy}
                      className="btn-copy"
                      style={{
                        flex: 1, padding: "7px 12px",
                        fontSize: 11, fontWeight: 600,
                        borderRadius: 5,
                        border: "1px solid #1a2e1a",
                        background: "#111b11",
                        color: "#34d399",
                      }}
                    >
                      {copied ? "$ copied!" : "$ copy script"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn-dl"
                      style={{
                        flex: 1, padding: "7px 12px",
                        fontSize: 11, fontWeight: 600,
                        borderRadius: 5,
                        border: "1px solid #1c1c1c",
                        background: "transparent",
                        color: "#3f3f3f",
                      }}
                    >
                      $ download .py
                    </button>
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>

        {/* ── STATUS BAR ── */}
        <footer style={{
          height: 24,
          background: "#0a0a0a",
          borderTop: "1px solid #1c1c1c",
          display: "flex", alignItems: "center",
          padding: "0 20px", gap: 20,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: statusDot,
              boxShadow: statusDot === "#4ade80" ? "0 0 4px #4ade8066" : "none",
            }} />
            <span style={{ fontSize: 10, color: "#3f3f3f" }}>{statusLabel}</span>
          </div>
          <span style={{ fontSize: 10, color: "#2a2a2a" }}>claude-sonnet-4</span>
          <span style={{ fontSize: 10, color: "#2a2a2a" }}>python 3.11</span>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 10, color: "#1c1c1c" }}>
              pipeline-ai — Mubarak Ali Piracha
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
