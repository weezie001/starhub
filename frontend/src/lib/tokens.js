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

export const WS_URL = import.meta.env.VITE_WS_URL ||
  `ws://${window.location.hostname}:3000`;

export function avatar(name) {
  return `https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a1a2e,1a1200,0a1520&backgroundType=gradientLinear`;
}

export function celebPlaceholder(name) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1a1200"/><stop offset="100%" stop-color="#0d0d0d"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="185" r="72" fill="#f0bf5a" opacity="0.08"/><text x="200" y="202" font-family="Georgia,serif" font-size="64" font-weight="700" fill="#f0bf5a" opacity="0.35" text-anchor="middle" dominant-baseline="middle">${initials}</text><rect x="0" y="420" width="400" height="80" fill="#f0bf5a" opacity="0.04"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
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
