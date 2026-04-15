import { useState, useEffect } from "react";
import { G } from "../lib/tokens.js";
import { useIsMobile } from "../lib/useIsMobile.js";

// ── TUTORIAL STEPS ────────────────────────────────────────────
const STEPS = [
  {
    emoji: "⭐",
    title: "Welcome to StarBookNow!",
    subtitle: "Your backstage pass to the stars",
    body: "This quick tour will show you everything you can do here. It only takes 1 minute — and after this, you'll be a pro! Tap the arrow below to start.",
    tip: null,
    color: "#f1c97d",
  },
  {
    emoji: "🌟",
    title: "Browse Celebrities",
    subtitle: "Find your favourite star",
    body: "Go to the ✨ Celebrities page from the menu at the top. You'll see hundreds of real stars — singers, athletes, actors and more! Tap on any celebrity card to learn about them.",
    tip: "💡 Tap the ♡ heart button on any celebrity to save them to your favourites list!",
    color: "#f1c97d",
  },
  {
    emoji: "📅",
    title: "Book a Celebrity",
    subtitle: "Make something amazing happen",
    body: "When you open a celebrity's profile, tap Book Now to start a booking. You can book them for:\n\n• 🎤 Events & appearances\n• 🎥 Personal video messages\n• 🤝 Meet & Greet experiences\n• 💼 Brand campaigns",
    tip: "💡 Fill in the form and choose how you want to pay. Our team reviews every request!",
    color: "#6DBF7B",
  },
  {
    emoji: "👑",
    title: "VIP Membership Plans",
    subtitle: "Unlock premium benefits",
    body: "Want even more? Upgrade your plan on the 💎 Pricing page:\n\n• 🆓 Free — Browse & donate\n• 👑 Premium VIP — Fan cards, priority support\n• 💎 Platinum Elite — All bookings, concierge service",
    tip: "💡 Go to Pricing in the menu to see all the perks and pick the right plan for you.",
    color: "#b8d4f0",
  },
  {
    emoji: "🃏",
    title: "Fan Cards",
    subtitle: "Your celebrity collector card",
    body: "Fan Cards are special digital collector cards you can get for your favourite celebrities. They look amazing and show you're a true fan! Find them on any celebrity's profile page.",
    tip: "💡 Platinum Elite members get exclusive fan card add-ons and special designs!",
    color: "#f1c97d",
  },
  {
    emoji: "📊",
    title: "Your Dashboard",
    subtitle: "Your personal control centre",
    body: "Tap your name or avatar in the top-right corner to open your Dashboard. Here you can:\n\n• 📋 See all your bookings\n• ❤️ View your saved favourites\n• 🪪 Manage your profile\n• 🎟️ See your memberships",
    tip: "💡 Your dashboard updates in real time — check back after you make a booking!",
    color: "#6DBF7B",
  },
  {
    emoji: "💬",
    title: "Live Support Chat",
    subtitle: "Real help, any time",
    body: "See the ★ gold button in the bottom-right corner of every page? Tap it anytime to chat live with a real support agent! They can help you with bookings, questions, or anything at all.",
    tip: "💡 You can also visit the Support page from the menu for more ways to get help.",
    color: "#f1c97d",
  },
  {
    emoji: "🎉",
    title: "You're All Set!",
    subtitle: "Let's get booking!",
    body: "You now know everything you need to get started on StarBookNow. Go ahead and browse the celebrities — your dream booking is just a few taps away!\n\nYou can always come back to this tutorial from the Support page.",
    tip: null,
    color: "#f1c97d",
  },
];

