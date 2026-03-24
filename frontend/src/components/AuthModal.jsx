import { useState } from "react";
import { G } from "../lib/tokens.js";
import { Btn, Input } from "./ui.jsx";
import { api } from "../api.js";

export default function AuthModal({ mode, onClose, onAuth, switchMode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (mode === "register" && !form.name.trim()) { setErr("Please enter your full name."); return; }
    if (!form.email.trim()) { setErr("Please enter your email address."); return; }
    if (!form.password.trim()) { setErr("Please enter a password."); return; }
    setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login(form.email, form.password)
        : await api.register(form.name, form.email, form.password);
      onAuth(data.user);
    } catch (e) {
      setErr(e.message || "Authentication failed. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000d0", zIndex: 1002, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, maxWidth: 420, width: "100%", padding: 38 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{mode === "login" ? "🔐" : "✨"}</div>
          <h2 style={{ margin: 0, color: G.text, fontFamily: G.serif, fontSize: 28, fontWeight: 700 }}>
            {mode === "login" ? "Welcome Back" : "Join StraBook"}
          </h2>
          <p style={{ color: G.muted, fontSize: 13, marginTop: 7 }}>
            {mode === "login" ? "Sign in to access your bookings and favorites" : "Create your free account and start booking celebrities"}
          </p>
        </div>

        {err && (
          <div style={{ background: G.red + "1E", color: G.red, borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: `1px solid ${G.red}30` }}>
            ⚠️ {err}
          </div>
        )}

        {mode === "register" && (
          <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
        )}
        <Input label="Email Address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" placeholder="your@email.com" />
        <Input label="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} type="password" placeholder="••••••••" />

        <Btn onClick={submit} full style={{ padding: "14px 0", marginTop: 6, fontSize: 14 }} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
        </Btn>

        <p style={{ textAlign: "center", color: G.muted, fontSize: 13, marginTop: 18 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={switchMode} style={{ background: "none", border: "none", color: G.gold, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {mode === "login" ? "Register free" : "Sign in"}
          </button>
        </p>
        {/* {mode === "login" && (
          <p style={{ textAlign: "center", color: G.dim, fontSize: 11, marginTop: 6 }}>
            Forgot your password? <button onClick={() => {}} style={{ background: "none", border: "none", color: G.gold, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Reset it</button>
          </p>
        )} */}
      </div>
    </div>
  );
}
