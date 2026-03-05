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
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://pipeline-ai-production.up.railway.app";

  const handleGenerate = async () => {
    if (!csvData.trim()) return;
    setLoading(true);
    setError("");
    setScript("");
    setExplanation("");
    setIssues([]);
    try {
      const response = await fetch(`${BACKEND_URL}/generate-pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_data: csvData }),
      });
      const data = await response.json();
      if (data.script) {
        setScript(data.script);
        setExplanation(data.explanation || "");
        setIssues(data.issues || []);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch (err) {
      setError("Cannot connect to backend. Make sure it is running.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaning_pipeline.py";
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="border-b border-white/5 px-8 py-4 flex items-center justify-between backdrop-blur-sm sticky top-0 z-10 bg-[#0a0c10]/90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-sm font-black">P</div>
          <span className="text-lg font-bold tracking-tight">PipelineAI</span>
          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/30 hidden md:block">Powered by Claude AI</span>
          <a href="https://github.com/MubarakAliPiracha" target="_blank" rel="noreferrer"
            className="text-xs text-white/40 hover:text-white/70 transition border border-white/10 px-3 py-1.5 rounded-lg">
            GitHub ↗
          </a>
        </div>
      </nav>

      <div className="text-center pt-20 pb-14 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          AI-Powered Data Pipeline Generator
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight">
          Stop cleaning data<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">manually.</span>
        </h1>
        <p className="text-white/40 text-lg max-w-lg mx-auto leading-relaxed">
          Paste your messy CSV. Get a production-ready Python cleaning script in seconds.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Input CSV</span>
            </div>
            <button onClick={() => setCsvData(EXAMPLE_CSV)}
              className="text-xs text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg hover:bg-blue-500/10 transition font-medium">
              Load example ↓
            </button>
          </div>
          <textarea
            className="flex-1 min-h-[300px] bg-[#060709] border border-white/5 rounded-xl p-4 text-sm font-mono text-white/70 placeholder-white/15 resize-none focus:outline-none focus:border-blue-500/40 transition leading-relaxed"
            placeholder={`Paste your CSV here...\n\nExample:\nid,name,age,salary\n1,John,25,50000\n2,,30,\n3,Alice,abc,75000`}
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
          {csvData && (
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span>{csvData.split('\n').length} rows</span>
              <span>·</span>
              <span>{csvData.split('\n')[0]?.split(',').length || 0} columns detected</span>
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/[0.08] border border-red-500/15 rounded-xl px-4 py-3 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          <button onClick={handleGenerate} disabled={loading || !csvData.trim()}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analyzing your data...
              </>
            ) : <>Generate Pipeline <span className="opacity-70">→</span></>}
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${script ? 'bg-green-400' : 'bg-white/20'}`} />
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Generated Script</span>
            </div>
            {script && <span className="text-xs text-green-400 font-medium">✓ Ready</span>}
          </div>
          <div className="flex-1 min-h-[300px] bg-[#060709] border border-white/5 rounded-xl p-4 overflow-auto">
            {script ? (
              <pre className="text-sm font-mono text-green-400/90 whitespace-pre-wrap leading-relaxed">{script}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">⚡</div>
                <p className="text-white/20 text-sm">Your cleaning script will appear here</p>
                <p className="text-white/10 text-xs">Paste CSV data and click Generate</p>
              </div>
            )}
          </div>
          {issues.length > 0 && (
            <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-400/80 uppercase tracking-widest mb-2">Issues Detected</p>
              <ul className="space-y-1">
                {issues.map((issue, i) => (
                  <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">·</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {explanation && (
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-400/80 uppercase tracking-widest mb-2">What it fixes</p>
              <p className="text-sm text-white/50 leading-relaxed">{explanation}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleCopy} disabled={!script}
              className="flex-1 py-3 rounded-xl border border-white/[0.08] hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed font-semibold transition text-sm">
              {copied ? "✅ Copied!" : "Copy"}
            </button>
            <button onClick={handleDownload} disabled={!script}
              className="flex-1 py-3 rounded-xl bg-white/[0.06] hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed font-semibold transition text-sm">
              Download .py
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-20 px-6">
        <p className="text-center text-xs text-white/30 uppercase tracking-widest font-semibold mb-12">How it works</p>
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { icon: "📋", step: "01", title: "Paste Data", desc: "Any messy CSV — missing values, duplicates, bad types" },
            { icon: "🤖", step: "02", title: "AI Analyzes", desc: "Claude detects every issue and plans the exact fix" },
            { icon: "⚡", step: "03", title: "Get Script", desc: "Download a Python script tailored to your data" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xl">{item.icon}</div>
              <p className="text-xs text-blue-400/60 font-bold tracking-widest">{item.step}</p>
              <p className="font-bold text-white/80 text-sm">{item.title}</p>
              <p className="text-xs text-white/30 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center">
        <p className="text-white/20 text-xs">
          Built by <a href="https://github.com/MubarakAliPiracha" className="text-white/40 hover:text-white/60 transition font-medium">Mubarak Piracha</a>
          {" "}· UWaterloo Co-op · Powered by Claude AI
        </p>
      </div>
    </div>
  );
}
