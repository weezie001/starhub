import { useState, useEffect, useRef } from "react";
import { G, celebPlaceholder } from "../lib/tokens.js";
import vipCardImg from "../assets/vip card.png";
import platinumCardImg from "../assets/platinum card.png";
import { api } from "../api.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.jsx";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Textarea } from "./ui/textarea.jsx";
import { Badge } from "./ui/badge.jsx";
import { cn } from "../lib/utils.js";

// ── Crypto wallet addresses ───────────────────────────────────────────────────
const WALLETS = {
  BTC:  { address: "1PcYsTowoq1JfrRQPdbRqyeh2Y5L8GdweS",          network: "Bitcoin" },
  ETH:  { address: "0xf0838664b03d61494125e93d13b1454d64535ceb",   network: "BNB Smart Chain (BEP20)" },
  USDT: { address: "0xf0838664b03d61494125e93d13b1454d64535ceb",   network: "BNB Smart Chain (BEP20)" },
};

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="text-[10px] font-bold px-2 py-0.5 rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors shrink-0"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function CryptoWallets() {
  return (
    <div className="mt-3 space-y-2 border border-border rounded-xl p-3 bg-secondary">
      <p className="text-muted-foreground text-[11px] mb-2 leading-relaxed">
        Send your payment to any of the addresses below, then confirm your booking. Your request will be <strong className="text-foreground">pending</strong> until payment is verified.
      </p>
      {Object.entries(WALLETS).map(([coin, { address, network }]) => (
        <div key={coin} className="rounded-lg border border-border bg-background p-2.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-primary text-[11px] font-bold">{coin}</span>
            <span className="text-muted-foreground text-[9px] tracking-wide">{network}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-foreground text-[10px] font-mono flex-1 break-all">
              {address}
            </span>
            <CopyBtn text={address} />
          </div>
        </div>
      ))}
    </div>
  );
}

const GIFT_CARD_TYPES = ["Apple", "Amazon", "Visa", "Google Play", "iTunes", "Steam"];

function resizeToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function GiftCardForm({ value, onChange }) {
  const [inputMode, setInputMode] = useState("code"); // "code" | "photo"
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const galleryRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadErr("");
    setUploading(true);
    try {
      const b64 = await resizeToBase64(file);
      // Store base64 for preview — actual cloud upload happens on confirm
      onChange(prev => ({ ...prev, photo: b64, code: "" }));
    } catch {
      setUploadErr("Could not read image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function switchMode(mode) {
    setInputMode(mode);
    // clear the other field when switching
    if (mode === "code") onChange(prev => ({ ...prev, photo: "" }));
    else onChange(prev => ({ ...prev, code: "" }));
  }

  return (
    <div className="mt-3 space-y-3 border border-border rounded-xl p-3 bg-secondary">
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Select card type, then provide either the redemption code or a photo. Your booking will be <strong className="text-foreground">pending</strong> until verified.
      </p>

      {/* Card type */}
      <div>
        <Label className="mb-1.5 block text-[12px]">Card Type</Label>
        <div className="flex gap-1.5 flex-wrap">
          {GIFT_CARD_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onChange(prev => ({ ...prev, type: t }))}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer",
                value.type === t
                  ? "bg-primary/10 border-primary/50 text-primary"
                  : "bg-background border-border text-muted-foreground hover:border-border/80"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div>
        <Label className="mb-1.5 block text-[12px]">How would you like to provide the card?</Label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => switchMode("code")}
            className={cn(
              "py-2.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer",
              inputMode === "code"
                ? "bg-primary/10 border-primary/50 text-primary"
                : "bg-background border-border text-muted-foreground"
            )}
          >
            🔑 Enter Code
          </button>
          <button
            type="button"
            onClick={() => switchMode("photo")}
            className={cn(
              "py-2.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer",
              inputMode === "photo"
                ? "bg-primary/10 border-primary/50 text-primary"
                : "bg-background border-border text-muted-foreground"
            )}
          >
            📷 Upload Photo
          </button>
        </div>

        {/* Code input */}
        {inputMode === "code" && (
          <Input
            placeholder="Enter the full redemption code"
            value={value.code}
            onChange={e => { const v = e.target.value; onChange(prev => ({ ...prev, code: v, photo: "" })); }}
          />
        )}

        {/* Photo input */}
        {inputMode === "photo" && (
          <>
            <input ref={galleryRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {value.photo ? (
              <div className="border-2 border-primary/40 bg-primary/5 rounded-xl p-3 flex flex-col items-center gap-2">
                <img src={value.photo} alt="Gift card" className="max-h-32 rounded-lg object-contain" />
                <button type="button" onClick={() => onChange({ ...value, photo: "" })} className="text-muted-foreground text-[10px] underline cursor-pointer bg-transparent border-none">
                  Remove photo
                </button>
              </div>
            ) : uploading ? (
              <div className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center gap-2">
                <span className="text-2xl">⏳</span>
                <span className="text-muted-foreground text-[11px]">Uploading...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors bg-transparent"
              >
                <span className="text-2xl">📷</span>
                <span className="text-muted-foreground text-[11px] font-medium">Tap to upload gift card photo</span>
              </button>
            )}
            {uploadErr && <p className="text-destructive text-[11px] mt-1">{uploadErr}</p>}
          </>
        )}
      </div>
    </div>
  );
}

function PaymentSelect({ value, onChange, onContactAdmin }) {
  const methods = [
    { id: "crypto",   label: "₿ Crypto",    desc: "BTC / ETH / USDT" },
    { id: "giftcard", label: "🎁 Gift Card", desc: "Apple / Amazon / Visa" },
    { id: "other",    label: "💬 Other",     desc: "Contact admin" },
  ];
  return (
    <div className="mb-4">
      <Label className="mb-2 block">Payment Method</Label>
      <div className="grid grid-cols-3 gap-2">
        {methods.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              if (m.id === "other") { onContactAdmin(); return; }
              onChange(m.id);
            }}
            className={cn(
              "rounded-xl p-2.5 cursor-pointer text-center transition-all border",
              value === m.id
                ? "bg-primary/10 border-primary/50"
                : m.id === "other"
                  ? "bg-secondary border-border hover:border-primary/40 hover:bg-primary/5"
                  : "bg-secondary border-border hover:border-border/80"
            )}
          >
            <div className={cn(
              "text-[13px] font-semibold",
              m.id === "other" ? "text-primary" : value === m.id ? "text-primary" : "text-foreground"
            )}>
              {m.label}
            </div>
            <div className="text-muted-foreground text-[10px] mt-0.5">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BookingModal({ open, c, type, onClose, onConfirm, user, memberships, userPlan, onOpenChat, setPage }) {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", date: "", message: "", guests: "" });
  const [payment, setPayment] = useState("");
  const [donateAmt, setDonateAmt] = useState(500);
  const [giftCard, setGiftCard] = useState({ type: "", code: "", photo: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ name: user?.name || "", email: user?.email || "", date: "", message: "", guests: "" });
      setPayment("");
      setGiftCard({ type: "", code: "", photo: "" });
      setDone(false);
    }
  }, [open]);

  if (!c) return null;

  // Plan-based access gate
  const plan = userPlan || "free";
  const isFanCardType = type === "fan_card" || type === "fan_card_platinum";
  const isBookingType = type === "booking" || type === "video" || type === "meet";
  const needsPremium = isFanCardType && plan === "free";
  const needsPlatinum = isBookingType && plan !== "platinum";

  const isPlanUpgrade = type === "plan_upgrade";
  const labels = { booking: "Event Booking", donate: "Charity Donation", fan_card: "VIP Fan Card", fan_card_platinum: "Platinum Elite Card", video: "Video Message", meet: "Meet & Greet", plan_upgrade: `${c?.name || "Plan"} — Upgrade` };
  const donateOptions = [200, 500, 1000, 1500, 2000];

  // Photo alone is enough (admin sees card type from image); code path requires a type selection too
  const giftCardReady = payment === "giftcard" && (giftCard.photo || (giftCard.type && giftCard.code));
  const canSubmit = !loading && form.name && form.email && payment && (payment !== "giftcard" || giftCardReady);

  async function submit() {
    setLoading(true);
    try {
      let giftCardPhoto = giftCard.photo;
      // Upload photo to cloud at confirm time (was stored as base64 for preview)
      if (payment === "giftcard" && giftCardPhoto?.startsWith("data:")) {
        try {
          const { url } = await api.uploadPhoto(giftCardPhoto);
          giftCardPhoto = url;
        } catch {
          // keep base64 as fallback
        }
      }
      const extraForm = payment === "giftcard"
        ? { ...form, giftCardType: giftCard.type, giftCardCode: giftCard.code, giftCardPhoto: giftCardPhoto }
        : form;
      await Promise.all([
        isPlanUpgrade
          ? api.createBooking(c, "plan_upgrade", extraForm, payment).catch(() => {})
          : api.createBooking(c, type, extraForm, payment, type === "donate" ? donateAmt : null),
        new Promise(resolve => setTimeout(resolve, 5000)),
      ]);
      onConfirm();
    } catch {}
    setLoading(false);
    setDone(true);
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {(needsPremium || needsPlatinum) ? (
          <div className="py-10 text-center">
            <div className="text-5xl mb-4">{needsPlatinum ? "💎" : "👑"}</div>
            <h3 className="text-foreground font-serif text-xl mb-2">
              {needsPlatinum ? "Platinum Plan Required" : "Premium Plan Required"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6 leading-relaxed">
              {needsPlatinum
                ? "Celebrity bookings (events, video messages, meet & greet) are exclusively available to Platinum plan members."
                : "Fan Card purchases are available to Premium and Platinum plan members."}
            </p>
            <div className="flex flex-col gap-2 max-w-[220px] mx-auto">
              <Button onClick={() => { onClose(); setPage?.("pricing"); }}>
                View Plans →
              </Button>
              <Button variant="ghost" onClick={onClose}>Maybe later</Button>
            </div>
          </div>
        ) : loading ? (
          <div className="py-14 flex flex-col items-center justify-center gap-5">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-primary/40 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">⭐</div>
            </div>
            <div className="text-center">
              <h3 className="text-foreground font-serif text-xl mb-1.5">Processing your request</h3>
              <p className="text-muted-foreground text-sm">Securing your booking with <strong className="text-primary">{c.name}</strong>...</p>
            </div>
            <div className="flex gap-2 mt-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          </div>
        ) : done ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-5">✅</div>
            <h3 className="text-primary font-serif text-2xl mb-2.5">
              {isPlanUpgrade ? "Upgrade Requested!" : (type === "fan_card" || type === "fan_card_platinum") ? "Card Purchased!" : "Request Submitted!"}
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6 text-sm">
              {isPlanUpgrade
                ? <>Your <strong className="text-foreground">{c.name}</strong> upgrade request is <strong className="text-foreground">pending review</strong>. Our team will activate your plan within 24 hours after payment verification.</>
                : <> Your <strong className="text-foreground">{labels[type]}</strong>{" "}{type === "donate" ? "donation" : "request"} for{" "}<strong className="text-primary">{c.name}</strong> is <strong className="text-foreground">pending review</strong>. Our team will contact you within 24 hours to confirm.</>
              }
            </p>
            <Button onClick={onClose} className="px-8">Done ✓</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2">
                {(() => {
                  const m = memberships?.find(m => String(m.celebId) === String(c?.id));
                  if (!m || m.status !== "approved") return null;
                  const isPlat = m.tier === "platinum";
                  return (
                    <div className="flex items-center gap-2 mb-2.5 rounded-full px-3 py-1.5 border w-fit" style={{ background: isPlat ? "rgba(180,200,240,0.08)" : "rgba(240,191,90,0.08)", borderColor: isPlat ? "rgba(180,200,240,0.3)" : "rgba(240,191,90,0.3)" }}>
                      <span className="text-sm">{isPlat ? "💎" : "👑"}</span>
                      <span className="font-bold text-[11px] tracking-widest uppercase" style={{ color: isPlat ? "#b8cce8" : "#f0bf5a" }}>
                        {isPlat ? "Platinum" : "VIP"} Priority Member
                      </span>
                      <span className="text-[10px] text-muted-foreground">· Priority booking active</span>
                    </div>
                  );
                })()}
                <Badge className="mb-2.5">{labels[type]}</Badge>
                <DialogTitle className="text-2xl mt-1">{c.name}</DialogTitle>
              </div>
            </DialogHeader>

            {(type === "fan_card" || type === "fan_card_platinum") && (() => {
              const isPlat = type === "fan_card_platinum";
              const price = isPlat ? (c.platinumPrice || 999) : (c.vipPrice || 299);
              return (
                <div className="mb-5 rounded-xl overflow-hidden border border-border">
                  {/* Card visual */}
                  <div className="relative h-36 flex items-center justify-between px-6" style={{
                    backgroundImage: `url(${isPlat ? platinumCardImg : vipCardImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}>
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Celeb photo */}
                    <img
                      src={c.img || celebPlaceholder(c.name)}
                      alt={c.name}
                      className="relative z-10 w-16 h-20 object-cover rounded-lg shadow-lg border-2 border-white/30 shrink-0"
                      onError={e => { e.target.src = celebPlaceholder(c.name); }}
                    />
                    <div className="relative z-10 text-right">
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
                        {isPlat ? "Platinum" : "VIP Member"}
                      </div>
                      <div className="font-serif font-extrabold text-3xl text-white/90">
                        {isPlat ? "PLAT" : "VIP"}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 700, marginTop: 2 }}>
                        {c.name.split(" ")[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 text-2xl opacity-80">
                      {isPlat ? "💎" : "👑"}
                    </div>
                  </div>
                  {/* Price row */}
                  <div className="px-4 py-3 bg-secondary flex items-center justify-between">
                    <div>
                      <div className="text-primary font-bold text-lg font-serif">${price.toLocaleString()} <span className="text-muted-foreground text-xs font-normal">/ year</span></div>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        {isPlat ? "All VIP perks + meet & greet + signed memorabilia" : "Priority booking • Exclusive content • Birthday surprises"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {type === "donate" && (
              <div className="mb-4">
                <Label className="mb-2 block">Donation Amount</Label>
                <div className="flex gap-2 flex-wrap">
                  {donateOptions.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonateAmt(amt)}
                      className={cn(
                        "flex-1 min-w-[70px] rounded-xl py-3 px-2 cursor-pointer border transition-all",
                        donateAmt === amt
                          ? "bg-primary/10 border-primary/50"
                          : "bg-secondary border-border"
                      )}
                    >
                      <div className={cn("text-base font-bold font-serif", donateAmt === amt ? "text-primary" : "text-foreground")}>
                        ${amt.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {type === "booking" && c.price != null && (
              <div className="text-primary font-bold mb-4 text-sm">
                ${c.price.toLocaleString()} base rate
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <Label className="mb-1.5 block">Full Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
              </div>
              <div>
                <Label className="mb-1.5 block">Email Address</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
              </div>
              {type === "booking" && (
                <>
                  <div>
                    <Label className="mb-1.5 block">Preferred Event Date</Label>
                    <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Number of Guests</Label>
                    <Input type="number" value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} placeholder="e.g. 100" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Additional Details</Label>
                    <Textarea rows={2} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us more about your event..." />
                  </div>
                </>
              )}
            </div>

            <PaymentSelect value={payment} onChange={setPayment} onContactAdmin={onOpenChat} />

            {/* Crypto wallet addresses */}
            {payment === "crypto" && <CryptoWallets />}

            {/* Gift card sub-form */}
            {payment === "giftcard" && (
              <GiftCardForm value={giftCard} onChange={setGiftCard} />
            )}

            <Button
              onClick={submit}
              className="w-full py-6 text-sm mt-3"
              disabled={!canSubmit}
            >
              {loading
                ? "⏳ Processing..."
                : type === "donate"
                  ? `Donate $${donateAmt.toLocaleString()} →`
                  : type === "fan_card"
                    ? `Purchase ${labels[type]} $${type === "fan_card_platinum" ? (c.platinumPrice||999) : (c.vipPrice||299)} →`
                    : `Confirm ${labels[type] || "Booking"} →`}
            </Button>
            {!payment && (
              <p className="text-muted-foreground text-xs text-center mt-2">
                Please select a payment method to continue
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
