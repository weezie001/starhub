import { useState, useEffect, useRef, useCallback } from "react";
import { G, WS_URL, fmtTime } from "../lib/tokens.js";
import { Btn, Input } from "./ui.jsx";

const SESSION_KEY = "sb_chat_session";
const TOPICS = ["General Inquiry", "Celebrity Booking", "Pricing & Packages", "VIP Fan Card", "Event Planning", "Technical Support"];

export default function SupportChat({ user }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("idle"); // idle | prechat | connecting | waiting | active | ended
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", topic: "" });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState(null);
  const [agentName, setAgentName] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [wsStatus, setWsStatus] = useState("disconnected"); // disconnected | connecting | connected

  const ws = useRef(null);
  const sessionIdRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectAttempts = useRef(0);
  const intentionalClose = useRef(false);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Clear unread when panel is open
  useEffect(() => { if (open) setUnread(0); }, [open]);

  // Update form when user prop changes
  useEffect(() => {
    setForm(f => ({ ...f, name: user?.name || f.name, email: user?.email || f.email }));
  }, [user?.name, user?.email]);

  const connect = useCallback((existingSessionId, name, email, topic) => {
    // Don't reconnect if already open/connecting
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) return;

    intentionalClose.current = false;
    setWsStatus("connecting");
    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      setWsStatus("connected");
      reconnectAttempts.current = 0;
      if (existingSessionId) {
        socket.send(JSON.stringify({ type: "customer_join", existingSessionId, name, email }));
      } else {
        socket.send(JSON.stringify({ type: "customer_join", name, email, topic: topic || "General Inquiry" }));
      }
    };

    socket.onmessage = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch { return; }

      switch (msg.type) {
        case "session_created":
          sessionIdRef.current = msg.sessionId;
          setPosition(msg.position);
          setStage("waiting");
          localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId: msg.sessionId, name, email }));
          break;

        case "session_rejoined": {
          const s = msg.session;
          sessionIdRef.current = s.id;
          const history = (msg.history || []).map(normalizeMsg);
          setMessages(history);
          setStage(s.status === "active" ? "active" : "waiting");
          if (s.agentName) setAgentName(s.agentName);
          break;
        }

        case "queue_update":
          setPosition(msg.position);
          break;

        case "agent_joined":
          setAgentName(msg.agentName);
          setStage("active");
          setPosition(null);
          break;

        case "agent_left":
          setAgentName(null);
          setStage("waiting");
          addSystemMsg("Agent disconnected. You'll be reconnected to a new agent shortly.");
          break;

        case "message": {
          const m = normalizeMsg(msg.message);
          setMessages(prev => prev.find(x => x.id === m.id) ? prev : [...prev, m]);
          if (!open) setUnread(n => n + 1);
          setIsTyping(false);
          break;
        }

        case "message_sent": {
          const m = normalizeMsg(msg.message);
          // Replace any optimistic messages and add server-confirmed one
          setMessages(prev => {
            const filtered = prev.filter(x => !String(x.id).startsWith("opt-"));
            return filtered.find(x => x.id === m.id) ? filtered : [...filtered, m];
          });
          break;
        }

        case "typing":
          setIsTyping(true);
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
          break;

        case "session_closed":
          setStage("ended");
          localStorage.removeItem(SESSION_KEY);
          break;
      }
    };

    socket.onclose = () => {
      setWsStatus("disconnected");
      if (intentionalClose.current) return;
      // Auto-reconnect with backoff (max 3 attempts)
      if (reconnectAttempts.current >= 3) return;
      const saved = localStorage.getItem(SESSION_KEY);
      if (!saved) return;
      reconnectAttempts.current++;
      const delay = reconnectAttempts.current * 2000;
      reconnectTimer.current = setTimeout(() => {
        const { sessionId: sid, name: n, email: e } = JSON.parse(saved);
        connect(sid, n, e, "");
      }, delay);
    };

    socket.onerror = () => setWsStatus("disconnected");
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    intentionalClose.current = true;
    clearTimeout(reconnectTimer.current);
    clearTimeout(typingTimer.current);
    ws.current?.close();
  }, []);

  function normalizeMsg(m) {
    return { id: m.id, sessionId: m.sessionId, role: m.senderRole || m.role, name: m.senderName || m.name, text: m.content || m.text || "", ts: m.ts || m.timestamp };
  }

  function addSystemMsg(text) {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "system", text, ts: new Date().toISOString() }]);
  }

  function openChat() {
    setOpen(true);
    // If already in an active stage with open WS, just show panel
    if (ws.current?.readyState === WebSocket.OPEN && (stage === "waiting" || stage === "active")) return;
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      const { sessionId: sid, name, email } = JSON.parse(saved);
      setForm(f => ({ ...f, name, email }));
      setStage("connecting");
      connect(sid, name, email, "");
    } else {
      setStage("prechat");
    }
  }

  function startChat() {
    if (!form.name.trim() || !form.email.trim()) return;
    setStage("connecting");
    connect(null, form.name.trim(), form.email.trim(), form.topic || "General Inquiry");
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "message", content: text }));
    // Optimistic display
    setMessages(prev => [...prev, { id: `opt-${Date.now()}`, role: "customer", text, ts: new Date().toISOString() }]);
    setInput("");
  }

  function handleInputKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    // Send typing indicator
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "typing" }));
    }
  }

  function endSession() {
    intentionalClose.current = true;
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "close_session" }));
    }
    localStorage.removeItem(SESSION_KEY);
    setStage("ended");
  }

  function resetChat() {
    intentionalClose.current = true;
    ws.current?.close();
    setStage("prechat");
    setMessages([]);
    sessionIdRef.current = null;
    setAgentName(null);
    setPosition(null);
    setForm({ name: user?.name || "", email: user?.email || "", topic: "" });
    localStorage.removeItem(SESSION_KEY);
  }

  const showEnd = stage === "waiting" || stage === "active";
  const isConnected = wsStatus === "connected";

  return (
    <>
      {/* Floating button */}
      <button onClick={() => open ? setOpen(false) : openChat()} style={{
        position: "fixed", bottom: 28, right: 28,
        width: 58, height: 58, borderRadius: "50%",
        background: `linear-gradient(135deg,${G.gold},${G.goldD})`,
        border: "none", cursor: "pointer", zIndex: 900,
        boxShadow: `0 4px 24px ${G.gold}50`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, transition: "transform 0.3s",
        transform: open ? "rotate(45deg)" : "none",
      }}>
        {open ? "✕" : "💬"}
        {unread > 0 && !open && (
          <span style={{ position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: G.red, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${G.bg}` }}>{unread}</span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{ position: "fixed", bottom: 100, right: 28, width: 380, height: 560, background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, display: "flex", flexDirection: "column", zIndex: 900, boxShadow: "0 24px 64px #000000cc", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ padding: "14px 18px", background: G.s1, borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${G.gold}20`, border: `1px solid ${G.gold}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👩‍💼</div>
                <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: isConnected ? G.green : G.amber, border: `2px solid ${G.s1}` }} />
              </div>
              <div>
                <div style={{ color: G.text, fontWeight: 700, fontSize: 14 }}>{agentName || "StarBook Concierge"}</div>
                <div style={{ color: isConnected ? G.green : G.amber, fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  {stage === "active" ? `${agentName || "Agent"} · Active Now` : stage === "waiting" ? "In Queue · Waiting" : stage === "connecting" ? "Connecting..." : "Online · Typically replies instantly"}
                </div>
              </div>
            </div>
            {showEnd && (
              <button onClick={endSession} style={{ background: G.red + "15", border: `1px solid ${G.red}30`, borderRadius: 50, padding: "5px 14px", color: G.red, cursor: "pointer", fontSize: 11, fontFamily: G.sans, fontWeight: 600 }}>
                End
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* PRE-CHAT */}
            {stage === "idle" || stage === "prechat" ? (
              <div style={{ flex: 1, padding: "20px 20px", overflowY: "auto" }}>
                <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                  Connect with a live concierge agent for booking help, VIP inquiries, and exclusive assistance.
                </p>
                <Input label="Your Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                <Input label="Email Address *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="your@email.com" />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: G.muted, fontSize: 11, letterSpacing: 0.8, display: "block", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Topic</label>
                  <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} style={{ width: "100%", background: G.s2, border: `1px solid ${G.border}`, borderRadius: 8, padding: "10px 12px", color: form.topic ? G.text : G.dim, fontSize: 13, outline: "none", fontFamily: G.sans }}>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <Btn onClick={startChat} full disabled={!form.name.trim() || !form.email.trim()} style={{ padding: "13px 0", fontSize: 12 }}>
                  Start Conversation →
                </Btn>
              </div>
            ) : null}

            {/* CONNECTING */}
            {stage === "connecting" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: G.gold, animation: `chatPulse 1.2s ${i*0.2}s infinite ease-in-out` }} />)}
                </div>
                <div style={{ color: G.muted, fontSize: 13 }}>Connecting to support...</div>
              </div>
            )}

            {/* WAITING */}
            {stage === "waiting" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
                <div style={{ margin: "16px 16px 8px", background: G.s2, border: `1px solid ${G.border}`, borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ color: G.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Queue Position</div>
                  <div style={{ color: G.gold, fontSize: 52, fontWeight: 800, fontFamily: G.serif, lineHeight: 1 }}>
                    {position != null ? `#${position}` : "—"}
                  </div>
                  <div style={{ color: G.muted, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
                    {position === 1 ? "You're next! An agent will join shortly." : position ? `${position - 1} ${position - 1 === 1 ? "person" : "people"} ahead of you.` : "Waiting for a position update..."}
                  </div>
                  <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 14 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: G.gold, animation: `chatPulse 1.4s ${i*0.25}s infinite` }} />)}
                  </div>
                </div>
                <div ref={scrollRef} style={{ flex: 1, padding: "0 14px 14px", overflowY: "auto" }}>
                  {messages.filter(m => m.role === "system").map((m, i) => (
                    <div key={m.id || i} style={{ textAlign: "center", marginBottom: 8 }}>
                      <span style={{ background: G.s2, border: `1px solid ${G.border}`, borderRadius: 50, padding: "4px 14px", color: G.muted, fontSize: 11, display: "inline-block" }}>{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIVE CHAT */}
            {stage === "active" && (
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m, i) => {
                  if (m.role === "system") return (
                    <div key={m.id || i} style={{ textAlign: "center" }}>
                      <span style={{ background: G.s2, border: `1px solid ${G.border}`, borderRadius: 50, padding: "4px 14px", color: G.muted, fontSize: 11, display: "inline-block" }}>{m.text}</span>
                    </div>
                  );
                  const isMe = m.role === "customer";
                  return (
                    <div key={m.id || i} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                      {!isMe && m.name && <div style={{ color: G.gold, fontSize: 10, fontWeight: 700, marginBottom: 3, letterSpacing: 0.5 }}>{m.name}</div>}
                      <div style={{ background: isMe ? `linear-gradient(135deg,${G.gold},${G.goldD})` : G.s2, color: isMe ? "#261900" : G.text, padding: "10px 14px", maxWidth: "82%", borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px", fontSize: 13, lineHeight: 1.65, border: isMe ? "none" : `1px solid ${G.border}` }}>
                        {m.text}
                      </div>
                      <div style={{ color: G.dim, fontSize: 10, marginTop: 3 }}>{fmtTime(m.ts)}</div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px", background: G.s2, border: `1px solid ${G.border}`, borderRadius: "14px 14px 14px 2px", alignSelf: "flex-start" }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: G.muted, animation: `chatPulse 1.2s ${i*0.15}s infinite` }} />)}
                  </div>
                )}
              </div>
            )}

            {/* ENDED */}
            {stage === "ended" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 40 }}>✅</div>
                <div style={{ color: G.text, fontWeight: 700, fontSize: 15, fontFamily: G.serif }}>Session Ended</div>
                <div style={{ color: G.muted, fontSize: 13, lineHeight: 1.7 }}>Thank you for contacting StarBook.<br />We hope we could help!</div>
                <Btn onClick={resetChat} variant="outline" style={{ padding: "10px 24px", fontSize: 12 }}>New Conversation</Btn>
              </div>
            )}
          </div>

          {/* Input — only when active */}
          {stage === "active" && (
            <div style={{ padding: "10px 12px", borderTop: `1px solid ${G.border}`, background: G.s1, display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleInputKey} placeholder="Type a message..." style={{ flex: 1, background: G.s2, border: `1px solid ${G.border}`, borderRadius: 50, padding: "10px 16px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans }} />
              <button onClick={sendMessage} disabled={!input.trim()} style={{ width: 38, height: 38, borderRadius: "50%", background: input.trim() ? `linear-gradient(135deg,${G.gold},${G.goldD})` : G.s2, border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, transition: "all 0.2s" }}>
                ➤
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes chatPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}
