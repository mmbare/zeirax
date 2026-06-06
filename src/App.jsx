import { useState, useRef, useEffect } from "react";

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM = `You are Zeirax, an elite AI research assistant. When given any question or topic:
1. Give a thorough, well-structured response using ## for main sections
2. Use bullet points with - for lists
3. Bold key terms with **term**
4. Cover overview, key facts, analysis, and takeaways
5. End with ## Key Takeaways with 3-5 bullet points
Be authoritative, precise, and genuinely insightful. Never give shallow answers.`;

const CHIPS = [
  "How does AI actually work?",
  "Build wealth at 19",
  "F1 racing history",
  "Grow on social media fast",
  "Best trading strategies",
  "What is quantum computing?",
];

function renderMd(text) {
  const lines = text.split("\n");
  let html = "", ul = false;
  for (let l of lines) {
    if (l.startsWith("## ")) {
      if (ul) { html += "</ul>"; ul = false; }
      html += `<h2>${l.slice(3)}</h2>`;
    } else if (l.startsWith("### ")) {
      if (ul) { html += "</ul>"; ul = false; }
      html += `<h3>${l.slice(4)}</h3>`;
    } else if (l.startsWith("- ") || l.startsWith("* ")) {
      if (!ul) { html += "<ul>"; ul = true; }
      html += `<li>${l.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`;
    } else if (l.trim() === "") {
      if (ul) { html += "</ul>"; ul = false; }
    } else {
      if (ul) { html += "</ul>"; ul = false; }
      html += `<p>${l.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>")}</p>`;
    }
  }
  if (ul) html += "</ul>";
  return html;
}

