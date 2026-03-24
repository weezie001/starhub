import { useState, useEffect } from "react";
import { G } from "../lib/tokens.js";
import { api } from "../api.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.jsx";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Textarea } from "./ui/textarea.jsx";
import { Badge } from "./ui/badge.jsx";
import { cn } from "../lib/utils.js";

// ── Crypto wallet addresses (update these with real addresses) ──────────────
const WALLETS = {
  BTC:  "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",  // TODO: replace with real BTC address
  ETH:  "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // TODO: replace with real ETH address
  USDT: "TKFHt3aMqvhEkH7kS9dGj2KA4GmLUkK29A",         // TODO: replace with real USDT (TRC20) address
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
      {Object.entries(WALLETS).map(([coin, addr]) => (
        <div key={coin} className="flex items-center gap-2">
          <span className="text-primary text-[11px] font-bold w-10 shrink-0">{coin}</span>
          <span className="text-foreground text-[10px] font-mono flex-1 truncate bg-background rounded px-2 py-1 border border-border">
            {addr}
          </span>
          <CopyBtn text={addr} />
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
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    try {
      const b64 = await resizeToBase64(file);
      const { url } = await api.uploadPhoto(b64);
      onChange({ ...value, photo: url });
    } catch {
      setUploadErr("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-3 space-y-3 border border-border rounded-xl p-3 bg-secondary">
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Select card type, upload a photo of the card, and enter the redemption code. Your booking will be <strong className="text-foreground">pending</strong> until verified.
      </p>
      <div>
        <Label className="mb-1.5 block text-[12px]">Card Type</Label>
        <div className="flex gap-1.5 flex-wrap">
          {GIFT_CARD_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...value, type: t })}
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
      <div>
        <Label className="mb-1.5 block text-[12px]">Card Photo</Label>
        <label className={cn(
          "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors",
          value.photo ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30"
        )}>
          {value.photo ? (
            <img src={value.photo} alt="Gift card" className="max-h-28 rounded-lg object-contain" />
          ) : (
            <>
              <span className="text-2xl">{uploading ? "⏳" : "📷"}</span>
              <span className="text-muted-foreground text-[11px] text-center">
                {uploading ? "Uploading..." : "Tap to take photo or upload card image"}
              </span>
            </>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
        {uploadErr && <p className="text-destructive text-[11px] mt-1">{uploadErr}</p>}
        {value.photo && (
          <button type="button" onClick={() => onChange({ ...value, photo: "" })} className="text-muted-foreground text-[10px] mt-1 underline cursor-pointer bg-transparent border-none">
            Remove photo
          </button>
        )}
      </div>
      <div>
        <Label className="mb-1.5 block text-[12px]">Gift Card Code</Label>
        <Input
          placeholder="Enter the full redemption code"
          value={value.code}
          onChange={e => onChange({ ...value, code: e.target.value })}
        />
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

export default function BookingModal({ open, c, type, onClose, onConfirm, user, onOpenChat }) {
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

  const labels = { booking: "Event Booking", donate: "Charity Donation", fan_card: "VIP Fan Card", video: "Video Message", meet: "Meet & Greet" };
  const donateOptions = [200, 500, 1000, 1500, 2000];

  const giftCardReady = payment === "giftcard" && giftCard.type && giftCard.code && giftCard.photo;
  const canSubmit = !loading && form.name && form.email && payment && (payment !== "giftcard" || giftCardReady);

  async function submit() {
    setLoading(true);
    try {
      const extraForm = payment === "giftcard"
        ? { ...form, giftCardType: giftCard.type, giftCardCode: giftCard.code, giftCardPhoto: giftCard.photo }
        : form;
      await api.createBooking(c, type, extraForm, payment, type === "donate" ? donateAmt : null);
      onConfirm();
      setDone(true);
    } catch {
      setDone(true);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-5">✅</div>
            <h3 className="text-primary font-serif text-2xl mb-2.5">
              {type === "fan_card" ? "Card Purchased!" : "Request Submitted!"}
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6 text-sm">
              Your <strong className="text-foreground">{labels[type]}</strong>{" "}
              {type === "donate" ? "donation" : "request"} for{" "}
              <strong className="text-primary">{c.name}</strong> is{" "}
              <strong className="text-foreground">pending review</strong>.
              Our team will contact you within 24 hours to confirm.
            </p>
            <Button onClick={onClose} className="px-8">Done ✓</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2">
                <Badge className="mb-2.5">{labels[type]}</Badge>
                <DialogTitle className="text-2xl mt-1">{c.name}</DialogTitle>
              </div>
            </DialogHeader>

            {type === "fan_card" && (
              <div className="mb-5 text-center border border-border rounded-xl p-4 bg-secondary">
                <div className="text-primary font-bold text-xl font-serif">
                  $299{" "}
                  <span className="text-sm text-muted-foreground font-normal">/ lifetime access</span>
                </div>
                <div className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                  Priority booking • Exclusive content • Special discounts • Birthday surprises
                </div>
              </div>
            )}

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

            {type === "booking" && (
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
                    ? "Purchase Fan Card $299 →"
                    : `Confirm ${labels[type]} →`}
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
