import { useEffect } from "react";
import { avatar } from "../lib/tokens.js";
import { Stars } from "../components/ui.jsx";
import { Button } from "../components/ui/button.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";

export default function FanCardPage({ c, onBook, setPage }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!c) setPage("celebrities");
  }, [c, setPage]);

  if (!c) return null;

  const vipPrice      = c.vipPrice      || 299;
  const platinumPrice = c.platinumPrice || 999;
  const celebImg      = c.img || avatar(c.name);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0d2137 40%, #0a1e30 70%, #071420 100%)",
          minHeight: isMobile ? 280 : 340,
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(240,191,90,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(240,191,90,0.15) 0%, transparent 40%)"
        }} />

        <div className={`relative z-10 max-w-[1100px] mx-auto flex items-center gap-8 ${isMobile ? "px-5 py-10 flex-col text-center" : "px-10 py-12"}`}>
          <div className="shrink-0">
            <img
              src={celebImg}
              alt={c.name}
              onError={e => { e.target.src = avatar(c.name); }}
              className="rounded-xl object-cover shadow-[0_8px_40px_rgba(0,0,0,0.6)] border border-white/10"
              style={{ width: isMobile ? 120 : 200, height: isMobile ? 150 : 240 }}
            />
          </div>
          <div className={isMobile ? "" : "flex-1"}>
            {c.feat && (
              <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/40 rounded-full px-3 py-1 mb-4">
                <span className="text-primary text-[10px]">⭐</span>
                <span className="text-primary text-[10px] font-bold tracking-[2px] uppercase">Featured</span>
              </div>
            )}
            <h1 className="text-white font-serif font-extrabold leading-tight mb-1" style={{ fontSize: isMobile ? 22 : 34 }}>
              {c.name}
            </h1>
            <p className="text-white/50 text-sm mb-4 font-medium">VIP Exclusive Membership</p>
            <div className={`flex gap-3 mb-4 flex-wrap ${isMobile ? "justify-center" : ""}`}>
              {c.country && (
                <div className="flex items-center gap-1.5 bg-white/8 border border-white/12 rounded-full px-3 py-1">
                  <span className="text-xs">{c.flag}</span>
                  <span className="text-white/70 text-[11px] font-medium">{c.country}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-white/8 border border-white/12 rounded-full px-3 py-1">
                <Stars r={c.rating || 5} size={10} />
                <span className="text-white/70 text-[11px] font-medium">{c.rating || 5} ({c.reviews || 0} reviews)</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-[520px]">
              Become an exclusive VIP member and unlock priority booking, exclusive content, special discounts, and birthday surprises from <strong className="text-white/80">{c.name}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Membership Cards ── */}
      <div className={`max-w-[1100px] mx-auto ${isMobile ? "px-5 py-10" : "px-10 py-14"}`}>
        <h2 className="font-serif text-foreground font-bold mb-8 text-xl">Available Memberships</h2>

        <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2 max-w-[680px]"}`}>

          {/* VIP Fan Card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
            {/* Gold card visual */}
            <div className="relative h-48 flex items-center justify-between px-6" style={{
              background: "linear-gradient(135deg, #c8920a 0%, #f5cc6a 35%, #e8a830 60%, #c8920a 100%)"
            }}>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.6) 0%, transparent 60%)"
              }} />
              {/* Celeb photo */}
              <img
                src={celebImg}
                alt={c.name}
                onError={e => { e.target.src = avatar(c.name); }}
                className="relative z-10 w-16 h-20 object-cover rounded-lg shadow-lg border-2 border-white/40"
              />
              <div className="relative z-10 text-right">
                <div style={{ color: "rgba(100,60,0,0.6)", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>VIP Member</div>
                <div className="font-serif font-extrabold text-3xl" style={{ color: "rgba(100,60,0,0.85)" }}>VIP</div>
                <div style={{ color: "rgba(100,60,0,0.5)", fontSize: 9, fontWeight: 700, marginTop: 2 }}>{c.name.split(" ")[0].toUpperCase()}</div>
              </div>
              <div className="absolute top-3 right-3 text-2xl opacity-70">👑</div>
              <div className="absolute top-3 left-3 bg-[#0d2137] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">${vipPrice.toLocaleString()}</div>
            </div>
            <div className="p-5">
              <h3 className="text-foreground font-bold text-base mb-1 font-serif">Royal Membership Card</h3>
              <p className="text-muted-foreground text-[12px] mb-4 leading-relaxed">
                Priority booking · Exclusive content · Special discounts · Birthday surprises
              </p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold text-lg font-serif">${vipPrice.toLocaleString()} <span className="text-muted-foreground text-xs font-normal">/ lifetime</span></span>
                <Button size="sm" className="px-5" onClick={() => onBook(c, "fan_card")}>Buy Now →</Button>
              </div>
            </div>
          </div>

          {/* Platinum Elite Card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
            {/* Platinum card visual */}
            <div className="relative h-48 flex items-center justify-between px-6" style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 35%, #1a1a2e 60%, #252548 100%)"
            }}>
              <div className="absolute inset-0 opacity-25" style={{
                backgroundImage: "radial-gradient(ellipse at 30% 40%, rgba(180,180,255,0.4) 0%, transparent 60%)"
              }} />
              {/* Celeb photo */}
              <img
                src={celebImg}
                alt={c.name}
                onError={e => { e.target.src = avatar(c.name); }}
                className="relative z-10 w-16 h-20 object-cover rounded-lg shadow-lg border-2 border-white/20"
              />
              <div className="relative z-10 text-right">
                <div style={{ color: "rgba(200,200,255,0.5)", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Platinum</div>
                <div className="font-serif font-extrabold text-3xl" style={{ color: "rgba(200,200,255,0.8)" }}>PLAT</div>
                <div style={{ color: "rgba(200,200,255,0.4)", fontSize: 9, fontWeight: 700, marginTop: 2 }}>{c.name.split(" ")[0].toUpperCase()}</div>
              </div>
              <div className="absolute top-3 right-3 text-2xl opacity-70">💎</div>
              <div className="absolute top-3 left-3 bg-primary text-[#1a0f00] text-[11px] font-bold px-2.5 py-1 rounded-full">${platinumPrice.toLocaleString()}</div>
            </div>
            <div className="p-5">
              <h3 className="text-foreground font-bold text-base mb-1 font-serif">Platinum Elite Card</h3>
              <p className="text-muted-foreground text-[12px] mb-4 leading-relaxed">
                All VIP perks · Private meet &amp; greet · Signed memorabilia · Concierge line
              </p>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold text-lg font-serif">${platinumPrice.toLocaleString()} <span className="text-muted-foreground text-xs font-normal">/ lifetime</span></span>
                <Button size="sm" className="px-5" onClick={() => onBook(c, "fan_card_platinum")}>Buy Now →</Button>
              </div>
            </div>
          </div>

        </div>

        <button
          onClick={() => setPage("celebrities")}
          className="mt-10 text-muted-foreground text-sm hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Back to Celebrities
        </button>
      </div>
    </div>
  );
}
