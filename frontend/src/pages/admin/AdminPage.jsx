import { useState, useEffect } from "react";
import { G, avatar } from "../../lib/tokens.js";
import { Stars, Badge, Btn, Input } from "../../components/ui.jsx";
import { api } from "../../api.js";
import ConciergeInbox from "./ConciergeInbox.jsx";

export default function AdminPage({ user }) {
  const [tab, setTab] = useState("overview");
  const [adminBookings, setAdminBookings] = useState([]);
  const [celebs, setCelebs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);

  // Celebrity add form
  const [showAddCeleb, setShowAddCeleb] = useState(false);
  const [celebForm, setCelebForm] = useState({ name: "", category: "actors", price: "", photo: "", bio: "", country: "", flag: "" });

  // User add form
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [userError, setUserError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [celebError, setCelebError] = useState("");

  useEffect(() => {
    api.getAdminBookings()
      .then(data => { setAdminBookings(data); setLoadingBookings(false); })
      .catch(() => setLoadingBookings(false));
    api.getCelebrities()
      .then(setCelebs)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "users" && users.length === 0) {
      api.getAdminUsers().then(setUsers).catch(() => {});
    }
  }, [tab]);

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

  async function deleteCeleb(id) {
    if (!confirm("Delete this celebrity?")) return;
    setCelebs(prev => prev.filter(c => c.id !== id));
    try { await api.deleteCelebrity(id); } catch {}
  }

  async function addCeleb() {
    setCelebError("");
    if (!celebForm.name || !celebForm.category || !celebForm.price) { setCelebError("Name, category and price are required."); return; }
    try {
      const res = await api.addCelebrity(celebForm);
      setCelebs(prev => [...prev, { ...res, avail: res.avail !== false, img: res.photo || null }]);
      setCelebForm({ name: "", category: "actors", price: "", photo: "", bio: "", country: "", flag: "" });
      setShowAddCeleb(false);
    } catch (e) { setCelebError(e.message); }
  }

  async function addUser() {
    setUserError("");
    if (!userForm.name || !userForm.email || !userForm.password) { setUserError("Name, email and password are required."); return; }
    try {
      const res = await api.createUser(userForm);
      setUsers(prev => [res, ...prev]);
      setUserForm({ name: "", email: "", password: "", role: "user" });
      setShowAddUser(false);
    } catch (e) { setUserError(e.message); }
  }

  async function deleteUser(u) {
    if (!confirm(`Delete user "${u.name}"? This will also remove all their bookings.`)) return;
    setDeletingUserId(u.id);
    try {
      await api.deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (e) {
      alert(e.message || "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
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

  const CATS = ["actors", "musicians", "sports", "influencers", "royalty", "comedians", "other"];

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
        {[["overview", "Overview"], ["celebrities", "Celebrities"], ["bookings", "Bookings"], ["users", "Users"], ["inbox", "Support Inbox"]].map(([t, l]) => (
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
              <Btn onClick={() => setTab("users")} variant="ghost" style={{ justifyContent: "flex-start" }}>👥 Manage Users</Btn>
              <Btn onClick={() => setTab("inbox")} variant="ghost" style={{ justifyContent: "flex-start" }}>💬 Open Support Inbox</Btn>
            </div>
          </div>
        </div>
      )}

      {tab === "celebrities" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: G.text, fontFamily: G.serif, fontSize: 20, margin: 0 }}>Celebrity Roster</h3>
            <Btn onClick={() => setShowAddCeleb(v => !v)} style={{ padding: "8px 20px", fontSize: 12 }}>
              {showAddCeleb ? "✕ Cancel" : "+ Add Celebrity"}
            </Btn>
          </div>

          {showAddCeleb && (
            <div style={{ background: G.card, border: `1px solid ${G.gold}30`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <h4 style={{ color: G.gold, margin: "0 0 16px", fontFamily: G.serif, fontSize: 16 }}>New Celebrity</h4>
              {celebError && <div style={{ background: G.red + "18", color: G.red, borderRadius: 8, padding: "8px 14px", fontSize: 12, marginBottom: 12 }}>{celebError}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Input label="Name *" value={celebForm.name} onChange={e => setCelebForm(f => ({ ...f, name: e.target.value }))} placeholder="Celebrity name" />
                <div>
                  <label style={{ color: G.muted, fontSize: 11, letterSpacing: 0.8, display: "block", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Category *</label>
                  <select value={celebForm.category} onChange={e => setCelebForm(f => ({ ...f, category: e.target.value }))} style={{ width: "100%", background: G.s2, border: `1px solid ${G.border}`, borderRadius: 8, padding: "10px 12px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans }}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Input label="Price ($) *" value={celebForm.price} onChange={e => setCelebForm(f => ({ ...f, price: e.target.value }))} placeholder="5000" type="number" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Input label="Photo URL" value={celebForm.photo} onChange={e => setCelebForm(f => ({ ...f, photo: e.target.value }))} placeholder="https://..." />
                <Input label="Country" value={celebForm.country} onChange={e => setCelebForm(f => ({ ...f, country: e.target.value }))} placeholder="USA" />
                <Input label="Flag Emoji" value={celebForm.flag} onChange={e => setCelebForm(f => ({ ...f, flag: e.target.value }))} placeholder="🇺🇸" />
              </div>
              <Input label="Bio" value={celebForm.bio} onChange={e => setCelebForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio..." rows={2} />
              <Btn onClick={addCeleb} style={{ marginTop: 8, padding: "9px 24px", fontSize: 12 }}>Add Celebrity →</Btn>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {celebs.map(c => (
              <div key={c.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={c.img || avatar(c.name)} alt={c.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: `2px solid ${G.gold}22` }} onError={e => e.target.src = avatar(c.name)} />
                  <div>
                    <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>{c.flag} {c.country} • {c.cat} • ${(c.price || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Stars r={c.rating} size={12} />
                  <Btn onClick={() => toggleAvail(c)} variant={c.avail ? "green" : "danger"} style={{ padding: "6px 14px", fontSize: 12 }}>
                    {c.avail ? "✓ Available" : "✗ Unavailable"}
                  </Btn>
                  <button onClick={() => deleteCeleb(c.id)} style={{ background: "none", border: `1px solid ${G.red}40`, borderRadius: 8, color: G.red, cursor: "pointer", padding: "6px 10px", fontSize: 12, fontFamily: G.sans }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
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
            {adminBookings.map(b => {
              const form = b.form || {};
              const isExpanded = expandedBooking === b.id;
              return (
                <div key={b.id} style={{ background: G.card, border: `1px solid ${isExpanded ? G.gold + "40" : G.border}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <div
                    onClick={() => setExpandedBooking(isExpanded ? null : b.id)}
                    style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, cursor: "pointer" }}
                  >
                    <div>
                      <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{b.celeb?.name}</div>
                      <div style={{ color: G.muted, fontSize: 12, marginTop: 2 }}>{form.name || b.userName} • {form.email} • {b.type}</div>
                      <div style={{ color: G.dim, fontSize: 11, marginTop: 1 }}>Submitted: {new Date(b.date).toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ color: G.gold, fontWeight: 700, fontSize: 15 }}>${(b.amount || b.celeb?.price || 0).toLocaleString()}</span>
                      <Badge color={statusColor[b.status] || G.amber}>{(b.status || "pending").toUpperCase()}</Badge>
                      {b.status === "pending" && (
                        <>
                          <Btn onClick={e => { e.stopPropagation(); updateStatus(b.id, "approved"); }} variant="green" style={{ padding: "6px 14px", fontSize: 12 }}>✓ Approve</Btn>
                          <Btn onClick={e => { e.stopPropagation(); updateStatus(b.id, "declined"); }} variant="danger" style={{ padding: "6px 14px", fontSize: 12 }}>✕ Decline</Btn>
                        </>
                      )}
                      <span style={{ color: G.dim, fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: `1px solid ${G.border}`, padding: "20px", background: G.s1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                      {/* Client Info */}
                      <div>
                        <div style={{ color: G.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Client Info</div>
                        {[["Name", form.name || b.userName || "—"], ["Email", form.email || "—"], ["Phone", form.phone || "—"], ["Account", b.userName || "—"]].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12 }}>
                            <span style={{ color: G.dim, fontWeight: 600, minWidth: 60 }}>{k}:</span>
                            <span style={{ color: G.text }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Booking Details */}
                      <div>
                        <div style={{ color: G.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Booking Details</div>
                        {[["Celebrity", b.celeb?.name || "—"], ["Type", b.type || "—"], ["Event Date", form.eventDate || form.date || "—"], ["Guests", form.guests || form.attendees || "—"], ["Event", form.eventType || form.event || "—"]].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12 }}>
                            <span style={{ color: G.dim, fontWeight: 600, minWidth: 80 }}>{k}:</span>
                            <span style={{ color: G.text }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Payment & Message */}
                      <div>
                        <div style={{ color: G.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Payment</div>
                        <div style={{ background: G.card, border: `1px solid ${G.gold}25`, borderRadius: 8, padding: "10px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{b.paymentMethod === "card" ? "💳" : b.paymentMethod === "crypto" ? "₿" : "🏦"}</span>
                          <span style={{ color: G.text, fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{b.paymentMethod || "—"}</span>
                        </div>
                        {form.message || form.notes ? (
                          <>
                            <div style={{ color: G.dim, fontSize: 10, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Message</div>
                            <div style={{ color: G.muted, fontSize: 12, lineHeight: 1.6, background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "10px 12px" }}>
                              {form.message || form.notes}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "users" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: G.text, fontFamily: G.serif, fontSize: 20, margin: 0 }}>User Management</h3>
            <Btn onClick={() => setShowAddUser(v => !v)} style={{ padding: "8px 20px", fontSize: 12 }}>
              {showAddUser ? "✕ Cancel" : "+ Add User"}
            </Btn>
          </div>

          {showAddUser && (
            <div style={{ background: G.card, border: `1px solid ${G.gold}30`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <h4 style={{ color: G.gold, margin: "0 0 16px", fontFamily: G.serif, fontSize: 16 }}>New User</h4>
              {userError && <div style={{ background: G.red + "18", color: G.red, borderRadius: 8, padding: "8px 14px", fontSize: 12, marginBottom: 12 }}>{userError}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Input label="Full Name *" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
                <Input label="Email *" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="user@email.com" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Input label="Password *" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} type="password" placeholder="••••••••" />
                <div>
                  <label style={{ color: G.muted, fontSize: 11, letterSpacing: 0.8, display: "block", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>Role</label>
                  <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} style={{ width: "100%", background: G.s2, border: `1px solid ${G.border}`, borderRadius: 8, padding: "10px 12px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans }}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <Btn onClick={addUser} style={{ marginTop: 4, padding: "9px 24px", fontSize: 12 }}>Create User →</Btn>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: G.muted }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                <div>No users found</div>
              </div>
            ) : users.map(u => (
              <div key={u.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${G.gold}20`, border: `1px solid ${G.gold}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {u.role === "admin" ? "⚙" : "👤"}
                  </div>
                  <div>
                    <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                    <div style={{ color: G.muted, fontSize: 12 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge color={u.role === "admin" ? G.red : G.gold}>{u.role?.toUpperCase()}</Badge>
                  <span style={{ color: G.dim, fontSize: 11 }}>Joined {new Date(u.joined).toLocaleDateString()}</span>
                  {u.id !== user.id && (
                    <button
                      onClick={() => deleteUser(u)}
                      disabled={deletingUserId === u.id}
                      title="Delete user"
                      style={{ background: "none", border: `1px solid ${G.red}40`, borderRadius: 8, color: deletingUserId === u.id ? G.dim : G.red, cursor: deletingUserId === u.id ? "default" : "pointer", padding: "5px 10px", fontSize: 13, fontFamily: G.sans, transition: "all 0.2s", opacity: deletingUserId === u.id ? 0.5 : 1 }}
                      onMouseEnter={e => { if (deletingUserId !== u.id) { e.currentTarget.style.background = G.red + "15"; e.currentTarget.style.borderColor = G.red + "80"; } }}
                      onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = G.red + "40"; }}
                    >
                      {deletingUserId === u.id ? "⏳" : "🗑"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "inbox" && <ConciergeInbox user={user} />}
    </div>
  );
}
