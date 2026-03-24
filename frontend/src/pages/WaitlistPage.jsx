import { useState, useEffect, useRef } from "react";
import { WS_URL, fmtDate } from "../lib/tokens.js";
import { api } from "../api.js";
import { useIsMobile } from "../lib/useIsMobile.js";
import { cn } from "../lib/utils.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card } from "../components/ui/card.jsx";

const TOPICS = ["Celebrity Booking", "Corporate Event", "Private Gala", "Brand Campaign", "Meet & Greet", "Keynote Speaker", "Custom Experience"];
const BUDGETS = ["$1,000 – $5,000", "$5,000 – $15,000", "$15,000 – $50,000", "$50,000+", "Flexible"];

export default function WaitlistPage({ user }) {
  const isMobile = useIsMobile();
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
      if (msg.type === "waitlist_attended" && msg.sessionId) {
        setEntry(prev => ({ ...prev, status: "attending", chatSessionId: msg.sessionId }));
        // Pre-save session so SupportChat can auto-join
        const saved = { sessionId: msg.sessionId, name: entry.name, email: entry.email };
        localStorage.setItem("sb_chat_session", JSON.stringify(saved));
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
    waiting:   { label: "In Queue",       colorClass: "text-[#D4A84B]", bgClass: "bg-[#D4A84B]/10", borderClass: "border-[#D4A84B]/40", icon: "⏳" },
    attending: { label: "Now Attending",  colorClass: "text-[#6DBF7B]", bgClass: "bg-[#6DBF7B]/10", borderClass: "border-[#6DBF7B]/40", icon: "✅" },
    done:      { label: "Completed",      colorClass: "text-primary",   bgClass: "bg-primary/10",    borderClass: "border-primary/40",   icon: "🏆" },
    cancelled: { label: "Cancelled",      colorClass: "text-destructive",bgClass: "bg-destructive/10",borderClass: "border-destructive/40",icon: "✕" },
  };

  return (
    <div className="min-h-screen bg-background pt-[68px]">
      {/* Hero */}
      <div className={cn("relative overflow-hidden", isMobile ? "px-5 pt-12 pb-10" : "px-[60px] pt-20 pb-[60px]")}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80')",
            filter: "brightness(0.12) grayscale(20%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        <div className="relative z-10 max-w-[680px]">
          <span className="block mb-4 text-[11px] font-bold tracking-[3px] uppercase text-primary">
            Exclusive Access
          </span>
          <h1 className="font-serif text-[clamp(36px,5vw,68px)] font-extrabold text-foreground leading-[1.05] mb-5 mt-0">
            Join the<br /><span className="text-primary italic">Concierge Waitlist.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-[1.8] max-w-[520px] m-0">
            Secure your place in the queue to be personally attended by one of our elite concierge agents for bespoke celebrity booking assistance.
          </p>
        </div>
      </div>

      <div className={cn(
        "max-w-[1100px] mx-auto grid items-start",
        isMobile
          ? "grid-cols-1 gap-6 px-4 pb-[60px]"
          : "grid-cols-[1fr_380px] gap-12 px-[60px] pb-20"
      )}>

        {/* Left: form or status */}
        <div>
          {stage === "form" && (
            <div className={cn(
              "rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
              isMobile ? "p-5" : "p-10"
            )}>
              <h2 className={cn(
                "font-serif font-bold text-foreground mt-0 mb-7",
                isMobile ? "text-[22px]" : "text-[26px]"
              )}>
                Reserve Your Spot
              </h2>

              {error && (
                <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-[13px] text-destructive">
                  ⚠️ {error}
                </div>
              )}

              <div className={cn("grid gap-4 mb-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Email Address *</Label>
                  <Input
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="mb-3.5">
                <Label className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">
                  Event Type
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, eventType: t }))}
                      className={cn(
                        "rounded-full border px-4 py-[7px] text-xs font-semibold transition-all duration-200 cursor-pointer",
                        form.eventType === t
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-white/5 border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cn("grid gap-4 mb-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Preferred Date</Label>
                  <Input
                    value={form.preferredDate}
                    onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                    type="date"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Budget Range</Label>
                  <select
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans"
                  >
                    <option value="">Select range</option>
                    {BUDGETS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Additional Notes</Label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Tell us about your event, requirements, or specific celebrities you have in mind..."
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              <Button
                onClick={submit}
                disabled={loading}
                className="w-full py-[15px] text-sm mt-2"
              >
                {loading ? "Joining waitlist..." : "Secure My Spot →"}
              </Button>
            </div>
          )}

          {stage === "submitted" && (
            <div className={cn(
              "rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-center",
              isMobile ? "p-8" : "p-[60px]"
            )}>
              <div className="text-[52px] mb-5">🎉</div>
              <h2 className="font-serif text-[28px] font-bold text-primary mt-0 mb-3">You're In!</h2>
              <p className="text-muted-foreground text-sm leading-[1.8]">Loading your queue status...</p>
            </div>
          )}

          {stage === "live" && entry && (
            <div className="flex flex-col gap-5">
              {/* Position card */}
              <div className="rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-9 text-center">
                <div className="text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground mb-4">
                  Your Queue Position
                </div>
                <div className={cn(
                  "font-serif font-black text-primary leading-none mb-2",
                  isMobile ? "text-[72px]" : "text-[96px]"
                )}>
                  #{entry.position || "—"}
                </div>
                <div className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-5 py-2 mt-2",
                  statusConfig[entry.status]?.bgClass || "bg-primary/10",
                  statusConfig[entry.status]?.borderClass || "border-primary/40"
                )}>
                  <span>{statusConfig[entry.status]?.icon}</span>
                  <span className={cn("font-bold text-[13px]", statusConfig[entry.status]?.colorClass || "text-primary")}>
                    {statusConfig[entry.status]?.label}
                  </span>
                </div>
                {wsConnected && (
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60">
                    <div className="w-[7px] h-[7px] rounded-full bg-[#6DBF7B]" />
                    Live updates active
                  </div>
                )}
              </div>

              {/* Details card */}
              <div className="rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-7">
                <h3 className="font-serif text-[18px] font-bold text-foreground mt-0 mb-5">Your Request Details</h3>
                {[["Name", entry.name], ["Email", entry.email], ["Event Type", entry.eventType || "—"], ["Preferred Date", entry.preferredDate || "—"], ["Budget", entry.budget || "—"], ["Submitted", fmtDate(entry.createdAt)]].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 border-b border-border">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.5px]">{k}</span>
                    <span className="text-foreground text-[13px] font-medium max-w-[60%] text-right">{v}</span>
                  </div>
                ))}
              </div>

              {entry.status === "attending" && (
                <div className="rounded-2xl border border-[#6DBF7B]/30 bg-[#6DBF7B]/[0.08] p-6 text-center">
                  <div className="text-[32px] mb-2.5">🎯</div>
                  <div className="text-[#6DBF7B] font-bold text-base mb-1.5">An agent is ready for you!</div>
                  <div className="text-muted-foreground text-[13px] leading-[1.7] mb-4">Your personal concierge is waiting. Open the live chat now.</div>
                  <Button
                    onClick={() => {
                      if (entry.chatSessionId) {
                        window.dispatchEvent(new CustomEvent("starbooknow:join-chat", { detail: { sessionId: entry.chatSessionId } }));
                      }
                    }}
                    className="px-8 py-3 text-[13px]"
                  >
                    💬 Open Live Chat →
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: info panel */}
        <div className={cn(
          "flex flex-col gap-5",
          !isMobile && "sticky top-[100px]"
        )}>
          <div className="rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-7">
            <h3 className="font-serif text-[18px] font-bold text-foreground mt-0 mb-5">What to Expect</h3>
            {[
              ["🎯", "Personalised Matching", "A dedicated agent will curate a shortlist of celebrities tailored to your event."],
              ["⚡", "Priority Access", "Waitlist members get first access to newly available talent and special packages."],
              ["🤝", "White-Glove Service", "From contract to day-of logistics, we handle everything seamlessly."],
              ["🔒", "Confidential & Secure", "All inquiries are handled with complete discretion and privacy."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-3.5 mb-5 last:mb-0">
                <div className="text-[22px] shrink-0">{icon}</div>
                <div>
                  <div className="text-foreground font-bold text-[13px] mb-1">{title}</div>
                  <div className="text-muted-foreground/60 text-xs leading-[1.6]">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-6 text-center">
            <div className="font-serif text-[36px] font-extrabold text-primary">~2h</div>
            <div className="text-muted-foreground text-xs mt-1">Average response time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
