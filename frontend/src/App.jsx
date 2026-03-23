import { useState, useEffect } from "react";
import { G } from "./lib/tokens.js";
import { api } from "./api.js";

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
import AdminPage from "./pages/admin/AdminPage.jsx";

// ── GLOBAL STYLES ────────────────────────────────────────────
const GLOBAL_CSS = `
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth}
  body{margin:0;padding:0;background:${G.bg};color:${G.text};font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:${G.bg}}
  ::-webkit-scrollbar-thumb{background:${G.border};border-radius:3px}
  ::-webkit-scrollbar-thumb:hover{background:${G.gold}55}
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

// ── ABOUT PAGE (inline, simple) ────────────────────────────
function AboutPage({ setPage }) {
  return (
    <div style={{ paddingTop: 72, minHeight: "100vh" }}>
      <section style={{ padding: "80px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>ABOUT STARBOOK</div>
        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontFamily: G.serif, color: G.cream, margin: "0 0 28px", fontWeight: 700, lineHeight: 1.1 }}>
          The World's Premier<br />Celebrity Booking Platform
        </h1>
        <p style={{ color: G.muted, fontSize: 16, lineHeight: 2, marginBottom: 28 }}>
          StarBook connects brands, event organizers, and individuals with the world's most sought-after celebrities. With over a decade of experience and a roster of 500+ verified A-list talent, we've facilitated more than 100,000 successful bookings worldwide.
        </p>
        <p style={{ color: G.muted, fontSize: 16, lineHeight: 2, marginBottom: 40 }}>
          Whether you're planning a corporate gala, launching a product, organizing a charity event, or creating an unforgettable personal experience — our dedicated team ensures every interaction is seamless, professional, and exceeds expectations.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
          {[
            ["✨", "Verified Talent", "Every celebrity is personally vetted. No fake profiles, no intermediaries — direct access to authentic star power."],
            ["🛡️", "Secure & Confidential", "Bank-level encryption protects every transaction. All bookings handled with strict confidentiality."],
            ["⚡", "AI-Powered Matching", "Our intelligent engine analyzes your event type, audience, and budget to match the perfect celebrity — in seconds."],
            ["🌐", "Global Reach", "From Hollywood to Dubai, London to Tokyo — our network spans every continent."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <div style={{ color: G.cream, fontWeight: 600, fontSize: 15, marginBottom: 8, fontFamily: G.serif }}>{title}</div>
              <div style={{ color: G.dim, fontSize: 13, lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: `linear-gradient(135deg, ${G.gold}15, ${G.gold}08)`, border: `1px solid ${G.gold}25`, borderRadius: 16, padding: "36px 32px", textAlign: "center" }}>
          <h3 style={{ color: G.cream, fontFamily: G.serif, fontSize: 28, margin: "0 0 12px" }}>Ready to Book Your Star?</h3>
          <p style={{ color: G.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>Join 100,000+ satisfied clients. Your unforgettable celebrity experience starts here.</p>
          <button onClick={() => setPage("celebrities")} style={{ background: `linear-gradient(45deg, ${G.gold}, ${G.goldD})`, color: "#261900", border: "none", borderRadius: 50, padding: "14px 36px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: G.sans, letterSpacing: 0.8 }}>
            Browse Celebrities Now
          </button>
        </div>
      </section>
    </div>
  );
}

// ── CONTACT / SUPPORT PAGE ───────────────────────────────────
function ContactPage({ setPage }) {
  return (
    <div style={{ paddingTop: 72, minHeight: "100vh" }}>
      <section style={{ padding: "80px 40px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>SUPPORT</div>
        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontFamily: G.serif, color: G.cream, margin: "0 0 20px", fontWeight: 700, lineHeight: 1.1 }}>
          We're Here to Help
        </h1>
        <p style={{ color: G.muted, fontSize: 16, lineHeight: 2, marginBottom: 48, maxWidth: 560 }}>
          Our concierge team is available 24/7. Use the live chat widget in the bottom-right corner to connect with a real agent instantly, or join the waitlist for dedicated one-on-one booking assistance.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
          {[
            ["💬", "Live Chat", "Click the chat icon in the bottom-right corner to connect with a live support agent immediately.", null],
            ["📋", "Concierge Waitlist", "Join our waitlist for a dedicated booking concierge to personally assist you.", "waitlist"],
            ["✉️", "Email Support", "Reach our team at support@starbook.io for detailed inquiries.", null],
            ["📞", "Priority Line", "VIP and enterprise clients can request a direct callback from our senior concierge team.", "waitlist"],
          ].map(([icon, title, desc, link]) => (
            <div key={title} onClick={link ? () => setPage(link) : undefined} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "28px 24px", cursor: link ? "pointer" : "default", transition: "all 0.3s" }}
              onMouseEnter={e => { if (link) { e.currentTarget.style.borderColor = G.gold + "50"; e.currentTarget.style.transform = "translateY(-3px)"; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.transform = "none"; }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <div style={{ color: G.cream, fontWeight: 600, fontSize: 15, marginBottom: 8, fontFamily: G.serif }}>{title}</div>
              <div style={{ color: G.dim, fontSize: 13, lineHeight: 1.7 }}>{desc}</div>
              {link && <div style={{ color: G.gold, fontSize: 12, marginTop: 12, fontWeight: 700 }}>Get Started →</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
const PAGES = ["home","celebrities","waitlist","about","contact","dashboard","admin"];

function getHashPage() {
  const hash = window.location.hash.slice(1);
  return PAGES.includes(hash) ? hash : "home";
}

export default function App() {
  const [page, setPageState] = useState(getHashPage);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [authModal, setAuthModal] = useState(null);
  const [celebModal, setCelebModal] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);

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

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sb_user");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
        api.getUserBookings().then(setBookings).catch(() => {});
      }
      const favRaw = localStorage.getItem("sb_favs");
      if (favRaw) setFavorites(JSON.parse(favRaw));
    } catch {}
  }, []);

  // Redirect auth-gated pages when user isn't loaded
  useEffect(() => {
    const authPages = ["dashboard", "admin"];
    if (authPages.includes(page) && !user) {
      const raw = localStorage.getItem("sb_user");
      if (!raw) setPage("home");
    }
  }, [page, user]);

  function handleAuth(userData) {
    setUser(userData);
    try { localStorage.setItem("sb_user", JSON.stringify(userData)); } catch {}
    setAuthModal(null);
    api.getUserBookings().then(setBookings).catch(() => {});
  }

  function handleLogout() {
    setUser(null);
    setBookings([]);
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

  const sharedProps = {
    onView: c => setCelebModal(c),
    onBook: handleBook,
    favorites,
    onFav: handleFav,
  };

  return (
    <div style={{ minHeight: "100vh", background: G.bg }}>
      <GlobalStyles />
      <Navbar page={page} setPage={setPage} user={user} onAuth={m => setAuthModal(m)} onLogout={handleLogout} />

      {page === "home"        && <HomePage {...sharedProps} setPage={setPage} />}
      {page === "celebrities" && <CelebritiesPage {...sharedProps} />}
      {page === "waitlist"    && <WaitlistPage user={user} />}
      {page === "about"       && <AboutPage setPage={setPage} />}
      {page === "contact"     && <ContactPage setPage={setPage} />}
      {page === "dashboard"   && user && <DashboardPage user={user} bookings={bookings} favorites={favorites} onView={c => setCelebModal(c)} setPage={setPage} />}
      {page === "admin"       && user?.role === "admin" && <AdminPage user={user} />}

      {/* Modals */}
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onAuth={handleAuth} switchMode={() => setAuthModal(authModal === "login" ? "register" : "login")} />}
      {celebModal && <CelebModal c={celebModal} onClose={() => setCelebModal(null)} onBook={handleBook} isFav={favorites.includes(celebModal.id)} onFav={handleFav} />}
      {bookingModal && <BookingModal c={bookingModal.celeb} type={bookingModal.type} onClose={() => setBookingModal(null)} onConfirm={() => { api.getUserBookings().then(setBookings).catch(() => {}); }} user={user} />}

      {/* Live support chat widget */}
      <SupportChat user={user} />
    </div>
  );
}
