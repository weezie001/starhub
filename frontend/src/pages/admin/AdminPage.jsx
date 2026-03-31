import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { avatar, celebPlaceholder } from "../../lib/tokens.js";
import { Stars } from "../../components/ui.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog.jsx";
import ConfirmModal from "../../components/ui/confirm-modal.jsx";
import { api } from "../../api.js";
import { WS_URL } from "../../lib/tokens.js";
import ConciergeInbox from "./ConciergeInbox.jsx";
import {
  House, Star, CalendarBlank, Receipt, Crown, Newspaper, Users, ChatCircle,
  Bell, MagnifyingGlass, SignOut, Check, X, PencilSimple, Trash, Plus,
  ArrowRight, UserCircle, ChartBar, List, EnvelopeSimple
} from "@phosphor-icons/react";

const CATS = ["actors", "musicians", "sports", "influencers", "royalty", "comedians", "other"];
const BLOG_CATS = ["Event Planning", "Trends", "Insights", "How It Works", "Strategy"];

const NAV = [
  { id: "overview",     label: "Overview",       icon: House },
  { id: "celebrities",  label: "Celebrities",     icon: Star },
  { id: "bookings",     label: "Bookings",        icon: CalendarBlank },
  { id: "transactions", label: "Transactions",    icon: Receipt },
  { id: "plans",        label: "Plans",           icon: Crown },
  { id: "blogs",        label: "Blogs",           icon: Newspaper },
  { id: "users",        label: "Users",           icon: Users },
  { id: "inbox",        label: "Support Inbox",   icon: ChatCircle },
];

function bodyToContent(body) {
  return body.split(/\n\n+/).filter(Boolean).map(block => {
    const t = block.trim();
    if (t.startsWith("## ")) return { type: "h2", text: t.slice(3).trim() };
    return { type: "p", text: t };
  });
}
function contentToBody(content = []) {
  return content.map(b => b.type === "h2" ? `## ${b.text}` : b.text).join("\n\n");
}

const statusVariant = { pending: "warning", approved: "success", declined: "destructive" };

function groupByMonth(items, dateKey, valueKey = null, months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: d.toLocaleString("default", { month: "short", year: "2-digit" }), value: 0 });
  }
  items.forEach(item => {
    const d = new Date(item[dateKey]);
    if (isNaN(d)) return;
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    const bucket = buckets.find(b => b.month === label);
    if (bucket) bucket.value += valueKey ? (Number(item[valueKey]) || 0) : 1;
  });
  return buckets;
}

// ── Reusable search bar ────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative">
      <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-foreground outline-none focus:border-primary/60 font-sans placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={[
            "px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer font-sans",
            value === v
              ? "bg-primary/15 border-primary/50 text-primary"
              : "bg-transparent border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground",
          ].join(" ")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
      <h3 className="text-foreground mb-4 font-serif text-lg m-0 flex items-center gap-2">
        {Icon && <Icon size={18} className="text-primary" />}
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Plan Card component ────────────────────────────────────────────────────
function PlanCard({ plan, onSave, saving }) {
  const [price, setPrice] = useState(String(plan.price));
  const [cycle, setCycle] = useState(plan.billingCycle || "monthly");
  const tierColors = { free: "text-muted-foreground", premium: "text-amber-400", platinum: "text-sky-300" };
  const tierLabels = { free: "Free", premium: "Premium / VIP", platinum: "Platinum / Executive" };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`font-serif text-lg font-bold mb-1 ${tierColors[plan.tier]}`}>
        {plan.tier === "platinum" ? "💎" : plan.tier === "premium" ? "👑" : "✨"} {tierLabels[plan.tier]}
      </div>
      <div className="mb-4">
        <label className="text-muted-foreground text-[11px] uppercase tracking-wide block mb-1.5">Monthly Price ($)</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          disabled={plan.tier === "free"}
          className="w-full rounded-xl border border-border bg-input px-3 py-2 text-foreground text-sm outline-none focus:border-primary/60 font-sans disabled:opacity-50"
        />
      </div>
      <div className="text-muted-foreground text-[11px] uppercase tracking-wide mb-1.5">Features</div>
      <ul className="space-y-1 mb-4">
        {(plan.features || []).map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check size={12} className="text-primary mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {plan.tier !== "free" && (
        <Button onClick={() => onSave(plan.tier, parseFloat(price) || 0, cycle, plan.features)} disabled={saving} className="w-full text-xs py-2">
          {saving ? "Saving…" : "Save Pricing →"}
        </Button>
      )}
    </div>
  );
}

