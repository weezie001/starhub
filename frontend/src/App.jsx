import { useState, useEffect } from "react";
import { G } from "./lib/tokens.js";
import { api } from "./api.js";
import { useIsMobile } from "./lib/useIsMobile.js";
import { Button } from "./components/ui/button.jsx";
import { Card } from "./components/ui/card.jsx";

// Components
import Navbar from "./components/Navbar.jsx";
import AuthModal from "./components/AuthModal.jsx";
import CelebModal from "./components/CelebModal.jsx";
import BookingModal from "./components/BookingModal.jsx";
import SupportChat from "./components/SupportChat.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import CelebritiesPage from "./pages/CelebritiesPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import WaitlistPage from "./pages/WaitlistPage.jsx";
import BlogsPage from "./pages/BlogsPage.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import FanCardPage from "./pages/FanCardPage.jsx";
import LoungePage from "./pages/LoungePage.jsx";
import PricingPage from "./pages/PricingPage.jsx";

// ── GLOBAL STYLES ────────────────────────────────────────────
const GLOBAL_CSS = `
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth}
  body{margin:0;padding:0;font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:#0a0a0a}
  ::-webkit-scrollbar-thumb{background:#2a2518;border-radius:10px}
  ::-webkit-scrollbar-thumb:hover{background:${G.gold}80}
  input,select,textarea,button{font-family:'Manrope',sans-serif}
  select option{background:${G.s2};color:${G.text}}
  .celeb-img{filter:grayscale(55%);transition:filter 0.6s ease,transform 0.6s ease}
  .celeb-card:hover .celeb-img{filter:grayscale(0%)}
  .reveal{opacity:0;transform:translateY(30px);transition:all 0.8s cubic-bezier(0.2,0.8,0.2,1)}
  .reveal.visible{opacity:1;transform:translateY(0)}
  .marquee-inner{display:flex;animation:marquee 30s linear infinite;width:max-content}
  @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes typing{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
  .typing-dot{width:4px;height:4px;background:${G.gold};border-radius:50%;animation:typing 1s infinite ease-in-out}
  .typing-dot:nth-child(2){animation-delay:0.2s}
  .typing-dot:nth-child(3){animation-delay:0.4s}
  @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
  html.tier-vip { --primary: 43 86% 60%; }
  html.tier-platinum { --primary: 220 40% 75%; }
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .member-badge{background:linear-gradient(90deg,#c8920a,#f5cc6a,#e8a830,#f5cc6a,#c8920a);background-size:200%;animation:shimmer 3s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .plat-badge{background:linear-gradient(90deg,#7090b0,#b8d0e8,#d0e4f4,#b8d0e8,#7090b0);background-size:200%;animation:shimmer 3s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
`;

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