export default function App() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, title: "How AI works", time: "Today" },
    { id: 2, title: "F1 aerodynamics explained", time: "Today" },
    { id: 3, title: "Trading strategies 2025", time: "Yesterday" },
    { id: 4, title: "Quantum computing basics", time: "Yesterday" },
    { id: 5, title: "Social media growth tips", time: "Last week" },
  ]);
  const bottomRef = useRef();
  const taRef = useRef();
  const camRef = useRef();
  const imgRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const ask = async (text) => {
    const t = (text || input).trim();
    if (!t || busy) return;
    setInput("");
    setBusy(true);
    setShowPlus(false);
    const next = [...msgs, { r: "u", c: t, id: Date.now() }];
    setMsgs(next);
    setHistory(prev => [{ id: Date.now(), title: t.slice(0, 40), time: "Just now" }, ...prev.slice(0, 9)]);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [
            { role: "system", content: SYSTEM },
            ...next.map(m => ({ role: m.r === "u" ? "user" : "assistant", content: m.c }))
          ]
        })
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error.message);
      setMsgs([...next, { r: "a", c: d.choices[0].message.content, id: Date.now() }]);
    } catch (e) {
      setMsgs([...next, { r: "e", c: e.message || "Something went wrong.", id: Date.now() }]);
    }
    setBusy(false);
  };

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMsgs(prev => [...prev, { r: "img", c: url, id: Date.now() }]);
    setShowPlus(false);
    setTimeout(() => {
      setMsgs(prev => [...prev, {
        r: "a",
        c: "I can see your image. In Zeirax Pro, I analyze images in detail — identifying objects, text, context, and providing deep research based on what I see.",
        id: Date.now()
      }]);
    }, 1500);
  };

  const copyText = (text) => navigator.clipboard?.writeText(text);

  return (
    <div style={{ height: "100dvh", background: "#0d0d0d", fontFamily: "'Inter', sans-serif", color: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#222;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 15px rgba(0,255,136,0.2)}50%{box-shadow:0 0 35px rgba(0,255,136,0.5)}}
        @keyframes dot{0%,80%,100%{transform:scale(0.35);opacity:.15}40%{transform:scale(1);opacity:1}}
        @keyframes popIn{from{opacity:0;transform:translateY(10px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        .msg{animation:fadeUp .3s cubic-bezier(.16,1,.3,1);}
        .ai-text h2{font-size:13px;font-weight:700;color:#fff;margin:18px 0 8px;display:flex;align-items:center;gap:8px;text-transform:uppercase;letter-spacing:.05em;}
        .ai-text h2:first-child{margin-top:0;}
        .ai-text h2::before{content:'';display:block;width:3px;height:14px;background:linear-gradient(#00ff88,#00ccff);border-radius:2px;flex-shrink:0;}
        .ai-text h3{font-size:15px;font-weight:600;color:#ddd;margin:14px 0 6px;}
        .ai-text p{font-size:15px;font-weight:400;color:#aaa;line-height:1.85;margin:5px 0;}
        .ai-text ul{list-style:none;padding:0;margin:8px 0;}
        .ai-text li{font-size:15px;font-weight:400;color:#999;line-height:1.75;padding:4px 0 4px 20px;position:relative;}
        .ai-text li::before{content:'•';position:absolute;left:0;color:#00ff88;font-weight:700;font-size:16px;line-height:1.5;}
        .ai-text strong{color:#fff;font-weight:700;}
        .ai-text em{color:#666;font-style:italic;}
        .chip:active{transform:scale(0.96);}
        .action-item:active{background:#1a1a1a;}
        .hist-item:active{background:#1a1a1a;}
        .u-bub:focus{border-color:#00ff8830!important;outline:none;}
        textarea{-webkit-appearance:none;}
      `}</style>

      {showSidebar && (
        <>
          <div onClick={() => setShowSidebar(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 90, animation: "fadeIn .2s ease" }} />
          <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "300px", background: "#111", zIndex: 100, display: "flex", flexDirection: "column", animation: "slideRight .25s cubic-bezier(.16,1,.3,1)" }}>
            <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative", width: "28px", height: "28px" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#00ff88,#00ccff)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
                  <div style={{ position: "absolute", inset: "4px", background: "#111", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: "10px", color: "#00ff88" }}>Z</span>
                  </div>
                </div>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: "20px", letterSpacing: ".1em", background: "linear-gradient(90deg,#00ff88,#00ccff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ZEIRAX</span>
              </div>
              <button onClick={() => setShowSidebar(false)} style={{ background: "none", border: "none", color: "#444", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #1a1a1a" }}>
              <button onClick={() => { setMsgs([]); setShowSidebar(false); }} style={{ width: "100%", background: "linear-gradient(135deg,#00ff8815,#00ccff15)", border: "1px solid #00ff8825", color: "#00ff88", fontSize: "14px", fontWeight: "600", padding: "12px", borderRadius: "12px", cursor: "pointer", fontFamily: "'Inter'", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                ✦ New Research
              </button>
            </div>
            <div style={{ padding: "16px 14px 8px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#333", letterSpacing: ".12em", marginBottom: "10px" }}>FEATURES</div>
              {[
                { icon: "🔬", label: "Deep Research", sub: "Expert analysis on any topic" },
                { icon: "⚡", label: "Pro Web Search", sub: "Live sources & citations" },
                { icon: "🖼️", label: "Image Analysis", sub: "Upload & scan with camera" },
                { icon: "📄", label: "Report Generator", sub: "Full structured documents" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer" }} className="hist-item">
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#ddd" }}>{f.label}</div>
                    <div style={{ fontSize: "11px", fontWeight: "500", color: "#333" }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "8px 14px 16px", borderTop: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#333", letterSpacing: ".12em", margin: "12px 0 10px" }}>RECENT</div>
              {history.map((h) => (
                <div key={h.id} onClick={() => { ask(h.title); setShowSidebar(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer" }} className="hist-item">
                  <span style={{ fontSize: "14px" }}>💬</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</div>
                    <div style={{ fontSize: "11px", color: "#2a2a2a", marginTop: "1px" }}>{h.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 16px", borderTop: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#1e1e1e", textAlign: "center" }}>ZEIRAX · AI RESEARCH ENGINE</div>
            </div>
          </div>
        </>
      )}

      {showPlus && (
        <>
          <div onClick={() => setShowPlus(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{ position: "fixed", bottom: "88px", left: "16px", right: "16px", background: "#141414", border: "1px solid #222", borderRadius: "20px", overflow: "hidden", zIndex: 50, animation: "popIn .2s cubic-bezier(.34,1.56,.64,1)" }}>
            {[
              { icon: "📷", title: "Scan with Camera", sub: "Point at anything to research it", action: () => camRef.current?.click() },
              { icon: "🖼️", title: "Upload Image", sub: "Analyze any image with AI", action: () => imgRef.current?.click() },
              { icon: "📄", title: "Generate Report", sub: "Full structured research document", action: () => ask("Generate a full research report on the future of artificial intelligence") },
              { icon: "⚡", title: "Quick Summary", sub: "Fast answers, straight to the point", action: () => ask("Give me a quick insightful summary on how the human brain processes information") },
            ].map((item, i) => (
              <div key={i} onClick={() => { setShowPlus(false); item.action(); }} className="action-item" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "15px 18px", borderBottom: i < 3 ? "1px solid #1a1a1a" : "none", cursor: "pointer" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#1e1e1e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#eee", marginBottom: "2px" }}>{item.title}</div>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: "#333" }}>{item.sub}</div>
                </div>
                <span style={{ color: "#2a2a2a", fontSize: "18px" }}>›</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setShowSidebar(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px", padding: "4px" }}>
            <div style={{ width: "22px", height: "2px", background: "#666", borderRadius: "2px" }} />
            <div style={{ width: "16px", height: "2px", background: "#666", borderRadius: "2px" }} />
            <div style={{ width: "22px", height: "2px", background: "#666", borderRadius: "2px" }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{ position: "relative", width: "28px", height: "28px" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#00ff88,#00ccff)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
              <div style={{ position: "absolute", inset: "4px", background: "#0d0d0d", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: "10px", color: "#00ff88" }}>Z</span>
              </div>
            </div>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: "21px", letterSpacing: ".1em", background: "linear-gradient(90deg,#00ff88,#00ccff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ZEIRAX</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button style={{ background: "none", border: "1px solid #2a2a2a", color: "#aaa", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontFamily: "'Inter'" }}>⚡ Go Pro</button>
          <button onClick={() => setMsgs([])} style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#1a1a1a", border: "none", cursor: "pointer", color: "#555", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>✦</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 12px", display: "flex", flexDirection: "column", gap: "22px" }}>
        {msgs.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "10px", animation: "fadeUp .5s ease" }}>
            <div style={{ position: "relative", width: "56px", height: "56px", marginBottom: "16px", animation: "glow 2.5s ease-in-out infinite" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#00ff88,#00ccff)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
              <div style={{ position: "absolute", inset: "7px", background: "#0d0d0d", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: "16px", color: "#00ff88" }}>Z</span>
              </div>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: "4px", letterSpacing: "-.3px" }}>
              Welcome, <span style={{ background: "linear-gradient(90deg,#00ff88,#00ccff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Moe</span> 👋
            </div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#3a3a3a", textAlign: "center", marginBottom: "28px" }}>What do you want to research today?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {CHIPS.map((c, i) => (
                <button key={i} className="chip" onClick={() => ask(c)} style={{ background: "#1a1a1a", border: "1px solid #222", color: "#888", fontSize: "13px", fontWeight: "500", padding: "9px 16px", borderRadius: "20px", cursor: "pointer", fontFamily: "'Inter'", transition: "all .15s" }}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m) => (
          <div key={m.id} className="msg">
            {m.r === "u" && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div>
                  <div contentEditable suppressContentEditableWarning className="u-bub" style={{ background: "#1e1e1e", border: "1px solid #282828", padding: "13px 17px", maxWidth: "84%", fontSize: "15px", fontWeight: "500", color: "#f0f0f0", lineHeight: "1.65", borderRadius: "20px 20px 5px 20px", cursor: "text", wordBreak: "break-word", display: "inline-block" }}>{m.c}</div>
                  <div style={{ fontSize: "10px", fontWeight: "600", color: "#222", textAlign: "right", marginTop: "4px" }}>Tap to edit</div>
                </div>
              </div>
            )}
            {m.r === "img" && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ border: "1px solid #282828", padding: "5px", maxWidth: "68%", borderRadius: "16px", overflow: "hidden" }}>
                  <img src={m.c} style={{ width: "100%", display: "block", borderRadius: "12px" }} alt="uploaded" />
                </div>
              </div>
            )}
            {m.r === "a" && (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ position: "relative", width: "28px", height: "28px", flexShrink: 0, marginTop: "2px" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#00ff88,#00ccff)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
                  <div style={{ position: "absolute", inset: "4px", background: "#0d0d0d", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: "9px", color: "#00ff88" }}>Z</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>Zeirax</span>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#00ff88", background: "#00ff8815", border: "1px solid #00ff8825", padding: "2px 8px", borderRadius: "10px" }}>AI</span>
                  </div>
                  <div className="ai-text" dangerouslySetInnerHTML={{ __html: renderMd(m.c) }} />
                  <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                    <button onClick={() => copyText(m.c)} style={{ background: "none", border: "1px solid #1e1e1e", color: "#444", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Inter'" }}>Copy</button>
                    <button style={{ background: "none", border: "1px solid #1e1e1e", color: "#444", fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Inter'" }}>Share</button>
                  </div>
                </div>
              </div>
            )}
            {m.r === "e" && (
              <div style={{ background: "#100808", border: "1px solid #2a1010", padding: "12px 16px", borderRadius: "8px", color: "#ff5555", fontSize: "14px" }}>⚠ {m.c}</div>
            )}
          </div>
        ))}

        {busy && (
          <div className="msg" style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ position: "relative", width: "28px", height: "28px", flexShrink: 0, marginTop: "2px" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#00ff88,#00ccff)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
              <div style={{ position: "absolute", inset: "4px", background: "#0d0d0d", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: "9px", color: "#00ff88" }}>Z</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>Zeirax</span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "#00ff88", background: "#00ff8815", border: "1px solid #00ff8825", padding: "2px 8px", borderRadius: "10px" }}>AI</span>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "4px 0" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00ff88", animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 14px 22px", background: "#0d0d0d", borderTop: "1px solid #141414" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
          <button onClick={() => setShowPlus(p => !p)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: showPlus ? "#00ff8820" : "#1a1a1a", border: showPlus ? "1px solid #00ff8840" : "none", cursor: "pointer", color: showPlus ? "#00ff88" : "#fff", fontSize: "22px", fontWeight: "300", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>+</button>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "8px", background: "#1a1a1a", borderRadius: "24px", padding: "10px 10px 10px 16px" }}>
            <textarea
              ref={taRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
              placeholder="Ask anything..."
              rows={1}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: "15px", fontWeight: "400", resize: "none", fontFamily: "'Inter',sans-serif", lineHeight: "1.5", caretColor: "#00ff88", maxHeight: "100px", overflow: "auto" }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
            />
            <button onClick={() => ask()} disabled={busy || !input.trim()} style={{ width: "34px", height: "34px", flexShrink: 0, background: busy || !input.trim() ? "#222" : "linear-gradient(135deg,#00ff88,#00ccff)", border: "none", borderRadius: "50%", cursor: busy || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: busy || !input.trim() ? "#333" : "#000", fontWeight: "800", transition: "all .2s" }}>↑</button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "8px", fontSize: "10px", fontWeight: "600", color: "#161616", letterSpacing: ".04em" }}>ZEIRAX · AI RESEARCH ENGINE</div>
      </div>

      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleImg} />
      <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
    </div>
  );
  }