export default function AdminPage({ user }) {
  const [tab, setTab] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);

  // ── bookings ───────────────────────────────────────────────────────────────
  const [adminBookings, setAdminBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [detailBooking, setDetailBooking] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  // ── celebrities ────────────────────────────────────────────────────────────
  const [celebs, setCelebs] = useState([]);
  const [showAddCeleb, setShowAddCeleb] = useState(false);
  const [celebForm, setCelebForm] = useState({ name: "", category: "actors", price: "", photo: "", bio: "", country: "", flag: "", vipPrice: "", platinumPrice: "" });
  const [celebError, setCelebError] = useState("");
  const photoInputRef = useRef(null);
  const [editCeleb, setEditCeleb] = useState(null);
  const [editCelebForm, setEditCelebForm] = useState({});
  const editPhotoInputRef = useRef(null);

  // ── users ──────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [userError, setUserError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPlanFilter, setUserPlanFilter] = useState("all");
  const [viewUser, setViewUser] = useState(null);
  const [viewUserLoading, setViewUserLoading] = useState(false);
  const [upgradingMembership, setUpgradingMembership] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ name: "", email: "", role: "user" });
  const [savingUser, setSavingUser] = useState(false);

  // ── blogs ──────────────────────────────────────────────────────────────────
  const [blogs, setBlogs] = useState([]);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const emptyBlogForm = { title: "", category: "Insights", author: "Admin", authorRole: "", readTime: "5 min read", feat: false, img: "", excerpt: "", body: "" };
  const [blogForm, setBlogForm] = useState(emptyBlogForm);
  const [blogError, setBlogError] = useState("");
  const [blogImgUploading, setBlogImgUploading] = useState(false);
  const blogImgInputRef = useRef(null);

  // ── transactions ───────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [txnSearch, setTxnSearch] = useState("");
  const [txnPaymentFilter, setTxnPaymentFilter] = useState("all");

  // ── plans ──────────────────────────────────────────────────────────────────
  const [plans, setPlans] = useState([]);
  const [savingPlan, setSavingPlan] = useState(null);

  // ── misc ───────────────────────────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState(null);

  // ── global notification WebSocket ──────────────────────────────────────────
  const [globalUnread, setGlobalUnread] = useState(0);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifWs = useRef(null);
  const tabRef = useRef(tab);
  tabRef.current = tab;

  function playAdminNotif(isPremium, type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = isPremium ? [1046, 1318, 1568]
        : type === "new_booking" ? [523, 659, 784]
        : type === "waitlist_new" ? [440, 554]
        : [880, 1108];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t); osc.stop(t + 0.35);
      });
    } catch {}
  }

  function pushNotif(n) {
    setRecentNotifs(prev => [{ ...n, id: Date.now() + Math.random(), ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...prev].slice(0, 20));
    setGlobalUnread(c => c + 1);
  }

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer = null;

    function connect() {
      if (cancelled) return;
      const socket = new WebSocket(WS_URL);
      notifWs.current = socket;

      socket.onopen = () => {
        if (cancelled) { socket.close(); return; }
        const token = (() => { try { return JSON.parse(localStorage.getItem("sb_user") || "{}").token || ""; } catch { return ""; } })();
        socket.send(JSON.stringify({ type: "agent_join", token }));
      };

      socket.onmessage = (evt) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === "new_session") {
            playAdminNotif(msg.isPremium, "new_session");
            const label = msg.isPremium ? `💎 Premium support — ${msg.customerName}` : `💬 New support chat — ${msg.customerName}`;
            pushNotif({ label, icon: "💬", tab: "inbox", isPremium: msg.isPremium });
            if (tabRef.current !== "inbox") setInboxUnread(n => n + 1);
          }
          if (msg.type === "message" && tabRef.current !== "inbox") {
            setInboxUnread(n => n + 1);
          }
          if (msg.type === "new_booking") {
            playAdminNotif(false, "new_booking");
            const typeLabel = msg.bookingType === "fan_card" ? "👑 VIP Fan Card"
              : msg.bookingType === "fan_card_platinum" ? "💎 Platinum Card"
              : msg.bookingType === "donate" ? "❤️ Donation"
              : "📅 Booking";
            pushNotif({ label: `${typeLabel} — ${msg.celebName} · $${(msg.amount || 0).toLocaleString()}`, icon: msg.isFanCard ? "🃏" : "📅", tab: "bookings", sub: msg.customerName });
          }
          if (msg.type === "waitlist_new") {
            playAdminNotif(false, "waitlist_new");
            pushNotif({ label: `⏳ Waitlist — ${msg.entry?.name || "New entry"}`, icon: "⏳", tab: "bookings", sub: msg.entry?.eventType || "" });
          }
          if (msg.type === "premium_login") {
            const isPlat = msg.plan === "platinum";
            playAdminNotif(true, "premium_login");
            pushNotif({ label: `${isPlat ? "💎 Platinum" : "👑 VIP"} member online — ${msg.userName}`, icon: isPlat ? "💎" : "👑", tab: "users", sub: msg.email, isPremium: true });
          }
        } catch {}
      };

      socket.onclose = () => {
        if (!cancelled) reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();
    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      if (notifWs.current) { notifWs.current.onclose = null; notifWs.current.close(); }
    };
  }, []);

  // Clear inbox badge when admin opens inbox tab
  useEffect(() => {
    if (tab === "inbox") setInboxUnread(0);
  }, [tab]);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!showNotifDropdown) return;
    const handler = (e) => {
      if (!e.target.closest("[data-notif-dropdown]")) setShowNotifDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifDropdown]);

  // Close mobile nav on outside click
  useEffect(() => {
    if (!mobileNav) return;
    const handler = (e) => {
      if (!e.target.closest("[data-mobile-nav]")) setMobileNav(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileNav]);

  // ── photo helpers ──────────────────────────────────────────────────────────
  function resizePhoto(file, maxPx, cb) {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        cb(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
  function handlePhotoFile(e) {
    const f = e.target.files?.[0];
    if (f) resizePhoto(f, 480, b64 => setCelebForm(p => ({ ...p, photo: b64 })));
  }
  function handleEditPhotoFile(e) {
    const f = e.target.files?.[0];
    if (f) resizePhoto(f, 480, b64 => setEditCelebForm(p => ({ ...p, photo: b64 })));
  }
  async function handleBlogImgFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBlogImgUploading(true);
    setBlogError("");
    resizePhoto(file, 1200, async b64 => {
      try {
        const { url } = await api.uploadPhoto(b64);
        setBlogForm(f => ({ ...f, img: url }));
      } catch {
        setBlogForm(f => ({ ...f, img: b64 }));
      } finally {
        setBlogImgUploading(false);
      }
    });
  }

  // ── data loading ───────────────────────────────────────────────────────────
  useEffect(() => {
    api.getAdminBookings()
      .then(data => { setAdminBookings(data); setLoadingBookings(false); })
      .catch(() => setLoadingBookings(false));
    api.getCelebrities().then(setCelebs).catch(() => {});
    api.getPlans().then(setPlans).catch(() => {});
  }, []);

  useEffect(() => {
    if ((tab === "users" || tab === "overview") && users.length === 0) api.getAdminUsers().then(setUsers).catch(() => {});
    if (tab === "blogs"        && blogs.length === 0)        api.getBlogs().then(setBlogs).catch(() => {});
    if (tab === "transactions" && transactions.length === 0) {
      setLoadingTxns(true);
      api.getAdminTransactions()
        .then(data => { setTransactions(data); setLoadingTxns(false); })
        .catch(() => setLoadingTxns(false));
    }
    if (tab === "plans" && plans.length === 0) {
      api.getPlans().then(setPlans).catch(() => {});
    }
  }, [tab]);

  // ── booking actions ────────────────────────────────────────────────────────
  async function updateStatus(id, status) {
    try {
      await api.updateBookingStatus(id, status);
      setAdminBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      if (status === "approved") { setTransactions([]); setLoadingTxns(false); }
    } catch {}
  }

  // ── celebrity actions ──────────────────────────────────────────────────────
  async function toggleAvail(celeb) {
    const n = !celeb.avail;
    setCelebs(prev => prev.map(c => c.id === celeb.id ? { ...c, avail: n } : c));
    try { await api.updateCelebAvailability(celeb.id, n); }
    catch { setCelebs(prev => prev.map(c => c.id === celeb.id ? { ...c, avail: celeb.avail } : c)); }
  }
  function deleteCeleb(id) {
    setConfirmModal({
      title: "Delete Celebrity",
      message: "Remove this celebrity from the roster?",
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
      setCelebForm({ name: "", category: "actors", price: "", photo: "", bio: "", country: "", flag: "", vipPrice: "", platinumPrice: "" });
      setShowAddCeleb(false);
    } catch (e) { setCelebError(e.message); }
  }
  function startEditCeleb(c) {
    setEditCeleb(c.id);
    setEditCelebForm({ name: c.name, category: c.cat, price: String(c.price), photo: c.img || "", bio: c.bio || "", country: c.country || "", flag: c.flag || "", vipPrice: String(c.vipPrice || 299), platinumPrice: String(c.platinumPrice || 999) });
  }
  async function saveEditCeleb(id) {
    try {
      await api.updateCelebrity(id, editCelebForm);
      setCelebs(prev => prev.map(c => c.id === id ? { ...c, name: editCelebForm.name, cat: editCelebForm.category, price: parseFloat(editCelebForm.price), img: editCelebForm.photo || c.img, bio: editCelebForm.bio, country: editCelebForm.country, flag: editCelebForm.flag, vipPrice: parseFloat(editCelebForm.vipPrice) || 299, platinumPrice: parseFloat(editCelebForm.platinumPrice) || 999 } : c));
      setEditCeleb(null);
    } catch (e) { alert(e.message); }
  }

  // ── user actions ───────────────────────────────────────────────────────────
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
      message: `Delete "${u.name}"? All their bookings will also be removed.`,
      onConfirm: async () => {
        setConfirmModal(null);
        setDeletingUserId(u.id);
        try { await api.deleteUser(u.id); setUsers(prev => prev.filter(x => x.id !== u.id)); }
        catch (e) { setConfirmModal({ title: "Error", message: e.message || "Failed.", confirmLabel: "OK", variant: "ghost", onConfirm: () => setConfirmModal(null) }); }
        finally { setDeletingUserId(null); }
      },
    });
  }

  async function openUserDetail(u) {
    setViewUser({ ...u, bookings: [], memberships: [] });
    setEditingUser(false);
    setViewUserLoading(true);
    try {
      const detail = await api.getAdminUserDetail(u.id);
      setViewUser(detail);
      setEditUserForm({ name: detail.name, email: detail.email, role: detail.role });
    } catch {}
    finally { setViewUserLoading(false); }
  }

  async function saveUserEdits() {
    setSavingUser(true);
    try {
      const updated = await api.updateAdminUser(viewUser.id, editUserForm);
      setViewUser(prev => ({ ...prev, ...updated }));
      setUsers(prev => prev.map(u => u.id === viewUser.id ? { ...u, ...updated } : u));
      setEditingUser(false);
    } catch (e) { alert(e.message); }
    finally { setSavingUser(false); }
  }

  async function handleUpgradeMembership(userId, tier, celeb) {
    setUpgradingMembership(true);
    try {
      await api.upgradeUserMembership(userId, { tier, celebId: celeb?.id, celebName: celeb?.name, celebImg: celeb?.img });
      const detail = await api.getAdminUserDetail(userId);
      setViewUser(detail);
    } catch (e) { alert(e.message); }
    finally { setUpgradingMembership(false); }
  }

  // ── plan actions ───────────────────────────────────────────────────────────
  async function savePlan(tier, price, billingCycle, features) {
    setSavingPlan(tier);
    try {
      await api.updatePlan(tier, { price, billingCycle, features });
      setPlans(prev => prev.map(p => p.tier === tier ? { ...p, price, billingCycle } : p));
    } catch (e) { alert(e.message); }
    finally { setSavingPlan(null); }
  }

  // ── blog actions ───────────────────────────────────────────────────────────
  async function submitBlog() {
    setBlogError("");
    if (!blogForm.title) { setBlogError("Title is required."); return; }
    const payload = { ...blogForm, content: bodyToContent(blogForm.body) };
    try {
      if (editBlog) {
        await api.updateBlog(editBlog.id, payload);
        setBlogs(prev => prev.map(b => b.id === editBlog.id ? { ...b, ...payload } : b));
        setEditBlog(null);
      } else {
        const res = await api.addBlog(payload);
        setBlogs(prev => [res, ...prev]);
        setShowAddBlog(false);
      }
      setBlogForm(emptyBlogForm);
    } catch (e) { setBlogError(e.message); }
  }
  function startEditBlog(b) {
    setEditBlog(b);
    setBlogForm({ title: b.title, category: b.category, author: b.author, authorRole: b.authorRole || "", readTime: b.readTime || "5 min read", feat: !!b.feat, img: b.img || "", excerpt: b.excerpt || "", body: contentToBody(b.content) });
    setShowAddBlog(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function deleteBlog(id) {
    setConfirmModal({
      title: "Delete Blog Post",
      message: "Delete this post? This cannot be undone.",
      onConfirm: async () => {
        setConfirmModal(null);
        setBlogs(prev => prev.filter(b => b.id !== id));
        try { await api.deleteBlog(id); } catch {}
      },
    });
  }
  function sendBlogAsEmail(blog) {
    setConfirmModal({
      title: "Send Blog as Email",
      message: `Send "${blog.title}" to all registered users? This will email every non-admin account.`,
      confirmLabel: "Send to All",
      variant: "default",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const { sent } = await api.sendBlogEmail(blog.id);
          alert(`Sent to ${sent} user${sent !== 1 ? "s" : ""}.`);
        } catch (e) {
          alert("Failed to send: " + (e.message || "Unknown error"));
        }
      },
    });
  }

  // ── filtered data ──────────────────────────────────────────────────────────
  const filteredBookings = adminBookings
    .filter(b => bookingStatusFilter === "all" || b.status === bookingStatusFilter)
    .filter(b => {
      if (!bookingSearch) return true;
      const q = bookingSearch.toLowerCase();
      const form = b.form || {};
      return (b.celeb?.name || "").toLowerCase().includes(q)
        || (form.name || b.userName || "").toLowerCase().includes(q)
        || (form.email || "").toLowerCase().includes(q);
    });

  const filteredTxns = transactions
    .filter(t => txnPaymentFilter === "all" || t.payment === txnPaymentFilter)
    .filter(t => {
      if (!txnSearch) return true;
      const q = txnSearch.toLowerCase();
      const form = t.form || {};
      return (t.celeb?.name || "").toLowerCase().includes(q)
        || (form.name || t.userName || "").toLowerCase().includes(q)
        || (t.invoiceId || "").toLowerCase().includes(q);
    });

  const filteredUsers = users
    .filter(u => userRoleFilter === "all" || u.role === userRoleFilter)
    .filter(u => userPlanFilter === "all" || (u.plan || "free") === userPlanFilter)
    .filter(u => {
      if (!userSearch) return true;
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

  // ── stats ──────────────────────────────────────────────────────────────────
  const stats = {
    bookings: adminBookings.length,
    revenue: adminBookings.filter(b => b.status === "approved").reduce((s, b) => s + (b.amount || 0), 0),
    pending: adminBookings.filter(b => b.status === "pending").length,
    celebs: celebs.length,
    available: celebs.filter(c => c.avail).length,
    users: users.length,
  };

  const statCards = [
    { label: "Total Users",    value: stats.users,                          Icon: Users,         colorClass: "text-[#b8d4f0]" },
    { label: "Total Bookings", value: stats.bookings,                       Icon: CalendarBlank, colorClass: "text-primary" },
    { label: "Revenue",        value: `$${stats.revenue.toLocaleString()}`, Icon: ChartBar,      colorClass: "text-[#6DBF7B]" },
    { label: "Pending",        value: stats.pending,                        Icon: Receipt,       colorClass: "text-[#D4A84B]" },
    { label: "Total Celebs",   value: stats.celebs,                         Icon: Star,          colorClass: "text-primary" },
    { label: "Available",      value: stats.available,                      Icon: Check,         colorClass: "text-[#6DBF7B]" },
  ];

  // ── chart data ─────────────────────────────────────────────────────────────
  const bookingsByMonth  = groupByMonth(adminBookings, "date");
  const revenueByMonth   = groupByMonth(adminBookings.filter(b => b.status === "approved"), "date", "amount");
  const signupsByMonth   = groupByMonth(users, "joined");
  const planDistribution = [
    { name: "Free",     value: users.filter(u => (u.plan || "free") === "free").length     },
    { name: "Premium",  value: users.filter(u => u.plan === "premium").length  },
    { name: "Platinum", value: users.filter(u => u.plan === "platinum").length },
  ].filter(p => p.value > 0);
  const PLAN_COLORS = { Free: "#6DBF7B", Premium: "#D4A84B", Platinum: "#60a5fa" };

  // ── nav helper ─────────────────────────────────────────────────────────────
  function handleNavClick(id) {
    setTab(id);
    setMobileNav(false);
  }

  // ── sidebar nav items ──────────────────────────────────────────────────────
  const NavItems = () => (
    <>
      {NAV.map(item => (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border-none text-left font-sans
            ${tab === item.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground bg-transparent"
            }`}
        >
          <item.icon size={18} weight={tab === item.id ? "fill" : "regular"} />
          {item.label}
          {item.id === "inbox" && inboxUnread > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
              {inboxUnread > 99 ? "99+" : inboxUnread}
            </span>
          )}
        </button>
      ))}
    </>
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ paddingTop: "64px" }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="w-60 shrink-0 bg-card border-r border-border flex-col hidden lg:flex">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-[10px] px-2 py-0.5">ADMIN</Badge>
            <span className="text-foreground font-semibold text-sm font-sans">Control Panel</span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <NavItems />
        </nav>
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <UserCircle size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-foreground text-xs font-semibold truncate">{user?.name || "Admin"}</div>
              <div className="text-muted-foreground text-[10px] truncate">{user?.email || ""}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Nav Overlay ── */}
      {mobileNav && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNav(false)} />
          <aside data-mobile-nav className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col pt-16">
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-[10px] px-2 py-0.5">ADMIN</Badge>
                <span className="text-foreground font-semibold text-sm font-sans">Control Panel</span>
              </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
              <NavItems />
            </nav>
            <div className="px-4 py-4 border-t border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <UserCircle size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-foreground text-xs font-semibold truncate">{user?.name || "Admin"}</div>
                  <div className="text-muted-foreground text-[10px] truncate">{user?.email || ""}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Header ── */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden bg-transparent border border-border rounded-lg p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            onClick={() => setMobileNav(p => !p)}
          >
            <List size={18} />
          </button>

          {/* Page title */}
          <h2 className="text-foreground font-semibold text-base font-sans hidden lg:block">
            {NAV.find(n => n.id === tab)?.label}
          </h2>
          <h2 className="text-foreground font-semibold text-sm font-sans lg:hidden ml-3">
            {NAV.find(n => n.id === tab)?.label}
          </h2>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <div className="relative" data-notif-dropdown>
              <button
                onClick={() => { setShowNotifDropdown(p => !p); setGlobalUnread(0); }}
                className="relative bg-transparent border border-border rounded-xl p-2 cursor-pointer flex items-center justify-center hover:border-primary/40 transition-colors"
              >
                <Bell size={18} className="text-muted-foreground" />
                {globalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none animate-pulse">
                    {globalUnread > 99 ? "99+" : globalUnread}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm font-semibold text-foreground font-sans">Recent Activity</span>
                    <button onClick={() => setShowNotifDropdown(false)} className="text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none font-sans">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {recentNotifs.length === 0 ? (
                      <div className="px-4 py-6 text-center text-muted-foreground text-xs font-sans">No recent activity</div>
                    ) : recentNotifs.map(n => (
                      <button
                        key={n.id}
                        onClick={() => { setTab(n.tab); setShowNotifDropdown(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 cursor-pointer border-none bg-transparent border-b border-border/50 last:border-none transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-base mt-0.5 shrink-0">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold truncate font-sans ${n.isPremium ? "text-amber-400" : "text-foreground"}`}>{n.label}</div>
                            {n.sub && <div className="text-[10px] text-muted-foreground truncate">{n.sub}</div>}
                          </div>
                          <span className="text-[9px] text-muted-foreground shrink-0 mt-0.5">{n.ts}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {recentNotifs.length > 0 && (
                    <button
                      onClick={() => { setRecentNotifs([]); setShowNotifDropdown(false); }}
                      className="w-full text-center text-[10px] text-muted-foreground py-2.5 border-t border-border hover:text-foreground cursor-pointer bg-transparent border-none font-sans"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Admin name (desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <UserCircle size={16} className="text-primary" />
              </div>
              <span className="text-foreground text-xs font-semibold font-sans">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* ── Overview ── */}
          {tab === "overview" && (
            <div>
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-7">
                {statCards.map(({ label, value, Icon, colorClass }) => (
                  <div key={label} className="rounded-2xl border border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-5">
                    <Icon size={20} className={`mb-1.5 ${colorClass}`} />
                    <div className={`text-[clamp(18px,2vw,24px)] font-bold font-serif ${colorClass}`}>{value}</div>
                    <div className="text-muted-foreground/60 text-[10px] mt-0.5 uppercase tracking-[0.8px]">{label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
                  <h3 className="text-foreground mb-4 font-serif text-xl m-0 flex items-center gap-2">
                    <ChartBar size={20} className="text-primary" /> Platform Summary
                  </h3>
                  <p className="text-muted-foreground leading-[1.8] text-sm">You have <strong className="text-primary">{stats.celebs}</strong> celebrities listed — <strong className="text-[#6DBF7B]">{stats.available}</strong> currently available.</p>
                  <p className="text-muted-foreground leading-[1.8] text-sm">Total bookings: <strong className="text-primary">{stats.bookings}</strong>. Confirmed revenue: <strong className="text-[#6DBF7B]">${stats.revenue.toLocaleString()}</strong>.</p>
                  <p className="text-muted-foreground leading-[1.8] text-sm"><strong className="text-[#D4A84B]">{stats.pending}</strong> bookings pending your review.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-6">
                  <h3 className="text-foreground mb-4 font-serif text-xl m-0 flex items-center gap-2">
                    <ArrowRight size={20} className="text-primary" /> Quick Actions
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <Button onClick={() => setTab("celebrities")}  variant="ghost" className="justify-start gap-2"><Star size={15} /> Manage Celebrity Listings</Button>
                    <Button onClick={() => setTab("bookings")}     variant="ghost" className="justify-start gap-2"><CalendarBlank size={15} /> Review Pending Bookings</Button>
                    <Button onClick={() => setTab("transactions")} variant="ghost" className="justify-start gap-2"><Receipt size={15} /> View Transactions</Button>
                    <Button onClick={() => setTab("blogs")}        variant="ghost" className="justify-start gap-2"><Newspaper size={15} /> Manage Blog Posts</Button>
                    <Button onClick={() => setTab("users")}        variant="ghost" className="justify-start gap-2"><Users size={15} /> Manage Users</Button>
                    <Button onClick={() => setTab("inbox")}        variant="ghost" className="justify-start gap-2"><ChatCircle size={15} /> Open Support Inbox</Button>
                  </div>
                </div>
              </div>

              {/* ── Charts ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                <ChartCard title="Bookings Over Time" icon={CalendarBlank}>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={bookingsByMonth}>
                      <defs>
                        <linearGradient id="cgBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f0bf5a" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f0bf5a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                      <Area type="monotone" dataKey="value" name="Bookings" stroke="#f0bf5a" fill="url(#cgBookings)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Revenue by Month" icon={ChartBar}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} width={44} tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                      <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, "Revenue"]} contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="value" name="Revenue" fill="#6DBF7B" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="User Signups by Month" icon={Users}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={signupsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="value" name="Signups" fill="#D4A84B" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Plan Distribution" icon={Crown}>
                  {planDistribution.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No user data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={38} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {planDistribution.map(entry => (
                            <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || "#888"} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: "#888" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

              </div>
            </div>
          )}

          {/* ── Celebrities ── */}
          {tab === "celebrities" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-foreground font-serif text-xl m-0">Celebrity Roster</h3>
                <Button onClick={() => { setShowAddCeleb(v => !v); setEditCeleb(null); }} className="px-5 py-2 text-xs gap-1.5">
                  {showAddCeleb ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Celebrity</>}
                </Button>
              </div>

              {showAddCeleb && (
                <div className="bg-card border border-primary/20 rounded-xl p-6 mb-5">
                  <h4 className="text-primary mb-4 font-serif text-base m-0">New Celebrity</h4>
                  {celebError && <div className="bg-destructive/10 text-destructive rounded-lg px-3.5 py-2 text-xs mb-3">{celebError}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <Input label="Name *" value={celebForm.name} onChange={e => setCelebForm(f => ({ ...f, name: e.target.value }))} placeholder="Celebrity name" />
                    <div>
                      <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Category *</label>
                      <select value={celebForm.category} onChange={e => setCelebForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-full border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans">
                        {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <Input label="Session / Booking Price ($) *" value={celebForm.price} onChange={e => setCelebForm(f => ({ ...f, price: e.target.value }))} placeholder="5000" type="number" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Photo</label>
                      <div className="flex gap-2 items-center">
                        {celebForm.photo
                          ? <img src={celebForm.photo} alt="preview" className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0" />
                          : <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0"><UserCircle size={20} className="text-muted-foreground" /></div>
                        }
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <button type="button" onClick={() => photoInputRef.current?.click()} className="w-full rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold py-1.5 cursor-pointer hover:bg-primary/10 transition-colors font-sans">Upload Photo</button>
                          <input type="text" value={celebForm.photo.startsWith("data:") ? "" : celebForm.photo} onChange={e => setCelebForm(f => ({ ...f, photo: e.target.value }))} placeholder="or paste URL" className="w-full rounded-full border border-border bg-input px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary/60 font-sans" />
                        </div>
                      </div>
                      <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
                    </div>
                    <Input label="Country" value={celebForm.country} onChange={e => setCelebForm(f => ({ ...f, country: e.target.value }))} placeholder="USA" />
                    <Input label="Flag Emoji" value={celebForm.flag} onChange={e => setCelebForm(f => ({ ...f, flag: e.target.value }))} placeholder="🇺🇸" />
                  </div>
                  <Input label="Bio" value={celebForm.bio} onChange={e => setCelebForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio..." rows={2} />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Input label="VIP Gold Card Price ($/mo)" value={celebForm.vipPrice} onChange={e => setCelebForm(f => ({ ...f, vipPrice: e.target.value }))} type="number" placeholder="299 (default)" />
                    <Input label="Platinum Card Price ($/mo)" value={celebForm.platinumPrice} onChange={e => setCelebForm(f => ({ ...f, platinumPrice: e.target.value }))} type="number" placeholder="999 (default)" />
                  </div>
                  <Button onClick={addCeleb} className="mt-3 px-6 py-2 text-xs gap-1.5"><Plus size={13} /> Add Celebrity</Button>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {celebs.map(c => (
                  <div key={c.id}>
                    <div className="rounded-xl border border-border bg-card p-4 flex justify-between items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <img src={c.img || celebPlaceholder(c.name)} alt={c.name} className="w-[42px] h-[42px] rounded-full object-cover border-2 border-primary/10" onError={e => e.target.src = celebPlaceholder(c.name)} />
                        <div>
                          <div className="text-foreground font-semibold text-sm">{c.name}</div>
                          <div className="text-muted-foreground text-xs">{c.flag} {c.country} • {c.cat} • ${(c.price || 0).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Stars r={c.rating} size={12} />
                        <Button onClick={() => toggleAvail(c)} variant={c.avail ? "success" : "danger"} className="px-3.5 py-1.5 text-xs gap-1">
                          {c.avail ? <><Check size={12} /> Available</> : <><X size={12} /> Unavailable</>}
                        </Button>
                        <button
                          onClick={() => editCeleb === c.id ? setEditCeleb(null) : startEditCeleb(c)}
                          className="bg-transparent border border-primary/40 rounded-lg text-primary cursor-pointer p-1.5 font-sans hover:bg-primary/10 transition-colors flex items-center justify-center"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={() => deleteCeleb(c.id)}
                          className="bg-transparent border border-destructive/40 rounded-lg text-destructive cursor-pointer p-1.5 font-sans hover:bg-destructive/10 transition-colors flex items-center justify-center"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>

                    {editCeleb === c.id && (
                      <div className="bg-card border border-primary/20 rounded-xl p-5 mt-1 ml-2">
                        <h4 className="text-primary mb-3 font-serif text-sm m-0">Edit — {c.name}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                          <Input label="Name" value={editCelebForm.name} onChange={e => setEditCelebForm(f => ({ ...f, name: e.target.value }))} />
                          <div>
                            <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Category</label>
                            <select value={editCelebForm.category} onChange={e => setEditCelebForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-full border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans">
                              {CATS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                          <Input label="Session / Booking Price ($)" value={editCelebForm.price} onChange={e => setEditCelebForm(f => ({ ...f, price: e.target.value }))} type="number" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Photo</label>
                            <div className="flex gap-2 items-center">
                              {editCelebForm.photo
                                ? <img src={editCelebForm.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0" />
                                : <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0"><UserCircle size={20} className="text-muted-foreground" /></div>
                              }
                              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                <button type="button" onClick={() => editPhotoInputRef.current?.click()} className="w-full rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold py-1.5 cursor-pointer hover:bg-primary/10 transition-colors font-sans">Upload Photo</button>
                                <input type="text" value={editCelebForm.photo?.startsWith("data:") ? "" : editCelebForm.photo} onChange={e => setEditCelebForm(f => ({ ...f, photo: e.target.value }))} placeholder="or paste URL" className="w-full rounded-full border border-border bg-input px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary/60 font-sans" />
                              </div>
                            </div>
                            <input ref={editPhotoInputRef} type="file" accept="image/*" onChange={handleEditPhotoFile} className="hidden" />
                          </div>
                          <Input label="Country" value={editCelebForm.country} onChange={e => setEditCelebForm(f => ({ ...f, country: e.target.value }))} />
                          <Input label="Flag Emoji" value={editCelebForm.flag} onChange={e => setEditCelebForm(f => ({ ...f, flag: e.target.value }))} />
                        </div>
                        <Input label="Bio" value={editCelebForm.bio} onChange={e => setEditCelebForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio..." rows={2} />
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <Input label="VIP Gold Card Price ($/mo)" value={editCelebForm.vipPrice} onChange={e => setEditCelebForm(f => ({ ...f, vipPrice: e.target.value }))} type="number" placeholder="299" />
                          <Input label="Platinum Card Price ($/mo)" value={editCelebForm.platinumPrice} onChange={e => setEditCelebForm(f => ({ ...f, platinumPrice: e.target.value }))} type="number" placeholder="999" />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button onClick={() => saveEditCeleb(c.id)} className="px-5 py-2 text-xs gap-1"><Check size={13} /> Save Changes</Button>
                          <Button onClick={() => setEditCeleb(null)} variant="ghost" className="px-5 py-2 text-xs gap-1"><X size={13} /> Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Bookings ── */}
          {tab === "bookings" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <SearchBar value={bookingSearch} onChange={setBookingSearch} placeholder="Search by celebrity, client or email..." />
                </div>
                <FilterPills
                  value={bookingStatusFilter}
                  onChange={setBookingStatusFilter}
                  options={[["all","All"], ["pending","Pending"], ["approved","Approved"], ["declined","Declined"]]}
                />
              </div>
              {loadingBookings ? (
                <div className="text-center py-16 text-muted-foreground">Loading bookings...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CalendarBlank size={48} className="mx-auto mb-3.5 opacity-30" />
                  <div>{adminBookings.length === 0 ? "No bookings yet" : "No results"}</div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filteredBookings.map(b => {
                    const form = b.form || {};
                    return (
                      <div key={b.id} onClick={() => setDetailBooking(b)} className="bg-card rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer px-4 sm:px-5 py-4 flex justify-between items-start sm:items-center flex-wrap gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-foreground font-semibold text-sm">{b.celeb?.name}</div>
                          <div className="text-muted-foreground text-xs mt-0.5 truncate">{form.name || b.userName} • {form.email}</div>
                          <div className="text-muted-foreground/60 text-[11px] mt-px">{b.type} • {new Date(b.date).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <span className="text-primary font-bold text-[14px]">${(b.amount || b.celeb?.price || 0).toLocaleString()}</span>
                          <Badge variant={statusVariant[b.status] || "warning"}>{(b.status || "pending").toUpperCase()}</Badge>
                          <ArrowRight size={14} className="text-muted-foreground/60" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Transactions ── */}
          {tab === "transactions" && (
            <div>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="text-foreground font-serif text-xl m-0">Transaction Ledger</h3>
                <div className="text-muted-foreground text-xs">{filteredTxns.length} of {transactions.length} records</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <SearchBar value={txnSearch} onChange={setTxnSearch} placeholder="Search by invoice ID, celebrity or client..." />
                </div>
                <FilterPills
                  value={txnPaymentFilter}
                  onChange={setTxnPaymentFilter}
                  options={[["all","All"], ["crypto","Crypto"], ["giftcard","Gift Card"], ["other","Other"]]}
                />
              </div>

              {loadingTxns ? (
                <div className="text-center py-16 text-muted-foreground">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Receipt size={48} className="mx-auto mb-3.5 opacity-30" />
                  <div>No approved transactions yet</div>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card p-4 mb-4 flex gap-6 flex-wrap">
                    <div><div className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Total Revenue</div><div className="text-[#6DBF7B] font-bold text-xl font-serif">${filteredTxns.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString()}</div></div>
                    <div><div className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Transactions</div><div className="text-primary font-bold text-xl font-serif">{filteredTxns.length}</div></div>
                    <div><div className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Avg. Value</div><div className="text-foreground font-bold text-xl font-serif">${filteredTxns.length ? Math.round(filteredTxns.reduce((s, t) => s + (t.amount || 0), 0) / filteredTxns.length).toLocaleString() : 0}</div></div>
                  </div>

                  {filteredTxns.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">No results matching your search</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredTxns.map(t => {
                        const form = t.form || {};
                        return (
                          <div key={t.id} className="rounded-xl border border-border bg-card px-4 py-3.5 flex justify-between items-start sm:items-center gap-3 flex-wrap">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-foreground font-semibold text-sm">{t.celeb?.name}</span>
                                <Badge variant="secondary" className="text-[9px] px-2 py-0.5">{t.type}</Badge>
                              </div>
                              <div className="text-muted-foreground text-xs truncate">{form.name || t.userName} • {form.email || t.userEmail}</div>
                              <div className="text-muted-foreground/60 text-[11px] mt-0.5">{new Date(t.date).toLocaleString()}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[#6DBF7B] font-bold text-base">${(t.amount || 0).toLocaleString()}</span>
                              <span className="text-muted-foreground/60 text-[10px] capitalize">{t.payment}</span>
                              {t.invoiceId && <span className="text-primary font-mono text-[10px] bg-primary/5 border border-primary/20 rounded px-1.5 py-0.5">{t.invoiceId}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Plans ── */}
          {tab === "plans" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-foreground font-serif text-xl m-0">Subscription Plans</h3>
                  <p className="text-muted-foreground text-sm mt-1">Set pricing and features for each plan tier.</p>
                </div>
              </div>
              {plans.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Crown size={48} className="mx-auto mb-3.5 opacity-30" />
                  <div>No plans configured yet</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {plans.map(plan => (
                    <PlanCard key={plan.tier} plan={plan} onSave={savePlan} saving={savingPlan === plan.tier} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Blogs ── */}
          {tab === "blogs" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-foreground font-serif text-xl m-0">Blog Posts</h3>
                <Button
                  onClick={() => { setShowAddBlog(v => !v); if (editBlog) { setEditBlog(null); setBlogForm(emptyBlogForm); } }}
                  className="px-5 py-2 text-xs gap-1.5"
                >
                  {showAddBlog ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Post</>}
                </Button>
              </div>

              {showAddBlog && (
                <div className="bg-card border border-primary/20 rounded-xl p-6 mb-5">
                  <h4 className="text-primary mb-4 font-serif text-base m-0">{editBlog ? "Edit Post" : "New Blog Post"}</h4>
                  {blogError && <div className="bg-destructive/10 text-destructive rounded-lg px-3.5 py-2 text-xs mb-3">{blogError}</div>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Input label="Title *" value={blogForm.title} onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title" />
                    <div>
                      <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Category</label>
                      <select value={blogForm.category} onChange={e => setBlogForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-full border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans">
                        {BLOG_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <Input label="Author" value={blogForm.author} onChange={e => setBlogForm(f => ({ ...f, author: e.target.value }))} placeholder="Author name" />
                    <Input label="Author Role" value={blogForm.authorRole} onChange={e => setBlogForm(f => ({ ...f, authorRole: e.target.value }))} placeholder="e.g. Senior Concierge" />
                    <Input label="Read Time" value={blogForm.readTime} onChange={e => setBlogForm(f => ({ ...f, readTime: e.target.value }))} placeholder="5 min read" />
                  </div>

                  <div className="mb-3">
                    <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Cover Image</label>
                    <div className="flex gap-2 items-start flex-wrap">
                      {blogForm.img ? (
                        <div className="relative shrink-0">
                          <img src={blogForm.img} alt="cover" className="w-24 h-16 rounded-lg object-cover border border-border" />
                          <button type="button" onClick={() => setBlogForm(f => ({ ...f, img: "" }))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center cursor-pointer border-none">
                            <X size={10} />
                          </button>
                        </div>
                      ) : null}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                        <button
                          type="button"
                          onClick={() => blogImgInputRef.current?.click()}
                          disabled={blogImgUploading}
                          className="rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold py-2 px-4 cursor-pointer hover:bg-primary/10 transition-colors font-sans disabled:opacity-50 disabled:cursor-default"
                        >
                          {blogImgUploading ? "Uploading..." : "Upload Image"}
                        </button>
                        <input type="text" value={blogForm.img?.startsWith("data:") ? "" : blogForm.img} onChange={e => setBlogForm(f => ({ ...f, img: e.target.value }))} placeholder="or paste image URL" className="w-full rounded-full border border-border bg-input px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary/60 font-sans" />
                      </div>
                      <input ref={blogImgInputRef} type="file" accept="image/*" onChange={handleBlogImgFile} className="hidden" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <Input label="Excerpt" value={blogForm.excerpt} onChange={e => setBlogForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary shown on blog listing..." />
                  </div>

                  <div className="mb-3">
                    <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Content</label>
                    <p className="text-muted-foreground/50 text-[10px] mb-2">Separate paragraphs with a blank line. Start a line with <code className="text-primary bg-primary/8 px-1 rounded">## </code> for headings.</p>
                    <textarea value={blogForm.body} onChange={e => setBlogForm(f => ({ ...f, body: e.target.value }))} placeholder={"First paragraph...\n\n## Section Heading\n\nAnother paragraph."} rows={10} className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60 font-sans resize-y leading-relaxed" />
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={blogForm.feat} onChange={e => setBlogForm(f => ({ ...f, feat: e.target.checked }))} className="w-4 h-4 accent-primary" />
                      <span className="text-sm text-foreground">Featured post</span>
                    </label>
                  </div>

                  <Button onClick={submitBlog} className="px-6 py-2 text-xs">{editBlog ? "Save Changes →" : "Publish Post →"}</Button>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {blogs.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Newspaper size={48} className="mx-auto mb-3.5 opacity-30" />
                    <div>No blog posts yet</div>
                  </div>
                ) : blogs.map(b => (
                  <div key={b.id} className="rounded-xl border border-border bg-card px-4 py-3.5 flex justify-between items-start sm:items-center gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {b.img && <img src={b.img} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0 border border-border" />}
                      <div className="min-w-0">
                        <div className="text-foreground font-semibold text-sm truncate">{b.title}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{b.category} • {b.author} • {b.date}</div>
                        {b.feat && <Badge variant="warning" className="text-[9px] mt-1">Featured</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => startEditBlog(b)} className="bg-transparent border border-primary/40 rounded-lg text-primary cursor-pointer px-2.5 py-1.5 text-xs font-sans hover:bg-primary/10 transition-colors flex items-center gap-1.5">
                        <PencilSimple size={13} /> Edit
                      </button>
                      <button onClick={() => sendBlogAsEmail(b)} title="Send as email to all users" className="bg-transparent border border-border rounded-lg text-muted-foreground cursor-pointer p-1.5 font-sans hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center">
                        <EnvelopeSimple size={14} />
                      </button>
                      <button onClick={() => deleteBlog(b.id)} className="bg-transparent border border-destructive/40 rounded-lg text-destructive cursor-pointer p-1.5 font-sans hover:bg-destructive/10 transition-colors flex items-center justify-center">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-foreground font-serif text-xl m-0">User Management</h3>
                <Button onClick={() => setShowAddUser(v => !v)} className="px-5 py-2 text-xs gap-1.5">
                  {showAddUser ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add User</>}
                </Button>
              </div>

              {showAddUser && (
                <div className="bg-card border border-primary/20 rounded-xl p-6 mb-5">
                  <h4 className="text-primary mb-4 font-serif text-base m-0">New User</h4>
                  {userError && <div className="bg-destructive/10 text-destructive rounded-lg px-3.5 py-2 text-xs mb-3">{userError}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Input label="Full Name *" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
                    <Input label="Email *" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="user@email.com" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Input label="Password *" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} type="password" placeholder="••••••••" />
                    <div>
                      <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Role</label>
                      <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} className="w-full rounded-full border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={addUser} className="mt-1 px-6 py-2 text-xs gap-1.5"><Plus size={13} /> Create User</Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1">
                  <SearchBar value={userSearch} onChange={setUserSearch} placeholder="Search by name or email..." />
                </div>
                <FilterPills
                  value={userRoleFilter}
                  onChange={setUserRoleFilter}
                  options={[["all","All Roles"], ["user","Users"], ["admin","Admins"]]}
                />
              </div>
              <div className="mb-4">
                <FilterPills
                  value={userPlanFilter}
                  onChange={setUserPlanFilter}
                  options={[["all","All Plans"], ["free","Free"], ["premium","Premium"], ["platinum","Platinum"]]}
                />
              </div>

              <div className="flex flex-col gap-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-3 opacity-30" />
                    <div>{users.length === 0 ? "No users found" : "No results"}</div>
                  </div>
                ) : filteredUsers.map(u => (
                  <div key={u.id} className="rounded-xl border border-border bg-card p-4 flex justify-between items-start sm:items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-[38px] h-[38px] rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center">
                        {u.role === "admin"
                          ? <Crown size={16} className="text-amber-400" />
                          : <UserCircle size={18} className="text-primary" />
                        }
                      </div>
                      <div>
                        <div className="text-foreground font-semibold text-sm">{u.name}</div>
                        <div className="text-muted-foreground text-xs">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge variant={u.role === "admin" ? "destructive" : "default"}>{u.role?.toUpperCase()}</Badge>
                      {/* Plan selector */}
                      <select
                        value={u.plan || "free"}
                        onChange={async e => {
                          const plan = e.target.value;
                          try {
                            const res = await api.setUserPlan(u.id, plan);
                            const planExpiresAt = res?.planExpiresAt || null;
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, plan, planExpiresAt } : x));
                          } catch {}
                        }}
                        className="text-xs rounded-lg border border-border bg-input px-2 py-1 text-foreground outline-none font-sans cursor-pointer"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="platinum">Platinum</option>
                      </select>
                      <span className="text-muted-foreground/60 text-[11px]">Joined {new Date(u.joined).toLocaleDateString()}</span>
                      <button
                        onClick={() => openUserDetail(u)}
                        className="bg-transparent border border-primary/40 rounded-lg text-primary cursor-pointer px-2.5 py-1 text-xs font-sans hover:bg-primary/10 transition-colors"
                      >
                        View
                      </button>
                      {u.id !== user.id && (
                        <button
                          onClick={() => deleteUser(u)}
                          disabled={deletingUserId === u.id}
                          className={["bg-transparent border border-destructive/40 rounded-lg px-2 py-1 font-sans transition-colors duration-200 flex items-center justify-center", deletingUserId === u.id ? "text-muted-foreground/60 cursor-default opacity-50" : "text-destructive cursor-pointer hover:bg-destructive/10"].join(" ")}
                        >
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: tab === "inbox" ? "contents" : "none" }}>
            <ConciergeInbox user={user} />
          </div>

        </main>
      </div>

      {/* ── User Detail Modal ── */}
      {viewUser && (
        <Dialog open={!!viewUser} onOpenChange={o => !o && setViewUser(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {viewUser.role === "admin"
                      ? <Crown size={22} className="text-amber-400" />
                      : <UserCircle size={24} className="text-primary" />
                    }
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-serif">{viewUser.name}</DialogTitle>
                    <p className="text-muted-foreground text-xs mt-0.5">{viewUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(e => !e)}
                  className="bg-transparent border border-primary/40 rounded-lg text-primary cursor-pointer px-3 py-1.5 text-xs font-sans hover:bg-primary/10 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <PencilSimple size={13} /> {editingUser ? "Cancel" : "Edit"}
                </button>
              </div>
            </DialogHeader>

            {/* Edit form */}
            {editingUser && !viewUserLoading && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 mb-2">
                <div className="text-primary text-[10px] uppercase tracking-widest font-bold">Edit User</div>
                <Input label="Name" value={editUserForm.name} onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))} />
                <Input label="Email" value={editUserForm.email} onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))} type="email" />
                <div>
                  <label className="text-muted-foreground text-[11px] tracking-[0.8px] block mb-1.5 uppercase font-semibold">Role</label>
                  <select value={editUserForm.role} onChange={e => setEditUserForm(f => ({ ...f, role: e.target.value }))} className="w-full rounded-full border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 font-sans">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button onClick={saveUserEdits} disabled={savingUser} className="w-full text-xs py-2">
                  {savingUser ? "Saving…" : "Save Changes →"}
                </Button>
              </div>
            )}

            {viewUserLoading ? (
              <div className="py-10 text-center text-muted-foreground text-sm">Loading details…</div>
            ) : (
              <div className="space-y-5 text-sm">

                {/* Basic info */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-2">Account Info</div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge variant={viewUser.role === "admin" ? "destructive" : "default"}>{viewUser.role?.toUpperCase()}</Badge></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <select
                      value={viewUser.plan || "free"}
                      onChange={async e => {
                        const plan = e.target.value;
                        try {
                          const res = await api.setUserPlan(viewUser.id, plan);
                          const planExpiresAt = res?.planExpiresAt || null;
                          setViewUser(prev => ({ ...prev, plan, planExpiresAt }));
                          setUsers(prev => prev.map(u => u.id === viewUser.id ? { ...u, plan, planExpiresAt } : u));
                        } catch {}
                      }}
                      className="text-xs rounded-lg border border-border bg-input px-2 py-1 text-foreground outline-none font-sans cursor-pointer"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span className="text-foreground">{new Date(viewUser.joined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Bookings</span><span className="text-foreground font-semibold">{viewUser.bookings?.length ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Spent</span><span className="text-primary font-bold">${(viewUser.bookings || []).filter(b => b.status === "approved").reduce((s, b) => s + (b.amount || 0), 0).toLocaleString()}</span></div>
                </div>

                {/* Memberships */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-3">Membership Status</div>
                  {(viewUser.memberships || []).length === 0 ? (
                    <p className="text-muted-foreground text-xs mb-3">No fan card memberships yet.</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {viewUser.memberships.map(m => (
                        <div key={m.bookingId} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                          <div>
                            <span className="text-foreground text-xs font-semibold">{m.celebName}</span>
                            <span className="ml-2 text-[10px] font-bold" style={{ color: m.tier === "platinum" ? "#b8cce8" : "#f0bf5a" }}>
                              {m.tier === "platinum" ? "💎 Platinum" : "👑 VIP"}
                            </span>
                          </div>
                          <Badge variant={m.status === "approved" ? "success" : "warning"} className="text-[9px]">
                            {m.status?.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upgrade controls */}
                  {(() => {
                    const approved = (viewUser.memberships || []).filter(m => m.status === "approved");
                    const highestTier = approved.some(m => m.tier === "platinum") ? "platinum"
                      : approved.some(m => m.tier === "vip") ? "vip" : null;
                    const firstMember = approved[0];
                    const pendingMember = (viewUser.memberships || []).find(m => m.status !== "approved");

                    return (
                      <div className="space-y-2">
                        {pendingMember && (
                          <Button
                            size="sm" className="w-full text-xs"
                            disabled={upgradingMembership}
                            onClick={() => handleUpgradeMembership(viewUser.id, pendingMember.tier, { id: pendingMember.celebId, name: pendingMember.celebName })}
                          >
                            {upgradingMembership ? "Activating…" : `Approve ${pendingMember.tier === "platinum" ? "Platinum" : "VIP"} — ${pendingMember.celebName}`}
                          </Button>
                        )}
                        {highestTier === "vip" && firstMember && (
                          <Button
                            size="sm" variant="outline" className="w-full text-xs"
                            disabled={upgradingMembership}
                            onClick={() => handleUpgradeMembership(viewUser.id, "platinum", { id: firstMember.celebId, name: firstMember.celebName, img: firstMember.celebImg })}
                          >
                            {upgradingMembership ? "Upgrading…" : `Upgrade to Platinum — ${firstMember.celebName}`}
                          </Button>
                        )}
                        {!highestTier && (
                          <p className="text-muted-foreground text-[11px] italic">Grant a membership by approving a pending fan card booking in the Bookings tab.</p>
                        )}
                        {highestTier === "platinum" && (
                          <p className="text-[11px] font-semibold" style={{ color: "#b8cce8" }}>💎 Already at highest tier (Platinum)</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Recent bookings */}
                {(viewUser.bookings || []).length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-3">Recent Bookings</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {viewUser.bookings.map(b => (
                        <div key={b.id} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                          <div>
                            <span className="text-foreground font-medium">{b.celebData?.name || "—"}</span>
                            <span className="text-muted-foreground ml-1.5 text-[10px]">{b.bookingType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-bold">${(b.amount || 0).toLocaleString()}</span>
                            <Badge variant={statusVariant[b.status] || "warning"} className="text-[9px]">{b.status?.toUpperCase()}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* ── Booking Detail Modal ── */}
      {detailBooking && (() => {
        const b = detailBooking;
        const form = b.form || {};
        const isPending = (b.status || "pending") === "pending";
        return (
          <Dialog open={!!detailBooking} onOpenChange={o => !o && setDetailBooking(null)}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <Badge variant={statusVariant[b.status] || "warning"}>{(b.status || "pending").toUpperCase()}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{b.type}</Badge>
                </div>
                <DialogTitle className="text-xl font-serif">{b.celeb?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                  <div className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-2">Client</div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground font-semibold">{form.name || b.userName || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground">{form.email || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span className="text-foreground">{new Date(b.date).toLocaleString()}</span></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                  <div className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-2">Booking Details</div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="text-primary font-bold">${(b.amount || b.celeb?.price || 0).toLocaleString()}</span></div>
                  {form.date    && <div className="flex justify-between"><span className="text-muted-foreground">Event Date</span><span className="text-foreground">{form.date}</span></div>}
                  {form.guests  && <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="text-foreground">{form.guests}</span></div>}
                  {form.message && <div><div className="text-muted-foreground mb-1">Additional Details</div><div className="text-foreground text-xs bg-background rounded-lg p-2.5 border border-border">{form.message}</div></div>}
                  {b.invoiceId  && <div className="flex justify-between"><span className="text-muted-foreground">Invoice ID</span><span className="text-primary font-mono text-xs">{b.invoiceId}</span></div>}
                </div>
                <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                  <div className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-2">Payment</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="text-foreground font-semibold">
                      {b.payment === "giftcard" ? "Gift Card"
                        : b.payment === "crypto" ? "Crypto"
                        : b.payment === "other" ? "Other"
                        : b.payment || "—"}
                    </span>
                  </div>
                  {form.giftCardType  && <div className="flex justify-between"><span className="text-muted-foreground">Card Type</span><span className="text-foreground">{form.giftCardType}</span></div>}
                  {form.giftCardCode  && <div className="flex justify-between"><span className="text-muted-foreground">Card Code</span><span className="text-foreground font-mono text-xs">{form.giftCardCode}</span></div>}
                  {form.giftCardPhoto && (
                    <div>
                      <div className="text-muted-foreground mb-1.5">Card Photo</div>
                      <img
                        src={form.giftCardPhoto}
                        alt="Gift card"
                        onClick={() => setPhotoPreview(form.giftCardPhoto)}
                        className="w-full max-h-48 object-contain rounded-lg border border-border cursor-zoom-in hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}
                </div>
                {isPending && (
                  <div className="flex gap-3 pt-1">
                    <Button onClick={async () => { await updateStatus(b.id, "approved"); setDetailBooking(null); }} className="flex-1 gap-1.5">
                      <Check size={14} /> Approve
                    </Button>
                    <Button variant="destructive" onClick={async () => { await updateStatus(b.id, "declined"); setDetailBooking(null); }} className="flex-1 gap-1.5">
                      <X size={14} /> Decline
                    </Button>
                  </div>
                )}
                {!isPending && <div className="text-center text-muted-foreground text-xs pt-1">This booking has been <strong className="text-foreground">{b.status}</strong>.</div>}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* ── Photo Preview Lightbox ── */}
      {photoPreview && (
        <div
          className="fixed inset-0 z-[1100] bg-black/92 flex items-center justify-center p-4"
          onClick={() => setPhotoPreview(null)}
        >
          <button
            onClick={() => setPhotoPreview(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-transparent border-none cursor-pointer leading-none"
          >
            <X size={28} />
          </button>
          <img
            src={photoPreview}
            alt="Gift card preview"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

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
