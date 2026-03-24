import { useState, useEffect } from "react";
import { G } from "../lib/tokens.js";
import { Button } from "./ui/button.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";
import { cn } from "../lib/utils.js";

export default function Navbar({ page, setPage, user, onAuth, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [page]);

  const navLinks = [
    ["home", "Explore"],
    ["celebrities", "Celebrities"],
    ["blog", "Blog"],
    ["waitlist", "Join Waitlist"],
    ["contact", "Support"],
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 h-[68px] z-[800] flex items-center justify-between transition-all duration-300",
          scrolled ? "bg-background/95 border-b border-white/8 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]" : "bg-background/40 border-b border-transparent backdrop-blur-xl"
        )}
        style={{ padding: isMobile ? "0 20px" : "0 48px" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
          onClick={() => setPage("home")}
        >
          <img src="/favicon.svg" alt="StarBook" className="w-8 h-8" />
          <span className="text-primary font-serif text-[22px] font-extrabold tracking-[3px] uppercase">
            StarBook
          </span>
        </div>

        {/* Desktop Nav */}
        {!isMobile && (
          <div className="flex items-center gap-9">
            {navLinks.map(([p, label]) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "bg-transparent border-0 border-b-2 cursor-pointer text-[13px] font-sans tracking-wide transition-colors duration-200 py-1",
                  page === p
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
            {user && (
              <button
                onClick={() => setPage("dashboard")}
                className={cn(
                  "bg-transparent border-0 border-b-2 cursor-pointer text-[13px] font-sans tracking-wide transition-colors duration-200 py-1",
                  page === "dashboard"
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Bookings
              </button>
            )}
            {user?.role === "admin" && (
              <button
                onClick={() => setPage("admin")}
                className={cn(
                  "bg-transparent border-0 cursor-pointer text-[13px] font-semibold font-sans py-1 transition-colors",
                  page === "admin" ? "text-destructive" : "text-destructive/60 hover:text-destructive"
                )}
              >
                Admin
              </button>
            )}
          </div>
        )}

        {/* Desktop Auth */}
        {!isMobile && (
          <div className="flex gap-3.5 items-center shrink-0">
            {user ? (
              <>
                <span className="text-muted-foreground text-[13px]">
                  Hi, <strong className="text-foreground">{user.name.split(" ")[0]}</strong>
                </span>
                <Button onClick={onLogout} variant="ghost" size="sm">Sign Out</Button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onAuth("login")}
                  className="bg-transparent border-0 text-muted-foreground cursor-pointer text-[13px] font-medium font-sans hover:text-foreground transition-colors"
                >
                  Sign In
                </button>
                <Button onClick={() => onAuth("register")} size="sm">Join VIP</Button>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="bg-transparent border border-border rounded-lg px-2.5 py-1.5 cursor-pointer text-muted-foreground text-lg flex items-center justify-center"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div
          className="fixed top-[68px] left-0 right-0 z-[799] bg-background/97 backdrop-blur-xl border-b border-border px-6 pt-5 pb-7 flex flex-col gap-1"
        >
          {navLinks.map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "border-0 rounded-lg cursor-pointer text-[15px] font-sans px-4 py-3 text-left transition-all",
                page === p ? "bg-primary/10 text-primary font-bold" : "bg-transparent text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
          {user && (
            <button
              onClick={() => setPage("dashboard")}
              className={cn(
                "border-0 rounded-lg cursor-pointer text-[15px] font-sans px-4 py-3 text-left",
                page === "dashboard" ? "bg-primary/10 text-primary font-bold" : "bg-transparent text-muted-foreground"
              )}
            >
              Bookings
            </button>
          )}
          {user?.role === "admin" && (
            <button
              onClick={() => setPage("admin")}
              className="bg-transparent border-0 text-destructive cursor-pointer text-[15px] font-semibold font-sans px-4 py-3 text-left"
            >
              Admin
            </button>
          )}
          <div className="border-t border-border mt-2 pt-4 flex gap-3 items-center">
            {user ? (
              <>
                <span className="text-muted-foreground text-[13px] flex-1">
                  Hi, <strong className="text-foreground">{user.name.split(" ")[0]}</strong>
                </span>
                <Button onClick={onLogout} variant="ghost" size="sm">Sign Out</Button>
              </>
            ) : (
              <>
                <Button onClick={() => { setMenuOpen(false); onAuth("login"); }} variant="ghost" className="flex-1">Sign In</Button>
                <Button onClick={() => { setMenuOpen(false); onAuth("register"); }} className="flex-1">Join VIP</Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
