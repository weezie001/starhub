import { G } from "../lib/tokens.js";

export function Stars({ r, size = 14 }) {
  return (
    <span style={{ color: G.gold, fontSize: size, letterSpacing: 2 }}>
      {"★".repeat(Math.floor(r))}{"☆".repeat(5 - Math.floor(r))}
      <span style={{ color: G.muted, fontSize: size - 1, marginLeft: 6, fontWeight: 500 }}>{r}</span>
    </span>
  );
}

export function Badge({ children, color = G.gold, style = {} }) {
  return (
    <span style={{
      background: color + "14", color, border: `1px solid ${color}30`,
      borderRadius: 20, padding: "4px 12px", fontSize: 10, fontWeight: 600,
      letterSpacing: 1.5, textTransform: "uppercase", ...style
    }}>
      {children}
    </span>
  );
}

export function Btn({ children, onClick, variant = "gold", style = {}, disabled = false, full = false }) {
  const base = {
    padding: "12px 28px", borderRadius: 50, fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
    letterSpacing: 0.8, fontFamily: G.sans, fontWeight: 700,
    outline: "none", display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 8, whiteSpace: "nowrap", textTransform: "uppercase",
  };
  const variants = {
    gold:    { background: `linear-gradient(45deg,${G.gold},${G.goldD})`, color: "#261900", border: "none", boxShadow: `0 2px 20px ${G.gold}30` },
    outline: { background: "transparent", color: G.gold, border: `1.5px solid ${G.gold}50` },
    ghost:   { background: G.warmGray + "60", color: G.text, border: `1px solid ${G.border}` },
    danger:  { background: G.red + "18", color: G.red, border: `1px solid ${G.red}30` },
    green:   { background: G.green + "18", color: G.green, border: `1px solid ${G.green}30` },
    dark:    { background: G.s2, color: G.text, border: `1px solid ${G.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...(full ? { width: "100%" } : {}), ...style, opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = "text", placeholder = "", style = {}, rows }) {
  const inputStyle = {
    width: "100%", background: G.s2, border: `1px solid ${G.border}`,
    borderRadius: 8, padding: "11px 14px", color: G.text, fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: G.sans, transition: "border 0.2s",
  };
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={{ color: G.muted, fontSize: 11, letterSpacing: 0.8, display: "block", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>{label}</label>}
      {rows ? (
        <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder}
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = G.gold + "60"}
          onBlur={e => e.target.style.borderColor = G.border} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = G.gold + "60"}
          onBlur={e => e.target.style.borderColor = G.border} />
      )}
    </div>
  );
}
