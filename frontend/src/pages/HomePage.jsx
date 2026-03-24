import { useState, useEffect, useRef } from "react";
import { avatar } from "../lib/tokens.js";
import { CELEBS, CATS, SERVICES, TESTIMONIALS, SPONSORS } from "../lib/data.js";
import { Stars } from "../components/ui.jsx";
import { Button } from "../components/ui/button.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";
import { cn } from "../lib/utils.js";

function SponsorLogo({ name }) {
  return (
    <div className="flex items-center gap-2.5 px-[30px]">
      {name === "Rolex" && <span className="text-[18px]">👑</span>}
      <span className="text-muted-foreground/60 text-sm font-bold tracking-[3px] uppercase opacity-35 cursor-default select-none">
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

export default function HomePage({ onView, onBook, favorites, onFav, setPage, openChat, user, onAuth }) {
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
      <section className={cn(
        "relative overflow-hidden flex items-center",
        isMobile ? "min-h-screen px-5 pt-[100px] pb-20" : "min-h-screen px-[60px] pt-[120px] pb-[100px]"
      )}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.3]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,8,0.8) 0%, rgba(10,10,8,0.25) 40%, rgba(10,10,8,0.93) 100%)" }}
        />

        <div className="relative z-10 w-full max-w-[860px]">
          {/* Availability pill */}
          <div className="inline-flex items-center gap-2.5 mb-7 bg-primary/[0.07] border border-primary/30 rounded-full px-5 py-[7px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6DBF7B] inline-block" />
            <span className="text-primary text-[11px] font-bold tracking-[2px] uppercase">500+ A-List Celebrities Available Now</span>
          </div>

          {/* Headline */}
          <h1
            className="font-serif text-foreground leading-none mb-7 font-extrabold tracking-[-2px]"
            style={{ fontSize: "clamp(42px,8vw,96px)" }}
          >
            The Stage is<br />
            <span className="text-primary italic">Yours.</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-muted-foreground leading-[1.8] max-w-[560px] mb-11 font-normal"
            style={{ fontSize: "clamp(14px,1.8vw,19px)" }}
          >
            Secure exclusive bookings with the world's most influential talent. An elite gateway to iconic performances and private appearances.
          </p>

          {/* Search bar pill */}
          <div className="flex items-center gap-3 max-w-[580px] mb-7 bg-[rgba(42,42,42,0.7)] backdrop-blur-md border border-border rounded-full pl-6 pr-1.5 py-1.5">
            <span className="text-primary text-base">⌕</span>
            <input
              placeholder="Search celebrity, genre, or event type..."
              className="flex-1 bg-transparent border-none text-foreground text-sm outline-none py-2.5 min-w-0 placeholder:text-muted-foreground"
              onFocus={() => setPage("celebrities")}
            />
            <Button onClick={() => setPage("celebrities")} size="sm" className="shrink-0 px-6 py-[11px] text-xs">
              Search
            </Button>
          </div>

          {/* Auth CTAs — shown only when logged out */}
          {!user && (
            <div className="flex gap-3 flex-wrap mb-7">
              <Button onClick={() => onAuth("register")} className="px-7 py-2.5 text-sm">
                Create Account →
              </Button>
              <Button onClick={() => onAuth("login")} variant="outline" className="px-7 py-2.5 text-sm">
                Sign In
              </Button>
            </div>
          )}

          {/* Category pills */}
          <div className="flex gap-2.5 flex-wrap items-center">
            <span className="text-muted-foreground/60 text-[11px] tracking-[2px] uppercase font-bold">Explore:</span>
            {CATS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setPage("celebrities")}
                className="bg-[rgba(53,53,52,0.5)] border border-border rounded-full px-[18px] py-[7px] text-muted-foreground text-xs font-medium transition-all duration-200 cursor-pointer hover:border-primary/50 hover:text-primary"
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        {!isMobile && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <span className="text-muted-foreground text-[10px] tracking-[3px] uppercase">Scroll</span>
            <div
              className="w-px h-10"
              style={{ background: "linear-gradient(to bottom, var(--primary), transparent)" }}
            />
          </div>
        )}
      </section>

      {/* ── TRUST BAR ── */}
      <div
        className={cn(
          "border-t border-primary/[0.15] border-b border-border",
          isMobile ? "px-5 py-10" : "px-10 py-14"
        )}
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}
      >
        <div className={cn(
          "max-w-[1000px] mx-auto grid text-center",
          isMobile ? "grid-cols-2 gap-8" : "grid-cols-4 gap-6"
        )}>
          {[["500+", "Celebrity Roster"], ["100K+", "Happy Clients"], ["10+", "Years Experience"], ["24/7", "Concierge Support"]].map(([n, l], i) => (
            <div key={l} className="relative">
              <div
                className="font-serif font-extrabold text-primary leading-none tracking-[-1px]"
                style={{ fontSize: "clamp(28px,5vw,52px)" }}
              >
                {n}
              </div>
              <div className="text-muted-foreground text-[11px] mt-2.5 tracking-[2px] uppercase font-semibold">{l}</div>
              {!isMobile && i < 3 && (
                <div
                  className="absolute right-0 top-[10%] h-[80%] w-px"
                  style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED CELEBRITIES ── */}
      <section
        ref={featRef}
        className={cn("reveal mx-auto max-w-[1280px]", isMobile ? "px-5 py-[60px]" : "px-10 py-[100px]")}
      >
        <div className="flex justify-between items-end mb-14">
          <div>
            <span className="text-primary text-[11px] tracking-[3px] font-bold uppercase block mb-3">Curated Selection</span>
            <h2
              className="font-serif text-foreground font-bold m-0 mb-3"
              style={{ fontSize: "clamp(26px,5vw,52px)" }}
            >
              Featured Talent
            </h2>
            <div
              className="h-[3px] w-16 rounded-sm"
              style={{ background: "linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 80%, transparent))" }}
            />
          </div>
          <button
            onClick={() => setPage("celebrities")}
            className="bg-transparent border-none text-primary cursor-pointer text-[13px] font-bold flex items-center gap-1.5 tracking-[0.5px] shrink-0 hover:opacity-80 transition-opacity"
          >
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
              <div className="grid grid-cols-1 gap-4">
                {[main, ...sideCards].filter(Boolean).slice(0, 3).map((c, idx) => (
                  <div
                    key={c.id}
                    className="celeb-card relative rounded-[20px] overflow-hidden cursor-pointer bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                    style={{ height: idx === 0 ? 320 : 220 }}
                    onClick={() => onView(c)}
                  >
                    <img
                      className="celeb-img w-full h-full object-cover"
                      src={c.img || avatar(c.name)}
                      alt={c.name}
                      onError={e => e.target.src = avatar(c.name)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
                    {idx === 0 && (
                      <div className="absolute top-5 left-5">
                        <span className="bg-primary/[0.13] text-primary border border-primary/40 backdrop-blur-md rounded-full px-4 py-[5px] text-[10px] font-bold tracking-[1.5px] uppercase inline-block">
                          ⭐ Top Pick
                        </span>
                      </div>
                    )}
                    <div className={cn("absolute bottom-0", idx === 0 ? "p-6" : "px-[22px] py-[18px]")}>
                      <h3
                        className="font-serif font-extrabold text-white leading-[1.05] mb-2"
                        style={{ fontSize: idx === 0 ? 28 : 21 }}
                      >
                        {c.name}
                      </h3>
                      {idx === 0 && (
                        <div className="flex gap-2.5">
                          <Button
                            size="sm"
                            className="px-[18px] py-[9px] text-[11px]"
                            disabled={!c.avail}
                            onClick={e => { e.stopPropagation(); onBook(c, "booking"); }}
                          >
                            Book Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-[18px] py-[9px] text-[11px]"
                            onClick={e => { e.stopPropagation(); onView(c); }}
                          >
                            View
                          </Button>
                        </div>
                      )}
                      {idx > 0 && (
                        <p className="text-primary text-[10px] font-bold tracking-[2px] uppercase m-0">{c.flag} {c.cat}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr",
                gridTemplateRows: sideCards.length > 2 ? "360px 300px" : "360px",
              }}
            >
              {main && (
                <div
                  className="celeb-card relative rounded-[20px] overflow-hidden cursor-pointer bg-card shadow-[0_8px_32px_rgba(0,0,0,0.38)]"
                  style={{ gridRow: sideCards.length > 2 ? "1 / 3" : "1" }}
                  onClick={() => onView(main)}
                >
                  <img
                    className="celeb-img w-full h-full object-cover"
                    src={main.img || avatar(main.name)}
                    alt={main.name}
                    onError={e => e.target.src = avatar(main.name)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[rgba(13,13,13,0.1)] to-transparent" />
                  <div className="absolute top-5 left-5">
                    <span className="bg-primary/[0.13] text-primary border border-primary/40 backdrop-blur-md rounded-full px-4 py-[5px] text-[10px] font-bold tracking-[1.5px] uppercase inline-block">
                      ⭐ Top Pick
                    </span>
                  </div>
                  <div className="absolute bottom-0 p-9">
                    <h3 className="font-serif text-[38px] font-extrabold text-white leading-[1.05] mb-2">
                      {main.name}
                    </h3>
                    <p className="text-white/60 text-[13px] mb-5 leading-[1.6]">
                      {main.bio.slice(0, 90)}...
                    </p>
                    <div className="flex gap-2.5">
                      <Button
                        size="sm"
                        className="px-[22px] py-2.5 text-[11px]"
                        disabled={!main.avail}
                        onClick={e => { e.stopPropagation(); onBook(main, "booking"); }}
                      >
                        Book Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-[22px] py-2.5 text-[11px]"
                        onClick={e => { e.stopPropagation(); onView(main); }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {sideCards.map(c => (
                <div
                  key={c.id}
                  className="celeb-card relative rounded-[20px] overflow-hidden cursor-pointer bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                  onClick={() => onView(c)}
                >
                  <img
                    className="celeb-img w-full h-full object-cover"
                    src={c.img || avatar(c.name)}
                    alt={c.name}
                    onError={e => e.target.src = avatar(c.name)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
                  <div className="absolute bottom-0 px-[22px] py-[18px]">
                    <h3 className="font-serif text-[21px] font-bold text-white mb-1">{c.name}</h3>
                    <p className="text-primary text-[10px] font-bold tracking-[2px] uppercase m-0">{c.flag} {c.cat}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onFav(c.id); }}
                    className="absolute top-3.5 right-3.5 w-[34px] h-[34px] rounded-full bg-[rgba(13,13,13,0.5)] backdrop-blur-md border border-border/40 flex items-center justify-center cursor-pointer text-[13px] transition-all duration-200 hover:bg-[rgba(13,13,13,0.8)]"
                  >
                    {favorites.includes(c.id) ? "❤️" : "🤍"}
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

        <div className="text-center mt-10">
          <Button
            variant="outline"
            className="px-10 py-3.5 text-xs"
            onClick={() => setPage("celebrities")}
          >
            View All {CELEBS.length}+ Celebrities →
          </Button>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section
        ref={catsRef}
        className={cn("reveal bg-background", isMobile ? "px-5 py-[60px]" : "px-[60px] py-[100px]")}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-6 mb-14">
            <h2
              className="font-serif font-bold text-foreground m-0 whitespace-nowrap"
              style={{ fontSize: "clamp(24px,4vw,48px)" }}
            >
              Trending Now
            </h2>
            <div className="h-px bg-border flex-1" />
          </div>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
          )}>
            {CATS.map(cat => (
              <div
                key={cat.id}
                onClick={() => setPage("celebrities")}
                className={cn(
                  "bg-card border border-border rounded-xl cursor-pointer transition-all duration-300",
                  "hover:border-primary/50 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)]",
                  isMobile ? "px-4 py-5" : "px-6 py-7"
                )}
              >
                <div className="text-[28px] mb-3.5">{cat.icon}</div>
                <div className="text-foreground font-bold text-sm mb-1 font-serif">{cat.name}</div>
                <div className="text-primary text-[13px] font-bold mb-0">{cat.n}</div>
                {!isMobile && (
                  <div className="text-muted-foreground/60 text-xs leading-[1.65] mt-2.5">{cat.desc}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section
        className={cn(
          "bg-background/50 border-t border-border",
          isMobile ? "px-5 py-[60px]" : "px-[60px] py-[100px]"
        )}
      >
        <div className="max-w-[1140px] mx-auto">
          <div className="text-center mb-14">
            <div className="text-primary text-[11px] tracking-[3px] font-bold mb-3.5 uppercase">Services</div>
            <h2
              className="font-serif text-foreground font-bold m-0 mb-3.5"
              style={{ fontSize: "clamp(24px,5vw,52px)" }}
            >
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-[15px] max-w-[480px] mx-auto leading-[1.7]">
              From intimate video messages to grand event appearances — we've got it covered.
            </p>
          </div>
          <div className={cn(
            "grid gap-[18px]",
            isMobile ? "grid-cols-1" : "grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
          )}>
            {SERVICES.map(s => (
              <div
                key={s.title}
                className="rounded-2xl border border-white/[0.08] bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-7 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:bg-white/[0.05]"
              >
                <div className="text-[32px] mb-4">{s.icon}</div>
                <h3 className="text-foreground m-0 mb-2.5 text-lg font-serif font-bold">{s.title}</h3>
                <p className="text-muted-foreground text-[13px] leading-[1.8] m-0 mb-[22px]">{s.desc}</p>
                <Button variant="outline" size="sm" className="px-5 py-[9px] text-[11px]" onClick={openChat}>
                  {s.cta} →
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        ref={whyRef}
        className={cn("reveal bg-background", isMobile ? "px-5 py-[60px]" : "px-[60px] py-[100px]")}
      >
        <div className="max-w-[1140px] mx-auto">
          <div className="text-center mb-[72px]">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-[11px] block mb-4">The Process</span>
            <h2
              className="font-serif font-bold text-foreground mx-auto leading-[1.1] max-w-[600px] m-0"
              style={{ fontSize: "clamp(28px,5vw,56px)" }}
            >
              Your vision, orchestrated by experts.
            </h2>
          </div>
          <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-3")}>
            {[
              ["01", "Curated Search", "Browse our invite-only catalog of global icons. Filter by expertise, availability, and event resonance to find your perfect match."],
              ["02", "Seamless Booking", "Our dedicated concierges handle all legal, logistical, and technical riders — a frictionless experience from offer to contract."],
              ["03", "Elite Experience", "Execute with confidence. Whether a private gala or keynote address, we manage the day-of details so you can focus on the spotlight."],
            ].map(([num, title, desc]) => (
              <div
                key={num}
                className={cn(
                  "bg-background/50 border border-border rounded-[20px] relative overflow-hidden",
                  isMobile ? "px-6 py-7" : "px-8 py-10"
                )}
              >
                <span className="font-serif text-[100px] font-extrabold text-primary/[0.06] absolute -top-5 right-4 leading-none select-none pointer-events-none">
                  {num}
                </span>
                <div className="w-11 h-11 rounded-xl bg-primary/[0.094] border border-primary/[0.21] flex items-center justify-center text-primary font-serif font-extrabold text-lg mb-6">
                  {num}
                </div>
                <h3 className="font-serif text-[22px] font-bold text-foreground m-0 mb-3.5">{title}</h3>
                <p className="text-muted-foreground leading-[1.8] text-sm m-0">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        ref={testRef}
        className={cn("reveal bg-background", isMobile ? "px-5 py-[60px]" : "px-[60px] py-[100px]")}
      >
        <div className="max-w-[820px] mx-auto text-center">
          <div className="text-primary text-[11px] tracking-[3px] font-bold mb-3.5 uppercase">Client Endorsements</div>
          <h2
            className="font-serif text-foreground font-bold m-0 mb-[52px]"
            style={{ fontSize: "clamp(24px,5vw,50px)" }}
          >
            What Our Clients Say
          </h2>
          <div className="rounded-2xl border border-white/[0.08] bg-card relative text-left px-7 py-7 md:px-[52px] md:py-11">
            <div className="font-serif text-[80px] text-primary opacity-15 absolute top-2.5 left-7 leading-none select-none pointer-events-none">"</div>
            <div className="flex gap-0.5 text-primary text-sm mb-[22px]">
              {"★".repeat(TESTIMONIALS[testimonialIdx].stars)}
            </div>
            <p className={cn(
              "text-muted-foreground leading-[1.9] italic m-0 mb-8",
              isMobile ? "text-sm" : "text-base"
            )}>
              {TESTIMONIALS[testimonialIdx].text}
            </p>
            <div className="border-t border-border pt-5 flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-full border border-primary/30 flex items-center justify-center text-base shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(var(--primary-rgb),0.25), rgba(var(--primary-rgb),0.19))" }}
              >
                👤
              </div>
              <div>
                <div className="text-foreground font-bold text-sm">{TESTIMONIALS[testimonialIdx].name}</div>
                <div className="text-muted-foreground/60 text-xs mt-0.5">{TESTIMONIALS[testimonialIdx].role}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-center mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={cn(
                  "h-2 rounded-full border-none cursor-pointer transition-all duration-300",
                  i === testimonialIdx ? "w-7 bg-primary" : "w-2 bg-border"
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SPONSORS ── */}
      <section
        ref={sponsorsRef}
        className="reveal bg-background/50 border-t border-border py-[70px] overflow-hidden"
      >
        <div className="text-muted-foreground/60 text-[11px] tracking-[3px] font-semibold mb-10 text-center">
          TRUSTED BY INDUSTRY LEADERS
        </div>
        <div className="marquee-wrapper overflow-hidden relative">
          <div className="marquee-inner">
            {[...SPONSORS, ...SPONSORS].map((s, i) => <SponsorLogo key={i} name={s.name} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        className={cn(
          "relative overflow-hidden text-center",
          isMobile ? "px-5 py-20" : "px-[60px] py-[120px]"
        )}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1514525253361-bee8718a74a2?w=1920&q=80')",
            filter: "brightness(0.15) grayscale(30%)",
          }}
        />
        <div className="absolute inset-0 bg-[rgba(10,10,8,0.82)]" />
        <div className="relative z-10 max-w-[860px] mx-auto">
          <h2
            className="font-serif font-extrabold text-foreground m-0 mb-8 leading-[1.05]"
            style={{ fontSize: "clamp(32px,6vw,80px)" }}
          >
            Elevate Your Next Event Beyond{" "}
            <span className="text-primary italic">Expectation.</span>
          </h2>
          <p className={cn(
            "text-muted-foreground max-w-[560px] mx-auto mb-11 leading-[1.8]",
            isMobile ? "text-[15px]" : "text-[17px]"
          )}>
            Join thousands of event planners, brands, and creators who trust StarBookNow for their most important moments.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              className={cn(isMobile ? "px-8 py-3.5 text-sm" : "px-12 py-[18px] text-sm")}
              onClick={() => setPage("celebrities")}
            >
              Start Your Inquiry
            </Button>
            <Button
              variant="outline"
              className={cn(isMobile ? "px-8 py-3.5 text-sm" : "px-12 py-[18px] text-sm")}
              onClick={() => setPage("waitlist")}
            >
              Join Concierge Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section
        className={cn(
          "bg-background/50 border-t border-border text-center",
          isMobile ? "px-5 py-[60px]" : "px-[60px] py-20"
        )}
      >
        <div className="max-w-[560px] mx-auto">
          <div className="text-primary text-[11px] tracking-[3px] font-bold mb-3 uppercase">Stay in the Loop</div>
          <h2
            className="font-serif text-foreground font-bold m-0 mb-3.5"
            style={{ fontSize: "clamp(22px,4vw,40px)" }}
          >
            Join Our Newsletter
          </h2>
          <p className="text-muted-foreground text-sm mb-8 leading-[1.8]">
            Get exclusive updates on new celebrity listings, VIP offers, and special events. No spam, just stars.
          </p>
          {subscribed ? (
            <div className="text-[#6DBF7B] text-base font-semibold">✅ You're subscribed! Welcome to StarBookNow.</div>
          ) : (
            <div className="flex max-w-[460px] mx-auto bg-card border border-border rounded-full pl-[22px] pr-1.5 py-1.5 items-center gap-0">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent border-none text-foreground text-sm outline-none min-w-0 placeholder:text-muted-foreground"
              />
              <Button
                size="sm"
                className="px-6 py-[11px] text-xs shrink-0"
                onClick={() => email && setSubscribed(true)}
              >
                Subscribe
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className={cn(
          "bg-[#0e0e0e] border-t border-border",
          isMobile ? "px-5 pt-12 pb-7" : "px-[60px] pt-[72px] pb-8"
        )}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className={cn(
            "flex gap-10 mb-12",
            isMobile ? "flex-col items-start" : "flex-row justify-between items-start"
          )}>
            <div className="max-w-[300px]">
              <span className="text-primary font-serif text-[22px] font-extrabold tracking-[3px] block mb-[18px] uppercase">
                StarBookNow
              </span>
              <p className="text-muted-foreground/60 text-[13px] leading-[1.9] m-0 mb-5">
                The world's premier platform for high-impact celebrity bookings. Redefining how excellence meets enterprise.
              </p>
              <div className="text-muted-foreground/60 text-xs">support@starbooknow.com</div>
              <div className="text-muted-foreground/60 text-xs mt-1">Available worldwide</div>
            </div>
            <div className={cn(
              "grid gap-7",
              isMobile ? "grid-cols-2" : "grid-cols-3 gap-[52px]"
            )}>
              {[
                ["Company", [["Press Kit", null], ["About Us", "about"], ["Contact", "contact"]]],
                ["Services", [["Bookings", "celebrities"], ["Video Messages", "celebrities"], ["VIP Fan Card", "waitlist"]]],
                ["Resources", [["Blog", "blog"], ["Terms of Service", "terms"], ["Privacy Policy", "privacy"]]],
              ].map(([title, links]) => (
                <div key={title}>
                  <div className="text-foreground font-bold text-[11px] mb-[18px] tracking-[2px] uppercase">{title}</div>
                  {links.map(([label, page]) => (
                    <div
                      key={label}
                      onClick={page ? () => setPage(page) : undefined}
                      className={cn(
                        "text-muted-foreground/60 text-[13px] mb-2.5 transition-colors duration-200",
                        page ? "cursor-pointer hover:text-primary" : "cursor-default"
                      )}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className={cn(
            "border-t border-border pt-6 flex gap-3",
            isMobile ? "flex-col items-start" : "flex-row justify-between items-center"
          )}>
            <div className="text-muted-foreground/60 text-[11px] tracking-[2px] uppercase">
              © 2025 StarBookNow. All rights reserved.
            </div>
            <div className={cn("flex flex-wrap", isMobile ? "gap-5" : "gap-8")}>
              {["New York", "London", "Dubai", "Singapore"].map(c => (
                <span key={c} className="text-muted-foreground/60 text-[11px] tracking-[2px] uppercase">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
