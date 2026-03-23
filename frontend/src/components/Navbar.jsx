import { useState, useEffect } from "react";
import { G } from "../lib/tokens.js";
import { Btn } from "./ui.jsx";

export default function Navbar({ page, setPage, user, onAuth, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    ["home", "Explore"],
    ["celebrities", "Celebrities"],
    ["waitlist", "Join Waitlist"],
    ["contact", "Support"],
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 68, zIndex: 800,
      background: scrolled ? "rgba(19,19,19,0.94)" : "rgba(19,19,19,0.6)",
      backdropFilter: "blur(20px) saturate(1.3)",
      borderBottom: `1px solid ${scrolled ? G.border : "transparent"}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px", transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}
        onClick={() => setPage("home")}>
        <span style={{ color: G.gold, fontFamily: G.serif, fontSize: 22, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
          StarBook
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {navLinks.map(([p, label]) => (
          <button key={p} onClick={() => setPage(p)} style={{
            background: "none", border: "none",
            borderBottom: page === p ? `2px solid ${G.gold}` : "2px solid transparent",
            color: page === p ? G.gold : G.muted,
            cursor: "pointer", fontSize: 13, fontWeight: page === p ? 700 : 500,
            letterSpacing: 0.5, transition: "color 0.25s", padding: "4px 0",
            fontFamily: G.sans,
          }}>
            {label}
          </button>
        ))}
        {user && (
          <button onClick={() => setPage("dashboard")} style={{
            background: "none", border: "none",
            borderBottom: page === "dashboard" ? `2px solid ${G.gold}` : "2px solid transparent",
            color: page === "dashboard" ? G.gold : G.muted,
            cursor: "pointer", fontSize: 13, fontWeight: page === "dashboard" ? 700 : 500,
            letterSpacing: 0.5, padding: "4px 0", fontFamily: G.sans,
          }}>
            Bookings
          </button>
        )}
        {user?.role === "admin" && (
          <button onClick={() => setPage("admin")} style={{
            background: "none", border: "none",
            color: page === "admin" ? G.red : G.red + "99",
            cursor: "pointer", fontSize: 13, fontWeight: 600,
            padding: "4px 0", fontFamily: G.sans,
          }}>
            Admin
          </button>
        )}
      </div>

      {/* Auth */}
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
    </nav>
  );
}
