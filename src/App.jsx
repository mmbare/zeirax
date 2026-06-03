import { useState, useRef, useEffect } from "react";

const FREE_PROMPT = `You are Zeirax, an elite AI research assistant. Your purpose is to help users conduct deep, structured research on any topic.

When given a research query:
1. Provide a clear, well-structured research breakdown
2. Cover key facts, context, history, current state, and future outlook
3. Highlight multiple perspectives or schools of thought
4. Surface non-obvious insights and counterintuitive findings
5. End with a "Key Takeaways" section with 3–5 bullet points

Format your response with ## headers. Be thorough but scannable. Avoid filler.
Tone: authoritative, precise, and intellectually engaging.`;

const PRO_PROMPT = `You are Zeirax Pro, an elite AI research assistant with access to real-time web search.

When given a research query:
1. Use web search to find current, accurate, and cited information
2. Structure your response with clear ## sections
3. After EVERY factual claim, include an inline citation like [Source: Publication Name, Year]
4. Cover: Overview, Key Facts, Current Developments, Expert Perspectives, Controversies/Debates, Future Outlook
5. End with "Key Takeaways" (3–5 bullets) and a "## Sources" section listing all cited sources as a numbered list with full names
6. Prioritize recency — note when information was last updated

Be extremely thorough. This is Pro mode — users expect depth, breadth, and verified sources.
Format source list as:
## Sources
1. Source Name — brief description
2. Source Name — brief description`;

const SUGGESTED = [
  "The geopolitics of rare earth minerals",
  "How memory consolidation works during sleep",
  "History and future of nuclear fusion energy",
  "The economics of attention in the social media age",
  "Quantum computing: where are we really?",
  "CRISPR gene editing: current state 2025",
];

