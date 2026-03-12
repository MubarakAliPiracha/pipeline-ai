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

  const statusColor = loading ? "#2563eb" : script ? "#10b981" : "#475569";
  const statusLabel = loading ? "Processing" : script ? "Ready" : "Standby";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #0f1117; color: #f1f5f9; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        button { font-family: 'DM Sans', sans-serif; }
        textarea { font-family: 'DM Mono', monospace !important; }
        .gh-link:hover { background: #1e293b; color: #f1f5f9; border-color: #334155; }
        .sidebar-link:hover { color: #f1f5f9; background: #131929; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header style={{
          height: 56,
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "#0f1117",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>PipelineAI</span>
          <a
            href="https://github.com/MubarakAliPiracha/pipeline-ai"
            target="_blank"
            rel="noreferrer"
            className="gh-link"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#94a3b8",
              textDecoration: "none",
              padding: "6px 14px",
              border: "1px solid #1e293b",
              borderRadius: 6,
              transition: "all 0.15s",
            }}
          >
            GitHub
          </a>
        </header>

        <div style={{ display: "flex", flex: 1 }}>
          <aside style={{
            width: 210,
            borderRight: "1px solid #1e293b",
            background: "#0f1117",
            flexShrink: 0,
            padding: "20px 0",
          }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["Generator", "History", "Schema Detect", "Data Preview"].map((label) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="sidebar-link"
                  style={{
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: label === "Generator" ? "#f1f5f9" : "#64748b",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <main style={{
            flex: 1,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            overflow: "auto",
            minWidth: 0,
          }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8 }}>
                Data Pipeline Generator
              </h1>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                Paste messy CSV data. Claude AI detects every issue and generates a production-ready Python cleaning script.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                { label: "Input Rows", value: rowCount || "—" },
                { label: "Columns", value: colCount || "—" },
                { label: "Issues Found", value: issues.length || "—" },
                { label: "Pipeline State", value: statusLabel },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "#131929",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "16px 20px",
                  }}
                >
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 8,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    color: label === "Pipeline State" ? statusColor : "#f1f5f9",
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flex: 1, minHeight: 480 }}>
              <div style={{
                background: "#131929",
                border: "1px solid #1e293b",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #1e293b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>CSV Input</span>
                  <button
                    onClick={() => setCsvData(EXAMPLE_CSV)}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#2563eb",
                      background: "transparent",
                      border: "1px solid #2563eb",
                      padding: "6px 14px",
                      borderRadius: 6,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    Load Example
                  </button>
                </div>
                <textarea
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    padding: "20px",
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: "#e2e8f0",
                    resize: "none",
                    width: "100%",
                    minHeight: 260,
                  }}
                  placeholder="Paste your CSV here..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                />
                {error && (
                  <div style={{
                    margin: "0 20px 16px",
                    padding: "12px 16px",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#f87171",
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {error}
                  </div>
                )}
                <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !csvData.trim()}
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      background: loading || !csvData.trim() ? "#1e293b" : "#2563eb",
                      border: "none",
                      borderRadius: 6,
                      color: loading || !csvData.trim() ? "#64748b" : "white",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading || !csvData.trim() ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(255,255,255,0.2)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }} />
                        Generating...
                      </span>
                    ) : (
                      "Generate Pipeline"
                    )}
                  </button>
                </div>
              </div>

              <div style={{
                background: "#131929",
                border: "1px solid #1e293b",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
                <div style={{ display: "flex", borderBottom: "1px solid #1e293b" }}>
                  {[
                    { id: "script", label: "Script" },
                    { id: "issues", label: "Issues", count: issues.length },
                    { id: "explanation", label: "Explanation" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: "14px 20px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: activeTab === tab.id ? "#f1f5f9" : "#64748b",
                        background: "none",
                        border: "none",
                        borderBottom: `2px solid ${activeTab === tab.id ? "#2563eb" : "transparent"}`,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: "-1px",
                        transition: "all 0.15s",
                      }}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span style={{
                          background: "rgba(245,158,11,0.15)",
                          color: "#f59e0b",
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div style={{
                  flex: 1,
                  padding: "20px",
                  overflow: "auto",
                  minHeight: 260,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "#94a3b8",
                }}>
                  {!script ? (
                    <div style={{
                      height: "100%",
                      minHeight: 220,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                      fontSize: 13,
                    }}>
                      No output yet. Paste CSV data and generate your pipeline.
                    </div>
                  ) : activeTab === "script" ? (
                    <pre style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: "#94a3b8",
                    }}>
                      {script}
                    </pre>
                  ) : activeTab === "issues" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {issues.length === 0 ? (
                        <div style={{ color: "#475569", fontSize: 13 }}>No issues detected</div>
                      ) : (
                        issues.map((iss, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "12px 16px",
                              background: "rgba(245,158,11,0.06)",
                              border: "1px solid rgba(245,158,11,0.15)",
                              borderRadius: 6,
                              fontSize: 12,
                              color: "#e2e8f0",
                              lineHeight: 1.6,
                            }}
                          >
                            {iss}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>
                      {explanation || "No explanation available."}
                    </div>
                  )}
                </div>
                {script && (
                  <div style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #1e293b",
                    display: "flex",
                    gap: 10,
                  }}>
                    <button
                      onClick={handleCopy}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        cursor: "pointer",
                        border: "1px solid #2563eb",
                        background: "#2563eb",
                        color: "white",
                        transition: "all 0.15s",
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownload}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 6,
                        cursor: "pointer",
                        border: "1px solid #1e293b",
                        background: "transparent",
                        color: "#94a3b8",
                        transition: "all 0.15s",
                      }}
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        <footer style={{
          height: 32,
          background: "#0f1117",
          borderTop: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 24,
          fontSize: 11,
          color: "#475569",
          fontFamily: "'DM Mono', monospace",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: statusColor,
            }} />
            {statusLabel}
          </span>
        </footer>
      </div>
    </>
  );
}
