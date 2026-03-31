import { useState } from "react";
import { avatar, celebPlaceholder } from "../lib/tokens.js";
import { CELEBS } from "../lib/data.js";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Separator } from "../components/ui/separator.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";
import { cn } from "../lib/utils.js";
import { api } from "../api.js";

// ── helpers ────────────────────────────────────────────────────────────────
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
    </button>
  );
}

function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40 shrink-0">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function MenuRow({ icon, label, sub, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-0 cursor-pointer text-left transition-colors rounded-xl",
        danger ? "hover:bg-destructive/5" : "hover:bg-white/[0.03]"
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0", danger ? "bg-destructive/10" : "bg-white/[0.06]")}>
          {icon}
        </div>
        <div>
          <div className={cn("text-sm font-medium font-sans", danger ? "text-destructive" : "text-foreground")}>{label}</div>
          {sub && <div className="text-xs text-muted-foreground mt-0.5 font-sans">{sub}</div>}
        </div>
      </div>
      {!danger && <ChevronRight />}
    </button>
  );
}

// ── mini sparkline for stat cards (desktop) ────────────────────────────────
function MiniBar({ color = "#6DBF7B" }) {
  const heights = [30, 55, 40, 70, 50, 85, 60];
  return (
    <div className="flex items-end gap-[3px] h-8">
      {heights.map((h, i) => (
        <div key={i} style={{ height: `${h}%`, background: color, opacity: 0.5 + (i / heights.length) * 0.5 }} className="w-[5px] rounded-sm" />
      ))}
    </div>
  );
}

