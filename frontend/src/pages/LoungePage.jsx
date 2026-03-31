import { useIsMobile } from "../lib/useIsMobile.js";
import { Button } from "../components/ui/button.jsx";
import { celebPlaceholder } from "../lib/tokens.js";
import vipCardImg from "../assets/vip card.png";
import platinumCardImg from "../assets/platinum card.png";

const VIP_PERKS = [
  ["🎯", "Priority Booking", "Skip the queue. Your requests are reviewed first."],
  ["🎬", "Exclusive Content", "Behind-the-scenes access and member-only videos."],
  ["🎁", "Birthday Surprises", "A personal message from your celebrity on your big day."],
  ["💰", "Member Discounts", "Special rates on future bookings with your celebrity."],
];

const PLAT_PERKS = [
  ...VIP_PERKS,
  ["🤝", "Private Meet & Greet", "Exclusive face-to-face sessions arranged just for you."],
  ["✍️", "Signed Memorabilia", "Authentic signed merchandise delivered to your door."],
  ["☎️", "Concierge Line", "Direct line to your personal booking concierge."],
  ["⚡", "Same-Day Response", "All requests guaranteed a response within hours."],
];

export default function LoungePage({ user, memberships, setPage, onBook }) {
  const isMobile = useIsMobile();
  const approved = memberships.filter(m => m.status === "approved");
  const pending  = memberships.filter(m => m.status !== "approved");
  const isPlat   = approved.some(m => m.tier === "platinum");
  const perks    = isPlat ? PLAT_PERKS : VIP_PERKS;
  const tierLabel = isPlat ? "Platinum Elite" : "VIP";
  const tierColor = isPlat ? "#b8cce8" : "#f0bf5a";
  const tierGrad  = isPlat
    ? "linear-gradient(135deg, #0d1520 0%, #152030 40%, #0d1a28 100%)"
    : "linear-gradient(135deg, #0a1628 0%, #0d2137 40%, #0a1e30 70%, #071420 100%)";

  return (
    <div className="min-h-screen bg-background pt-[68px]">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: tierGrad, minHeight: isMobile ? 220 : 280 }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: isPlat
            ? "radial-gradient(circle at 20% 50%, rgba(180,200,240,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(180,200,240,0.2) 0%, transparent 40%)"
            : "radial-gradient(circle at 20% 50%, rgba(240,191,90,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(240,191,90,0.15) 0%, transparent 40%)"
        }} />
        <div className={`relative z-10 max-w-[1100px] mx-auto ${isMobile ? "px-5 py-10" : "px-10 py-14"}`}>
          <div className="text-xs font-bold tracking-[3px] uppercase mb-3" style={{ color: tierColor }}>
            {isPlat ? "💎" : "👑"} Members Lounge
          </div>
          <h1 className="text-white font-serif font-extrabold leading-tight mb-2" style={{ fontSize: isMobile ? 26 : 40 }}>
            Welcome back, {user.name.split(" ")[0]}.
          </h1>
          <p className="text-white/50 text-sm max-w-[480px] leading-relaxed">
            You're a <span style={{ color: tierColor, fontWeight: 700 }}>{tierLabel} Member</span>. Your exclusive privileges are active.
          </p>
        </div>
      </div>

      <div className={`max-w-[1100px] mx-auto ${isMobile ? "px-5 py-10" : "px-10 py-14"}`}>

        {/* ── Active membership cards ── */}
        {approved.length > 0 && (
          <section className="mb-14">
            <h2 className="font-serif text-foreground font-bold text-xl mb-6">Your Memberships</h2>
            <div className={`grid gap-5 ${isMobile ? "grid-cols-1" : "grid-cols-2 max-w-[700px]"}`}>
              {approved.map(m => {
                const cardImg = m.tier === "platinum" ? platinumCardImg : vipCardImg;
                const label   = m.tier === "platinum" ? "PLAT" : "VIP";
                return (
                  <div key={m.bookingId} className="rounded-2xl overflow-hidden border border-border shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                    <div className="relative h-44 flex items-center justify-between px-5" style={{
                      backgroundImage: `url(${cardImg})`, backgroundSize: "cover", backgroundPosition: "center"
                    }}>
                      <div className="absolute inset-0 bg-black/20" />
                      <img
                        src={m.celebImg || celebPlaceholder(m.celebName)}
                        alt={m.celebName}
                        onError={e => { e.target.src = celebPlaceholder(m.celebName); }}
                        className="relative z-10 w-14 h-[72px] object-cover rounded-lg shadow-lg border-2 border-white/30"
                      />
                      <div className="relative z-10 text-right">
                        <div className="text-white/60 font-bold tracking-[3px] uppercase" style={{ fontSize: 9 }}>
                          {m.tier === "platinum" ? "Platinum" : "VIP Member"}
                        </div>
                        <div className="font-serif font-extrabold text-3xl text-white/90">{label}</div>
                        <div className="text-white/50 font-bold mt-0.5" style={{ fontSize: 9 }}>
                          {m.celebName.split(" ")[0].toUpperCase()}
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 text-xl opacity-80">
                        {m.tier === "platinum" ? "💎" : "👑"}
                      </div>
                    </div>
                    <div className="bg-card p-4">
                      <div className="text-foreground font-bold text-sm font-serif mb-0.5">{m.celebName}</div>
                      <div className="text-muted-foreground text-[11px] mb-3">
                        {m.tier === "platinum" ? "Platinum Elite Card" : "Royal VIP Card"} · year membership
                      </div>
                      <Button size="sm" className="w-full text-xs" onClick={() => onBook({ id: m.celebId, name: m.celebName, img: m.celebImg }, "booking")}>
                        Book Priority Session →
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Pending memberships notice ── */}
        {pending.length > 0 && (
          <section className="mb-10">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
              <div className="text-amber-400 font-bold text-sm mb-1">⏳ Pending Activation</div>
              <div className="text-muted-foreground text-xs leading-relaxed">
                {pending.length} membership{pending.length > 1 ? "s are" : " is"} awaiting admin approval. Your full lounge privileges will unlock once confirmed.
              </div>
            </div>
          </section>
        )}

        {/* ── Perks grid ── */}
        <section className="mb-14">
          <h2 className="font-serif text-foreground font-bold text-xl mb-6">
            Your {tierLabel} Privileges
          </h2>
          <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
            {perks.map(([icon, title, desc]) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5 flex gap-4 items-start hover:border-primary/30 transition-colors duration-300">
                <div className="text-2xl shrink-0">{icon}</div>
                <div>
                  <div className="text-foreground font-semibold text-sm mb-1 font-serif">{title}</div>
                  <div className="text-muted-foreground text-xs leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Exclusive content placeholder ── */}
        <section className="mb-14">
          <h2 className="font-serif text-foreground font-bold text-xl mb-6">Exclusive Content</h2>
          <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
            {[
              ["🎬", "Behind the Scenes", "Exclusive behind-the-scenes footage available for members only."],
              ["📸", "Private Gallery", "High-resolution photos from private events and sessions."],
              ["🎙️", "Member Podcast", "Monthly conversations recorded exclusively for VIP members."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-28 flex items-center justify-center" style={{
                  background: isPlat
                    ? "linear-gradient(135deg, #0d1520, #152030)"
                    : "linear-gradient(135deg, #0a1628, #0d2137)"
                }}>
                  <div className="text-4xl opacity-40">{icon}</div>
                </div>
                <div className="p-4">
                  <div className="text-foreground font-semibold text-sm font-serif mb-1">{title}</div>
                  <div className="text-muted-foreground text-[11px] leading-relaxed mb-3">{desc}</div>
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: tierColor }}>
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="rounded-2xl border border-border p-8 text-center" style={{
          background: isPlat
            ? "linear-gradient(135deg, rgba(180,200,240,0.05), rgba(180,200,240,0.02))"
            : "linear-gradient(135deg, rgba(240,191,90,0.07), rgba(240,191,90,0.02))"
        }}>
          <div className="text-3xl mb-3">{isPlat ? "💎" : "👑"}</div>
          <h3 className="font-serif text-foreground font-bold text-lg mb-2">Ready to book your next experience?</h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            As a {tierLabel} member, your requests are always prioritised.
          </p>
          <Button onClick={() => setPage("celebrities")}>Browse Celebrities →</Button>
        </div>

        <button
          onClick={() => setPage("dashboard")}
          className="mt-8 text-muted-foreground text-sm hover:text-primary transition-colors bg-transparent border-none cursor-pointer block"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
