import { useState, useEffect } from "react";
import { G } from "../lib/tokens.js";
import { Btn } from "./ui.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";

export default function Navbar({ page, setPage, user, onAuth, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close menu on page change
  useEffect(() => { setMenuOpen(false); }, [page]);

  const navLinks = [
    ["home", "Explore"],
    ["celebrities", "Celebrities"],
    ["blog", "Blog"],
    ["waitlist", "Join Waitlist"],
    ["contact", "Support"],
  ];

  const linkStyle = (p) => ({
    background: "none", border: "none",
    borderBottom: page === p ? `2px solid ${G.gold}` : "2px solid transparent",
    color: page === p ? G.gold : G.muted,
    cursor: "pointer", fontSize: 13, fontWeight: page === p ? 700 : 500,
    letterSpacing: 0.5, transition: "color 0.25s", padding: "4px 0",
    fontFamily: G.sans,
  });

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 68, zIndex: 800,
        background: scrolled ? "rgba(19,19,19,0.94)" : "rgba(19,19,19,0.6)",
        backdropFilter: "blur(20px) saturate(1.3)",
        borderBottom: `1px solid ${scrolled ? G.border : "transparent"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "0 20px" : "0 48px",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}
          onClick={() => setPage("home")}>
          <span style={{ color: G.gold, fontFamily: G.serif, fontSize: 22, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
            StarBook
          </span>
        </div>

        {/* Desktop Nav links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {navLinks.map(([p, label]) => (
              <button key={p} onClick={() => setPage(p)} style={linkStyle(p)}>{label}</button>
            ))}
            {user && (
              <button onClick={() => setPage("dashboard")} style={linkStyle("dashboard")}>Bookings</button>
            )}
            {user?.role === "admin" && (
              <button onClick={() => setPage("admin")} style={{
                background: "none", border: "none",
                color: page === "admin" ? G.red : G.red + "99",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                padding: "4px 0", fontFamily: G.sans,
              }}>Admin</button>
            )}
          </div>
        )}

        {/* Desktop Auth */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
            {user ? (
              <>
                <span style={{ color: G.muted, fontSize: 13 }}>
                  Hi, <strong style={{ color: G.cream }}>{user.name.split(" ")[0]}</strong>
                </span>
                <Btn onClick={onLogout} variant="ghost" style={{ padding: "8px 20px", fontSize: 11 }}>Sign Out</Btn>
              </>
            ) : (
              <>
                <button onClick={() => onAuth("login")} style={{
                  background: "none", border: "none", color: G.muted, cursor: "pointer",
                  fontSize: 13, fontWeight: 500, fontFamily: G.sans, transition: "color 0.2s",
                }}
                  onMouseEnter={e => e.target.style.color = G.text}
                  onMouseLeave={e => e.target.style.color = G.muted}>
                  Sign In
                </button>
                <Btn onClick={() => onAuth("register")} style={{ padding: "9px 22px", fontSize: 12 }}>Join VIP</Btn>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: "none", border: `1px solid ${G.border}`, borderRadius: 8,
            padding: "6px 10px", cursor: "pointer", color: G.muted, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 68, left: 0, right: 0, zIndex: 799,
          background: "rgba(19,19,19,0.97)", backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${G.border}`,
          padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 4,
        }}>
          {navLinks.map(([p, label]) => (
            <button key={p} onClick={() => setPage(p)} style={{
              background: page === p ? `${G.gold}12` : "none",
              border: "none", borderRadius: 8,
              color: page === p ? G.gold : G.muted,
              cursor: "pointer", fontSize: 15, fontWeight: page === p ? 700 : 500,
              padding: "12px 16px", fontFamily: G.sans, textAlign: "left",
              letterSpacing: 0.3,
            }}>{label}</button>
          ))}
          {user && (
            <button onClick={() => setPage("dashboard")} style={{
              background: page === "dashboard" ? `${G.gold}12` : "none",
              border: "none", borderRadius: 8,
              color: page === "dashboard" ? G.gold : G.muted,
              cursor: "pointer", fontSize: 15, fontWeight: page === "dashboard" ? 700 : 500,
              padding: "12px 16px", fontFamily: G.sans, textAlign: "left",
            }}>Bookings</button>
          )}
          {user?.role === "admin" && (
            <button onClick={() => setPage("admin")} style={{
              background: "none", border: "none",
              color: G.red, cursor: "pointer", fontSize: 15, fontWeight: 600,
              padding: "12px 16px", fontFamily: G.sans, textAlign: "left",
            }}>Admin</button>
          )}
          <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
            {user ? (
              <>
                <span style={{ color: G.muted, fontSize: 13, flex: 1 }}>
                  Hi, <strong style={{ color: G.cream }}>{user.name.split(" ")[0]}</strong>
                </span>
                <Btn onClick={onLogout} variant="ghost" style={{ padding: "9px 20px", fontSize: 12 }}>Sign Out</Btn>
              </>
            ) : (
              <>
                <Btn onClick={() => onAuth("login")} variant="ghost" style={{ flex: 1, padding: "11px 0", fontSize: 13 }}>Sign In</Btn>
                <Btn onClick={() => onAuth("register")} style={{ flex: 1, padding: "11px 0", fontSize: 13 }}>Join VIP</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