// ── COMPONENT ─────────────────────────────────────────────────
export default function TutorialModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState("in"); // "in" | "out-left" | "out-right"
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  // Reset step when opened
  useEffect(() => {
    if (open) {
      setStep(0);
      setAnimDir("in");
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  function goTo(next) {
    const dir = next > step ? "out-left" : "out-right";
    setAnimDir(dir);
    setTimeout(() => {
      setStep(next);
      setAnimDir("in");
    }, 220);
  }

  function handleNext() {
    if (isLast) { onClose(); return; }
    goTo(step + 1);
  }

  function handlePrev() {
    if (isFirst) return;
    goTo(step - 1);
  }

  function handleSkip() { onClose(); }

  if (!open && !visible) return null;

  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.82)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: isMobile ? "16px" : "24px",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.3s ease",
  };

  const cardStyle = {
    background: `linear-gradient(145deg, #1c1b1b 0%, #201f1f 100%)`,
    border: `1px solid ${G.border}`,
    borderRadius: isMobile ? 20 : 28,
    width: "100%",
    maxWidth: isMobile ? "100%" : 500,
    overflow: "hidden",
    boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${current.color}22`,
    transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
    transition: "transform 0.35s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.35s ease",
  };

  const slideStyle = {
    transition: "opacity 0.22s ease, transform 0.22s ease",
    opacity: animDir === "in" ? 1 : 0,
    transform: animDir === "out-left" ? "translateX(-18px)" : animDir === "out-right" ? "translateX(18px)" : "translateX(0)",
  };

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={cardStyle}>

        {/* ── Progress bar ── */}
        <div style={{ height: 3, background: "#2a2a2a", position: "relative" }}>
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${((step + 1) / STEPS.length) * 100}%`,
            background: `linear-gradient(90deg, ${current.color}aa, ${current.color})`,
            borderRadius: "0 3px 3px 0",
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s ease",
          }} />
        </div>

        {/* ── Header ── */}
        <div style={{
          padding: isMobile ? "20px 20px 0" : "28px 32px 0",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: 2, fontWeight: 800,
            color: G.dim, textTransform: "uppercase",
          }}>
            Step {step + 1} of {STEPS.length}
          </div>
          {!isLast && (
            <button onClick={handleSkip} style={{
              background: "none", border: "none", cursor: "pointer",
              color: G.dim, fontSize: 12, fontFamily: G.sans,
              padding: "2px 8px", borderRadius: 6,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = G.text}
              onMouseLeave={e => e.target.style.color = G.dim}
            >
              Skip tour ✕
            </button>
          )}
        </div>

        {/* ── Slide content ── */}
        <div style={{ ...slideStyle, padding: isMobile ? "20px" : "24px 32px" }}>

          {/* Emoji icon */}
          <div style={{
            width: isMobile ? 64 : 76, height: isMobile ? 64 : 76,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${current.color}22 0%, ${current.color}06 100%)`,
            border: `1.5px solid ${current.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isMobile ? 30 : 36,
            marginBottom: 16,
            transition: "background 0.4s ease",
          }}>
            {current.emoji}
          </div>

          {/* Title */}
          <div style={{
            fontSize: isMobile ? 22 : 26, fontWeight: 800,
            color: G.text, fontFamily: G.serif,
            lineHeight: 1.25, marginBottom: 4,
          }}>
            {current.title}
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            color: current.color, textTransform: "uppercase",
            marginBottom: 16, opacity: 0.9,
          }}>
            {current.subtitle}
          </div>

          {/* Body */}
          <div style={{
            color: G.muted, fontSize: isMobile ? 14 : 15,
            lineHeight: 1.75, whiteSpace: "pre-line",
            marginBottom: current.tip ? 16 : 0,
          }}>
            {current.body}
          </div>

          {/* Tip box */}
          {current.tip && (
            <div style={{
              background: `${current.color}10`,
              border: `1px solid ${current.color}30`,
              borderRadius: 10, padding: "12px 14px",
              color: G.muted, fontSize: 13, lineHeight: 1.6,
            }}>
              {current.tip}
            </div>
          )}
        </div>

        {/* ── Dot indicators ── */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 6,
          paddingBottom: 6,
        }}>
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === step ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i === step ? current.color : "#333",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/* ── Navigation buttons ── */}
        <div style={{
          display: "flex", gap: 10, padding: isMobile ? "16px 20px 20px" : "16px 32px 28px",
          alignItems: "center",
        }}>
          {/* Back button */}
          <button
            onClick={handlePrev}
            disabled={isFirst}
            style={{
              flex: "0 0 auto",
              width: 44, height: 44, borderRadius: "50%",
              background: isFirst ? "transparent" : "#2a2a2a",
              border: `1px solid ${isFirst ? "transparent" : G.border}`,
              color: isFirst ? "transparent" : G.muted,
              fontSize: 18, cursor: isFirst ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { if (!isFirst) e.currentTarget.style.background = "#333"; }}
            onMouseLeave={e => { if (!isFirst) e.currentTarget.style.background = "#2a2a2a"; }}
          >
            ←
          </button>

          {/* Next / Finish button */}
          <button
            onClick={handleNext}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              background: isLast
                ? `linear-gradient(135deg, ${G.gold}, #c98a10)`
                : `linear-gradient(135deg, ${current.color}cc, ${current.color}99)`,
              border: "none",
              color: "#1a0f00", fontWeight: 800,
              fontSize: isMobile ? 14 : 15,
              cursor: "pointer", fontFamily: G.sans,
              letterSpacing: 0.5,
              transition: "all 0.3s ease",
              boxShadow: `0 4px 20px ${current.color}30`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${current.color}50`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 20px ${current.color}30`; }}
          >
            {isLast ? "🚀 Let's Go!" : `Next →`}
          </button>
        </div>

      </div>
    </div>
  );
}