// ── main ───────────────────────────────────────────────────────────────────
export default function DashboardPage({ user, bookings, favorites, onView, setPage, memberTier, onLogout, onFav, theme, toggleTheme, onUserUpdate }) {
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState("profile"); // "profile" | "bookings" | "favorites" | "edit"
  const [desktopTab, setDesktopTab] = useState("bookings");
  const [desktopEditing, setDesktopEditing] = useState(false);

  // Edit state
  const [editName, setEditName] = useState(user.name);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const myBookings = bookings.filter(b => String(b.userId) === String(user.id));
  const myFavs = CELEBS.filter(c => favorites.includes(c.id));
  const spent = myBookings.reduce((s, b) => s + (b.amount || b.celeb?.price || 0), 0);

  const planLabel = user.role === "admin" ? "Administrator"
    : memberTier === "platinum" ? "Platinum Executive"
    : memberTier === "vip" ? "VIP Premium"
    : "Free Plan";
  const planIcon = user.role === "admin" ? "🔑" : memberTier === "platinum" ? "💎" : memberTier === "vip" ? "👑" : "✨";
  const planColor = memberTier === "platinum" ? "text-sky-300" : memberTier === "vip" ? "text-amber-400" : "text-muted-foreground";
  const bannerGradient = memberTier === "platinum"
    ? "linear-gradient(135deg,#0a1520 0%,#1a3050 40%,#0d2040 100%)"
    : memberTier === "vip"
    ? "linear-gradient(135deg,#1a1200 0%,#3a2800 40%,#2a1800 100%)"
    : "linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)";

  async function handleSaveProfile() {
    if (!editName.trim()) return;
    setEditLoading(true); setEditError("");
    try {
      await api.updateMe({ name: editName.trim() });
      onUserUpdate?.({ name: editName.trim() });
      if (isMobile) setMobileView("profile");
      else setDesktopEditing(false);
    } catch (e) {
      setEditError(e.message || "Failed to save");
    } finally { setEditLoading(false); }
  }

  function openEdit() {
    setEditName(user.name);
    setEditError("");
    if (isMobile) setMobileView("edit");
    else setDesktopEditing(true);
  }

  function cancelEdit() {
    setEditName(user.name);
    setEditError("");
    if (isMobile) setMobileView("profile");
    else setDesktopEditing(false);
  }

  // ── PROFILE LEFT PANEL (shared between desktop sidebar + mobile overview) ──
  const ProfileCard = ({ desktop }) => (
    <div className={cn("flex flex-col", desktop ? "h-full" : "")}>
      {/* Banner + avatar */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card mb-4">
        <div className="h-20 w-full" style={{ background: bannerGradient }} />
        <div className="px-5 pb-5">
          <div className="flex items-end gap-3 -mt-9 mb-3">
            <div className="w-[68px] h-[68px] rounded-full border-4 border-card overflow-hidden bg-card shrink-0 shadow-lg">
              <img src={avatar(user.name)} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <span className={cn("pb-1 text-[11px] font-bold font-sans tracking-wide", planColor)}>{planIcon} {planLabel.toUpperCase()}</span>
          </div>
          <div className="text-foreground font-serif text-lg font-bold leading-tight">{user.name}</div>
          <div className="text-muted-foreground text-[13px] font-sans mt-0.5 mb-3">{user.email}</div>
          <Button onClick={openEdit} variant="outline" size="sm" className="w-full rounded-xl text-xs">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Info rows */}
      <div className="rounded-2xl border border-border bg-card px-5 py-3 flex flex-col gap-0 mb-4">
        {[
          ["Email", user.email],
          ["Plan", planLabel],
          ...(user.planExpiresAt && memberTier !== "free" ? [["Renews", new Date(user.planExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })]] : []),
          ["Member Since", new Date(user.id).toLocaleDateString("en-US", { month: "short", year: "numeric" })],
          ["Bookings", myBookings.length],
          ["Total Spent", `$${spent.toLocaleString()}`],
        ].map(([k, v], i, arr) => (
          <div key={k}>
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground text-xs font-sans">{k}</span>
              <span className="text-foreground text-xs font-semibold font-sans">{String(v)}</span>
            </div>
            {i < arr.length - 1 && <Separator />}
          </div>
        ))}
      </div>

      {desktop && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <MenuRow icon={theme === "dark" ? "☀️" : "🌙"} label="Display" sub={`${theme === "dark" ? "Dark" : "Light"} mode`} onClick={toggleTheme} />
          <Separator className="mx-4" />
          <MenuRow icon="💳" label="Subscription" sub={planLabel} onClick={() => setPage("pricing")} />
          <Separator className="mx-4" />
          <MenuRow icon="🚪" label="Log Out" onClick={onLogout} danger />
        </div>
      )}
    </div>
  );

  // ── BOOKINGS LIST (shared) ─────────────────────────────────────────────────
  const BookingsList = () => (
    myBookings.length === 0 ? (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-4xl mb-3">📭</div>
        <div className="text-foreground mb-1.5 font-medium text-sm">No bookings yet</div>
        <div className="text-xs mb-5">Discover and book your favourite celebrities</div>
        <Button size="sm" onClick={() => setPage("celebrities")}>Browse Celebrities →</Button>
      </div>
    ) : (
      <div className="flex flex-col gap-2.5">
        {myBookings.map(b => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <img src={b.celeb.img || celebPlaceholder(b.celeb.name)} alt={b.celeb.name}
                className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0"
                onError={e => e.target.src = celebPlaceholder(b.celeb.name)}
              />
              <div>
                <div className="text-foreground font-semibold text-sm">{b.celeb.name}</div>
                <div className="text-muted-foreground text-xs mt-0.5 font-sans">
                  {b.type} · {new Date(b.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-primary font-bold text-sm">${(b.amount || b.celeb?.price || 0).toLocaleString()}</span>
              <Badge variant={b.status === "approved" ? "success" : b.status === "declined" ? "destructive" : "amber"} className="text-[9px]">
                {(b.status || "pending").toUpperCase()}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    )
  );

  // ── FAVOURITES GRID (shared) ───────────────────────────────────────────────
  const FavouritesList = () => (
    myFavs.length === 0 ? (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-4xl mb-3">💔</div>
        <div className="text-foreground mb-1.5 font-medium text-sm">No favourites yet</div>
        <div className="text-xs mb-5">Browse celebrities and tap the heart to save them</div>
        <Button size="sm" onClick={() => setPage("celebrities")}>Browse Celebrities →</Button>
      </div>
    ) : (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {myFavs.map(c => (
          <div key={c.id} onClick={() => onView(c)} className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/40 transition-colors">
            <div className="relative">
              <img src={c.img || celebPlaceholder(c.name)} alt={c.name} className="w-full h-28 object-cover"
                onError={e => e.target.src = celebPlaceholder(c.name)} />
              <button onClick={e => { e.stopPropagation(); onFav?.(c.id); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-xs cursor-pointer hover:bg-black/70 transition-colors border border-white/10">
                ❤️
              </button>
            </div>
            <div className="p-2.5">
              <div className="text-foreground text-xs font-semibold truncate">{c.name}</div>
              <div className="text-primary text-xs mt-0.5 font-bold">${c.price.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    )
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isMobile) {
    return (
      <div className="pt-[68px] min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Page title */}
          <div className="mb-6">
            <div className="text-primary text-[10px] tracking-[3px] font-bold mb-1 uppercase font-sans">My Account</div>
            <h1 className="text-foreground font-serif text-2xl font-bold">Client Profile</h1>
          </div>

          <div className="flex gap-6 items-start">
            {/* ── Left panel ── */}
            <div className="w-72 shrink-0">
              <ProfileCard desktop />
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 min-w-0">
              {/* Desktop edit profile panel */}
              {desktopEditing && (
                <div className="rounded-2xl border border-border bg-card p-6 mb-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-foreground font-serif text-lg font-bold">Edit Profile</h2>
                    <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground text-xs font-sans cursor-pointer bg-transparent border-0 transition-colors">Cancel</button>
                  </div>
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-card border border-border shrink-0">
                      <img src={avatar(user.name)} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-foreground font-semibold text-sm">{user.name}</div>
                      <div className="text-muted-foreground text-xs font-sans">{user.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-muted-foreground text-[10px] tracking-[0.8px] block mb-1.5 uppercase font-semibold font-sans">Display Name</label>
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans transition-colors"
                        placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-[10px] tracking-[0.8px] block mb-1.5 uppercase font-semibold font-sans">Email Address</label>
                      <input value={user.email} disabled
                        className="w-full rounded-xl border border-border bg-white/[0.02] px-4 py-2.5 text-sm text-muted-foreground outline-none font-sans cursor-not-allowed" />
                    </div>
                  </div>
                  {editError && <div className="bg-destructive/10 text-destructive text-xs rounded-xl px-4 py-2.5 mt-3 font-sans">{editError}</div>}
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSaveProfile} disabled={editLoading || !editName.trim()} size="sm" className="px-6 rounded-xl">
                      {editLoading ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "All Bookings", value: myBookings.length, delta: "+12.5%", color: "#6366f1", barColor: "#6366f1" },
                  { label: "Approved",     value: myBookings.filter(b => b.status === "approved").length, delta: "+26%", color: "#6DBF7B", barColor: "#6DBF7B" },
                  { label: "Pending",      value: myBookings.filter(b => b.status === "pending").length,  delta: myBookings.filter(b => b.status === "pending").length > 0 ? "Needs review" : "All clear", color: "#D4A84B", barColor: "#D4A84B" },
                ].map(({ label, value, delta, color, barColor }) => (
                  <div key={label} className="rounded-2xl border border-border bg-card p-5 flex justify-between items-start">
                    <div>
                      <div className="text-[clamp(22px,2vw,30px)] font-bold font-serif text-foreground">{value}</div>
                      <div className="text-muted-foreground text-xs font-sans mt-0.5">{label}</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-[11px] text-muted-foreground font-sans">{delta}</span>
                      </div>
                    </div>
                    <MiniBar color={barColor} />
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex border-b border-border px-5 pt-4">
                  {[["bookings", "My Bookings"], ["favorites", "Favourites"]].map(([t, l]) => (
                    <button
                      key={t}
                      onClick={() => setDesktopTab(t)}
                      className={cn(
                        "bg-transparent border-0 border-b-2 -mb-px cursor-pointer text-[13px] font-sans px-4 pb-3 mr-2 transition-all font-medium",
                        desktopTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >{l}</button>
                  ))}
                </div>
                <div className="p-5">
                  {desktopTab === "bookings" && <BookingsList />}
                  {desktopTab === "favorites" && <FavouritesList />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════

  // Edit Profile
  if (mobileView === "edit") {
    return (
      <div className="pt-16 min-h-screen max-w-md mx-auto px-5 pb-12">
        <div className="mt-6 mb-6 flex items-center gap-3">
          <BackBtn onClick={cancelEdit} />
          <h1 className="text-foreground font-serif text-xl font-bold">Edit Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden bg-card">
              <img src={avatar(user.name)} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-muted-foreground text-[10px] tracking-[0.8px] block mb-1.5 uppercase font-semibold font-sans">Display Name</label>
            <input value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60 font-sans transition-colors"
              placeholder="Your name" />
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] tracking-[0.8px] block mb-1.5 uppercase font-semibold font-sans">Email Address</label>
            <input value={user.email} disabled
              className="w-full rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-sm text-muted-foreground outline-none font-sans cursor-not-allowed" />
            <p className="text-muted-foreground/50 text-[10px] mt-1 font-sans">Contact support to change your email.</p>
          </div>
          <div>
            <label className="text-muted-foreground text-[10px] tracking-[0.8px] block mb-1.5 uppercase font-semibold font-sans">Membership</label>
            <div className="w-full rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-sm text-muted-foreground font-sans flex items-center gap-2">
              {planIcon} {planLabel}
            </div>
          </div>
          {editError && <div className="bg-destructive/10 text-destructive text-xs rounded-xl px-4 py-3 font-sans">{editError}</div>}
          <Button onClick={handleSaveProfile} disabled={editLoading || !editName.trim()} className="w-full mt-2 rounded-xl py-3">
            {editLoading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    );
  }

  // Bookings
  if (mobileView === "bookings") {
    return (
      <div className="pt-16 min-h-screen max-w-xl mx-auto px-5 pb-12">
        <div className="mt-6 mb-5 flex items-center gap-3">
          <BackBtn onClick={() => setMobileView("profile")} />
          <h1 className="text-foreground font-serif text-xl font-bold">My Bookings</h1>
        </div>
        <BookingsList />
      </div>
    );
  }

  // Favourites
  if (mobileView === "favorites") {
    return (
      <div className="pt-16 min-h-screen max-w-xl mx-auto px-5 pb-12">
        <div className="mt-6 mb-5 flex items-center gap-3">
          <BackBtn onClick={() => setMobileView("profile")} />
          <h1 className="text-foreground font-serif text-xl font-bold">Favourites</h1>
        </div>
        <FavouritesList />
      </div>
    );
  }

  // Profile overview (default mobile view)
  return (
    <div className="pt-16 min-h-screen max-w-md mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mt-6 mb-4">
        <h1 className="text-foreground font-serif text-xl font-bold">My Profile</h1>
        <button onClick={openEdit}
          className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
        </button>
      </div>

      {/* Hero card */}
      <div className="mx-5 mb-4">
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
          <div className="h-24 w-full" style={{ background: bannerGradient }} />
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <div className="flex items-end gap-3">
                <div className="w-[72px] h-[72px] rounded-full border-4 border-card overflow-hidden bg-card shrink-0 shadow-lg">
                  <img src={avatar(user.name)} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <button onClick={openEdit}
                className="shrink-0 rounded-full border border-primary/40 bg-primary/10 text-primary text-[11px] font-semibold font-sans px-3.5 py-1.5 cursor-pointer hover:bg-primary/20 transition-colors mb-1">
                Edit Profile
              </button>
            </div>
            <h2 className="text-foreground font-serif text-lg font-bold leading-tight">{user.name}</h2>
            <p className="text-muted-foreground text-sm font-sans mt-0.5">{user.email}</p>
            <span className={cn("text-[11px] font-bold font-sans mt-1.5 inline-block", planColor)}>{planIcon} {planLabel}</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-2.5">
        {[
          ["Bookings", myBookings.length, "📅"],
          ["Favourites", myFavs.length, "❤️"],
          ["Spent", `$${spent >= 1000 ? (spent / 1000).toFixed(1) + "k" : spent.toLocaleString()}`, "💰"],
        ].map(([label, value, icon]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
            <div className="text-lg mb-0.5">{icon}</div>
            <div className="text-foreground font-bold text-base font-serif">{value}</div>
            <div className="text-muted-foreground text-[10px] uppercase tracking-wide font-sans mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Activity menu */}
      <div className="mx-5 flex flex-col gap-3">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <MenuRow icon="📅" label="My Bookings" sub={`${myBookings.length} total`} onClick={() => setMobileView("bookings")} />
          <Separator className="mx-4" />
          <MenuRow icon="❤️" label="Favourites" sub={`${myFavs.length} saved`} onClick={() => setMobileView("favorites")} />
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <MenuRow icon={planIcon} label="Subscription" sub={planLabel} onClick={() => setPage("pricing")} />
          <Separator className="mx-4" />
          <MenuRow icon={theme === "dark" ? "☀️" : "🌙"} label="Display" sub={`${theme === "dark" ? "Dark" : "Light"} mode`} onClick={toggleTheme} />
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <MenuRow icon="🚪" label="Log Out" onClick={onLogout} danger />
        </div>

        <p className="text-center text-muted-foreground/40 text-[10px] font-sans mt-1">
          StarBookNow · Member since {new Date(user.id).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
