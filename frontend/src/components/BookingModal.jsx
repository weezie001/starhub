import { useState } from "react";
import { G } from "../lib/tokens.js";
import { Badge, Btn, Input } from "./ui.jsx";
import { api } from "../api.js";

function PaymentSelect({ value, onChange }) {
  const methods = [
    { id: "crypto", label: "₿ Crypto", desc: "BTC / ETH / USDT" },
    { id: "cashapp", label: "$ CashApp", desc: "Instant transfer" },
    { id: "venmo", label: "V Venmo", desc: "Quick & easy" },
    { id: "paypal", label: "P PayPal", desc: "Buyer protection" },
    { id: "giftcard", label: "🎁 Gift Card", desc: "Apple / Amazon / Visa" },
  ];
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ color: G.muted, fontSize: 11, letterSpacing: 0.8, display: "block", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Payment Method</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {methods.map(m => (
          <button key={m.id} onClick={() => onChange(m.id)} style={{
            background: value === m.id ? G.gold + "18" : G.s2,
            border: `1.5px solid ${value === m.id ? G.gold : G.border}`,
            borderRadius: 10, padding: "10px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s",
          }}>
            <div style={{ color: value === m.id ? G.gold : G.text, fontSize: 13, fontWeight: 600 }}>{m.label}</div>
            <div style={{ color: G.dim, fontSize: 10, marginTop: 2 }}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BookingModal({ c, type, onClose, onConfirm, user }) {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", date: "", message: "", guests: "" });
  const [payment, setPayment] = useState("");
  const [donateAmt, setDonateAmt] = useState(500);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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
    <div style={{ position: "fixed", inset: 0, background: "#000000d0", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, maxWidth: 520, width: "100%", padding: 34, maxHeight: "90vh", overflow: "auto" }}
        onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 18 }}>✅</div>
            <h3 style={{ color: G.gold, fontFamily: G.serif, margin: "0 0 10px", fontSize: 26 }}>
              {type === "fan_card" ? "Card Purchased!" : "Confirmed!"}
            </h3>
            <p style={{ color: G.muted, lineHeight: 1.7, maxWidth: 340, margin: "0 auto 24px" }}>
              Your <strong style={{ color: G.text }}>{labels[type]}</strong> {type === "donate" ? "donation" : "request"} for{" "}
              <strong style={{ color: G.gold }}>{c.name}</strong> has been submitted. Our team will contact you within 24 hours.
            </p>
            <Btn onClick={onClose} style={{ padding: "12px 32px" }}>Done ✓</Btn>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <Badge style={{ marginBottom: 10 }}>{labels[type]}</Badge>
                <h3 style={{ margin: 0, color: G.text, fontFamily: G.serif, fontSize: 24 }}>{c.name}</h3>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: G.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {type === "fan_card" && (
              <div style={{ marginBottom: 22, textAlign: "center" }}>
                <div style={{ color: G.gold, fontWeight: 700, fontSize: 22, fontFamily: G.serif }}>
                  $299 <span style={{ fontSize: 13, color: G.muted, fontWeight: 400 }}>/ lifetime access</span>
                </div>
                <div style={{ color: G.dim, fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>Priority booking • Exclusive content • Special discounts • Birthday surprises</div>
              </div>
            )}

            {type === "donate" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ color: G.muted, fontSize: 11, letterSpacing: 0.8, display: "block", marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Donation Amount</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {donateOptions.map(amt => (
                    <button key={amt} onClick={() => setDonateAmt(amt)} style={{
                      flex: "1 1 auto", minWidth: 70,
                      background: donateAmt === amt ? G.gold + "18" : G.s2,
                      border: `1.5px solid ${donateAmt === amt ? G.gold : G.border}`,
                      borderRadius: 10, padding: "12px 8px", cursor: "pointer", transition: "all 0.2s",
                    }}>
                      <div style={{ color: donateAmt === amt ? G.gold : G.text, fontSize: 16, fontWeight: 700, fontFamily: G.serif }}>${amt.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {type === "booking" && (
              <div style={{ color: G.gold, fontWeight: 700, marginBottom: 18, fontSize: 15 }}>${c.price.toLocaleString()} base rate</div>
            )}

            <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
            <Input label="Email Address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" placeholder="your@email.com" />
            {type === "booking" && (
              <>
                <Input label="Preferred Event Date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" />
                <Input label="Number of Guests" value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} type="number" placeholder="e.g. 100" />
                <Input label="Additional Details" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us more about your event..." rows={2} />
              </>
            )}

            <PaymentSelect value={payment} onChange={setPayment} />

            <Btn onClick={submit} full style={{ padding: "14px 0", fontSize: 13 }} disabled={loading || !form.name || !form.email || !payment}>
              {loading ? "⏳ Processing..." : type === "donate" ? `Donate $${donateAmt.toLocaleString()} →` : type === "fan_card" ? "Purchase Fan Card $299 →" : `Confirm ${labels[type]} →`}
            </Btn>
            {!payment && <p style={{ color: G.dim, fontSize: 11, textAlign: "center", marginTop: 10 }}>Please select a payment method to continue</p>}
          </>
        )}
      </div>
    </div>
  );
}
