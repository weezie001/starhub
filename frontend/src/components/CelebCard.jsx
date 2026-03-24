import { useState } from "react";
import { G, avatar } from "../lib/tokens.js";
import { Stars } from "./ui.jsx";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
import { cn } from "../lib/utils.js";

export default function CelebCard({ c, onView, onBook, onFav, isFav }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={cn(
        "celeb-card rounded-xl overflow-hidden border cursor-pointer transition-all duration-500",
        hover
          ? "border-primary/50 -translate-y-2 shadow-[0_24px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(240,191,90,0.12)]"
          : "border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      )}
      style={{ background: G.card }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Image */}
      <div className="relative h-44 sm:h-64 overflow-hidden" onClick={() => onView(c)}>
        <img
          className="celeb-img w-full h-full object-cover transition-transform duration-500"
          src={c.img || avatar(c.name)} alt={c.name}
          style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
          onError={e => { e.target.src = avatar(c.name); }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#13131350] to-transparent" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {c.feat && <Badge className="text-[9px] px-1.5 py-0.5">Featured</Badge>}
          <Badge variant={c.avail ? "success" : "destructive"} className="text-[9px] px-1.5 py-0.5">
            {c.avail ? "Available" : "Booked"}
          </Badge>
        </div>

        {/* Fav button */}
        <button
          onClick={e => { e.stopPropagation(); onFav(c.id); }}
          className="absolute top-2.5 right-2.5 bg-[#13131380] backdrop-blur-sm border border-border rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center cursor-pointer text-xs sm:text-sm transition-all hover:bg-[#131313]"
        >
          {isFav ? "❤️" : "🤍"}
        </button>

        {/* Name overlay */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <h3 className="m-0 text-[14px] sm:text-xl font-bold text-white font-serif leading-tight mb-0.5">{c.name}</h3>
          <div className="text-white/60 text-[10px] tracking-wide uppercase font-medium">
            {c.flag} {c.country}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 pb-4">
        <div className="flex justify-between items-center mb-1.5">
          <Stars r={c.rating || 5} size={10} />
          <span className="text-primary font-bold text-[12px] sm:text-sm font-serif">
            ${(c.price || 0).toLocaleString()}
          </span>
        </div>
        {(c.reviews > 0) && (
          <div className="text-muted-foreground text-[10px] mb-2.5 tracking-wide">
            {c.reviews} reviews
          </div>
        )}
        {(c.tags || []).length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {c.tags.slice(0, 2).map(t => (
              <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">{t}</Badge>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <Button onClick={() => onBook(c, "event")} size="sm" className="flex-1 text-[10px] sm:text-[11px] px-2" disabled={!c.avail}>
            Book Now
          </Button>
          <Button onClick={() => onView(c)} variant="ghost" size="sm" className="text-[10px] sm:text-[11px] px-2">
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
