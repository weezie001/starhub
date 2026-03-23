import { useState, useEffect, useRef } from "react";
import { G, fmtTime, fmtDate } from "../../lib/tokens.js";
import { Badge, Btn } from "../../components/ui.jsx";
import { WS_URL } from "../../lib/tokens.js";
import { api } from "../../api.js";

const STATUS_COLORS = {
  waiting: G.amber, active: G.green, closed: G.dim,
};

// Map backend DB session row → display shape
function mapSession(s) {
  return {
    ...s,
    name: s.customerName || s.name || "Unknown",
    email: s.customerEmail || s.email || "",
    lastMsg: s.lastMessage || s.lastMsg || "",
  };
}

// Map backend message row → display shape
// Backend DB rows use senderRole; WS envelope messages may use role
function mapMsg(m) {
  const role = m.senderRole || m.role || "customer";
  return {
    from: role === "agent" ? "agent" : role === "system" ? "system" : "customer",
    text: m.content || m.text || "",
    timestamp: m.ts || m.timestamp || Date.now(),
  };
}

function SessionItem({ session, isActive, onClick, unread }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left",
      background: isActive ? `${G.gold}10` : "none",
      border: `1px solid ${isActive ? G.gold + "40" : "transparent"}`,
      borderRadius: 10, padding: "12px 14px", cursor: "pointer",
      transition: "all 0.2s", marginBottom: 6,
    }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = G.s2; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "none"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[session.status] || G.dim, flexShrink: 0 }} />
          <span style={{ color: G.text, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.name}
          </span>
        </div>
        {unread > 0 && (
          <span style={{ background: G.red, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 50, padding: "2px 7px", flexShrink: 0 }}>
            {unread}
          </span>
        )}
      </div>
      <div style={{ color: G.dim, fontSize: 11, marginBottom: 4, paddingLeft: 16 }}>{session.email}</div>
      {session.lastMsg && (
        <div style={{ color: G.muted, fontSize: 11, paddingLeft: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {session.lastMsg}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 16, marginTop: 4 }}>
        <Badge color={STATUS_COLORS[session.status] || G.dim} style={{ fontSize: 9, padding: "2px 8px" }}>
          {session.status?.toUpperCase()}
        </Badge>
        {session.topic && <span style={{ color: G.dim, fontSize: 10 }}>{session.topic}</span>}
      </div>
    </button>
  );
}

export default function ConciergeInbox({ user }) {
  const [sessions, setSessions] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState("chat");
  const [wsConnected, setWsConnected] = useState(false);
  const [typingCustomer, setTypingCustomer] = useState(false);
  const [unreadMap, setUnreadMap] = useState({});
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const activeIdRef = useRef(null);
  activeIdRef.current = activeSessionId;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingCustomer]);

  useEffect(() => {
    let cancelled = false;
    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      if (cancelled) { socket.close(); return; }
      setWsConnected(true);
      // agent_join requires a valid JWT token
      const token = (() => { try { return JSON.parse(localStorage.getItem("sb_user") || "{}").token || ""; } catch { return ""; } })();
      socket.send(JSON.stringify({ type: "agent_join", token }));
    };

    socket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        // Initial session list after agent_join
        if (msg.type === "agent_init") {
          setSessions((msg.sessions || []).map(mapSession));
        }

        // Refresh session list response
        if (msg.type === "sessions_list") {
          setSessions((msg.sessions || []).map(mapSession));
        }

        // New session from a customer
        if (msg.type === "new_session") {
          const newSession = mapSession(msg.session || { id: msg.sessionId, customerName: msg.customerName, status: "waiting", topic: msg.topic });
          setSessions(prev => {
            const exists = prev.find(s => s.id === newSession.id);
            return exists ? prev : [newSession, ...prev];
          });
        }

        // Session claimed confirmation (includes full history)
        if (msg.type === "session_claimed") {
          const { sessionId: sid, history } = msg;
          setSessions(prev => prev.map(s => s.id === sid ? { ...s, status: "active" } : s));
          if (activeIdRef.current === sid) {
            setMessages((history || []).map(mapMsg));
          }
        }

        // Inbound message
        if (msg.type === "message") {
          const m = msg.message || msg;
          const sid = m.sessionId || msg.sessionId;
          const mapped = mapMsg(m);
          setSessions(prev => prev.map(s => s.id === sid ? { ...s, lastMsg: mapped.text } : s));
          if (sid === activeIdRef.current) {
            setMessages(prev => [...prev, mapped]);
            setTypingCustomer(false);
          } else if (mapped.from !== "agent") {
            setUnreadMap(prev => ({ ...prev, [sid]: (prev[sid] || 0) + 1 }));
          }
        }

        // Message echo (our own sent message)
        if (msg.type === "message_sent") {
          const m = msg.message || msg;
          const mapped = mapMsg(m);
          // Already added optimistically; update with server ts if needed
        }

        // Typing indicator
        if (msg.type === "typing" && msg.from === "customer") {
          if (msg.sessionId === activeIdRef.current || !msg.sessionId) {
            setTypingCustomer(true);
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => setTypingCustomer(false), 3000);
          }
        }

        // Session closed
        if (msg.type === "session_closed" || msg.type === "session_updated") {
          const sid = msg.sessionId;
          if (sid) setSessions(prev => prev.map(s => s.id === sid ? { ...s, status: msg.status || "closed" } : s));
        }

        // Session reclaimed (another agent)
        if (msg.type === "session_claimed_by_other") {
          setSessions(prev => prev.map(s => s.id === msg.sessionId ? { ...s, status: "active", agentName: msg.agentName } : s));
        }

        // Customer disconnected notification
        if (msg.type === "customer_disconnected") {
          setSessions(prev => prev.map(s => s.id === msg.sessionId ? { ...s, lastMsg: "(Customer disconnected)" } : s));
        }
      } catch {}
    };

    socket.onclose = () => { if (!cancelled) setWsConnected(false); };

    api.getAdminWaitlist().then(setWaitlist).catch(() => {});

    return () => {
      cancelled = true;
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [user]);

  async function openSession(session) {
    setActiveSessionId(session.id);
    setUnreadMap(prev => ({ ...prev, [session.id]: 0 }));
    // Load history via REST
    try {
      const data = await api.getChatHistory(session.id);
      setMessages((data.messages || []).map(mapMsg));
    } catch {
      setMessages([]);
    }
  }

  function claimSession(sessionId) {
    if (ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "claim_session", sessionId }));
  }

  function sendMessage() {
    if (!input.trim() || !activeSessionId) return;
    if (ws.current?.readyState !== WebSocket.OPEN) return;
    const text = input.trim();
    ws.current.send(JSON.stringify({ type: "message", sessionId: activeSessionId, content: text }));
    // Optimistic message
    setMessages(prev => [...prev, { from: "agent", text, timestamp: Date.now() }]);
    setInput("");
  }

  function closeSession(sessionId) {
    if (ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "close_session", sessionId }));
  }

  function refreshSessions() {
    if (ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "get_sessions" }));
  }

  async function attendToEntry(entry) {
    try {
      await api.updateWaitlistStatus(entry.id, "attending");
      setWaitlist(prev => prev.map(w => w.id === entry.id ? { ...w, status: "attending" } : w));
    } catch {}
    // Switch to chat tab
    setTab("chat");
    // Try to find existing chat session matching this customer's email
    const match = sessions.find(s =>
      s.email === entry.email && s.status !== "closed"
    );
    if (match) {
      openSession(match);
    }
    // If no match yet, agent waits in the chat tab for the customer to open SupportChat
  }

  async function updateWaitlistStatus(id, status) {
    try {
      await api.updateWaitlistStatus(id, status);
      setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    } catch {}
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const waitingCount = sessions.filter(s => s.status === "waiting").length;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 220px)", minHeight: 520, gap: 0, border: `1px solid ${G.border}`, borderRadius: 14, overflow: "hidden" }}>

      {/* ── LEFT: Sessions list ── */}
      <div style={{ width: 260, flexShrink: 0, background: G.s1, borderRight: `1px solid ${G.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${G.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: G.text, fontWeight: 700, fontSize: 14, fontFamily: G.serif }}>Live Queue</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={refreshSessions} title="Refresh" style={{ background: "none", border: "none", color: G.dim, cursor: "pointer", fontSize: 14, padding: 0 }}>↻</button>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: wsConnected ? G.green : G.red }} />
              <span style={{ color: G.dim, fontSize: 10 }}>{wsConnected ? "Live" : "Offline"}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[["chat", "💬 Chat"], ["waitlist", "📋 Waitlist"]].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? G.gold + "18" : "none", border: `1px solid ${tab === t ? G.gold + "40" : G.border}`, borderRadius: 8, padding: "7px 0", color: tab === t ? G.gold : G.muted, fontSize: 11, cursor: "pointer", fontFamily: G.sans, fontWeight: tab === t ? 700 : 400, transition: "all 0.2s" }}>
                {l}
              </button>
            ))}
          </div>
          {tab === "chat" && waitingCount > 0 && (
            <div style={{ background: G.amber + "18", border: `1px solid ${G.amber}30`, borderRadius: 8, padding: "7px 12px", marginTop: 8 }}>
              <span style={{ color: G.amber, fontSize: 11, fontWeight: 700 }}>{waitingCount} waiting for agent</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {tab === "chat" && (
            sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px", color: G.dim }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
                <div style={{ fontSize: 12 }}>No active sessions yet</div>
              </div>
            ) : (
              sessions.map(s => (
                <SessionItem key={s.id} session={s} isActive={s.id === activeSessionId}
                  onClick={() => openSession(s)} unread={unreadMap[s.id] || 0} />
              ))
            )
          )}
          {tab === "waitlist" && (
            waitlist.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px", color: G.dim }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 12 }}>No waitlist entries</div>
              </div>
            ) : (
              waitlist.map(w => (
                <div key={w.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ color: G.text, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{w.name}</div>
                  <div style={{ color: G.dim, fontSize: 11, marginBottom: 4 }}>{w.email}</div>
                  {w.eventType && <div style={{ color: G.muted, fontSize: 11, marginBottom: 6 }}>{w.eventType}</div>}
                  <Badge color={w.status === "waiting" ? G.amber : w.status === "attending" ? G.green : w.status === "done" ? G.gold : G.dim} style={{ fontSize: 9 }}>
                    {w.status?.toUpperCase()}
                  </Badge>
                  {w.status === "waiting" && (
                    <Btn onClick={() => attendToEntry(w)} variant="green" style={{ width: "100%", padding: "6px 0", fontSize: 10, marginTop: 8 }}>Attend Now →</Btn>
                  )}
                  {w.status === "attending" && (
                    <Btn onClick={() => { setTab("chat"); const m = sessions.find(s => s.email === w.email && s.status !== "closed"); if (m) openSession(m); }} variant="ghost" style={{ width: "100%", padding: "6px 0", fontSize: 10, marginTop: 8 }}>Open Chat →</Btn>
                  )}
                  {w.status === "attending" && (
                    <Btn onClick={() => updateWaitlistStatus(w.id, "done")} variant="danger" style={{ width: "100%", padding: "6px 0", fontSize: 10, marginTop: 8 }}>Mark Done</Btn>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* ── CENTER: Chat thread ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: G.bg, minWidth: 0 }}>
        {activeSession ? (
          <>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${G.border}`, background: G.s1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: G.gold + "20", border: `1px solid ${G.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                <div>
                  <div style={{ color: G.text, fontWeight: 700, fontSize: 14 }}>{activeSession.name}</div>
                  <div style={{ color: G.dim, fontSize: 11 }}>{activeSession.email} • {activeSession.topic || "General"}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {activeSession.status === "waiting" && (
                  <Btn onClick={() => claimSession(activeSession.id)} variant="green" style={{ padding: "7px 16px", fontSize: 11 }}>Claim Session</Btn>
                )}
                {activeSession.status === "active" && (
                  <Btn onClick={() => closeSession(activeSession.id)} variant="danger" style={{ padding: "7px 16px", fontSize: 11 }}>End Session</Btn>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: G.dim, fontSize: 13, padding: "40px 0" }}>
                  No messages yet.
                </div>
              )}
              {messages.map((m, i) => (
                m.from === "system" ? (
                  <div key={i} style={{ textAlign: "center" }}>
                    <span style={{ color: G.dim, fontSize: 11, background: G.s1, padding: "4px 12px", borderRadius: 20 }}>{m.text}</span>
                  </div>
                ) : (
                  <div key={i} style={{ display: "flex", justifyContent: m.from === "agent" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: m.from === "agent" ? "flex-end" : "flex-start", gap: 3 }}>
                      <div style={{ background: m.from === "agent" ? `linear-gradient(135deg,${G.gold},${G.goldD})` : G.s1, color: m.from === "agent" ? "#261900" : G.text, padding: "10px 14px", borderRadius: m.from === "agent" ? "14px 14px 2px 14px" : "14px 14px 14px 2px", fontSize: 13, lineHeight: 1.6, border: m.from !== "agent" ? `1px solid ${G.border}` : "none" }}>
                        {m.text}
                      </div>
                      <span style={{ color: G.dim, fontSize: 10 }}>{fmtTime(m.timestamp)}</span>
                    </div>
                  </div>
                )
              ))}
              {typingCustomer && (
                <div style={{ display: "flex", alignSelf: "flex-start", background: G.s1, padding: "10px 14px", borderRadius: "14px 14px 14px 2px", border: `1px solid ${G.border}`, gap: 4, alignItems: "center" }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {activeSession.status === "active" ? (
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${G.border}`, background: G.s1, display: "flex", gap: 10 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type a message..." style={{ flex: 1, background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 14px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans }} />
                <Btn onClick={sendMessage} style={{ padding: "0 22px", borderRadius: 10, flexShrink: 0 }}>Send</Btn>
              </div>
            ) : (
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${G.border}`, background: G.s1, textAlign: "center" }}>
                {activeSession.status === "waiting" ? (
                  <Btn onClick={() => claimSession(activeSession.id)} variant="green" style={{ padding: "12px 32px" }}>Claim Session to Start Chatting</Btn>
                ) : (
                  <span style={{ color: G.dim, fontSize: 13 }}>Session closed</span>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{ fontSize: 52 }}>💬</div>
            <div style={{ color: G.text, fontSize: 18, fontFamily: G.serif, fontWeight: 700 }}>Concierge Inbox</div>
            <div style={{ color: G.muted, fontSize: 13, textAlign: "center", maxWidth: 300, lineHeight: 1.7 }}>Select a session from the left to start chatting with a customer in real-time.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: G.s1, border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 16px", marginTop: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: wsConnected ? G.green : G.red }} />
              <span style={{ color: G.muted, fontSize: 11 }}>{wsConnected ? "Live connection active" : "Connecting..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Customer details ── */}
      <div style={{ width: 240, flexShrink: 0, background: G.s1, borderLeft: `1px solid ${G.border}`, padding: "20px 16px", overflowY: "auto" }}>
        {activeSession ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${G.gold}30,${G.goldD}20)`, border: `1px solid ${G.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px" }}>👤</div>
              <div style={{ color: G.text, fontWeight: 700, fontSize: 15, fontFamily: G.serif }}>{activeSession.name}</div>
              <div style={{ color: G.dim, fontSize: 11, marginTop: 4 }}>{activeSession.email}</div>
            </div>

            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "14px 12px", marginBottom: 16 }}>
              {[
                ["Status", activeSession.status],
                ["Topic", activeSession.topic || "General"],
                ["Started", activeSession.createdAt ? fmtDate(activeSession.createdAt) : "—"],
                ["Messages", messages.filter(m => m.from !== "system").length],
                ...(activeSession.agentName ? [["Agent", activeSession.agentName]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${G.border}` }}>
                  <span style={{ color: G.dim, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{k}</span>
                  <span style={{ color: G.text, fontSize: 11, fontWeight: 600 }}>{String(v)}</span>
                </div>
              ))}
            </div>

            <div style={{ color: G.muted, fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>Quick Replies</div>
            {[
              "Thank you for your patience. Looking into this now.",
              "I'll connect you with the right team member shortly.",
              "Your booking has been confirmed. We'll follow up within 24h.",
              "Is there anything else I can help you with?",
            ].map(reply => (
              <button key={reply} onClick={() => setInput(reply)} style={{ width: "100%", background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 10px", color: G.muted, fontSize: 11, cursor: "pointer", textAlign: "left", marginBottom: 6, fontFamily: G.sans, lineHeight: 1.5, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = G.gold + "40"; e.currentTarget.style.color = G.text; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}>
                {reply}
              </button>
            ))}
          </>
        ) : (
          <div style={{ textAlign: "center", color: G.dim, fontSize: 12, paddingTop: 60 }}>
            Select a session to see customer details
          </div>
        )}
      </div>
    </div>
  );
}
