import { useState } from "react";
import { G, avatar } from "../lib/tokens.js";
import { CELEBS } from "../lib/data.js";
import { Stars, Badge, Btn } from "../components/ui.jsx";

export default function DashboardPage({ user, bookings, favorites, onView, setPage }) {
  const [tab, setTab] = useState("bookings");
  const myBookings = bookings.filter(b => String(b.userId) === String(user.id));
  const myFavs = CELEBS.filter(c => favorites.includes(c.id));
  const spent = myBookings.reduce((s, b) => s + (b.amount || b.celeb?.price || 0), 0);

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", padding: "64px 28px 50px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, marginTop: 30 }}>
        <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>My Account</div>
        <h1 style={{ fontSize: "clamp(24px,4vw,44px)", fontFamily: G.serif, color: G.text, margin: "0 0 6px", fontWeight: 700 }}>Welcome back, {user.name.split(" ")[0]}</h1>
        <p style={{ color: G.muted, fontSize: 14, margin: 0 }}>{user.email} • {user.role === "admin" ? "🔑 Administrator" : "✨ Fan Account"}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 30 }}>
        {[["Bookings", myBookings.length, "📅", G.gold], ["Favorites", myFavs.length, "❤️", G.red], ["Total Spent", `$${spent.toLocaleString()}`, "💰", G.green], ["Status", user.role === "admin" ? "Admin" : "VIP Fan", "👑", G.amber]].map(([l, v, icon, color]) => (
          <div key={l} style={{ background: G.card, border: `1px solid ${color}22`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 700, color, fontFamily: G.serif }}>{v}</div>
            <div style={{ color: G.muted, fontSize: 11, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `1px solid ${G.border}` }}>
        {[["bookings", "📅 My Bookings"], ["favorites", "❤️ Favorites"], ["profile", "👤 Profile"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === t ? G.gold : "transparent"}`, color: tab === t ? G.gold : G.muted, padding: "12px 20px", cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 400, marginBottom: -1, transition: "all 0.2s", fontFamily: G.sans }}>{l}</button>
        ))}
      </div>

      {tab === "bookings" && (
        myBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: G.muted }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
            <div style={{ color: G.text, marginBottom: 6 }}>No bookings yet</div>
            <div style={{ fontSize: 13, marginBottom: 22 }}>Discover and book your favorite celebrities</div>
            <Btn onClick={() => setPage("celebrities")}>Browse Celebrities →</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myBookings.map(b => (
              <div key={b.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img src={b.celeb.img || avatar(b.celeb.name)} alt={b.celeb.name} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: `2px solid ${G.gold}30` }} onError={e => e.target.src = avatar(b.celeb.name)} />
                  <div>
                    <div style={{ color: G.text, fontWeight: 600, fontSize: 15 }}>{b.celeb.name}</div>
                    <div style={{ color: G.muted, fontSize: 12, marginTop: 2 }}>{b.type} • {new Date(b.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</div>
                    {b.form?.date && <div style={{ color: G.dim, fontSize: 11, marginTop: 1 }}>Event date: {b.form.date}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: G.gold, fontWeight: 700, fontSize: 15 }}>${(b.amount || b.celeb?.price || 0).toLocaleString()}</span>
                  <Badge color={b.status === "approved" ? G.green : b.status === "declined" ? G.red : G.amber}>{(b.status || "pending").toUpperCase()}</Badge>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "favorites" && (
        myFavs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: G.muted }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>💔</div>
            <div style={{ color: G.text, marginBottom: 6 }}>No favorites yet</div>
            <div style={{ fontSize: 13, marginBottom: 22 }}>Browse celebrities and tap the heart to save them</div>
            <Btn onClick={() => setPage("celebrities")}>Browse Celebrities →</Btn>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 16 }}>
            {myFavs.map(c => (
              <div key={c.id} onClick={() => onView(c)} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = G.gold + "50"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; }}>
                <img src={c.img || avatar(c.name)} alt={c.name} style={{ width: "100%", height: 130, objectFit: "cover" }} onError={e => e.target.src = avatar(c.name)} />
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ color: G.text, fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: G.gold, fontSize: 12, marginTop: 3, fontWeight: 700 }}>${c.price.toLocaleString()}</div>
                  <Badge color={c.avail ? G.green : G.red} style={{ marginTop: 6 }}>{c.avail ? "AVAILABLE" : "BOOKED"}</Badge>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "profile" && (
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 28, maxWidth: 560 }}>
          <h3 style={{ color: G.text, margin: "0 0 20px", fontFamily: G.serif, fontSize: 22 }}>Profile Information</h3>
          {[["Full Name", user.name], ["Email Address", user.email], ["Account Type", user.role === "admin" ? "🔑 Administrator" : "✨ Fan Account"], ["Member Since", new Date(user.id).toLocaleDateString("en-US", { month: "long", year: "numeric" })], ["Bookings Made", myBookings.length], ["Total Spent", `$${spent.toLocaleString()}`]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${G.border}` }}>
              <span style={{ color: G.muted, fontSize: 13 }}>{k}</span>
              <span style={{ color: G.text, fontSize: 13, fontWeight: 600 }}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
