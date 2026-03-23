import { useState, useEffect, useRef } from "react";
import { G, WS_URL, fmtDate } from "../lib/tokens.js";
import { Btn, Input } from "../components/ui.jsx";
import { api } from "../api.js";

const TOPICS = ["Celebrity Booking", "Corporate Event", "Private Gala", "Brand Campaign", "Meet & Greet", "Keynote Speaker", "Custom Experience"];
const BUDGETS = ["$1,000 – $5,000", "$5,000 – $15,000", "$15,000 – $50,000", "$50,000+", "Flexible"];

export default function WaitlistPage({ user }) {
  const [stage, setStage] = useState("form"); // form | submitted | live
  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "",
    eventType: "", preferredDate: "", budget: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [entry, setEntry] = useState(null); // { id, position, status, ... }
  const [wsConnected, setWsConnected] = useState(false);
  const ws = useRef(null);

  // Connect to WS after joining to get live position updates
  useEffect(() => {
    if (stage !== "live" || !entry?.id) return;

    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
      socket.send(JSON.stringify({ type: 'waitlist_watch', id: entry.id }));
    };
    socket.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === "waitlist_updated" && msg.id === entry.id) {
        setEntry(prev => ({ ...prev, status: msg.status }));
      }
    };
    socket.onclose = () => setWsConnected(false);

    return () => socket.close();
  }, [stage, entry?.id]);

  // Poll position every 30s as fallback
  useEffect(() => {
    if (stage !== "live" || !entry?.id) return;
    const interval = setInterval(async () => {
      try {
        const data = await api.getWaitlistPosition(entry.id);
        setEntry(data);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [stage, entry?.id]);

  async function submit() {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.joinWaitlist(form);
      const fullEntry = { ...form, id: res.id, position: res.position, status: "waiting", createdAt: new Date().toISOString() };
      setEntry(fullEntry);
      setStage("submitted");
      setTimeout(() => setStage("live"), 2000);
    } catch (e) {
      setError(e.message || "Failed to join waitlist. Please try again.");
    }
    setLoading(false);
  }

  const statusConfig = {
    waiting:   { label: "In Queue", color: G.amber, icon: "⏳" },
    attending: { label: "Now Attending", color: G.green, icon: "✅" },
    done:      { label: "Completed", color: G.gold, icon: "🏆" },
    cancelled: { label: "Cancelled", color: G.red, icon: "✕" },
  };

  return (
    <div style={{ paddingTop: 68, minHeight: "100vh", background: G.bg }}>
      {/* Hero */}
      <div style={{ position: "relative", padding: "80px 60px 60px", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80')",
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.12) grayscale(20%)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom,${G.bg}60,${G.bg}ff)` }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 680 }}>
          <span style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 16 }}>Exclusive Access</span>
          <h1 style={{ fontFamily: G.serif, fontSize: "clamp(36px,5vw,68px)", fontWeight: 800, color: G.cream, margin: "0 0 20px", lineHeight: 1.05 }}>
            Join the<br /><span style={{ color: G.gold, fontStyle: "italic" }}>Concierge Waitlist.</span>
          </h1>
          <p style={{ color: G.muted, fontSize: 16, lineHeight: 1.8, maxWidth: 520, margin: 0 }}>
            Secure your place in the queue to be personally attended by one of our elite concierge agents for bespoke celebrity booking assistance.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 60px 80px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "start" }}>

        {/* Left: form or status */}
        <div>
          {stage === "form" && (
            <div style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 16, padding: 40 }}>
              <h2 style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 700, color: G.text, margin: "0 0 28px" }}>Reserve Your Spot</h2>

              {error && (
                <div style={{ background: G.red + "1E", color: G.red, border: `1px solid ${G.red}30`, borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13 }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                <Input label="Email Address *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="your@email.com" />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ color: G.muted, fontSize: 11, letterSpacing: 0.8, display: "block", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Event Type</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TOPICS.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, eventType: t }))} style={{
                      background: form.eventType === t ? `${G.gold}20` : G.s2,
                      border: `1.5px solid ${form.eventType === t ? G.gold : G.border}`,
                      borderRadius: 50, padding: "7px 16px", color: form.eventType === t ? G.gold : G.muted,
                      fontSize: 12, cursor: "pointer", fontFamily: G.sans, fontWeight: 600, transition: "all 0.2s",
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Input label="Preferred Date" value={form.preferredDate} onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))} type="date" />
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: G.muted, fontSize: 11, letterSpacing: 0.8, display: "block", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Budget Range</label>
                  <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} style={{
                    width: "100%", background: G.s2, border: `1px solid ${G.border}`, borderRadius: 8,
                    padding: "11px 14px", color: G.text, fontSize: 14, outline: "none", fontFamily: G.sans,
                  }}>
                    <option value="">Select range</option>
                    {BUDGETS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <Input label="Additional Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Tell us about your event, requirements, or specific celebrities you have in mind..." rows={3} />

              <Btn onClick={submit} full style={{ padding: "15px 0", fontSize: 14, marginTop: 8 }} disabled={loading}>
                {loading ? "Joining waitlist..." : "Secure My Spot →"}
              </Btn>
            </div>
          )}

          {stage === "submitted" && (
            <div style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 16, padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>🎉</div>
              <h2 style={{ fontFamily: G.serif, fontSize: 28, fontWeight: 700, color: G.gold, margin: "0 0 12px" }}>You're In!</h2>
              <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.8 }}>Loading your queue status...</p>
            </div>
          )}

          {stage === "live" && entry && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Position card */}
              <div style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 16, padding: 36, textAlign: "center" }}>
                <div style={{ color: G.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Your Queue Position</div>
                <div style={{ fontFamily: G.serif, fontSize: 96, fontWeight: 800, color: G.gold, lineHeight: 1, marginBottom: 8 }}>
                  #{entry.position || "—"}
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: (statusConfig[entry.status]?.color || G.gold) + "18",
                  border: `1px solid ${(statusConfig[entry.status]?.color || G.gold)}40`,
                  borderRadius: 50, padding: "8px 20px", marginTop: 8,
                }}>
                  <span>{statusConfig[entry.status]?.icon}</span>
                  <span style={{ color: statusConfig[entry.status]?.color || G.gold, fontWeight: 700, fontSize: 13 }}>
                    {statusConfig[entry.status]?.label}
                  </span>
                </div>
                {wsConnected && (
                  <div style={{ marginTop: 16, color: G.dim, fontSize: 11, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: G.green }} />
                    Live updates active
                  </div>
                )}
              </div>

              {/* Details card */}
              <div style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28 }}>
                <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 700, color: G.text, margin: "0 0 20px" }}>Your Request Details</h3>
                {[["Name", entry.name], ["Email", entry.email], ["Event Type", entry.eventType || "—"], ["Preferred Date", entry.preferredDate || "—"], ["Budget", entry.budget || "—"], ["Submitted", fmtDate(entry.createdAt)]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${G.border}` }}>
                    <span style={{ color: G.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</span>
                    <span style={{ color: G.text, fontSize: 13, fontWeight: 500, maxWidth: "60%", textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>

              {entry.status === "attending" && (
                <div style={{ background: `${G.green}14`, border: `1px solid ${G.green}30`, borderRadius: 16, padding: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
                  <div style={{ color: G.green, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>An agent is ready for you!</div>
                  <div style={{ color: G.muted, fontSize: 13, lineHeight: 1.7 }}>Open the chat widget to begin your personalized concierge session.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: info panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 100 }}>
          <div style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28 }}>
            <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 700, color: G.text, margin: "0 0 20px" }}>What to Expect</h3>
            {[["🎯", "Personalised Matching", "A dedicated agent will curate a shortlist of celebrities tailored to your event."],
              ["⚡", "Priority Access", "Waitlist members get first access to newly available talent and special packages."],
              ["🤝", "White-Glove Service", "From contract to day-of logistics, we handle everything seamlessly."],
              ["🔒", "Confidential & Secure", "All inquiries are handled with complete discretion and privacy."],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ color: G.text, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{title}</div>
                  <div style={{ color: G.dim, fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: `${G.gold}10`, border: `1px solid ${G.gold}30`, borderRadius: 16, padding: 24, textAlign: "center" }}>
            <div style={{ fontFamily: G.serif, fontSize: 36, fontWeight: 800, color: G.gold }}>~2h</div>
            <div style={{ color: G.muted, fontSize: 12, marginTop: 4 }}>Average response time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
