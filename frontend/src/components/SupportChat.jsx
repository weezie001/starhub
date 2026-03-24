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
      <div onClick={e => e.stopPropagation()} style={{ background: G.card, borderRadius: 16, overflow: "hidden", maxWidth: "92vw", maxHeight: "90vh", display: "flex", flexDirection: "column", minWidth: 320 }}>
        <div style={{ padding: "12px 16px", background: G.s1, borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ color: G.text, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file._ft === "img" ? "🖼" : "📄"} {file.name}
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <a href={file.data} download={file.name} style={{ color: G.gold, fontSize: 12, textDecoration: "none", fontWeight: 700, background: `${G.gold}18`, border: `1px solid ${G.gold}40`, borderRadius: 50, padding: "4px 12px" }}>⬇ Download</a>
            <button onClick={onClose} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 260, background: G.bg }}>
          {file._ft === "img" ? (
            <img src={file.data} alt={file.name} style={{ maxWidth: "88vw", maxHeight: "76vh", objectFit: "contain", borderRadius: 4 }} />
          ) : isPDF ? (
            <iframe src={file.data} title={file.name} style={{ width: "80vw", height: "74vh", border: "none" }} />
          ) : (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📄</div>
              <div style={{ color: G.text, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{file.name}</div>
              <div style={{ color: G.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Preview not available for this file type.<br />Click download to open it locally.</div>
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
    <div style={{ background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
      {c.img ? (
        <img src={c.img} alt={c.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0, filter: "grayscale(40%)" }} onError={e => { e.target.style.display = "none"; }} />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${G.gold}20`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌟</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: G.cream, fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.flag} {c.name}</div>
        <div style={{ color: G.dim, fontSize: 10, textTransform: "capitalize" }}>{c.cat} · from ${c.price?.toLocaleString()}</div>
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
    <div style={{ background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ color: G.cream, fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>🌟 {celebName}</div>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 50, background: statusColor + "25", color: statusColor, border: `1px solid ${statusColor}40`, flexShrink: 0, marginLeft: 6, textTransform: "capitalize" }}>{b.status}</span>
      </div>
      <div style={{ color: G.dim, fontSize: 10, textTransform: "capitalize" }}>{(b.type || b.bookingType || "").replace(/_/g, " ")} {amount && `· ${amount}`} {date && `· ${date}`}</div>
    </div>
  );
}

function BlogCard({ blog, onNavigate }) {
  return (
    <div onClick={onNavigate} style={{ background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = G.gold + "50"}
      onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
      <div style={{ color: G.gold, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{blog.category}</div>
      <div style={{ color: G.cream, fontWeight: 700, fontSize: 12, marginBottom: 4, lineHeight: 1.4 }}>{blog.title}</div>
      <div style={{ color: G.dim, fontSize: 10, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{blog.excerpt}</div>
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

export default function SupportChat({ user, setPage, triggerOpen }) {
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
    window.addEventListener("strabook:join-chat", handleJoinChat);
    return () => window.removeEventListener("strabook:join-chat", handleJoinChat);
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
          `💰 **StraBook Pricing — Live from our roster:**\n\nCelebrities on our platform range from **$${min}** to **$${max}** depending on the talent and event type.\n\n💌 Personal Video Message — from $299\n🤝 Meet & Greet — from $1,500\n🎉 Private Appearance — from $3,000\n🏢 Corporate Event — from $5,000\n📣 Brand Campaign — from $8,000\n\nPrices vary by talent and requirements. A concierge can give an exact quote.`,
          [{ label: "🔍 Search Celebrities", intent: "search_celeb" }, { label: "💬 Get a Quote", intent: "live_agent" }, { label: "🏠 Main Menu", intent: "menu" }]
        ), 400);
      } else {
        setTimeout(() => pushBotMsg(
          `💰 **StraBook Pricing:**\n\n💌 Personal Video Message — from $299\n🤝 Meet & Greet — from $1,500\n🎉 Private Appearance — from $3,000\n🏢 Corporate Event — from $5,000\n📣 Brand Campaign — from $8,000`,
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
          pushBotMsg(`📰 Here are our latest **${recent.length}** articles from the StraBook Journal:`, [{ label: "📰 Read All Articles", intent: "navigate_blog" }, { label: "🏠 Main Menu", intent: "menu" }], { _type: "blogs", items: recent });
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
      setTimeout(() => { pushBotMsg("Opening the StraBook Journal! 📖", []); setPage("blog"); }, 300);
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
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i} style={{ color: G.cream }}>{p}</strong> : p);
  }

  return (
    <>
      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
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
        <div style={{ position: "fixed", bottom: 100, right: 28, width: 380, height: 580, background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, display: "flex", flexDirection: "column", zIndex: 900, boxShadow: "0 24px 64px #000000cc", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ padding: "14px 18px", background: G.s1, borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${G.gold}20`, border: `1px solid ${G.gold}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {isLiveStage ? "👩‍💼" : "🤖"}
                </div>
                <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: isLiveStage ? (isConnected ? G.green : G.amber) : G.green, border: `2px solid ${G.s1}` }} />
              </div>
              <div>
                <div style={{ color: G.text, fontWeight: 700, fontSize: 14 }}>
                  {stage === "active" ? (agentName || "StraBook Agent") : isLiveStage ? "StraBook Support" : "StraBot ✨"}
                </div>
                <div style={{ color: isLiveStage ? (isConnected ? G.green : G.amber) : G.gold, fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  {stage === "active" ? `${agentName || "Agent"} · Live Support` : stage === "waiting" ? "In Queue · Waiting" : stage === "connecting" ? "Connecting..." : "AI-Powered · Live Data"}
                </div>
              </div>
            </div>
            {(stage === "waiting" || stage === "active") && (
              <button onClick={endSession} style={{ background: G.red + "15", border: `1px solid ${G.red}30`, borderRadius: 50, padding: "5px 14px", color: G.red, cursor: "pointer", fontSize: 11, fontFamily: G.sans, fontWeight: 600 }}>End</button>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* ── NAME INPUT ── */}
            {stage === "bot_name" && (
              <div style={{ flex: 1, padding: "28px 22px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
                <div style={{ fontSize: 32, textAlign: "center" }}>🤖</div>
                <div style={{ color: G.muted, fontSize: 13, lineHeight: 1.75, textAlign: "center" }}>
                  Welcome to StraBook! I'm <strong style={{ color: G.gold }}>StraBot</strong>, your AI assistant.<br />What's your name?
                </div>
                <input
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitName()}
                  autoFocus
                  placeholder="Your first name..."
                  style={{ background: G.s2, border: `1px solid ${G.border}`, borderRadius: 10, padding: "12px 16px", color: G.text, fontSize: 14, outline: "none", fontFamily: G.sans }}
                />
                <button
                  onClick={submitName}
                  disabled={!botName.trim()}
                  style={{ background: botName.trim() ? `linear-gradient(45deg,${G.gold},${G.goldD})` : G.s2, color: botName.trim() ? "#261900" : G.dim, border: "none", borderRadius: 10, padding: "13px 0", fontSize: 13, fontWeight: 800, cursor: botName.trim() ? "pointer" : "default", fontFamily: G.sans, transition: "all 0.2s" }}>
                  Start Chat →
                </button>
              </div>
            )}

            {/* ── BOT CHAT ── */}
            {(stage === "bot" || stage === "email_prompt") && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {botMessages.map((m, i) => (
                    <div key={m.id}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                        {m.role === "bot" && (
                          <div style={{ color: G.gold, fontSize: 10, fontWeight: 700, marginBottom: 3, letterSpacing: 0.5 }}>StraBot 🤖</div>
                        )}
                        <div style={{
                          background: m.role === "user" ? `linear-gradient(135deg,${G.gold},${G.goldD})` : G.s2,
                          color: m.role === "user" ? "#261900" : G.text,
                          padding: "10px 14px", maxWidth: "92%",
                          borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          fontSize: 13, lineHeight: 1.7,
                          border: m.role === "bot" ? `1px solid ${G.border}` : "none",
                          whiteSpace: "pre-line",
                        }}>
                          {m.role === "bot" ? renderBotText(m.text) : m.text}
                        </div>

                        {/* Rich payload cards */}
                        {m.role === "bot" && m.payload && (
                          <div style={{ maxWidth: "92%", width: "100%" }}>
                            {renderPayload(m.payload)}
                          </div>
                        )}
                      </div>

                      {/* Quick reply buttons — only on last bot message */}
                      {m.role === "bot" && m.options?.length > 0 && i === botMessages.length - 1 && stage === "bot" && !wlStep && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                          {m.options.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => selectOption(opt)}
                              style={{ background: "none", border: `1px solid ${G.gold}50`, borderRadius: 50, padding: "6px 12px", color: G.gold, fontSize: 11, cursor: "pointer", fontFamily: G.sans, fontWeight: 600, transition: "all 0.2s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = G.gold + "20"; e.currentTarget.style.borderColor = G.gold; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = G.gold + "50"; }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Email entry for going live */}
                  {stage === "email_prompt" && (
                    <div style={{ background: G.s2, border: `1px solid ${G.gold}30`, borderRadius: 12, padding: 16, marginTop: 4 }}>
                      <div style={{ color: G.muted, fontSize: 12, marginBottom: 10 }}>Your email address:</div>
                      <input
                        value={botEmail}
                        onChange={e => setBotEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && goLive()}
                        type="email"
                        autoFocus
                        placeholder="your@email.com"
                        style={{ width: "100%", background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "10px 12px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans, boxSizing: "border-box", marginBottom: 8 }}
                      />
                      <button
                        onClick={goLive}
                        disabled={!botEmail.trim()}
                        style={{ width: "100%", background: botEmail.trim() ? `linear-gradient(45deg,${G.gold},${G.goldD})` : G.s2, color: botEmail.trim() ? "#261900" : G.dim, border: "none", borderRadius: 8, padding: "11px 0", fontSize: 12, fontWeight: 800, cursor: botEmail.trim() ? "pointer" : "default", fontFamily: G.sans }}>
                        Connect to Live Agent →
                      </button>
                    </div>
                  )}
                </div>

                {/* Bot text input */}
                {stage === "bot" && (
                  <div style={{ padding: "10px 12px", borderTop: `1px solid ${G.border}`, background: G.s1, flexShrink: 0 }}>
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleBotKeyDown}
                      placeholder={wlStep ? WL_PROMPTS[wlStep].split("?")[0] + "..." : "Ask me anything or select above..."}
                      style={{ width: "100%", background: G.s2, border: `1px solid ${wlStep ? G.gold + "60" : G.border}`, borderRadius: 50, padding: "10px 16px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans, boxSizing: "border-box", transition: "border-color 0.2s" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── CONNECTING ── */}
            {stage === "connecting" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: G.gold, animation: `chatPulse 1.2s ${i*0.2}s infinite ease-in-out` }} />)}
                </div>
                <div style={{ color: G.muted, fontSize: 13 }}>Connecting to live support...</div>
              </div>
            )}

            {/* ── WAITING ── */}
            {stage === "waiting" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
                <div style={{ margin: "16px 16px 8px", background: G.s2, border: `1px solid ${G.border}`, borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ color: G.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Queue Position</div>
                  <div style={{ color: G.gold, fontSize: 52, fontWeight: 800, fontFamily: G.serif, lineHeight: 1 }}>{position != null ? `#${position}` : "—"}</div>
                  <div style={{ color: G.muted, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
                    {position === 1 ? "You're next! An agent will join shortly." : position ? `${position - 1} ${position - 1 === 1 ? "person" : "people"} ahead of you.` : "Waiting for a position update..."}
                  </div>
                  <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 14 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: G.gold, animation: `chatPulse 1.4s ${i*0.25}s infinite` }} />)}
                  </div>
                </div>
                <div ref={scrollRef} style={{ flex: 1, padding: "0 14px 14px", overflowY: "auto" }}>
                  {liveMessages.filter(m => m.role === "system").map((m, i) => (
                    <div key={m.id || i} style={{ textAlign: "center", marginBottom: 8 }}>
                      <span style={{ background: G.s2, border: `1px solid ${G.border}`, borderRadius: 50, padding: "4px 14px", color: G.muted, fontSize: 11, display: "inline-block" }}>{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ACTIVE LIVE CHAT ── */}
            {stage === "active" && (
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {liveMessages.map((m, i) => {
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
                        {renderContent(m.text, setPreview)}
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

            {/* ── ENDED ── */}
            {stage === "ended" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 40 }}>✅</div>
                <div style={{ color: G.text, fontWeight: 700, fontSize: 15, fontFamily: G.serif }}>Session Ended</div>
                <div style={{ color: G.muted, fontSize: 13, lineHeight: 1.7 }}>Thank you for contacting StraBook.<br />We hope we could help!</div>
                <button onClick={resetChat} style={{ background: "none", border: `1px solid ${G.border}`, borderRadius: 50, padding: "10px 28px", color: G.muted, cursor: "pointer", fontSize: 12, fontFamily: G.sans }}>New Conversation</button>
              </div>
            )}
          </div>

          {/* Live chat input */}
          {stage === "active" && (
            <div style={{ padding: "10px 12px", borderTop: `1px solid ${G.border}`, background: G.s1, display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xlsx,.pptx,.txt" style={{ display: "none" }} onChange={handleFileSelect} />
              <button onClick={() => fileInputRef.current?.click()} title="Attach file" style={{ width: 34, height: 34, borderRadius: "50%", background: G.s2, border: `1px solid ${G.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, color: G.muted }}>📎</button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleLiveKey} placeholder="Type a message..." style={{ flex: 1, background: G.s2, border: `1px solid ${G.border}`, borderRadius: 50, padding: "10px 16px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans }} />
              <button onClick={sendMessage} disabled={!input.trim()} style={{ width: 38, height: 38, borderRadius: "50%", background: input.trim() ? `linear-gradient(135deg,${G.gold},${G.goldD})` : G.s2, border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, transition: "all 0.2s" }}>➤</button>
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
