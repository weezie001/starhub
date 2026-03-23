import { useState } from "react";
import { G, avatar } from "../lib/tokens.js";
import { Stars, Badge, Btn } from "./ui.jsx";

export default function CelebCard({ c, onView, onBook, onFav, isFav }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="celeb-card"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: G.card, borderRadius: 12, overflow: "hidden",
        border: `1px solid ${hover ? G.gold + "40" : G.border}`,
        transition: "all 0.45s cubic-bezier(0.4,0,0.2,1)",
        transform: hover ? "translateY(-5px)" : "none",
        boxShadow: hover ? `0 20px 48px #00000060, 0 0 0 1px ${G.gold}20` : "0 2px 8px #00000040",
        cursor: "pointer",
      }}>
      {/* Image */}
      <div style={{ position: "relative", height: 300, overflow: "hidden" }} onClick={() => onView(c)}>
        <img className="celeb-img"
          src={c.img || avatar(c.name)} alt={c.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: hover ? "scale(1.06)" : "scale(1)" }}
          onError={e => { e.target.src = avatar(c.name); }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,#131313 0%,#13131350 45%,transparent 100%)" }} />
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
          {c.feat && <Badge>Featured</Badge>}
          <Badge color={c.avail ? G.green : G.red}>{c.avail ? "Available" : "Booked"}</Badge>
        </div>
        <button onClick={e => { e.stopPropagation(); onFav(c.id); }} style={{
          position: "absolute", top: 14, right: 14,
          background: "#13131380", backdropFilter: "blur(8px)",
          border: `1px solid ${G.border}`, borderRadius: "50%",
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 14, transition: "all 0.3s",
        }}>
          {isFav ? "❤️" : "🤍"}
        </button>
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
          <h3 style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: G.serif, lineHeight: 1.2 }}>
            {c.name}
          </h3>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>
            {c.flag} {c.country}
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Stars r={c.rating} />
          <span style={{ color: G.gold, fontWeight: 700, fontSize: 15, fontFamily: G.serif }}>
            From ${c.price.toLocaleString()}
          </span>
        </div>
        <div style={{ color: G.dim, fontSize: 11, marginBottom: 14, letterSpacing: 0.5 }}>
          {c.reviews} verified reviews
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {c.tags.slice(0, 2).map(t => (
            <span key={t} style={{
              background: G.s2, color: G.muted, borderRadius: 50,
              padding: "3px 12px", fontSize: 10, letterSpacing: 0.8, fontWeight: 600, textTransform: "uppercase",
            }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => onBook(c, "booking")} style={{ flex: 1, padding: "10px 0", fontSize: 11 }} disabled={!c.avail}>
            Book Now
          </Btn>
          <Btn onClick={() => onView(c)} variant="ghost" style={{ padding: "10px 16px", fontSize: 11 }}>
            View
          </Btn>
        </div>
      </div>
    </div>
  );
}
