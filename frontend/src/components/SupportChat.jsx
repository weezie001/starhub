import { useState, useEffect, useRef, useCallback } from "react";
import { G, WS_URL, fmtTime } from "../lib/tokens.js";
import { api } from "../api.js";

// ── File preview lightbox ────────────────────────────────────────────────────
function FilePreviewModal({ file, onClose }) {
  useEffect(() => {
    if (!file) return;
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, file]);
  if (!file) return null;
  const isPDF = file.name?.toLowerCase().endsWith(".pdf") || (file.data || "").startsWith("data:application/pdf");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000e0", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "hsl(var(--card))", borderRadius: 16, overflow: "hidden", maxWidth: "92vw", maxHeight: "90vh", display: "flex", flexDirection: "column", minWidth: 320 }}>
        <div style={{ padding: "12px 16px", background: "hsl(var(--secondary))", borderBottom: "1px solid hsl(var(--border))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ color: "hsl(var(--foreground))", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file._ft === "img" ? "🖼" : "📄"} {file.name}
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <a href={file.data} download={file.name} style={{ color: "hsl(var(--primary))", fontSize: 12, textDecoration: "none", fontWeight: 700, background: "hsl(var(--primary)/0.1)", border: "1px solid hsl(var(--primary)/0.3)", borderRadius: 50, padding: "4px 12px" }}>⬇ Download</a>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "hsl(var(--muted-foreground))", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 260, background: "hsl(var(--background))" }}>
          {file._ft === "img" ? (
            <img src={file.data} alt={file.name} style={{ maxWidth: "88vw", maxHeight: "76vh", objectFit: "contain", borderRadius: 4 }} />
          ) : isPDF ? (
            <iframe src={file.data} title={file.name} style={{ width: "80vw", height: "74vh", border: "none" }} />
          ) : (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📄</div>
              <div style={{ color: "hsl(var(--foreground))", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{file.name}</div>
              <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Preview not available for this file type.<br />Click download to open it locally.</div>
              <a href={file.data} download={file.name} style={{ background: `linear-gradient(45deg,${G.gold},${G.goldD})`, color: "#261900", padding: "11px 28px", borderRadius: 50, fontSize: 13, fontWeight: 800, textDecoration: "none", display: "inline-block" }}>⬇ Download File</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── File/image renderer ───────────────────────────────────────────────────────
function renderContent(text, onPreview) {
  try {
    const obj = JSON.parse(text);
    if (obj._ft === "img") return (
      <div>
        <img src={obj.data} alt={obj.name} onClick={() => onPreview?.(obj)} style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, display: "block", marginBottom: 4, cursor: "pointer" }} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => onPreview?.(obj)} style={{ background: "none", border: "none", color: "inherit", opacity: 0.7, cursor: "pointer", fontSize: 10, padding: 0, fontFamily: "inherit", textDecoration: "underline" }}>👁 View</button>
          <a href={obj.data} download={obj.name} style={{ fontSize: 10, color: "inherit", opacity: 0.7, textDecoration: "underline" }}>⬇ Download</a>
        </div>
      </div>
    );
    if (obj._ft === "doc") return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => onPreview?.(obj)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "inherit", textDecoration: "underline", flex: 1, textAlign: "left" }}>📎 {obj.name}</button>
        <a href={obj.data} download={obj.name} style={{ fontSize: 10, color: "inherit", opacity: 0.7, textDecoration: "none", flexShrink: 0 }}>⬇</a>
      </div>
    );
  } catch {}
  return text;
}