// ── ABOUT PAGE ────────────────────────────────────────────────
function AboutPage({ setPage }) {
  const isMobile = useIsMobile();
  return (
    <div className="pt-[72px] min-h-screen">
      <section className="max-w-[900px] mx-auto" style={{ padding: isMobile ? "48px 20px" : "80px 40px" }}>
        <div className="text-primary text-[11px] tracking-[3px] font-semibold mb-3.5 uppercase">About StarBookNow</div>
        <h1 className="font-serif text-foreground font-bold leading-tight mb-7" style={{ fontSize: "clamp(28px,5vw,56px)" }}>
          The World's Premier<br />Celebrity Booking Platform
        </h1>
        <p className="text-muted-foreground leading-loose mb-7" style={{ fontSize: isMobile ? 14 : 16 }}>
          StarBookNow connects brands, event organizers, and individuals with the world's most sought-after celebrities. With over a decade of experience and a roster of 500+ verified A-list talent, we've facilitated more than 100,000 successful bookings worldwide.
        </p>
        <p className="text-muted-foreground leading-loose mb-10" style={{ fontSize: isMobile ? 14 : 16 }}>
          Whether you're planning a corporate gala, launching a product, organizing a charity event, or creating an unforgettable personal experience — our dedicated team ensures every interaction is seamless, professional, and exceeds expectations.
        </p>
        <div className={`grid gap-4 mb-10 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
          {[
            ["✨", "Verified Talent", "Every celebrity is personally vetted. No fake profiles, no intermediaries — direct access to authentic star power."],
            ["🛡️", "Secure & Confidential", "Bank-level encryption protects every transaction. All bookings handled with strict confidentiality."],
            ["⚡", "AI-Powered Matching", "Our intelligent engine analyzes your event type, audience, and budget to match the perfect celebrity — in seconds."],
            ["🌐", "Global Reach", "From Hollywood to Dubai, London to Tokyo — our network spans every continent."],
          ].map(([icon, title, desc]) => (
            <Card key={title} className={isMobile ? "p-5" : "p-7"}>
              <div className="text-3xl mb-3">{icon}</div>
              <div className="text-foreground font-semibold text-[15px] mb-2 font-serif">{title}</div>
              <div className="text-muted-foreground text-sm leading-relaxed">{desc}</div>
            </Card>
          ))}
        </div>
        <div className="border border-primary/25 rounded-2xl text-center" style={{ background: `linear-gradient(135deg, ${G.gold}15, ${G.gold}08)`, padding: isMobile ? "28px 20px" : "36px 32px" }}>
          <h3 className="text-foreground font-serif mb-3" style={{ fontSize: isMobile ? 22 : 28 }}>Ready to Book Your Star?</h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Join 100,000+ satisfied clients. Your unforgettable celebrity experience starts here.</p>
          <Button onClick={() => setPage("celebrities")}>Browse Celebrities Now</Button>
        </div>
      </section>
    </div>
  );
}

// ── CONTACT / SUPPORT PAGE ────────────────────────────────────
function ContactPage({ setPage }) {
  const isMobile = useIsMobile();
  return (
    <div className="pt-[72px] min-h-screen">
      <section className="max-w-[860px] mx-auto" style={{ padding: isMobile ? "48px 20px" : "80px 40px" }}>
        <div className="text-primary text-[11px] tracking-[3px] font-semibold mb-3.5 uppercase">Support</div>
        <h1 className="font-serif text-foreground font-bold leading-tight mb-5" style={{ fontSize: "clamp(28px,5vw,56px)" }}>
          We're Here to Help
        </h1>
        <p className="text-muted-foreground leading-loose max-w-[560px]" style={{ fontSize: isMobile ? 14 : 16, marginBottom: isMobile ? 32 : 48 }}>
          Our concierge team is available 24/7. Use the live chat widget in the bottom-right corner to connect with a real agent instantly, or join the waitlist for dedicated one-on-one booking assistance.
        </p>
        <div className={`grid gap-4 mb-10 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
          {[
            ["💬", "Live Chat", "Click the chat icon in the bottom-right corner to connect with a live support agent immediately.", null],
            ["📋", "Concierge Waitlist", "Join our waitlist for a dedicated booking concierge to personally assist you.", "waitlist"],
            ["✉️", "Email Support", "Reach our team at support@starbooknow.com for detailed inquiries.", null],
            ["📞", "Priority Line", "VIP and enterprise clients can request a direct callback from our senior concierge team.", "waitlist"],
          ].map(([icon, title, desc, link]) => (
            <Card
              key={title}
              onClick={link ? () => setPage(link) : undefined}
              className={`${isMobile ? "p-5" : "p-7"} ${link ? "cursor-pointer hover:border-primary/50 hover:-translate-y-1" : ""} transition-all duration-300`}
            >
              <div className="text-3xl mb-3">{icon}</div>
              <div className="text-foreground font-semibold text-[15px] mb-2 font-serif">{title}</div>
              <div className="text-muted-foreground text-sm leading-relaxed">{desc}</div>
              {link && <div className="text-primary text-xs mt-3 font-bold">Get Started →</div>}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
const PAGES = ["home","celebrities","waitlist","about","contact","dashboard","admin","blog","terms","privacy","fancard","lounge","pricing"];

function getHashPage() {
  const hash = window.location.hash.slice(1);
  return PAGES.includes(hash) ? hash : "home";
}

export default function App() {
  const [page, setPageState] = useState(getHashPage);
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("sb_theme") || "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("sb_theme", theme);
  }, [theme]);

  function toggleTheme() { setTheme(t => t === "dark" ? "light" : "dark"); }
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [authModal, setAuthModal] = useState(null);
  const [celebModal, setCelebModal] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [chatTrigger, setChatTrigger] = useState(0);
  const [fanCardCeleb, setFanCardCeleb] = useState(null);

  function openChat() { setChatTrigger(k => k + 1); }

  function setPage(p) {
    setPageState(p);
    window.location.hash = p === "home" ? "" : p;
  }

  // Sync page on browser back/forward
  useEffect(() => {
    const onPop = () => setPageState(getHashPage());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Load persisted state — mark userLoaded when done so auth gate can run
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sb_user");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
        api.getUserBookings().then(setBookings).catch(() => {});
        api.getUserMemberships().then(setMemberships).catch(() => {});
        // Sync latest plan from server (admin may have changed it)
        api.getMe().then(me => {
          if (me?.plan) {
            setUser(u => {
              const updated = { ...u, plan: me.plan };
              try { localStorage.setItem("sb_user", JSON.stringify(updated)); } catch {}
              return updated;
            });
          }
        }).catch(() => {});
      }
      const favRaw = localStorage.getItem("sb_favs");
      if (favRaw) setFavorites(JSON.parse(favRaw));
    } catch {}
    setUserLoaded(true);
  }, []);

  // Re-sync plan when user returns to the tab
  useEffect(() => {
    const onFocus = () => {
      if (!localStorage.getItem("sb_user")) return;
      api.getMe().then(me => {
        if (me?.plan) {
          setUser(u => {
            if (!u || u.plan === me.plan) return u;
            const updated = { ...u, plan: me.plan };
            try { localStorage.setItem("sb_user", JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
      }).catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Only redirect after we know whether a user is logged in
  useEffect(() => {
    if (!userLoaded) return;
    const authPages = ["dashboard", "admin", "lounge"];
    if (authPages.includes(page) && !user) setPage("home");
  }, [page, user, userLoaded]);

  function handleAuth(userData) {
    setUser(userData);
    try { localStorage.setItem("sb_user", JSON.stringify(userData)); } catch {}
    setAuthModal(null);
    api.getUserBookings().then(setBookings).catch(() => {});
    api.getUserMemberships().then(setMemberships).catch(() => {});
  }

  function handleLogout() {
    setUser(null);
    setBookings([]);
    setMemberships([]);
    try { localStorage.removeItem("sb_user"); } catch {}
    setPage("home");
  }

  function handleFav(id) {
    if (!user) { setAuthModal("login"); return; }
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem("sb_favs", JSON.stringify(next)); } catch {}
  }

  function handleBook(celeb, type) {
    if (!user) { setAuthModal("login"); return; }
    setCelebModal(null);
    setBookingModal({ celeb, type });
  }

  function handleFanCard(celeb) {
    setFanCardCeleb(celeb);
    setPage("fancard");
  }

  const sharedProps = {
    onView: c => {
      if (!user) { setAuthModal("login"); return; }
      setCelebModal(c);
    },
    onBook: handleBook,
    onFanCard: handleFanCard,
    favorites,
    onFav: handleFav,
  };

  // Apply plan-based tier CSS class to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("tier-vip", "tier-platinum");
    if (user?.plan === "platinum") html.classList.add("tier-platinum");
    else if (user?.plan === "premium") html.classList.add("tier-vip");
  }, [user?.plan]);

  // highestTier derived from user.plan (primary) or approved fan card memberships (legacy fallback)
  const highestTier = user?.plan === "platinum" ? "platinum"
    : user?.plan === "premium" ? "vip"
    : memberships.some(m => m.status === "approved" && m.tier === "platinum") ? "platinum"
    : memberships.some(m => m.status === "approved" && m.tier === "vip") ? "vip"
    : null;

  const userPlan = user?.plan || "free";

  return (
    <div className="bg-background" style={{ minHeight: "100vh" }}>
      <GlobalStyles />
      <Navbar page={page} setPage={setPage} user={user} onAuth={m => setAuthModal(m)} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} memberTier={highestTier} />

      {page === "home"        && <HomePage {...sharedProps} setPage={setPage} openChat={openChat} user={user} onAuth={m => setAuthModal(m)} />}
      {page === "celebrities" && <CelebritiesPage {...sharedProps} user={user} onAuth={m => setAuthModal(m)} />}
      {page === "waitlist"    && <WaitlistPage user={user} />}
      {page === "about"       && <AboutPage setPage={setPage} />}
      {page === "contact"     && <ContactPage setPage={setPage} />}
      {page === "dashboard"   && user && <DashboardPage user={user} bookings={bookings} favorites={favorites} onView={c => setCelebModal(c)} setPage={setPage} memberTier={highestTier} />}
      {page === "admin"       && user?.role === "admin" && <AdminPage user={user} />}
      {page === "blog"        && <BlogsPage setPage={setPage} />}
      {page === "terms"       && <TermsPage setPage={setPage} />}
      {page === "privacy"     && <PrivacyPage setPage={setPage} />}
      {page === "fancard"     && <FanCardPage c={fanCardCeleb} onBook={handleBook} setPage={setPage} userPlan={userPlan} />}
      {page === "lounge"      && user && <LoungePage user={user} memberships={memberships} setPage={setPage} onBook={handleBook} />}
      {page === "pricing"     && <PricingPage user={user} setPage={setPage} onAuth={m => setAuthModal(m)} onUpgrade={(tier, plan) => setBookingModal({ celeb: { id: `plan_${tier}`, name: tier === "platinum" ? "Platinum / Executive Plan" : "Premium / VIP Plan", price: plan?.price || 0 }, type: "plan_upgrade", tier }) } />}

      {/* Modals — always rendered, visibility controlled by open prop */}
      <AuthModal open={!!authModal} mode={authModal || "login"} onClose={() => setAuthModal(null)} onAuth={handleAuth} switchMode={() => setAuthModal(authModal === "login" ? "register" : "login")} />
      <CelebModal open={!!celebModal} c={celebModal} onClose={() => setCelebModal(null)} onBook={handleBook} isFav={celebModal ? favorites.includes(celebModal.id) : false} onFav={handleFav} />
      <BookingModal open={!!bookingModal} c={bookingModal?.celeb} type={bookingModal?.type} onClose={() => setBookingModal(null)} onConfirm={() => { api.getUserBookings().then(setBookings).catch(() => {}); api.getUserMemberships().then(setMemberships).catch(() => {}); }} user={user} memberships={memberships} userPlan={userPlan} onOpenChat={() => { setBookingModal(null); openChat(); }} setPage={setPage} />

      {/* Live support chat widget — hidden on admin page to avoid covering inbox UI */}
      {page !== "admin" && <SupportChat user={user} setPage={setPage} triggerOpen={chatTrigger} onAuth={m => setAuthModal(m)} />}
    </div>
  );
}
