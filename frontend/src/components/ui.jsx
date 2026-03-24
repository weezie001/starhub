// Bridge: re-exports shadcn/ui components with the existing API so all pages keep working
import { Button as ShadBtn } from "./ui/button.jsx";
import { Input as ShadInput } from "./ui/input.jsx";
import { Textarea } from "./ui/textarea.jsx";
import { Label } from "./ui/label.jsx";
import { Badge as ShadBadge } from "./ui/badge.jsx";
import { G } from "../lib/tokens.js";
import { cn } from "../lib/utils.js";

// Map old hex color props to shadcn badge variants
function colorToVariant(color) {
  if (!color) return "default";
  if (color === G.green  || color?.includes("6DBF7B")) return "success";
  if (color === G.red    || color?.includes("D4564E")) return "destructive";
  if (color === G.amber  || color?.includes("D4A84B")) return "amber";
  return "default";
}

// Map old Btn variant names to shadcn Button variants
const VARIANT_MAP = {
  gold:    "default",
  outline: "outline",
  ghost:   "ghost",
  danger:  "danger",
  green:   "success",
  dark:    "dark",
};

export function Stars({ r, size = 14 }) {
  return (
    <span style={{ color: G.gold, fontSize: size, letterSpacing: 2 }}>
      {"★".repeat(Math.floor(r))}{"☆".repeat(5 - Math.floor(r))}
      <span style={{ color: G.muted, fontSize: size - 1, marginLeft: 6, fontWeight: 500 }}>{r}</span>
    </span>
  );
}

export function Badge({ children, color, style = {}, className }) {
  return (
    <ShadBadge variant={colorToVariant(color)} className={className} style={style}>
      {children}
    </ShadBadge>
  );
}

export function Btn({ children, onClick, variant = "gold", style = {}, disabled = false, full = false, className }) {
  return (
    <ShadBtn
      onClick={onClick}
      variant={VARIANT_MAP[variant] || "default"}
      disabled={disabled}
      className={cn(full ? "w-full" : "", className)}
      style={style}
    >
      {children}
    </ShadBtn>
  );
}

export function Input({ label, value, onChange, type = "text", placeholder = "", style = {}, rows, className }) {
  return (
    <div className="mb-3.5" style={typeof style === "object" && !style.marginBottom ? style : {}}>
      {label && <Label className="mb-1.5 block">{label}</Label>}
      {rows ? (
        <Textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} className={className} />
      ) : (
        <ShadInput type={type} value={value} onChange={onChange} placeholder={placeholder} className={className} />
      )}
    </div>
  );
}