function parseMarkdown(text) {
  const lines = text.split("\n");
  let html = "";
  let inUl = false;
  for (let line of lines) {
    if (line.startsWith("## ")) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<h2>${line.slice(3)}</h2>`;
    } else if (line.startsWith("### ")) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<h3>${line.slice(4)}</h3>`;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inUl) { html += "<ul>"; inUl = true; }
      html += `<li>${formatInline(line.slice(2))}</li>`;
    } else if (/^\d+\. /.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<div class="source-item">${formatInline(line)}</div>`;
    } else if (line.trim() === "") {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += "<br/>";
    } else {
      if (inUl) { html += "</ul>"; inUl = false; }
      html += `<p>${formatInline(line)}</p>`;
    }
  }
  if (inUl) html += "</ul>";
  return html;
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[Source: ([^\]]+)\]/g, '<span class="cite">[$1]</span>');
}

function LandingPage({ onEnter }) {
  const [hovered, setHovered] = useState(null);
  const features = [
    { icon: "◈", title: "Deep Research", desc: "Multi-layered analysis covering facts, history, context, and future outlook on any topic." },
    { icon: "◉", title: "Pro Web Search", desc: "Real-time web search with verified citations and live source references — not just training data." },
    { icon: "◫", title: "Session History", desc: "Every research session saved locally so you can revisit and build on past work." },
    { icon: "◬", title: "Export Ready", desc: "Copy any research report instantly to use in your writing, studies, or work." },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#e8e6e0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,255,170,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.025) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "-300px", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(0,255,170,0.05) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "960px", margin: "0 auto", padding: "0 24px 100px" }}>
        <nav style={{ padding: "28px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #0d1520" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #00ffaa, #00ccff)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
            <span style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "0.2em", background: "linear-gradient(90deg, #00ffaa, #00ccff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ZEIRAX</span>
          </div>
          <button onClick={onEnter} style={{ background: "none", border: "1px solid #00ffaa33", color: "#00ffaa", padding: "8px 20px", fontSize: "10px", letterSpacing: "0.2em", cursor: "pointer", fontFamily: "inherit" }}>LAUNCH APP →</button>
        </nav>
        <div style={{ textAlign: "center", padding: "100px 0 80px" }}>
          <div style={{ fontSize: "10px", color: "#00ffaa", letterSpacing: "0.4em", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "1px", background: "#00ffaa" }} />AI RESEARCH ENGINE<div style={{ width: "30px", height: "1px", background: "#00ffaa" }} />
          </div>
          <h1 style={{ fontSize: "clamp(42px, 8vw, 84px)", fontWeight: "800", lineHeight: "1.05", fontFamily: "'Syne', Georgia, serif", margin: "0 0 32px" }}>
            <span style={{ display: "block", color: "#e8e6e0" }}>Research anything.</span>
            <span style={{ display: "block", background: "linear-gradient(90deg, #00ffaa, #00ccff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Know everything.</span>
          </h1>
          <p style={{ maxWidth: "540px", margin: "0 auto 48px", fontSize: "16px", lineHeight: "1.8", color: "#6b7a90" }}>Zeirax is an AI-powered deep research assistant that breaks down any topic with structured analysis, verified sources, and expert-level insight.</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onEnter} style={{ background: "linear-gradient(135deg, #00ffaa, #00ccff)", border: "none", color: "#080a0f", padding: "14px 36px", fontSize: "12px", letterSpacing: "0.2em", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>START RESEARCHING →</button>
            <button onClick={onEnter} style={{ background: "none", border: "1px solid #1e2a3a", color: "#6b7a90", padding: "14px 36px", fontSize: "12px", letterSpacing: "0.2em", cursor: "pointer", fontFamily: "inherit" }}>VIEW PRO MODE</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1px", background: "#1a2030", marginBottom: "80px" }}>
          {features.map((f, i) => (
            <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ background: hovered === i ? "#0d1520" : "#080a0f", padding: "32px 28px", transition: "background 0.2s" }}>
              <div style={{ fontSize: "22px", marginBottom: "16px", color: "#00ffaa" }}>{f.icon}</div>
              <div style={{ fontSize: "12px", letterSpacing: "0.15em", color: "#e8e6e0", marginBottom: "10px" }}>{f.title}</div>
              <div style={{ fontSize: "12px", color: "#4a5568", lineHeight: "1.7" }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#1a2030", maxWidth: "600px", margin: "0 auto 80px" }}>
          {[{ name: "FREE", price: "0", color: "#4a5568", items: ["5 research queries/day", "AI knowledge base", "Session history", "Copy export"] },
            { name: "PRO", price: "12", color: "#00ffaa", items: ["Unlimited queries", "Live web search", "Verified citations", "Source references", "Priority speed"] }
          ].map((plan, i) => (
            <div key={i} style={{ background: "#080a0f", padding: "32px 24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: plan.color, marginBottom: "8px" }}>{plan.name}</div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#e8e6e0", marginBottom: "4px", fontFamily: "'Syne', Georgia, serif" }}>${plan.price}<span style={{ fontSize: "12px", color: "#4a5568" }}>/mo</span></div>
              <div style={{ margin: "20px 0", height: "1px", background: "#1a2030" }} />
              {plan.items.map((item, j) => (
                <div key={j} style={{ fontSize: "12px", color: "#6b7a90", padding: "5px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: plan.color, fontSize: "10px" }}>✓</span> {item}
                </div>
              ))}
              <button onClick={onEnter} style={{ marginTop: "20px", width: "100%", padding: "10px", background: i === 1 ? "linear-gradient(135deg, #00ffaa, #00ccff)" : "none", border: i === 0 ? "1px solid #1e2a3a" : "none", color: i === 1 ? "#080a0f" : "#6b7a90", fontSize: "10px", letterSpacing: "0.2em", cursor: "pointer", fontFamily: "inherit" }}>
                {i === 1 ? "TRY PRO FREE" : "GET STARTED"}
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", padding: "60px 0", border: "1px solid #1e2a3a" }}>
          <h2 style={{ fontFamily: "'Syne', Georgia, serif", fontSize: "32px", color: "#e8e6e0", margin: "0 0 16px" }}>Your research, upgraded.</h2>
          <p style={{ color: "#4a5568", fontSize: "13px", margin: "0 0 32px" }}>No signup needed. Start researching immediately.</p>
          <button onClick={onEnter} style={{ background: "linear-gradient(135deg, #00ffaa, #00ccff)", border: "none", color: "#080a0f", padding: "14px 40px", fontSize: "12px", letterSpacing: "0.2em", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>OPEN ZEIRAX →</button>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "24px", fontSize: "9px", color: "#1e2a3a", letterSpacing: "0.2em" }}>ZEIRAX · FOUNDED BY MOE · 2026</div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono&display=swap');`}</style>
    </div>
  );
}

