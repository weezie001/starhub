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
          ? "border-primary/40 -translate-y-1 shadow-[0_20px_48px_rgba(0,0,0,0.4)]"
          : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
      )}
      style={{ background: G.card }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Image */}
      <div className="relative h-72 overflow-hidden" onClick={() => onView(c)}>
        <img
          className="celeb-img w-full h-full object-cover transition-transform duration-500"
          src={c.img || avatar(c.name)} alt={c.name}
          style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
          onError={e => { e.target.src = avatar(c.name); }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#13131350] to-transparent" />

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
          {c.feat && <Badge className="text-[10px]">Featured</Badge>}
          <Badge variant={c.avail ? "success" : "destructive"} className="text-[10px]">
            {c.avail ? "Available" : "Booked"}
          </Badge>
        </div>

        {/* Fav button */}
        <button
          onClick={e => { e.stopPropagation(); onFav(c.id); }}
          className="absolute top-3.5 right-3.5 bg-[#13131380] backdrop-blur-sm border border-border rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-sm transition-all hover:bg-[#131313]"
        >
          {isFav ? "❤️" : "🤍"}
        </button>

        {/* Name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="m-0 text-xl font-bold text-white font-serif leading-tight mb-1">{c.name}</h3>
          <div className="text-white/60 text-[11px] tracking-wide uppercase font-medium">
            {c.flag} {c.country}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pb-5">
        <div className="flex justify-between items-center mb-2">
          <Stars r={c.rating} />
          <span className="text-primary font-bold text-sm font-serif">
            From ${c.price.toLocaleString()}
          </span>
        </div>
        <div className="text-muted-foreground text-[11px] mb-3.5 tracking-wide">
          {c.reviews} verified reviews
        </div>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {c.tags.slice(0, 2).map(t => (
            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onBook(c, "booking")} size="sm" className="flex-1 text-[11px]" disabled={!c.avail}>
            Book Now
          </Button>
          <Button onClick={() => onView(c)} variant="ghost" size="sm" className="text-[11px]">
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
