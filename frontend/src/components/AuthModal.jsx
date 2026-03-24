import { useState } from "react";
import { api } from "../api.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.jsx";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Eye, EyeOff } from "lucide-react";

export default function AuthModal({ open, mode, onClose, onAuth, switchMode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center items-center pb-2">
          <div className="text-4xl mb-3">{mode === "login" ? "🔐" : "✨"}</div>
          <DialogTitle className="text-2xl">
            {mode === "login" ? "Welcome Back" : "Join StarBookNow"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === "login"
              ? "Sign in to access your bookings and favorites"
              : "Create your free account and start booking celebrities"}
          </p>
        </DialogHeader>

        {err && (
          <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg px-3.5 py-2.5 text-sm mb-2">
            ⚠️ {err}
          </div>
        )}

        <div className="space-y-1">
          {mode === "register" && (
            <div className="mb-3.5">
              <Label className="mb-1.5 block">Full Name</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
            </div>
          )}
          <div className="mb-3.5">
            <Label className="mb-1.5 block">Email Address</Label>
            <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
          </div>
          <div className="mb-4">
            <Label className="mb-1.5 block">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button onClick={submit} className="w-full py-6 text-sm" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
        </Button>

        <p className="text-center text-muted-foreground text-sm mt-2">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={switchMode} className="text-primary font-semibold bg-transparent border-none cursor-pointer text-sm">
            {mode === "login" ? "Register free" : "Sign in"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