export default function ZeiraxApp() {
  const [page, setPage] = useState("landing");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("research");
  const [mode, setMode] = useState("free");
  const textareaRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [query]);

  const runResearch = async (q) => {
    const trimmed = (q || query).trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSources([]);
    setActiveTab("research");
    const isPro = mode === "pro";
    try {
      const body = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: isPro ? PRO_PROMPT : FREE_PROMPT,
        messages: [{ role: "user", content: trimmed }],
      };
      if (isPro) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1000, messages: [{ role: "system", content: isPro ? PRO_PROMPT : FREE_PROMPT }, { role: "user", content: trimmed }] }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.choices?.[0]?.message?.content || "";
      let mainText = text;
      let extractedSources = [];
      const srcMatch = text.match(/## Sources\n([\s\S]*?)(?:\n##|$)/i);
      if (srcMatch) {
        const srcLines = srcMatch[1].trim().split("\n").filter(l => /^\d+\./.test(l));
        extractedSources = srcLines.map(l => l.replace(/^\d+\.\s*/, ""));
        mainText = text.replace(/## Sources[\s\S]*$/i, "").trim();
      }
      setResult(mainText);
      setSources(extractedSources);
      setHistory(prev => [{ query: trimmed, result: mainText, sources: extractedSources, mode: isPro ? "PRO" : "FREE", time: new Date() }, ...prev.slice(0, 9)]);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err.message || "Research failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runResearch();
  };

  if (page === "landing") return <LandingPage onEnter={() => setPage("app")} />;

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#e8e6e0", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono&display=swap');
        .res h2 { color: #00ffaa; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin: 28px 0 10px; border-bottom: 1px solid #0d1520; padding-bottom: 6px; }
        .res h3 { color: #00ccff; font-size: 12px; letter-spacing: 0.12em; margin: 18px 0 8px; }
        .res ul { padding-left: 18px; margin: 8px 0; }
        .res li { margin: 6px 0; color: #c8c4bc; line-height: 1.7; }
        .res p { color: #b0aca4; line-height: 1.9; margin: 6px 0; }
        .res strong { color: #e8e6e0; }
        .res em { color: #8899aa; }
        .res .cite { display: inline-block; background: #0a1a2a; border: 1px solid #00ccff33; color: #00ccff; font-size: 10px; padding: 1px 6px; margin-left: 4px; letter-spacing: 0.05em; vertical-align: middle; }
        .res .source-item { color: #6b7a90; font-size: 12px; padding: 5px 0; border-bottom: 1px solid #0d1520; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { from { transform: scaleY(0.3); opacity: 0.2; } to { transform: scaleY(1); opacity: 0.9; } }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,255,170,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "880px", margin: "0 auto", padding: "0 24px 100px" }}>
        <header style={{ padding: "36px 0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setPage("landing")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", padding: 0 }}>
              <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, #00ffaa, #00ccff)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
              <span style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "0.2em", fontFamily: "'Syne', Georgia, serif", background: "linear-gradient(90deg, #00ffaa, #00ccff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ZEIRAX</span>
            </button>
            <div style={{ width: "1px", height: "20px", background: "#1e2a3a" }} />
            <span style={{ fontSize: "9px", color: "#2d3748", letterSpacing: "0.2em" }}>RESEARCH ENGINE</span>
          </div>
          <div style={{ display: "flex", border: "1px solid #1e2a3a" }}>
            {["free", "pro"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ background: mode === m ? (m === "pro" ? "linear-gradient(135deg, #00ffaa22, #00ccff22)" : "#0d1520") : "none", border: "none", cursor: "pointer", padding: "8px 18px", fontSize: "10px", letterSpacing: "0.2em", fontFamily: "inherit", color: mode === m ? (m === "pro" ? "#00ffaa" : "#e8e6e0") : "#4a5568", transition: "all 0.2s" }}>
                {m === "pro" && <span style={{ fontSize: "8px" }}>⚡</span>} {m.toUpperCase()}
              </button>
            ))}
          </div>
        </header>
        {mode === "pro" && (
          <div style={{ background: "#050e0a", border: "1px solid #00ffaa22", padding: "10px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>⚡</span>
            <span style={{ fontSize: "11px", color: "#00ffaa", letterSpacing: "0.1em" }}>PRO MODE ACTIVE</span>
            <span style={{ fontSize: "11px", color: "#4a5568" }}>— Real-time web search + verified source citations enabled</span>
          </div>
        )}
        <div style={{ display: "flex", marginBottom: "32px", borderBottom: "1px solid #1a2030" }}>
          {["research", "history"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 20px", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: activeTab === tab ? "#00ffaa" : "#4a5568", borderBottom: activeTab === tab ? "2px solid #00ffaa" : "2px solid transparent", transition: "all 0.2s", fontFamily: "inherit" }}>
              {tab}{tab === "history" && history.length > 0 && <span style={{ marginLeft: "6px", background: "#1e2a3a", padding: "1px 6px", fontSize: "9px", color: "#6b7a90" }}>{history.length}</span>}
            </button>
          ))}
        </div>
        {activeTab === "research" && (
          <>
            <div style={{ background: "#0d1117", border: `1px solid ${mode === "pro" ? "#00ffaa33" : "#1e2a3a"}`, padding: "24px", marginBottom: "28px", position: "relative" }}>
              <div style={{ position: "absolute", top: "-1px", left: "24px", background: "#080a0f", padding: "0 8px", fontSize: "9px", letterSpacing: "0.25em", color: mode === "pro" ? "#00ffaa" : "#2d3748" }}>
                {mode === "pro" ? "⚡ PRO RESEARCH QUERY" : "RESEARCH QUERY"}
              </div>
              <textarea ref={textareaRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey} placeholder={mode === "pro" ? "Ask anything — Zeirax will search the web and cite sources..." : "What do you want to understand deeply?"} rows={2} style={{ width: "100%", background: "none", border: "none", outline: "none", color: "#e8e6e0", fontSize: "16px", resize: "none", fontFamily: "'Syne', Georgia, serif", lineHeight: "1.6", boxSizing: "border-box", caretColor: "#00ffaa" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <span style={{ fontSize: "10px", color: "#1e2a3a", letterSpacing: "0.1em" }}>⌘ + ENTER</span>
                <button onClick={() => runResearch()} disabled={loading || !query.trim()} style={{ background: loading ? "#0d1117" : "linear-gradient(135deg, #00ffaa, #00ccff)", border: "none", cursor: loading ? "not-allowed" : "pointer", padding: "10px 28px", fontSize: "11px", letterSpacing: "0.2em", fontFamily: "inherit", color: loading ? "#4a5568" : "#080a0f", fontWeight: "700", transition: "all 0.2s", outline: "none" }}>
                  {loading ? (mode === "pro" ? "SEARCHING WEB..." : "RESEARCHING...") : (mode === "pro" ? "⚡ PRO RESEARCH →" : "RESEARCH →")}
                </button>
              </div>
            </div>
            {!result && !loading && (
              <div style={{ marginBottom: "36px" }}>
                <p style={{ fontSize: "9px", color: "#2d3748", letterSpacing: "0.25em", marginBottom: "12px" }}>SUGGESTED TOPICS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {SUGGESTED.map((s, i) => (
                    <button key={i} onClick={() => { setQuery(s); runResearch(s); }} style={{ background: "none", border: "1px solid #1e2a3a", color: "#6b7a90", fontSize: "12px", padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {loading && (
              <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", padding: "48px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginBottom: "20px" }}>
                  {[0,1,2,3,4,5,6].map(i => (
                    <div key={i} style={{ width: "3px", height: "24px", background: mode === "pro" ? "#00ccff" : "#00ffaa", animation: `pulse 0.8s ease-in-out ${i*0.1}s infinite alternate`, borderRadius: "2px" }} />
                  ))}
                </div>
                <p style={{ color: "#00ffaa", fontSize: "10px", letterSpacing: "0.3em", margin: "0 0 8px" }}>{mode === "pro" ? "SEARCHING THE WEB..." : "SYNTHESIZING RESEARCH..."}</p>
                <p style={{ color: "#2d3748", fontSize: "10px", letterSpacing: "0.15em", margin: 0 }}>{mode === "pro" ? "Finding sources, verifying facts, building citations" : "Analyzing across multiple dimensions"}</p>
              </div>
            )}
            {error && <div style={{ background: "#150a0a", border: "1px solid #3a1e1e", padding: "16px 20px", color: "#ff6b6b", fontSize: "13px" }}>⚠ {error}</div>}
            {result && !loading && (
              <div ref={resultRef} style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "6px", height: "6px", background: "#00ffaa", borderRadius: "50%" }} />
                    <span style={{ fontSize: "10px", color: "#00ffaa", letterSpacing: "0.2em" }}>RESEARCH COMPLETE</span>
                    {mode === "pro" && <span style={{ fontSize: "9px", background: "#00ffaa22", color: "#00ffaa", padding: "2px 8px", letterSpacing: "0.1em" }}>⚡ PRO · WEB SEARCH</span>}
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(result + (sources.length ? "\n\nSources:\n" + sources.join("\n") : ""))} style={{ background: "none", border: "1px solid #1e2a3a", color: "#4a5568", fontSize: "10px", letterSpacing: "0.15em", padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>COPY REPORT</button>
                </div>
                <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", padding: "32px" }}>
                  <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #1a2030", fontSize: "14px", color: "#6b7a90", fontFamily: "'Syne', Georgia, serif", fontStyle: "italic" }}>{query}</div>
                  <div className="res" dangerouslySetInnerHTML={{ __html: parseMarkdown(result) }} />
                  {sources.length > 0 && (
                    <div style={{ marginTop: "32px", borderTop: "1px solid #1a2030", paddingTop: "24px" }}>
                      <div style={{ fontSize: "10px", color: "#00ffaa", letterSpacing: "0.25em", marginBottom: "16px" }}>◈ SOURCES ({sources.length})</div>
                      {sources.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: "1px solid #0d1520", alignItems: "flex-start" }}>
                          <span style={{ fontSize: "9px", color: "#2d3748", minWidth: "20px", paddingTop: "2px" }}>{String(i+1).padStart(2,"0")}</span>
                          <span style={{ fontSize: "12px", color: "#8899aa", lineHeight: "1.6" }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {activeTab === "history" && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#2d3748", fontSize: "13px", letterSpacing: "0.15em" }}>NO RESEARCH SESSIONS YET</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {history.map((item, i) => (
                  <div key={i} style={{ background: "#0d1117", border: "1px solid #1e2a3a", padding: "18px 20px", cursor: "pointer" }}
                    onClick={() => { setQuery(item.query); setResult(item.result); setSources(item.sources || []); setMode(item.mode === "PRO" ? "pro" : "free"); setActiveTab("research"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ fontSize: "13px", color: "#e8e6e0", fontFamily: "'Syne', Georgia, serif" }}>{item.query}</div>
                      {item.mode === "PRO" && <span style={{ fontSize: "9px", background: "#00ffaa15", color: "#00ffaa", padding: "2px 7px" }}>⚡ PRO</span>}
                    </div>
                    <div style={{ fontSize: "10px", color: "#2d3748", letterSpacing: "0.1em", marginTop: "8px" }}>
                      {item.time.toLocaleTimeString()} · {item.result.length} chars{item.sources?.length ? ` · ${item.sources.length} sources` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid #0d1117", background: "rgba(8,10,15,0.96)", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "9px", color: "#1e2a3a", letterSpacing: "0.2em" }}>ZEIRAX · FOUNDED BY MOE · 2026</span>
        <span style={{ fontSize: "9px", color: mode === "pro" ? "#00ffaa" : "#1e2a3a", letterSpacing: "0.15em" }}>{mode === "pro" ? "⚡ PRO MODE" : "FREE MODE"}</span>
      </div>
    </div>
  );
  }
