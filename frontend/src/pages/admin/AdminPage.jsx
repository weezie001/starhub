import { useState, useEffect } from "react";
import { G, avatar } from "../../lib/tokens.js";
import { CELEBS } from "../../lib/data.js";
import { Stars, Badge, Btn } from "../../components/ui.jsx";
import { api } from "../../api.js";
import ConciergeInbox from "./ConciergeInbox.jsx";

export default function AdminPage({ user }) {
  const [tab, setTab] = useState("overview");
  const [adminBookings, setAdminBookings] = useState([]);
  const [celebs, setCelebs] = useState(CELEBS);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    api.getAdminBookings()
      .then(data => { setAdminBookings(data); setLoadingBookings(false); })
      .catch(() => setLoadingBookings(false));
  }, []);

  async function updateStatus(id, status) {
    try {
      await api.updateBookingStatus(id, status);
      setAdminBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch {}
  }

  async function toggleAvail(celeb) {
    const newAvail = !celeb.avail;
    setCelebs(prev => prev.map(c => c.id === celeb.id ? { ...c, avail: newAvail } : c));
    try {
      await api.updateCelebAvailability(celeb.id, newAvail);
    } catch {
      setCelebs(prev => prev.map(c => c.id === celeb.id ? { ...c, avail: celeb.avail } : c));
    }
  }

  const stats = {
    bookings: adminBookings.length,
    revenue: adminBookings.reduce((s, b) => s + (b.amount || 0), 0),
    pending: adminBookings.filter(b => b.status === "pending").length,
    celebs: celebs.length,
    available: celebs.filter(c => c.avail).length,
  };

  const statusColor = { pending: G.amber, approved: G.green, declined: G.red };

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", padding: "64px 28px 50px", maxWidth: 1140, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30, marginTop: 30 }}>
        <Badge color={G.red} style={{ fontSize: 11, padding: "4px 12px" }}>⚙ ADMIN PANEL</Badge>
        <h1 style={{ fontSize: "clamp(20px,3.5vw,36px)", fontFamily: G.serif, color: G.text, margin: 0, fontWeight: 700 }}>Control Dashboard</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 28 }}>
        {[["Total Bookings", stats.bookings, "📅", G.gold], ["Revenue", `$${stats.revenue.toLocaleString()}`, "💰", G.green], ["Pending", stats.pending, "⏳", G.amber], ["Total Celebs", stats.celebs, "⭐", G.gold], ["Available", stats.available, "✅", G.green]].map(([l, v, i, c]) => (
          <div key={l} style={{ background: G.card, border: `1px solid ${c}22`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{i}</div>
            <div style={{ fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, color: c, fontFamily: G.serif }}>{v}</div>
            <div style={{ color: G.muted, fontSize: 10, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.8 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `1px solid ${G.border}` }}>
        {[["overview", "Overview"], ["celebrities", "Celebrities"], ["bookings", "Bookings"], ["inbox", "Concierge Inbox"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === t ? G.red : "transparent"}`, color: tab === t ? G.red : G.muted, padding: "12px 20px", cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 400, marginBottom: -1, transition: "all 0.2s", fontFamily: G.sans }}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ color: G.text, margin: "0 0 16px", fontFamily: G.serif, fontSize: 20 }}>📊 Platform Summary</h3>
            <p style={{ color: G.muted, lineHeight: 1.8, fontSize: 14 }}>You have <strong style={{ color: G.gold }}>{stats.celebs}</strong> celebrities listed — <strong style={{ color: G.green }}>{stats.available}</strong> currently available.</p>
            <p style={{ color: G.muted, lineHeight: 1.8, fontSize: 14 }}>Total bookings: <strong style={{ color: G.gold }}>{stats.bookings}</strong>. Revenue: <strong style={{ color: G.green }}>${stats.revenue.toLocaleString()}</strong>.</p>
            <p style={{ color: G.muted, lineHeight: 1.8, fontSize: 14 }}><strong style={{ color: G.amber }}>{stats.pending}</strong> bookings pending your review.</p>
          </div>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ color: G.text, margin: "0 0 16px", fontFamily: G.serif, fontSize: 20 }}>⚡ Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn onClick={() => setTab("celebrities")} variant="ghost" style={{ justifyContent: "flex-start" }}>📋 Manage Celebrity Listings</Btn>
              <Btn onClick={() => setTab("bookings")} variant="ghost" style={{ justifyContent: "flex-start" }}>📅 Review Pending Bookings</Btn>
              <Btn onClick={() => setTab("inbox")} variant="ghost" style={{ justifyContent: "flex-start" }}>💬 Open Concierge Inbox</Btn>
            </div>
          </div>
        </div>
      )}

      {tab === "celebrities" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {celebs.map(c => (
            <div key={c.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={c.img || avatar(c.name)} alt={c.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: `2px solid ${G.gold}22` }} onError={e => e.target.src = avatar(c.name)} />
                <div>
                  <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ color: G.muted, fontSize: 12 }}>{c.flag} {c.country} • {c.cat} • ${c.price.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Stars r={c.rating} size={12} />
                <Btn onClick={() => toggleAvail(c)} variant={c.avail ? "green" : "danger"} style={{ padding: "6px 14px", fontSize: 12 }}>
                  {c.avail ? "✓ Available" : "✗ Unavailable"}
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "bookings" && (
        loadingBookings ? (
          <div style={{ textAlign: "center", padding: 60, color: G.muted }}>Loading bookings...</div>
        ) : adminBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: G.muted }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
            <div>No bookings yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {adminBookings.map(b => (
              <div key={b.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{b.celeb?.name}</div>
                  <div style={{ color: G.muted, fontSize: 12, marginTop: 2 }}>{b.form?.name} • {b.form?.email} • {b.type}</div>
                  <div style={{ color: G.dim, fontSize: 11, marginTop: 1 }}>Submitted: {new Date(b.date).toLocaleString()}</div>
                  {b.userName && <div style={{ color: G.dim, fontSize: 11 }}>Client: {b.userName}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ color: G.gold, fontWeight: 700, fontSize: 15 }}>${(b.amount || b.celeb?.price || 0).toLocaleString()}</span>
                  <Badge color={statusColor[b.status] || G.amber}>{(b.status || "pending").toUpperCase()}</Badge>
                  {b.status === "pending" && (
                    <>
                      <Btn onClick={() => updateStatus(b.id, "approved")} variant="green" style={{ padding: "6px 14px", fontSize: 12 }}>✓ Approve</Btn>
                      <Btn onClick={() => updateStatus(b.id, "declined")} variant="danger" style={{ padding: "6px 14px", fontSize: 12 }}>✕ Decline</Btn>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "inbox" && <ConciergeInbox user={user} />}
    </div>
  );
}