// ── Rich card renderers ───────────────────────────────────────────────────────
function CelebCard({ c, onNavigate }) {
  return (
    <div style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
      {c.img ? (
        <img src={c.img} alt={c.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0, filter: "grayscale(40%)" }} onError={e => { e.target.style.display = "none"; }} />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${G.gold}20`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌟</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "hsl(var(--foreground))", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.flag} {c.name}</div>
        <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 10, textTransform: "capitalize" }}>{c.cat} · from ${c.price?.toLocaleString()}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 50, background: c.avail ? `${G.green}25` : `${G.red}20`, color: c.avail ? G.green : G.red, border: `1px solid ${c.avail ? G.green : G.red}40` }}>
          {c.avail ? "Available" : "Booked"}
        </span>
        {c.avail && (
          <button onClick={onNavigate} style={{ background: `linear-gradient(45deg,${G.gold},${G.goldD})`, color: "#261900", border: "none", borderRadius: 50, padding: "3px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: G.sans }}>Book →</button>
        )}
      </div>
    </div>
  );
}

function BookingCard({ b }) {
  const statusColor = { pending: G.amber, approved: G.green, declined: G.red, confirmed: G.green }[b.status] || G.muted;
  const celebName = b.celeb?.name || b.celebData?.name || "Unknown";
  const amount = b.amount ? `$${Number(b.amount).toLocaleString()}` : "";
  const date = b.date ? new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <div style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ color: "hsl(var(--foreground))", fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>🌟 {celebName}</div>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 50, background: statusColor + "25", color: statusColor, border: `1px solid ${statusColor}40`, flexShrink: 0, marginLeft: 6, textTransform: "capitalize" }}>{b.status}</span>
      </div>
      <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 10, textTransform: "capitalize" }}>{(b.type || b.bookingType || "").replace(/_/g, " ")} {amount && `· ${amount}`} {date && `· ${date}`}</div>
    </div>
  );
}

function BlogCard({ blog, onNavigate }) {
  return (
    <div onClick={onNavigate} style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: "10px 12px", cursor: "pointer", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = G.gold + "50"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "hsl(var(--border))"}>
      <div style={{ color: "hsl(var(--primary))", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{blog.category}</div>
      <div style={{ color: "hsl(var(--foreground))", fontWeight: 700, fontSize: 12, marginBottom: 4, lineHeight: 1.4 }}>{blog.title}</div>
      <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 10, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{blog.excerpt}</div>
    </div>
  );
}

// ── Intent detection ──────────────────────────────────────────────────────────
const INTENTS = [
  { name: "my_bookings",  re: /\b(my booking|bookings|track|order|status|reservation)\b/i },
  { name: "search_celeb", re: /\b(find|search|show|who|list|browse|celeb|celebrity|celebrities|actor|musician|athlete|sport|influencer|royalt)\b/i },
  { name: "availability", re: /\b(available|free|who can i book|who.?s available|open)\b/i },
  { name: "pricing",      re: /\b(price|cost|how much|fee|rate|charge|expensive|cheap|afford)\b/i },
  { name: "waitlist",     re: /\b(waitlist|wait list|concierge|join|sign up|register)\b/i },
  { name: "blog",         re: /\b(blog|article|read|tip|journal|guide|advice|news)\b/i },
  { name: "navigate",     re: /\b(go to|open|take me|navigate|visit|show page|dashboard|home|celebrities page|about|contact)\b/i },
  { name: "live_agent",   re: /\b(agent|human|live|support|person|representative|operator|real|staff|help|talk)\b/i },
];

function detectIntent(text) {
  for (const { name, re } of INTENTS) {
    if (re.test(text)) return name;
  }
  return null;
}

const MAIN_MENU_OPTIONS = [
  { label: "🔍 Search Celebrities", intent: "search_celeb" },
  { label: "📅 Who's Available?", intent: "availability" },
  { label: "💰 Pricing Info", intent: "pricing" },
  { label: "📦 My Bookings", intent: "my_bookings" },
  { label: "📋 Join Waitlist", intent: "waitlist" },
  { label: "📰 Blog & Articles", intent: "blog" },
  { label: "💬 Talk to a Live Agent", intent: "live_agent" },
];

const SESSION_KEY = "sb_chat_session";

// ── Waitlist flow steps ───────────────────────────────────────────────────────
const WL_STEPS = ["name", "email", "eventType", "preferredDate", "budget"];
const WL_PROMPTS = {
  name:          "What's your full name?",
  email:         "What's your email address?",
  eventType:     "What type of event are you planning? (e.g. Corporate, Wedding, Private Party, Brand Campaign)",
  preferredDate: "When is your preferred event date? (e.g. June 2026 or a specific date)",
  budget:        "What's your approximate budget? (e.g. Under $5k, $5k–$15k, $15k+)",
};

export default function SupportChat({ user, setPage, triggerOpen, onAuth }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("idle");
  const [botName, setBotName] = useState(user?.name || "");
  const [botEmail, setBotEmail] = useState(user?.email || "");
  const [botMessages, setBotMessages] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState(null);
  const [agentName, setAgentName] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [preview, setPreview] = useState(null);

  // Open chat when triggered externally (e.g. from service cards or payment)
  useEffect(() => {
    if (triggerOpen) openChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerOpen]);

  // Live data cache
  const [celebs, setCelebs] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Waitlist multi-step state
  const [wlStep, setWlStep] = useState(null);   // null | step name
  const [wlData, setWlData] = useState({});

  const ws = useRef(null);
  const sessionIdRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectAttempts = useRef(0);
  const intentionalClose = useRef(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [botMessages, liveMessages, isTyping]);

  useEffect(() => { if (open) setUnread(0); }, [open]);

  useEffect(() => {
    if (user?.name) setBotName(n => user.name || n);
    if (user?.email) setBotEmail(e => user.email || e);
  }, [user?.name, user?.email]);

  // ── Fetch live data when chat opens ────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    api.getCelebrities().then(setCelebs).catch(() => {});
    api.getBlogs().then(setBlogs).catch(() => {});
    if (user) api.getUserBookings().then(setUserBookings).catch(() => {});
  }, [open, user]);

  // ── Live chat WebSocket ───────────────────────────────────────────────────
  const connect = useCallback((existingSessionId, name, email, topic) => {
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
          setLiveMessages((msg.history || []).map(normalizeMsg));
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
          pushSystemMsg("Agent disconnected. You'll be reconnected to a new agent shortly.");
          break;
        case "message": {
          const m = normalizeMsg(msg.message);
          setLiveMessages(prev => prev.find(x => x.id === m.id) ? prev : [...prev, m]);
          if (!open) setUnread(n => n + 1);
          setIsTyping(false);
          break;
        }
        case "message_sent": {
          const m = normalizeMsg(msg.message);
          setLiveMessages(prev => {
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
      if (reconnectAttempts.current >= 3) return;
      const saved = localStorage.getItem(SESSION_KEY);
      if (!saved) return;
      reconnectAttempts.current++;
      reconnectTimer.current = setTimeout(() => {
        const { sessionId: sid, name: n, email: e } = JSON.parse(saved);
        connect(sid, n, e, "");
      }, reconnectAttempts.current * 2000);
    };
    socket.onerror = () => setWsStatus("disconnected");
  }, []);

  useEffect(() => {
    function handleJoinChat(e) {
      const { sessionId } = e.detail;
      const name = botName || user?.name || "Guest";
      const email = botEmail || user?.email || "";
      localStorage.setItem(SESSION_KEY, JSON.stringify({ sessionId, name, email }));
      setOpen(true);
      setStage("connecting");
      connect(sessionId, name, email, "");
    }
    window.addEventListener("starbooknow:join-chat", handleJoinChat);
    return () => window.removeEventListener("starbooknow:join-chat", handleJoinChat);
  }, [connect, botName, botEmail, user]);

  useEffect(() => () => {
    intentionalClose.current = true;
    clearTimeout(reconnectTimer.current);
    clearTimeout(typingTimer.current);
    ws.current?.close();
  }, []);

  function normalizeMsg(m) {
    return { id: m.id, sessionId: m.sessionId, role: m.senderRole || m.role, name: m.senderName || m.name, text: m.content || m.text || "", ts: m.ts || m.timestamp };
  }

  function pushSystemMsg(text) {
    setLiveMessages(prev => [...prev, { id: Date.now().toString(), role: "system", text, ts: new Date().toISOString() }]);
  }

  // ── Bot helpers ───────────────────────────────────────────────────────────
  function pushBotMsg(text, options = [], payload = null) {
    setBotMessages(prev => [...prev, { id: `b${Date.now()}${Math.random()}`, role: "bot", text, options, payload }]);
  }

  function pushUserMsg(text) {
    setBotMessages(prev => [...prev, { id: `u${Date.now()}${Math.random()}`, role: "user", text }]);
  }

  function launchBot(name) {
    const greeting = `Hi ${name}! 👋 I'm **StraBot**, your AI booking assistant. I can look up real celebrities, show your bookings, and more. How can I help you?`;
    setBotMessages([{ id: "b0", role: "bot", text: greeting, options: MAIN_MENU_OPTIONS, payload: null }]);
  }

  // ── Intent handlers ───────────────────────────────────────────────────────
  function handleIntent(intent, rawText) {
    setWlStep(null);
    setWlData({});

    if (intent === "live_agent") {
      setTimeout(() => {
        pushBotMsg("Sure! Connecting you with a live concierge agent. Please provide your email address.", []);
        setStage("email_prompt");
      }, 350);
      return;
    }

    if (intent === "my_bookings") {
      if (!user) {
        setTimeout(() => pushBotMsg("You need to be signed in to view your bookings. Please sign in first, then I can pull them up for you! 🔐", MAIN_MENU_OPTIONS), 350);
        return;
      }
      setTimeout(() => {
        if (userBookings.length === 0) {
          pushBotMsg("You don't have any bookings yet. Ready to book your first celebrity?", MAIN_MENU_OPTIONS);
        } else {
          pushBotMsg(`You have **${userBookings.length}** booking${userBookings.length > 1 ? "s" : ""}:`, MAIN_MENU_OPTIONS, { _type: "bookings", items: userBookings });
        }
      }, 350);
      return;
    }

    if (intent === "search_celeb" || intent === "availability") {
      const q = rawText?.toLowerCase() || "";
      const catMap = { music: "musicians", musician: "musicians", singer: "musicians", actor: "actors", film: "actors", sport: "sports", athlete: "sports", influencer: "influencers", royal: "royalty" };
      let filtered = celebs;

      // Filter by category keyword
      for (const [kw, cat] of Object.entries(catMap)) {
        if (q.includes(kw)) { filtered = celebs.filter(c => c.cat === cat); break; }
      }
      // Filter by availability if intent is availability
      if (intent === "availability") filtered = filtered.filter(c => c.avail);

      // Filter by name if a name-like word > 3 chars appears
      const words = q.split(/\s+/).filter(w => w.length > 3 && !["find","search","show","list","available","celebrities","celebrity","book","who"].includes(w));
      if (words.length > 0) {
        const nameMatches = celebs.filter(c => words.some(w => c.name.toLowerCase().includes(w)));
        if (nameMatches.length > 0) filtered = nameMatches;
      }

      const results = filtered.slice(0, 5);
      setTimeout(() => {
        if (results.length === 0) {
          pushBotMsg("I couldn't find any celebrities matching that. Try a different search, or browse the full roster.", [{ label: "🎭 Browse All Celebrities", intent: "navigate_celebs" }, ...MAIN_MENU_OPTIONS]);
        } else {
          const label = intent === "availability" ? `Here are **${results.length}** available celebrities right now:` : `Here are **${results.length}** celebrities matching your search:`;
          pushBotMsg(label, [{ label: "🎭 Browse Full Roster", intent: "navigate_celebs" }, { label: "🏠 Main Menu", intent: "menu" }], { _type: "celebs", items: results });
        }
      }, 400);
      return;
    }

    if (intent === "pricing") {
      if (celebs.length > 0) {
        const prices = celebs.map(c => c.price).filter(Boolean);
        const min = Math.min(...prices).toLocaleString();
        const max = Math.max(...prices).toLocaleString();
        setTimeout(() => pushBotMsg(
          `💰 **StarBookNow Pricing — Live from our roster:**\n\nCelebrities on our platform range from **$${min}** to **$${max}** depending on the talent and event type.\n\n💌 Personal Video Message — from $299\n🤝 Meet & Greet — from $1,500\n🎉 Private Appearance — from $3,000\n🏢 Corporate Event — from $5,000\n📣 Brand Campaign — from $8,000\n\nPrices vary by talent and requirements. A concierge can give an exact quote.`,
          [{ label: "🔍 Search Celebrities", intent: "search_celeb" }, { label: "💬 Get a Quote", intent: "live_agent" }, { label: "🏠 Main Menu", intent: "menu" }]
        ), 400);
      } else {
        setTimeout(() => pushBotMsg(
          `💰 **StarBookNow Pricing:**\n\n💌 Personal Video Message — from $299\n🤝 Meet & Greet — from $1,500\n🎉 Private Appearance — from $3,000\n🏢 Corporate Event — from $5,000\n📣 Brand Campaign — from $8,000`,
          [{ label: "💬 Get an Exact Quote", intent: "live_agent" }, { label: "🏠 Main Menu", intent: "menu" }]
        ), 400);
      }
      return;
    }

    if (intent === "waitlist") {
      const firstStep = WL_STEPS[0];
      const prefill = user?.name || botName;
      if (prefill) {
        setWlData({ name: prefill });
        const nextStep = user?.email ? "eventType" : "email";
        if (user?.email) setWlData({ name: prefill, email: user.email });
        setWlStep(nextStep);
        setTimeout(() => pushBotMsg(
          `Great! Let's get you on the concierge waitlist. ${user ? `I've already filled in your name (${prefill}) and email (${user.email}).` : ""}\n\n${WL_PROMPTS[nextStep]}`,
          []
        ), 350);
      } else {
        setWlStep(firstStep);
        setTimeout(() => pushBotMsg(`Sure! Let's get you on the concierge waitlist.\n\n${WL_PROMPTS[firstStep]}`, []), 350);
      }
      return;
    }

    if (intent === "blog") {
      const recent = blogs.slice(0, 4);
      setTimeout(() => {
        if (recent.length === 0) {
          pushBotMsg("Our blog is loading. You can head to the Blog section for the latest articles!", [{ label: "📰 Open Blog", intent: "navigate_blog" }, { label: "🏠 Main Menu", intent: "menu" }]);
        } else {
          pushBotMsg(`📰 Here are our latest **${recent.length}** articles from the StarBookNow Journal:`, [{ label: "📰 Read All Articles", intent: "navigate_blog" }, { label: "🏠 Main Menu", intent: "menu" }], { _type: "blogs", items: recent });
        }
      }, 400);
      return;
    }

    if (intent === "navigate") {
      const q = rawText?.toLowerCase() || "";
      const pageMap = [["dashboard", "dashboard"], ["home", "home"], ["celeb", "celebrities"], ["wait", "waitlist"], ["about", "about"], ["contact", "contact"], ["blog", "blog"]];
      const match = pageMap.find(([kw]) => q.includes(kw));
      if (match) {
        setTimeout(() => {
          pushBotMsg(`Sure! Taking you to **${match[1]}** now. ✈️`, MAIN_MENU_OPTIONS);
          setPage(match[1]);
        }, 300);
      } else {
        setTimeout(() => pushBotMsg("Where would you like to go? I can navigate to: Home, Celebrities, Dashboard, Waitlist, Blog, About, or Contact.", MAIN_MENU_OPTIONS), 300);
      }
      return;
    }
  }

  // Handle internal quick-reply option intents (not LIVE)
  function selectOption(opt) {
    if (opt.intent === "live_agent") {
      pushUserMsg("💬 Talk to a Live Agent");
      handleIntent("live_agent", "");
      return;
    }
    if (opt.intent === "menu") {
      pushUserMsg("🏠 Main Menu");
      setTimeout(() => pushBotMsg("What else can I help you with?", MAIN_MENU_OPTIONS), 300);
      return;
    }
    if (opt.intent === "navigate_celebs") {
      pushUserMsg("🎭 Browse Full Roster");
      setTimeout(() => { pushBotMsg("Opening the celebrities page for you! 🌟", []); setPage("celebrities"); }, 300);
      return;
    }
    if (opt.intent === "navigate_blog") {
      pushUserMsg("📰 Open Blog");
      setTimeout(() => { pushBotMsg("Opening the StarBookNow Journal! 📖", []); setPage("blog"); }, 300);
      return;
    }
    // Named intents
    if (opt.intent) {
      pushUserMsg(opt.label);
      handleIntent(opt.intent, opt.label);
      return;
    }
  }

  // ── Waitlist step handler ─────────────────────────────────────────────────
  async function handleWlInput() {
    const text = input.trim();
    if (!text || !wlStep) return;
    setInput("");
    pushUserMsg(text);

    const updated = { ...wlData, [wlStep]: text };
    setWlData(updated);

    const currentIdx = WL_STEPS.indexOf(wlStep);
    const nextStep = WL_STEPS[currentIdx + 1];

    if (nextStep) {
      setWlStep(nextStep);
      setTimeout(() => pushBotMsg(WL_PROMPTS[nextStep], []), 350);
    } else {
      // All steps collected — submit
      setWlStep(null);
      setTimeout(async () => {
        pushBotMsg("⏳ Submitting your request...", []);
        try {
          const result = await api.joinWaitlist({
            name: updated.name,
            email: updated.email,
            eventType: updated.eventType,
            preferredDate: updated.preferredDate,
            budget: updated.budget,
          });
          pushBotMsg(
            `✅ **You're on the waitlist!**\n\nYour position: **#${result.position}**\n\nOur concierge team will reach out to **${updated.email}** to discuss your event. Thank you, ${updated.name}!`,
            MAIN_MENU_OPTIONS
          );
        } catch {
          pushBotMsg("⚠️ There was an issue submitting your request. Please try again or talk to a live agent.", [
            { label: "🔄 Try Again", intent: "waitlist" },
            { label: "💬 Talk to an Agent", intent: "live_agent" },
          ]);
        }
      }, 400);
    }
  }

  // ── Bot text input handler ────────────────────────────────────────────────
  function handleBotKey(e) {
    if (e.key !== "Enter") return;
    const text = input.trim();
    if (!text) return;

    // Waitlist flow takes priority
    if (wlStep) { handleWlInput(); return; }

    setInput("");
    pushUserMsg(text);
    const intent = detectIntent(text);
    if (intent) {
      handleIntent(intent, text);
    } else {
      setTimeout(() => pushBotMsg("I didn't quite catch that. Here's what I can help you with:", MAIN_MENU_OPTIONS), 350);
    }
  }

  function handleBotKeyDown(e) {
    if (e.key === "Enter") handleBotKey(e);
  }

  function goLive() {
    if (!botEmail.trim()) return;
    const name = botName || "Guest";
    const email = botEmail.trim();
    setStage("connecting");
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const { sessionId: sid, name: sn, email: se } = JSON.parse(saved);
        connect(sid, sn || name, se || email, "General Inquiry");
        return;
      } catch {}
    }
    connect(null, name, email, "General Inquiry");
  }

  // ── Open / reset ──────────────────────────────────────────────────────────
  function openChat() {
    setOpen(true);
    if (ws.current?.readyState === WebSocket.OPEN && (stage === "waiting" || stage === "active")) return;
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const { sessionId: sid, name, email } = JSON.parse(saved);
        setBotName(name);
        setBotEmail(email);
        setStage("connecting");
        connect(sid, name, email, "");
        return;
      } catch {}
    }
    if (stage === "idle") {
      const name = user?.name || botName;
      if (name) {
        setBotName(name);
        setStage("bot");
        launchBot(name);
      } else {
        setStage("bot_name");
      }
    }
  }

  function submitName() {
    if (!botName.trim()) return;
    setStage("bot");
    launchBot(botName.trim());
  }

  // ── Live chat send ────────────────────────────────────────────────────────
  function sendMessage() {
    const text = input.trim();
    if (!text || ws.current?.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: "message", content: text }));
    setLiveMessages(prev => [...prev, { id: `opt-${Date.now()}`, role: "customer", text, ts: new Date().toISOString() }]);
    setInput("");
  }

  function handleLiveKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: "typing" }));
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file || ws.current?.readyState !== WebSocket.OPEN) return;
    const reader = new FileReader();
    reader.onload = () => {
      const isImg = file.type.startsWith("image/");
      const payload = JSON.stringify({ _ft: isImg ? "img" : "doc", name: file.name, data: reader.result });
      ws.current.send(JSON.stringify({ type: "message", content: payload }));
      setLiveMessages(prev => [...prev, { id: `opt-${Date.now()}`, role: "customer", text: payload, ts: new Date().toISOString() }]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function endSession() {
    intentionalClose.current = true;
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: "close_session" }));
    localStorage.removeItem(SESSION_KEY);
    setStage("ended");
  }

  function resetChat() {
    intentionalClose.current = true;
    ws.current?.close();
    setLiveMessages([]);
    sessionIdRef.current = null;
    setAgentName(null);
    setPosition(null);
    setWlStep(null);
    setWlData({});
    localStorage.removeItem(SESSION_KEY);
    const name = user?.name || "";
    setBotName(name);
    setBotEmail(user?.email || "");
    if (name) {
      setStage("bot");
      setBotMessages([]);
      setTimeout(() => launchBot(name), 0);
    } else {
      setStage("bot_name");
      setBotMessages([]);
    }
  }

  const isLiveStage = ["waiting", "active", "connecting"].includes(stage);
  const isConnected = wsStatus === "connected";

  // ── Rich bot message payload renderer ────────────────────────────────────
  function renderPayload(payload) {
    if (!payload) return null;
    if (payload._type === "celebs") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {payload.items.map(c => (
            <CelebCard key={c.id} c={c} onNavigate={() => setPage("celebrities")} />
          ))}
        </div>
      );
    }
    if (payload._type === "bookings") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {payload.items.map((b, i) => <BookingCard key={b.id || i} b={b} />)}
        </div>
      );
    }
    if (payload._type === "blogs") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {payload.items.map(blog => (
            <BlogCard key={blog.id} blog={blog} onNavigate={() => setPage("blog")} />
          ))}
        </div>
      );
    }
    return null;
  }

  // ── Bold markdown helper ──────────────────────────────────────────────────
  function renderBotText(text) {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i} style={{ color: "hsl(var(--foreground))" }}>{p}</strong> : p);
  }

  return (
    <>
      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />

      {/* ── Floating button ── */}
      <button
        onClick={() => open ? setOpen(false) : openChat()}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-full border-none cursor-pointer z-[900] flex items-center justify-center text-[20px] sm:text-[22px] transition-all duration-300 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#f5cc6a,#c98a10)",
          boxShadow: "0 4px 28px rgba(240,191,90,0.55)",
          transform: open ? "rotate(45deg)" : "none",
        }}
      >
        {open ? "✕" : "💬"}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className="fixed bottom-[80px] right-3 left-3 sm:left-auto sm:bottom-[100px] sm:right-7 sm:w-[380px] h-[75vh] sm:h-[580px] flex flex-col z-[900] rounded-[20px] overflow-hidden border border-border"
          style={{ background: "hsl(var(--card))", boxShadow: "0 28px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,191,90,0.06)" }}>

          {/* Header */}
          <div className="px-[18px] py-3.5 flex items-center justify-between shrink-0 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-lg">
                  {isLiveStage ? "👩‍💼" : "🤖"}
                </div>
                <div className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111111] ${isLiveStage ? (isConnected ? "bg-[#6DBF7B]" : "bg-[#D4A84B]") : "bg-[#6DBF7B]"}`} />
              </div>
              <div>
                <div className="text-foreground font-bold text-[14px]">
                  {stage === "active" ? (agentName || "StarBookNow Agent") : isLiveStage ? "StarBookNow Support" : "StraBot ✨"}
                </div>
                <div className={`text-[10px] font-semibold tracking-[0.5px] uppercase ${isLiveStage ? (isConnected ? "text-[#6DBF7B]" : "text-[#D4A84B]") : "text-primary"}`}>
                  {stage === "active" ? `${agentName || "Agent"} · Live Support` : stage === "waiting" ? "In Queue · Waiting" : stage === "connecting" ? "Connecting..." : "AI-Powered · Live Data"}
                </div>
              </div>
            </div>
            {(stage === "waiting" || stage === "active") && (
              <button
                onClick={endSession}
                className="bg-destructive/10 border border-destructive/30 rounded-full px-3.5 py-1 text-destructive cursor-pointer text-[11px] font-semibold hover:bg-destructive/20 transition-colors"
              >
                End
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* Auth gate — not logged in */}
            {!user && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                <div className="text-[44px]">🔒</div>
                <div className="text-foreground font-semibold text-[15px]">Login required</div>
                <div className="text-muted-foreground text-[13px] leading-relaxed">
                  Please sign in to chat with our support team and access your bookings.
                </div>
                <button
                  onClick={() => { setOpen(false); onAuth?.("login"); }}
                  className="mt-1 rounded-full px-7 py-3 text-[13px] font-extrabold border-none cursor-pointer text-[#1a1000] hover:brightness-110 transition-all"
                  style={{ background: "linear-gradient(135deg,#f5cc6a,#c98a10)" }}
                >
                  Sign In →
                </button>
                <button
                  onClick={() => { setOpen(false); onAuth?.("register"); }}
                  className="text-primary text-[12px] font-semibold underline underline-offset-2 cursor-pointer bg-transparent border-none"
                >
                  Create a free account
                </button>
              </div>
            )}

            {/* Name input */}
            {user && stage === "bot_name" && (
              <div className="flex-1 px-[22px] py-7 flex flex-col justify-center gap-3.5">
                <div className="text-[32px] text-center">🤖</div>
                <div className="text-muted-foreground text-[13px] leading-[1.75] text-center">
                  Welcome to StarBookNow! I'm <strong className="text-primary">StraBot</strong>, your AI assistant.<br />What's your name?
                </div>
                <input
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitName()}
                  autoFocus
                  placeholder="Your first name..."
                  className="bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-[14px] outline-none font-sans focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={submitName}
                  disabled={!botName.trim()}
                  className={`rounded-xl py-3 text-[13px] font-extrabold border-none transition-all duration-200 ${botName.trim() ? "cursor-pointer text-[#1a1000] hover:brightness-110" : "cursor-default text-muted-foreground/40 bg-secondary"}`}
                  style={botName.trim() ? { background: "linear-gradient(135deg,#f5cc6a,#c98a10)" } : {}}
                >
                  Start Chat →
                </button>
              </div>
            )}

            {/* Bot chat */}
            {user && (stage === "bot" || stage === "email_prompt") && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2.5">
                  {botMessages.map((m, i) => (
                    <div key={m.id}>
                      <div className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                        {m.role === "bot" && (
                          <div className="text-primary text-[10px] font-bold mb-1 tracking-[0.5px]">StraBot 🤖</div>
                        )}
                        <div className={`px-3.5 py-2.5 max-w-[92%] text-[13px] leading-[1.7] whitespace-pre-line ${
                          m.role === "user"
                            ? "text-[#1a1000] rounded-[14px_14px_2px_14px]"
                            : "text-foreground bg-secondary border border-border rounded-[14px_14px_14px_2px]"
                        }`}
                          style={m.role === "user" ? { background: "linear-gradient(135deg,#f5cc6a,#c98a10)" } : {}}>
                          {m.role === "bot" ? renderBotText(m.text) : m.text}
                        </div>
                        {m.role === "bot" && m.payload && (
                          <div className="max-w-[92%] w-full">{renderPayload(m.payload)}</div>
                        )}
                      </div>
                      {m.role === "bot" && m.options?.length > 0 && i === botMessages.length - 1 && stage === "bot" && !wlStep && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {m.options.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => selectOption(opt)}
                              className="bg-transparent border border-primary/40 rounded-full px-3 py-1.5 text-primary text-[11px] font-semibold cursor-pointer hover:bg-primary/15 hover:border-primary transition-all duration-200"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Email prompt */}
                  {stage === "email_prompt" && (
                    <div className="bg-secondary border border-primary/20 rounded-xl p-4 mt-1">
                      <div className="text-muted-foreground text-[12px] mb-2.5">Your email address:</div>
                      <input
                        value={botEmail}
                        onChange={e => setBotEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && goLive()}
                        type="email"
                        autoFocus
                        placeholder="your@email.com"
                        className="w-full bg-muted/60 border border-border rounded-lg px-3 py-2.5 text-foreground text-[13px] outline-none font-sans mb-2 focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
                      />
                      <button
                        onClick={goLive}
                        disabled={!botEmail.trim()}
                        className={`w-full rounded-lg py-2.5 text-[12px] font-extrabold border-none transition-all ${botEmail.trim() ? "cursor-pointer text-[#1a1000] hover:brightness-110" : "cursor-default text-muted-foreground/40 bg-secondary"}`}
                        style={botEmail.trim() ? { background: "linear-gradient(135deg,#f5cc6a,#c98a10)" } : {}}
                      >
                        Connect to Live Agent →
                      </button>
                    </div>
                  )}
                </div>

                {/* Bot input */}
                {stage === "bot" && (
                  <div className="px-3 py-2.5 border-t border-border/60 shrink-0 bg-secondary/40">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleBotKeyDown}
                      placeholder={wlStep ? WL_PROMPTS[wlStep].split("?")[0] + "..." : "Ask me anything or select above..."}
                      className={`w-full bg-secondary rounded-full px-4 py-2.5 text-foreground text-[13px] outline-none font-sans transition-colors placeholder:text-muted-foreground/40 border ${wlStep ? "border-primary/50" : "border-border"} focus:border-primary/50`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Connecting */}
            {user && stage === "connecting" && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3.5">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary" style={{ animation: `chatPulse 1.2s ${i*0.2}s infinite ease-in-out` }} />)}
                </div>
                <div className="text-muted-foreground text-[13px]">Connecting to live support...</div>
              </div>
            )}

            {/* Waiting */}
            {user && stage === "waiting" && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="mx-4 mt-4 mb-2 bg-secondary border border-border rounded-xl p-4 text-center">
                  <div className="text-muted-foreground text-[11px] tracking-[2px] uppercase font-bold mb-2.5">Queue Position</div>
                  <div className="text-primary font-extrabold font-serif leading-none text-[52px]">{position != null ? `#${position}` : "—"}</div>
                  <div className="text-muted-foreground text-[12px] mt-2 leading-[1.6]">
                    {position === 1 ? "You're next! An agent will join shortly." : position ? `${position - 1} ${position - 1 === 1 ? "person" : "people"} ahead of you.` : "Waiting for a position update..."}
                  </div>
                  <div className="flex gap-1.5 justify-center mt-3.5">
                    {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-primary" style={{ animation: `chatPulse 1.4s ${i*0.25}s infinite` }} />)}
                  </div>
                </div>
                <div ref={scrollRef} className="flex-1 px-3.5 pb-3.5 overflow-y-auto">
                  {liveMessages.filter(m => m.role === "system").map((m, i) => (
                    <div key={m.id || i} className="text-center mb-2">
                      <span className="bg-secondary border border-border rounded-full px-3.5 py-1 text-muted-foreground text-[11px] inline-block">{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active live chat */}
            {user && stage === "active" && (
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2.5">
                {liveMessages.map((m, i) => {
                  if (m.role === "system") return (
                    <div key={m.id || i} className="text-center">
                      <span className="bg-secondary border border-border rounded-full px-3.5 py-1 text-muted-foreground text-[11px] inline-block">{m.text}</span>
                    </div>
                  );
                  const isMe = m.role === "customer";
                  return (
                    <div key={m.id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && m.name && <div className="text-primary text-[10px] font-bold mb-1 tracking-[0.5px]">{m.name}</div>}
                      <div className={`px-3.5 py-2.5 max-w-[82%] text-[13px] leading-[1.65] ${
                        isMe
                          ? "text-[#1a1000] rounded-[14px_14px_2px_14px]"
                          : "text-foreground bg-secondary border border-border rounded-[14px_14px_14px_2px]"
                      }`}
                        style={isMe ? { background: "linear-gradient(135deg,#f5cc6a,#c98a10)" } : {}}>
                        {renderContent(m.text, setPreview)}
                      </div>
                      <div className="text-muted-foreground/50 text-[10px] mt-1">{fmtTime(m.ts)}</div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-center gap-1 px-3.5 py-2.5 bg-secondary border border-border rounded-[14px_14px_14px_2px] self-start">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" style={{ animation: `chatPulse 1.2s ${i*0.15}s infinite` }} />)}
                  </div>
                )}
              </div>
            )}

            {/* Ended */}
            {user && stage === "ended" && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3.5 p-6 text-center">
                <div className="text-[40px]">✅</div>
                <div className="text-foreground font-bold text-[15px] font-serif">Session Ended</div>
                <div className="text-muted-foreground text-[13px] leading-[1.7]">Thank you for contacting StarBookNow.<br />We hope we could help!</div>
                <button
                  onClick={resetChat}
                  className="bg-transparent border border-border/60 rounded-full px-7 py-2.5 text-muted-foreground cursor-pointer text-[12px] hover:border-primary/40 hover:text-primary transition-colors"
                >
                  New Conversation
                </button>
              </div>
            )}
          </div>

          {/* Live chat input bar */}
          {stage === "active" && (
            <div className="px-3 py-2.5 border-t border-border/60 flex gap-2 items-center shrink-0 bg-secondary/40">
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xlsx,.pptx,.txt" className="hidden" onChange={handleFileSelect} />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                className="w-[34px] h-[34px] rounded-full bg-secondary border border-border cursor-pointer flex items-center justify-center text-[15px] shrink-0 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >📎</button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleLiveKey}
                placeholder="Type a message..."
                className="flex-1 bg-secondary border border-border rounded-full px-4 py-2.5 text-foreground text-[13px] outline-none font-sans focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`w-[38px] h-[38px] rounded-full border-none flex items-center justify-center text-[15px] shrink-0 transition-all duration-200 ${input.trim() ? "cursor-pointer hover:brightness-110 active:scale-95" : "cursor-default opacity-40"}`}
                style={input.trim() ? { background: "linear-gradient(135deg,#f5cc6a,#c98a10)" } : { background: "rgba(255,255,255,0.05)" }}
              >➤</button>
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
