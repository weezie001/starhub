import { useState, useEffect, useRef } from "react";
import { G, avatar } from "../lib/tokens.js";
import { CELEBS, CATS, SERVICES, TESTIMONIALS, SPONSORS } from "../lib/data.js";
import { Stars, Badge, Btn } from "../components/ui.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";

function SponsorLogo({ name }) {
  return (
    <div style={{ padding: "0 30px", display: "flex", alignItems: "center", gap: 10 }}>
      {name === "Rolex" && <span style={{ fontSize: 18 }}>👑</span>}
      <span style={{ color: G.dim, fontSize: 14, fontWeight: 700, letterSpacing: 3, fontFamily: G.sans, opacity: 0.35, cursor: "default", textTransform: "uppercase" }}>
        {name}
      </span>
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function HomePage({ onView, onBook, favorites, onFav, setPage, openChat }) {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const isMobile = useIsMobile();

  const heroRef = useReveal();
  const featRef = useReveal();
  const catsRef = useReveal();
  const whyRef = useReveal();
  const testRef = useReveal();
  const sponsorsRef = useReveal();

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: isMobile ? "100px 20px 80px" : "120px 60px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.3)" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${G.bg}cc 0%, ${G.bg}40 40%, ${G.bg}ee 100%)` }} />
        <div style={{ maxWidth: 860, position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28, background: `${G.gold}12`, border: `1px solid ${G.gold}30`, borderRadius: 50, padding: "7px 20px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.green, display: "inline-block" }} />
            <span style={{ color: G.gold, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>500+ A-List Celebrities Available Now</span>
          </div>
          <h1 style={{ fontSize: "clamp(42px,8vw,96px)", fontFamily: G.serif, color: G.cream, lineHeight: 1.0, margin: "0 0 28px", fontWeight: 800, letterSpacing: -2 }}>
            The Stage is<br /><span style={{ color: G.gold, fontStyle: "italic" }}>Yours.</span>
          </h1>
          <p style={{ color: G.muted, fontSize: "clamp(14px,1.8vw,19px)", lineHeight: 1.8, maxWidth: 560, margin: "0 0 44px", fontWeight: 400 }}>
            Secure exclusive bookings with the world's most influential talent. An elite gateway to iconic performances and private appearances.
          </p>
          {/* Search bar pill */}
          <div style={{ background: "rgba(42,42,42,0.7)", backdropFilter: "blur(16px)", border: `1px solid ${G.border}`, borderRadius: 50, padding: "6px 6px 6px 24px", display: "flex", alignItems: "center", gap: 12, maxWidth: 580, marginBottom: 28 }}>
            <span style={{ color: G.gold, fontSize: 16 }}>⌕</span>
            <input placeholder="Search celebrity, genre, or event type..." style={{ flex: 1, background: "transparent", border: "none", color: G.text, fontSize: 14, outline: "none", fontFamily: G.sans, padding: "10px 0", minWidth: 0 }} onFocus={() => setPage("celebrities")} />
            <Btn onClick={() => setPage("celebrities")} style={{ padding: "11px 26px", fontSize: 12, flexShrink: 0 }}>Search</Btn>
          </div>
          {/* Category pills */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ color: G.dim, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Explore:</span>
            {CATS.map(cat => (
              <button key={cat.id} onClick={() => setPage("celebrities")} style={{ background: "rgba(53,53,52,0.5)", border: `1px solid ${G.border}`, borderRadius: 50, padding: "7px 18px", color: G.muted, fontSize: 12, cursor: "pointer", fontFamily: G.sans, fontWeight: 500, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = G.gold + "80"; e.currentTarget.style.color = G.gold; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
        {/* Scroll indicator */}
        {!isMobile && (
          <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
            <span style={{ color: G.muted, fontSize: 10, letterSpacing: 3, textTransform: "uppercase" }}>Scroll</span>
            <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${G.gold}, transparent)` }} />
          </div>
        )}
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: `linear-gradient(180deg, ${G.s1} 0%, ${G.bg} 100%)`, borderTop: `1px solid ${G.gold}25`, borderBottom: `1px solid ${G.border}`, padding: isMobile ? "40px 20px" : "56px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 32 : 24, textAlign: "center" }}>
          {[["500+", "Celebrity Roster"], ["100K+", "Happy Clients"], ["10+", "Years Experience"], ["24/7", "Concierge Support"]].map(([n, l], i) => (
            <div key={l} style={{ position: "relative" }}>
              <div style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 800, color: G.gold, fontFamily: G.serif, lineHeight: 1, letterSpacing: -1 }}>{n}</div>
              <div style={{ color: G.muted, fontSize: 11, marginTop: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>{l}</div>
              {!isMobile && i < 3 && <div style={{ position: "absolute", right: 0, top: "10%", height: "80%", width: 1, background: `linear-gradient(to bottom, transparent, ${G.border}, transparent)` }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED CELEBRITIES ── */}
      <section ref={featRef} className="reveal" style={{ padding: isMobile ? "60px 20px" : "100px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}>
          <div>
            <span style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Curated Selection</span>
            <h2 style={{ fontSize: "clamp(26px,5vw,52px)", fontFamily: G.serif, color: G.cream, margin: "0 0 12px", fontWeight: 700 }}>Featured Talent</h2>
            <div style={{ height: 3, width: 64, background: `linear-gradient(90deg, ${G.gold}, ${G.goldD})`, borderRadius: 2 }} />
          </div>
          <button onClick={() => setPage("celebrities")} style={{ background: "none", border: "none", color: G.gold, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontFamily: G.sans, letterSpacing: 0.5, flexShrink: 0 }}>
            {isMobile ? "All →" : "View Full Roster →"}
          </button>
        </div>
        {/* Bento grid layout */}
        {(() => {
          const feat = CELEBS.filter(c => c.feat);
          const [main, ...rest] = feat;
          const sideCards = rest.slice(0, 4);
          if (isMobile) {
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                {[main, ...sideCards].filter(Boolean).slice(0, 3).map((c, idx) => (
                  <div key={c.id} className="celeb-card" onClick={() => onView(c)} style={{ position: "relative", borderRadius: 20, overflow: "hidden", cursor: "pointer", background: G.card, boxShadow: `0 4px 20px #00000040`, height: idx === 0 ? 320 : 220 }}>
                    <img className="celeb-img" src={c.img || avatar(c.name)} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = avatar(c.name)} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d0d0d 0%, transparent 60%)" }} />
                    {idx === 0 && <div style={{ position: "absolute", top: 20, left: 20 }}>
                      <span style={{ background: `${G.gold}22`, color: G.gold, border: `1px solid ${G.gold}40`, backdropFilter: "blur(8px)", borderRadius: 50, padding: "5px 16px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "inline-block" }}>⭐ Top Pick</span>
                    </div>}
                    <div style={{ position: "absolute", bottom: 0, padding: idx === 0 ? "24px 24px" : "18px 22px" }}>
                      <h3 style={{ fontFamily: G.serif, fontSize: idx === 0 ? 28 : 21, fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.05 }}>{c.name}</h3>
                      {idx === 0 && <div style={{ display: "flex", gap: 10 }}>
                        <Btn onClick={e => { e.stopPropagation(); onBook(c, "booking"); }} style={{ padding: "9px 18px", fontSize: 11 }} disabled={!c.avail}>Book Now</Btn>
                        <Btn variant="outline" onClick={e => { e.stopPropagation(); onView(c); }} style={{ padding: "9px 18px", fontSize: 11 }}>View</Btn>
                      </div>}
                      {idx > 0 && <p style={{ color: G.gold, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>{c.flag} {c.cat}</p>}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: `360px ${sideCards.length > 2 ? "300px" : "0"}`, gap: 16 }}>
              {main && (
                <div className="celeb-card" onClick={() => onView(main)} style={{ gridRow: sideCards.length > 2 ? "1 / 3" : "1", position: "relative", borderRadius: 20, overflow: "hidden", cursor: "pointer", background: G.card, boxShadow: `0 8px 32px #00000060` }}>
                  <img className="celeb-img" src={main.img || avatar(main.name)} alt={main.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = avatar(main.name)} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d0d0d 0%, rgba(13,13,13,0.1) 50%, transparent 100%)" }} />
                  <div style={{ position: "absolute", top: 20, left: 20 }}>
                    <span style={{ background: `${G.gold}22`, color: G.gold, border: `1px solid ${G.gold}40`, backdropFilter: "blur(8px)", borderRadius: 50, padding: "5px 16px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "inline-block" }}>⭐ Top Pick</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, padding: "32px 36px" }}>
                    <h3 style={{ fontFamily: G.serif, fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.05 }}>{main.name}</h3>
                    <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, margin: "0 0 20px", lineHeight: 1.6 }}>{main.bio.slice(0, 90)}...</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Btn onClick={e => { e.stopPropagation(); onBook(main, "booking"); }} style={{ padding: "10px 22px", fontSize: 11 }} disabled={!main.avail}>Book Now</Btn>
                      <Btn variant="outline" onClick={e => { e.stopPropagation(); onView(main); }} style={{ padding: "10px 22px", fontSize: 11 }}>View Profile</Btn>
                    </div>
                  </div>
                </div>
              )}
              {sideCards.map(c => (
                <div key={c.id} className="celeb-card" onClick={() => onView(c)} style={{ position: "relative", borderRadius: 20, overflow: "hidden", cursor: "pointer", background: G.card, boxShadow: `0 4px 20px #00000040` }}>
                  <img className="celeb-img" src={c.img || avatar(c.name)} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = avatar(c.name)} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d0d0d 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", bottom: 0, padding: "18px 22px" }}>
                    <h3 style={{ fontFamily: G.serif, fontSize: 21, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{c.name}</h3>
                    <p style={{ color: G.gold, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>{c.flag} {c.cat}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onFav(c.id); }} style={{ position: "absolute", top: 14, right: 14, background: "rgba(13,13,13,0.5)", backdropFilter: "blur(8px)", border: `1px solid ${G.border}40`, borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(13,13,13,0.8)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(13,13,13,0.5)"}>
                    {favorites.includes(c.id) ? "❤️" : "🤍"}
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Btn onClick={() => setPage("celebrities")} variant="outline" style={{ padding: "14px 40px", fontSize: 12 }}>View All {CELEBS.length}+ Celebrities →</Btn>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section ref={catsRef} className="reveal" style={{ background: G.bg, padding: isMobile ? "60px 20px" : "100px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 56 }}>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(24px,4vw,48px)", fontWeight: 700, color: G.cream, margin: 0, whiteSpace: "nowrap" }}>Trending Now</h2>
            <div style={{ height: 1, background: G.border, flex: 1 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
            {CATS.map(cat => (
              <div key={cat.id} onClick={() => setPage("celebrities")} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: isMobile ? "20px 16px" : "28px 24px", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = G.gold + "50"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 40px #00000040`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{cat.icon}</div>
                <div style={{ color: G.cream, fontWeight: 700, fontSize: 14, marginBottom: 4, fontFamily: G.serif }}>{cat.name}</div>
                <div style={{ color: G.gold, fontSize: 13, fontWeight: 700, marginBottom: isMobile ? 0 : 10 }}>{cat.n}</div>
                {!isMobile && <div style={{ color: G.dim, fontSize: 12, lineHeight: 1.65 }}>{cat.desc}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding: isMobile ? "60px 20px" : "100px 60px", background: G.s1, borderTop: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>Services</div>
            <h2 style={{ fontSize: "clamp(24px,5vw,52px)", fontFamily: G.serif, color: G.text, margin: "0 0 14px", fontWeight: 700 }}>Everything You Need</h2>
            <p style={{ color: G.muted, fontSize: 15, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>From intimate video messages to grand event appearances — we've got it covered.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 28, transition: "all 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = G.gold + "50"; e.currentTarget.style.background = G.cardH; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.background = G.card; e.currentTarget.style.transform = "none"; }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ color: G.text, margin: "0 0 10px", fontSize: 18, fontFamily: G.serif, fontWeight: 700 }}>{s.title}</h3>
                <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.8, margin: "0 0 22px" }}>{s.desc}</p>
                <Btn variant="outline" onClick={openChat} style={{ padding: "9px 20px", fontSize: 11 }}>{s.cta} →</Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section ref={whyRef} className="reveal" style={{ background: G.bg, padding: isMobile ? "60px 20px" : "100px 60px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <span style={{ color: G.gold, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 11, display: "block", marginBottom: 16 }}>The Process</span>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px,5vw,56px)", fontWeight: 700, color: G.text, margin: "0 auto", lineHeight: 1.1, maxWidth: 600 }}>Your vision, orchestrated by experts.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 24 }}>
            {[
              ["01", "Curated Search", "Browse our invite-only catalog of global icons. Filter by expertise, availability, and event resonance to find your perfect match."],
              ["02", "Seamless Booking", "Our dedicated concierges handle all legal, logistical, and technical riders — a frictionless experience from offer to contract."],
              ["03", "Elite Experience", "Execute with confidence. Whether a private gala or keynote address, we manage the day-of details so you can focus on the spotlight."],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 20, padding: isMobile ? "28px 24px" : "40px 32px", position: "relative", overflow: "hidden" }}>
                <span style={{ fontFamily: G.serif, fontSize: 100, fontWeight: 800, color: `${G.gold}10`, position: "absolute", top: -20, right: 16, lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>{num}</span>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${G.gold}18`, border: `1px solid ${G.gold}35`, display: "flex", alignItems: "center", justifyContent: "center", color: G.gold, fontFamily: G.serif, fontWeight: 800, fontSize: 18, marginBottom: 24 }}>{num}</div>
                <h3 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 700, color: G.text, margin: "0 0 14px" }}>{title}</h3>
                <p style={{ color: G.muted, lineHeight: 1.8, fontSize: 14, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section ref={testRef} className="reveal" style={{ padding: isMobile ? "60px 20px" : "100px 60px", background: G.bg }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>Client Endorsements</div>
          <h2 style={{ fontSize: "clamp(24px,5vw,50px)", fontFamily: G.serif, color: G.text, margin: "0 0 52px", fontWeight: 700 }}>What Our Clients Say</h2>
          <div style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 16, padding: isMobile ? "28px 24px" : "44px 52px", position: "relative", textAlign: "left" }}>
            <div style={{ fontFamily: G.serif, fontSize: 80, color: G.gold, opacity: 0.15, position: "absolute", top: 10, left: 28, lineHeight: 1 }}>"</div>
            <div style={{ display: "flex", gap: 2, color: G.gold, fontSize: 14, marginBottom: 22 }}>{"★".repeat(TESTIMONIALS[testimonialIdx].stars)}</div>
            <p style={{ color: G.muted, lineHeight: 1.9, fontSize: isMobile ? 14 : 16, fontStyle: "italic", margin: "0 0 32px" }}>{TESTIMONIALS[testimonialIdx].text}</p>
            <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${G.gold}40, ${G.goldD}30)`, border: `1px solid ${G.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
              <div>
                <div style={{ color: G.text, fontWeight: 700, fontSize: 14 }}>{TESTIMONIALS[testimonialIdx].name}</div>
                <div style={{ color: G.dim, fontSize: 12, marginTop: 2 }}>{TESTIMONIALS[testimonialIdx].role}</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)} style={{ width: i === testimonialIdx ? 28 : 8, height: 8, borderRadius: 4, background: i === testimonialIdx ? G.gold : G.border, border: "none", cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SPONSORS ── */}
      <section ref={sponsorsRef} className="reveal" style={{ background: G.s1, borderTop: `1px solid ${G.border}`, padding: "70px 0", overflow: "hidden" }}>
        <div style={{ color: G.dim, fontSize: 11, letterSpacing: 3, fontWeight: 600, marginBottom: 40, textAlign: "center" }}>TRUSTED BY INDUSTRY LEADERS</div>
        <div className="marquee-wrapper" style={{ overflow: "hidden", position: "relative" }}>
          <div className="marquee-inner">
            {[...SPONSORS, ...SPONSORS].map((s, i) => <SponsorLogo key={i} name={s.name} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ position: "relative", padding: isMobile ? "80px 20px" : "120px 60px", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1514525253361-bee8718a74a2?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.15) grayscale(30%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,8,0.82)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontFamily: G.serif, fontSize: "clamp(32px,6vw,80px)", fontWeight: 800, color: G.cream, margin: "0 0 32px", lineHeight: 1.05 }}>
            Elevate Your Next Event Beyond{" "}
            <span style={{ color: G.gold, fontStyle: "italic" }}>Expectation.</span>
          </h2>
          <p style={{ color: G.muted, fontSize: isMobile ? 15 : 17, maxWidth: 560, margin: "0 auto 44px", lineHeight: 1.8 }}>
            Join thousands of event planners, brands, and creators who trust StraBook for their most important moments.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => setPage("celebrities")} style={{ padding: isMobile ? "14px 32px" : "18px 48px", fontSize: 14 }}>Start Your Inquiry</Btn>
            <Btn onClick={() => setPage("waitlist")} variant="outline" style={{ padding: isMobile ? "14px 32px" : "18px 48px", fontSize: 14 }}>Join Concierge Waitlist</Btn>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ background: G.s1, borderTop: `1px solid ${G.border}`, padding: isMobile ? "60px 20px" : "80px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Stay in the Loop</div>
          <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontFamily: G.serif, color: G.text, margin: "0 0 14px", fontWeight: 700 }}>Join Our Newsletter</h2>
          <p style={{ color: G.muted, fontSize: 14, marginBottom: 32, lineHeight: 1.8 }}>Get exclusive updates on new celebrity listings, VIP offers, and special events. No spam, just stars.</p>
          {subscribed ? (
            <div style={{ color: G.green, fontSize: 16, fontWeight: 600 }}>✅ You're subscribed! Welcome to StraBook.</div>
          ) : (
            <div style={{ display: "flex", gap: 0, maxWidth: 460, margin: "0 auto", background: G.card, border: `1px solid ${G.border}`, borderRadius: 50, padding: "6px 6px 6px 22px", alignItems: "center" }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ flex: 1, background: "transparent", border: "none", color: G.text, fontSize: 14, outline: "none", fontFamily: G.sans, minWidth: 0 }} />
              <Btn onClick={() => email && setSubscribed(true)} style={{ padding: "11px 24px", fontSize: 12, flexShrink: 0 }}>Subscribe</Btn>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0e0e0e", borderTop: `1px solid ${G.border}`, padding: isMobile ? "48px 20px 28px" : "72px 60px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "flex-start", gap: 40, marginBottom: 48 }}>
            <div style={{ maxWidth: 300 }}>
              <span style={{ color: G.gold, fontFamily: G.serif, fontSize: 22, fontWeight: 800, letterSpacing: 3, display: "block", marginBottom: 18, textTransform: "uppercase" }}>StraBook</span>
              <p style={{ color: G.dim, fontSize: 13, lineHeight: 1.9, margin: "0 0 20px" }}>The world's premier platform for high-impact celebrity bookings. Redefining how excellence meets enterprise.</p>
              <div style={{ color: G.dim, fontSize: 12 }}>support@strabook.io</div>
              <div style={{ color: G.dim, fontSize: 12, marginTop: 4 }}>Available worldwide</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: isMobile ? 28 : 52 }}>
              {[["Company", [["Press Kit", null], ["About Us", "about"], ["Contact", "contact"]]], ["Services", [["Bookings", "celebrities"], ["Video Messages", "celebrities"], ["VIP Fan Card", "waitlist"]]], ["Resources", [["Blog", "blog"], ["Terms of Service", "terms"], ["Privacy Policy", "privacy"]]]].map(([title, links]) => (
                <div key={title}>
                  <div style={{ color: G.text, fontWeight: 700, fontSize: 11, marginBottom: 18, letterSpacing: 2, textTransform: "uppercase" }}>{title}</div>
                  {links.map(([label, page]) => <div key={label} onClick={page ? () => setPage(page) : undefined} style={{ color: G.dim, fontSize: 13, marginBottom: 10, cursor: page ? "pointer" : "default", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = page ? G.gold : G.dim} onMouseLeave={e => e.target.style.color = G.dim}>{label}</div>)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 24, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 12 }}>
            <div style={{ color: G.dim, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>© 2025 StraBook. All rights reserved.</div>
            <div style={{ display: "flex", gap: isMobile ? 20 : 32, flexWrap: "wrap" }}>
              {["New York", "London", "Dubai", "Singapore"].map(c => <span key={c} style={{ color: G.dim, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>{c}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
