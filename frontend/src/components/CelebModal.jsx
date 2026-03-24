import { G, avatar } from "../lib/tokens.js";
import { Stars } from "./ui.jsx";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
import { Dialog, DialogContent } from "./ui/dialog.jsx";

export default function CelebModal({ open, c, onClose, onBook, isFav, onFav }) {
  if (!c) return null;
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Hero image */}
        <div className="relative h-72">
          <img
            src={c.img || avatar(c.name)} alt={c.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = avatar(c.name); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          <button
            onClick={() => onFav(c.id)}
            className="absolute top-3 right-14 bg-black/60 border-none rounded-full w-9 h-9 text-base cursor-pointer flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            {isFav ? "❤️" : "🤍"}
          </button>

          <div className="absolute bottom-4 left-5">
            <div className="flex gap-1.5 mb-2">
              {c.feat && <Badge className="text-[10px]">FEATURED</Badge>}
              <Badge variant={c.avail ? "success" : "destructive"}>
                {c.avail ? "AVAILABLE" : "FULLY BOOKED"}
              </Badge>
            </div>
            <h2 className="m-0 text-foreground text-3xl font-serif font-bold leading-tight">{c.name}</h2>
            <div className="text-muted-foreground text-sm mt-1">{c.flag} {c.country} • {c.cat}</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              ["Rating", <Stars r={c.rating} size={15} />],
              ["Reviews", `${c.reviews} clients`],
              ["Base Price", `$${c.price.toLocaleString()}`],
            ].map(([k, v]) => (
              <div key={k} className="bg-secondary rounded-xl p-3.5">
                <div className="text-muted-foreground text-[10px] tracking-wide uppercase mb-1.5">{k}</div>
                <div className="text-foreground font-semibold text-sm">{v}</div>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-5 text-sm">{c.bio}</p>

          <div className="mb-6">
            <div className="text-primary text-[10px] tracking-widest font-bold mb-2.5 uppercase">Available For</div>
            <div className="flex gap-2 flex-wrap">
              {c.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <Button onClick={() => onBook(c, "booking")} disabled={!c.avail} size="sm">📅 Book Now</Button>
            <Button onClick={() => onBook(c, "donate")} variant="outline" size="sm">💝 Donate</Button>
            <Button onClick={() => onBook(c, "fan_card")} variant="ghost" size="sm">💎 Fan Card</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
