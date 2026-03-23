import { G, avatar } from "../lib/tokens.js";
import { Stars, Badge, Btn } from "./ui.jsx";

export default function CelebModal({ c, onClose, onBook, isFav, onFav }) {
  if (!c) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, maxWidth: 700, width: "100%", maxHeight: "90vh", overflow: "auto" }}
        onClick={e => e.stopPropagation()}>
        {/* Hero image */}
        <div style={{ height: 300, position: "relative" }}>
          <img src={c.img || avatar(c.name)} alt={c.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "18px 18px 0 0" }}
            onError={e => { e.target.src = avatar(c.name); }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,#1c1b1b 0%,transparent 55%)", borderRadius: "18px 18px 0 0" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "#000000aa", border: "none", borderRadius: "50%", width: 36, height: 36, color: G.text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <button onClick={() => onFav(c.id)} style={{ position: "absolute", top: 14, right: 58, background: "#000000aa", border: "none", borderRadius: "50%", width: 36, height: 36, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isFav ? "❤️" : "🤍"}
          </button>
          <div style={{ position: "absolute", bottom: 18, left: 22 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {c.feat && <Badge>FEATURED</Badge>}
              <Badge color={c.avail ? G.green : G.red}>{c.avail ? "AVAILABLE" : "FULLY BOOKED"}</Badge>
            </div>
            <h2 style={{ margin: 0, color: G.text, fontSize: 30, fontFamily: G.serif, fontWeight: 700 }}>{c.name}</h2>
            <div style={{ color: G.muted, fontSize: 13, marginTop: 4 }}>{c.flag} {c.country} • {c.cat}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
            {[["Rating", <Stars r={c.rating} size={15} />], ["Reviews", c.reviews + " clients"], ["Base Price", `$${c.price.toLocaleString()}`]].map(([k, v]) => (
              <div key={k} style={{ background: G.s2, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ color: G.muted, fontSize: 10, letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" }}>{k}</div>
                <div style={{ color: G.text, fontWeight: 600, fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
          <p style={{ color: G.muted, lineHeight: 1.8, marginBottom: 22, fontSize: 14 }}>{c.bio}</p>
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: G.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>AVAILABLE FOR</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {c.tags.map(t => <Badge key={t}>{t}</Badge>)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Btn onClick={() => onBook(c, "booking")} disabled={!c.avail} style={{ fontSize: 12 }}>📅 Book Now</Btn>
            <Btn onClick={() => onBook(c, "donate")} variant="outline" style={{ fontSize: 12 }}>💝 Donate</Btn>
            <Btn onClick={() => onBook(c, "fan_card")} variant="ghost" style={{ fontSize: 12 }}>💎 Fan Card</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
