import { useState } from "react";
import { G, avatar } from "../lib/tokens.js";
import { CELEBS } from "../lib/data.js";
import { Stars } from "../components/ui.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Separator } from "../components/ui/separator.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";
import { cn } from "../lib/utils.js";

export default function DashboardPage({ user, bookings, favorites, onView, setPage }) {
  const [tab, setTab] = useState("bookings");
  const isMobile = useIsMobile();
  const myBookings = bookings.filter(b => String(b.userId) === String(user.id));
  const myFavs = CELEBS.filter(c => favorites.includes(c.id));
  const spent = myBookings.reduce((s, b) => s + (b.amount || b.celeb?.price || 0), 0);

  const stats = [
    ["Bookings",    myBookings.length,                                   "📅", "text-primary"],
    ["Favorites",   myFavs.length,                                       "❤️", "text-destructive"],
    ["Total Spent", `$${spent.toLocaleString()}`,                        "💰", "text-[#6DBF7B]"],
    ["Status",      user.role === "admin" ? "Admin" : "VIP Fan",         "👑", "text-[#D4A84B]"],
  ];

  return (
    <div className="pt-16 min-h-screen max-w-4xl mx-auto px-7 pb-12">
      {/* Header */}
      <div className="mb-8 mt-8">
        <div className="text-primary text-[11px] tracking-[3px] font-bold mb-2.5 uppercase">My Account</div>
        <h1 className="text-[clamp(24px,4vw,44px)] font-serif text-foreground font-bold mb-1.5">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-sm">
          {user.email} • {user.role === "admin" ? "🔑 Administrator" : "✨ Fan Account"}
        </p>
      </div>

      {/* Stats */}
      <div className={cn("grid gap-3.5 mb-8", isMobile ? "grid-cols-2" : "grid-cols-4")}>
        {stats.map(([label, value, icon, colorClass]) => (
          <Card key={label} className="p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <div className={cn("text-[clamp(18px,2.5vw,26px)] font-bold font-serif mb-1", colorClass)}>{value}</div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wide">{label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {[["bookings", "📅 My Bookings"], ["favorites", "❤️ Favorites"], ["profile", "👤 Profile"]].map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "bg-transparent border-0 border-b-2 -mb-px cursor-pointer text-[13px] font-sans px-5 py-3 transition-all",
              tab === t ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Bookings */}
      {tab === "bookings" && (
        myBookings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-foreground mb-1.5 font-medium">No bookings yet</div>
            <div className="text-sm mb-6">Discover and book your favorite celebrities</div>
            <Button onClick={() => setPage("celebrities")}>Browse Celebrities →</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myBookings.map(b => (
              <Card key={b.id}>
                <CardContent className="p-5 flex justify-between items-center flex-wrap gap-3.5">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={b.celeb.img || avatar(b.celeb.name)} alt={b.celeb.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                      onError={e => e.target.src = avatar(b.celeb.name)}
                    />
                    <div>
                      <div className="text-foreground font-semibold text-[15px]">{b.celeb.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {b.type} • {new Date(b.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      {b.form?.date && <div className="text-muted-foreground text-[11px] mt-0.5">Event date: {b.form.date}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-bold text-[15px]">
                      ${(b.amount || b.celeb?.price || 0).toLocaleString()}
                    </span>
                    <Badge
                      variant={b.status === "approved" ? "success" : b.status === "declined" ? "destructive" : "amber"}
                    >
                      {(b.status || "pending").toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Favorites */}
      {tab === "favorites" && (
        myFavs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">💔</div>
            <div className="text-foreground mb-1.5 font-medium">No favorites yet</div>
            <div className="text-sm mb-6">Browse celebrities and tap the heart to save them</div>
            <Button onClick={() => setPage("celebrities")}>Browse Celebrities →</Button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
            {myFavs.map(c => (
              <Card
                key={c.id}
                onClick={() => onView(c)}
                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              >
                <img
                  src={c.img || avatar(c.name)} alt={c.name}
                  className="w-full h-32 object-cover"
                  onError={e => e.target.src = avatar(c.name)}
                />
                <CardContent className="p-3">
                  <div className="text-foreground text-sm font-semibold">{c.name}</div>
                  <div className="text-primary text-xs mt-1 font-bold">${c.price.toLocaleString()}</div>
                  <Badge variant={c.avail ? "success" : "destructive"} className="mt-1.5 text-[9px]">
                    {c.avail ? "AVAILABLE" : "BOOKED"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Profile */}
      {tab === "profile" && (
        <Card className="max-w-lg p-7">
          <h3 className="text-foreground font-serif text-2xl mb-5">Profile Information</h3>
          {[
            ["Full Name",    user.name],
            ["Email Address", user.email],
            ["Account Type", user.role === "admin" ? "🔑 Administrator" : "✨ Fan Account"],
            ["Member Since", new Date(user.id).toLocaleDateString("en-US", { month: "long", year: "numeric" })],
            ["Bookings Made", myBookings.length],
            ["Total Spent",  `$${spent.toLocaleString()}`],
          ].map(([k, v], i, arr) => (
            <div key={k}>
              <div className="flex justify-between py-3.5">
                <span className="text-muted-foreground text-sm">{k}</span>
                <span className="text-foreground text-sm font-semibold">{String(v)}</span>
              </div>
              {i < arr.length - 1 && <Separator />}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
