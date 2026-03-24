import { useState, useEffect } from "react";
import { avatar } from "../../lib/tokens.js";
import { Stars } from "../../components/ui.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Input } from "../../components/ui/input.jsx";
import ConfirmModal from "../../components/ui/confirm-modal.jsx";
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
  const [confirmModal, setConfirmModal] = useState(null);

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

  function deleteCeleb(id) {
    setConfirmModal({
      title: "Delete Celebrity",
      message: "Are you sure you want to remove this celebrity from the roster?",
      onConfirm: async () => {
        setConfirmModal(null);
        setCelebs(prev => prev.filter(c => c.id !== id));
        try { await api.deleteCelebrity(id); } catch {}
      },
    });
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

  function deleteUser(u) {
    setConfirmModal({
      title: "Delete User",
      message: `Delete "${u.name}"? This will also remove all their bookings and cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(null);
        setDeletingUserId(u.id);
        try {
          await api.deleteUser(u.id);
          setUsers(prev => prev.filter(x => x.id !== u.id));
        } catch (e) {
          setConfirmModal({ title: "Error", message: e.message || "Failed to delete user.", confirmLabel: "OK", variant: "ghost", onConfirm: () => setConfirmModal(null) });
        } finally {
          setDeletingUserId(null);
        }
      },
    });
  }

  const stats = {
    bookings: adminBookings.length,
    revenue: adminBookings.reduce((s, b) => s + (b.amount || 0), 0),
    pending: adminBookings.filter(b => b.status === "pending").length,
    celebs: celebs.length,
    available: celebs.filter(c => c.avail).length,
  };

  const CATS = ["actors", "musicians", "sports", "influencers", "royalty", "comedians", "other"];

  const statCards = [
    { label: "Total Bookings", value: stats.bookings,                       icon: "📅", colorClass: "text-primary" },
    { label: "Revenue",        value: `$${stats.revenue.toLocaleString()}`, icon: "💰", colorClass: "text-[#6DBF7B]" },
    { label: "Pending",        value: stats.pending,                        icon: "⏳", colorClass: "text-[#D4A84B]" },
    { label: "Total Celebs",   value: stats.celebs,                         icon: "⭐", colorClass: "text-primary" },
    { label: "Available",      value: stats.available,                      icon: "✅", colorClass: "text-[#6DBF7B]" },
  ];

  const statusVariant = { pending: "warning", approved: "success", declined: "destructive" };

  return (
    <div className="pt-16 pb-12 px-4 sm:px-7 max-w-[1140px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-8 mt-8 flex-wrap">
        <Badge variant="destructive" className="text-[11px] px-3 py-1">⚙ ADMIN PANEL</Badge>
        <h1 className="text-[clamp(20px,3.5vw,36px)] font-serif text-foreground m-0 font-bold">Control Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-7">
        {statCards.map(({ label, value, icon, colorClass }) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-5">
            <div className="text-lg mb-1.5">{icon}</div>
            <div className={`text-[clamp(18px,2vw,24px)] font-bold font-serif ${colorClass}`}>{value}</div>
            <div className="text-muted-foreground/60 text-[10px] mt-0.5 uppercase tracking-[0.8px]">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-white/8 flex gap-0 mb-6 overflow-x-auto scrollbar-none">
        {[["overview", "Overview"], ["celebrities", "Celebrities"], ["bookings", "Bookings"], ["users", "Users"], ["inbox", "Support Inbox"]].map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "bg-transparent border-none px-4 py-3 cursor-pointer text-[13px] -mb-px transition-all duration-200 font-sans whitespace-nowrap",
              tab === t
                ? "border-b-2 border-destructive text-destructive font-bold"
                : "border-b-2 border-transparent text-muted-foreground font-normal hover:text-foreground",
            ].join(" ")}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-6">
            <h3 className="text-foreground mb-4 font-serif text-xl m-0">📊 Platform Summary</h3>
            <p className="text-muted-foreground leading-[1.8] text-sm">
              You have <strong className="text-primary">{stats.celebs}</strong> celebrities listed — <strong className="text-[#6DBF7B]">{stats.available}</strong> currently available.
            </p>
            <p className="text-muted-foreground leading-[1.8] text-sm">
              Total bookings: <strong className="text-primary">{stats.bookings}</strong>. Revenue: <strong className="text-[#6DBF7B]">${stats.revenue.toLocaleString()}</strong>.
            </p>
            <p className="text-muted-foreground leading-[1.8] text-sm">
              <strong className="text-[#D4A84B]">{stats.pending}</strong> bookings pending your review.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-6">
            <h3 className="text-foreground mb-4 font-serif text-xl m-0">⚡ Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              <Button onClick={() => setTab("celebrities")} variant="ghost" className="justify-start">📋 Manage Celebrity Listings</Button>
              <Button onClick={() => setTab("bookings")} variant="ghost" className="justify-start">📅 Review Pending Bookings</Button>
              <Button onClick={() => setTab("users")} variant="ghost" className="justify-start">👥 Manage Users</Button>
              <Button onClick={() => setTab("inbox")} variant="ghost" className="justify-start">💬 Open Support Inbox</Button>
            </div>
          </div>
        </div>
      )}

      {/* Celebrities Tab */}
      {tab === "celebrities" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-foreground font-serif text-xl m-0">Celebrity Roster</h3>
            <Button onClick={() => setShowAddCeleb(v => !v)} className="px-5 py-2 text-xs">
              {showAddCeleb ? "✕ Cancel" : "+ Add Celebrity"}
            </Button>
          </div>

          {showAddCeleb && (
            <div className="bg-card border border-primary/20 rounded-xl p-6 mb-5">
              <h4 className="text-primary mb-4 font-serif text-base m-0">New Celebrity</h4>
              {celebError && (
                <div className="bg-destructive/10 text-destructive rounded-lg px-3.5 py-2 text-xs mb-3">{celebError}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <Input label="Name *" value={celebForm.name} onChange={e => setCelebForm(f => ({ ...f, name: e.target.value }))} placeholder="Celebrity name" />
                <div>
                  <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Category *</label>
                  <select
                    value={celebForm.category}
                    onChange={e => setCelebForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans"
                  >
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Input label="Price ($) *" value={celebForm.price} onChange={e => setCelebForm(f => ({ ...f, price: e.target.value }))} placeholder="5000" type="number" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <Input label="Photo URL" value={celebForm.photo} onChange={e => setCelebForm(f => ({ ...f, photo: e.target.value }))} placeholder="https://..." />
                <Input label="Country" value={celebForm.country} onChange={e => setCelebForm(f => ({ ...f, country: e.target.value }))} placeholder="USA" />
                <Input label="Flag Emoji" value={celebForm.flag} onChange={e => setCelebForm(f => ({ ...f, flag: e.target.value }))} placeholder="🇺🇸" />
              </div>
              <Input label="Bio" value={celebForm.bio} onChange={e => setCelebForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio..." rows={2} />
              <Button onClick={addCeleb} className="mt-2 px-6 py-2 text-xs">Add Celebrity →</Button>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {celebs.map(c => (
              <div key={c.id} className="rounded-xl border border-white/8 bg-card p-4 flex justify-between items-center gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <img
                    src={c.img || avatar(c.name)}
                    alt={c.name}
                    className="w-[42px] h-[42px] rounded-full object-cover border-2 border-primary/10"
                    onError={e => e.target.src = avatar(c.name)}
                  />
                  <div>
                    <div className="text-foreground font-semibold text-sm">{c.name}</div>
                    <div className="text-muted-foreground text-xs">{c.flag} {c.country} • {c.cat} • ${(c.price || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Stars r={c.rating} size={12} />
                  <Button
                    onClick={() => toggleAvail(c)}
                    variant={c.avail ? "success" : "danger"}
                    className="px-3.5 py-1.5 text-xs"
                  >
                    {c.avail ? "✓ Available" : "✗ Unavailable"}
                  </Button>
                  <button
                    onClick={() => deleteCeleb(c.id)}
                    className="bg-transparent border border-destructive/40 rounded-lg text-destructive cursor-pointer px-2.5 py-1.5 text-xs font-sans hover:bg-destructive/10 hover:border-destructive/70 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {tab === "bookings" && (
        loadingBookings ? (
          <div className="text-center py-16 text-muted-foreground">Loading bookings...</div>
        ) : adminBookings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-3.5">📭</div>
            <div>No bookings yet</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {adminBookings.map(b => {
              const form = b.form || {};
              const isExpanded = expandedBooking === b.id;
              return (
                <div
                  key={b.id}
                  className={[
                    "bg-card rounded-xl overflow-hidden transition-colors duration-200 border",
                    isExpanded ? "border-primary/40" : "border-white/8",
                  ].join(" ")}
                >
                  <div
                    onClick={() => setExpandedBooking(isExpanded ? null : b.id)}
                    className="px-4 sm:px-5 py-4 flex justify-between items-start sm:items-center flex-wrap gap-3 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground font-semibold text-sm">{b.celeb?.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5 truncate">{form.name || b.userName} • {form.email}</div>
                      <div className="text-muted-foreground/60 text-[11px] mt-px">{b.type} • {new Date(b.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <span className="text-primary font-bold text-[14px]">${(b.amount || b.celeb?.price || 0).toLocaleString()}</span>
                      <Badge variant={statusVariant[b.status] || "warning"}>
                        {(b.status || "pending").toUpperCase()}
                      </Badge>
                      {b.status === "pending" && (
                        <>
                          <Button
                            onClick={e => { e.stopPropagation(); updateStatus(b.id, "approved"); }}
                            variant="success"
                            className="px-3 py-1.5 text-xs"
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            onClick={e => { e.stopPropagation(); updateStatus(b.id, "declined"); }}
                            variant="danger"
                            className="px-3 py-1.5 text-xs"
                          >
                            ✕ Decline
                          </Button>
                        </>
                      )}
                      <span className="text-muted-foreground/60 text-xs">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/8 p-4 sm:p-5 bg-background/50 grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* Client Info */}
                      <div>
                        <div className="text-primary text-[10px] tracking-[1.5px] font-bold uppercase mb-2.5">Client Info</div>
                        {[["Name", form.name || b.userName || "—"], ["Email", form.email || "—"], ["Phone", form.phone || "—"], ["Account", b.userName || "—"]].map(([k, v]) => (
                          <div key={k} className="flex gap-2 mb-1.5 text-xs">
                            <span className="text-muted-foreground/60 font-semibold min-w-[60px]">{k}:</span>
                            <span className="text-foreground">{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Booking Details */}
                      <div>
                        <div className="text-primary text-[10px] tracking-[1.5px] font-bold uppercase mb-2.5">Booking Details</div>
                        {[["Celebrity", b.celeb?.name || "—"], ["Type", b.type || "—"], ["Event Date", form.eventDate || form.date || "—"], ["Guests", form.guests || form.attendees || "—"], ["Event", form.eventType || form.event || "—"]].map(([k, v]) => (
                          <div key={k} className="flex gap-2 mb-1.5 text-xs">
                            <span className="text-muted-foreground/60 font-semibold min-w-[80px]">{k}:</span>
                            <span className="text-foreground">{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* Payment & Message */}
                      <div>
                        <div className="text-primary text-[10px] tracking-[1.5px] font-bold uppercase mb-2.5">Payment</div>
                        <div className="bg-card border border-primary/15 rounded-lg px-3 py-2.5 mb-3 flex items-center gap-2">
                          <span className="text-lg">{b.paymentMethod === "crypto" ? "₿" : b.paymentMethod === "giftcard" ? "🎁" : "🏦"}</span>
                          <span className="text-foreground text-[13px] font-semibold capitalize">{b.paymentMethod || "—"}</span>
                        </div>

                        {/* Gift card details */}
                        {b.paymentMethod === "giftcard" && (form.giftCardType || form.giftCardCode) && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg px-3.5 py-2.5 mb-3">
                            <div className="text-primary text-[10px] tracking-[1.5px] font-bold uppercase mb-2">🎁 Gift Card Details</div>
                            {[
                              ["Card Type",   form.giftCardType   || "—"],
                              ["Amount",      form.giftCardAmount ? `$${form.giftCardAmount}` : "—"],
                              ["Redeem Code", form.giftCardCode   || "—"],
                            ].map(([k, v]) => (
                              <div key={k} className="flex gap-2 mb-1.5 text-xs">
                                <span className="text-muted-foreground/60 font-semibold min-w-[90px]">{k}:</span>
                                <span className={[
                                  "break-all",
                                  k === "Redeem Code" ? "text-primary font-bold font-mono tracking-wide" : "text-foreground",
                                ].join(" ")}>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {(form.message || form.notes) ? (
                          <>
                            <div className="text-muted-foreground/60 text-[10px] tracking-[1.5px] font-bold uppercase mb-1.5">Message</div>
                            <div className="text-muted-foreground text-xs leading-[1.6] bg-card border border-white/8 rounded-lg px-3 py-2.5">
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

      {/* Users Tab */}
      {tab === "users" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-foreground font-serif text-xl m-0">User Management</h3>
            <Button onClick={() => setShowAddUser(v => !v)} className="px-5 py-2 text-xs">
              {showAddUser ? "✕ Cancel" : "+ Add User"}
            </Button>
          </div>

          {showAddUser && (
            <div className="bg-card border border-primary/20 rounded-xl p-6 mb-5">
              <h4 className="text-primary mb-4 font-serif text-base m-0">New User</h4>
              {userError && (
                <div className="bg-destructive/10 text-destructive rounded-lg px-3.5 py-2 text-xs mb-3">{userError}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input label="Full Name *" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
                <Input label="Email *" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="user@email.com" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input label="Password *" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} type="password" placeholder="••••••••" />
                <div>
                  <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Role</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <Button onClick={addUser} className="mt-1 px-6 py-2 text-xs">Create User →</Button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {users.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-3">👥</div>
                <div>No users found</div>
              </div>
            ) : users.map(u => (
              <div key={u.id} className="rounded-xl border border-white/8 bg-card p-4 flex justify-between items-start sm:items-center gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-base">
                    {u.role === "admin" ? "⚙" : "👤"}
                  </div>
                  <div>
                    <div className="text-foreground font-semibold text-sm">{u.name}</div>
                    <div className="text-muted-foreground text-xs">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge variant={u.role === "admin" ? "destructive" : "default"}>
                    {u.role?.toUpperCase()}
                  </Badge>
                  <span className="text-muted-foreground/60 text-[11px]">Joined {new Date(u.joined).toLocaleDateString()}</span>
                  {u.id !== user.id && (
                    <button
                      onClick={() => deleteUser(u)}
                      disabled={deletingUserId === u.id}
                      title="Delete user"
                      className={[
                        "bg-transparent border border-destructive/40 rounded-lg text-[13px] px-2.5 py-1 font-sans transition-colors duration-200",
                        deletingUserId === u.id
                          ? "text-muted-foreground/60 cursor-default opacity-50"
                          : "text-destructive cursor-pointer hover:bg-destructive/10 hover:border-destructive/70",
                      ].join(" ")}
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

      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        confirmLabel={confirmModal?.confirmLabel || "Delete"}
        variant={confirmModal?.variant || "danger"}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}
