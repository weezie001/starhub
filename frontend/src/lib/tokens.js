export const G = {
  gold: "#f1c97d", goldD: "#d4ad65", goldL: "#ffdea5",
  bg: "#131313", s1: "#1c1b1b", s2: "#201f1f",
  card: "#1c1b1b", cardH: "#2a2a2a",
  text: "#e5e2e1", muted: "#d0c5af", dim: "#99907c",
  border: "#4d4635", borderL: "#353534",
  green: "#6DBF7B", red: "#D4564E", amber: "#D4A84B",
  cream: "#e5e2e1", warmGray: "#353534",
  serif: "'Noto Serif', Georgia, serif",
  sans: "'Manrope', sans-serif",
};

export const WS_URL = (import.meta.env.VITE_WS_URL || "ws://localhost:5000");

export function avatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1200&color=D4AF37&bold=true&size=300&font-size=0.38`;
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
