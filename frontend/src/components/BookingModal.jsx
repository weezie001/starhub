import { useState } from "react";
import { G } from "../lib/tokens.js";
import { api } from "../api.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.jsx";
import { Button } from "./ui/button.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Textarea } from "./ui/textarea.jsx";
import { Badge } from "./ui/badge.jsx";
import { cn } from "../lib/utils.js";

function PaymentSelect({ value, onChange }) {
  const methods = [
    { id: "crypto",   label: "₿ Crypto",    desc: "BTC / ETH / USDT" },
    { id: "cashapp",  label: "$ CashApp",   desc: "Instant transfer" },
    { id: "venmo",    label: "V Venmo",     desc: "Quick & easy" },
    { id: "paypal",   label: "P PayPal",    desc: "Buyer protection" },
    { id: "giftcard", label: "🎁 Gift Card", desc: "Apple / Amazon / Visa" },
  ];
  return (
    <div className="mb-4">
      <Label className="mb-2 block">Payment Method</Label>
      <div className="grid grid-cols-3 gap-2">
        {methods.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              "rounded-xl p-2.5 cursor-pointer text-center transition-all border",
              value === m.id
                ? "bg-primary/10 border-primary/50"
                : "bg-secondary border-border hover:border-border/80"
            )}
          >
            <div className={cn("text-[13px] font-semibold", value === m.id ? "text-primary" : "text-foreground")}>{m.label}</div>
            <div className="text-muted-foreground text-[10px] mt-0.5">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BookingModal({ open, c, type, onClose, onConfirm, user }) {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", date: "", message: "", guests: "" });
  const [payment, setPayment] = useState("");
  const [donateAmt, setDonateAmt] = useState(500);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!c) return null;

  const labels = { booking: "Event Booking", donate: "Charity Donation", fan_card: "VIP Fan Card", video: "Video Message", meet: "Meet & Greet" };
  const donateOptions = [200, 500, 1000, 1500, 2000];

  async function submit() {
    setLoading(true);
    try {
      await api.createBooking(c, type, form, payment, type === "donate" ? donateAmt : null);
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
              {type === "fan_card" ? "Card Purchased!" : "Confirmed!"}
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6 text-sm">
              Your <strong className="text-foreground">{labels[type]}</strong>{" "}
              {type === "donate" ? "donation" : "request"} for{" "}
              <strong className="text-primary">{c.name}</strong> has been submitted.
              Our team will contact you within 24 hours.
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

            <PaymentSelect value={payment} onChange={setPayment} />

            <Button
              onClick={submit}
              className="w-full py-6 text-sm mt-1"
              disabled={loading || !form.name || !form.email || !payment}
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
