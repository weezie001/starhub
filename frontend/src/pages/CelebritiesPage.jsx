import { useState, useMemo, useEffect } from "react";
import { CATS } from "../lib/data.js";
import { api } from "../api.js";
import { Button } from "../components/ui/button.jsx";
import CelebCard from "../components/CelebCard.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";
import { cn } from "../lib/utils.js";

export default function CelebritiesPage({ onView, onBook, favorites, onFav, user, onAuth }) {
  const [celebs, setCelebs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [priceMax, setPriceMax] = useState(100000);
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    api.getCelebrities()
      .then(data => {
        setCelebs(data);
        const max = Math.max(...data.map(c => c.price || 0), 10000);
        const rounded = Math.ceil(max / 1000) * 1000;
        setPriceMax(rounded);
        setMaxPrice(rounded);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = celebs.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !(c.country || "").toLowerCase().includes(search.toLowerCase()) &&
          !(c.cat || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (cat !== "all" && c.cat !== cat) return false;
      if (c.price > maxPrice) return false;
      if (availOnly && !c.avail) return false;
      return true;
    });
    if (sort === "featured")   list = [...list].sort((a, b) => (b.feat ? 1 : 0) - (a.feat ? 1 : 0));
    if (sort === "price_asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating")     list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "reviews")    list = [...list].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    return list;
  }, [celebs, search, cat, maxPrice, availOnly, sort]);

  const hasActiveFilters = cat !== "all" || availOnly || maxPrice < priceMax;
  const activeFilterCount = [cat !== "all", availOnly, maxPrice < priceMax].filter(Boolean).length;

  const FilterContent = () => (
    <>
      <div className="mb-7">
        <div className="text-muted-foreground text-[10px] tracking-[2px] font-bold mb-3 uppercase">Category</div>
        {[{ id: "all", name: "All Talent", icon: "◼" }, ...CATS].map(c => (
          <button
            key={c.id}
            onClick={() => { setCat(c.id); if (isMobile) setFiltersOpen(false); }}
            className={cn(
              "flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 cursor-pointer text-[13px] font-sans text-left transition-all mb-1 border",
              cat === c.id
                ? "bg-primary/10 border-primary/30 text-primary font-bold"
                : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-[11px]">{c.icon || "◼"}</span> {c.name}
          </button>
        ))}
      </div>

      <div className="mb-7">
        <div className="text-muted-foreground text-[10px] tracking-[2px] font-bold mb-3 uppercase">Max Budget</div>
        <input
          type="range" min={1000} max={priceMax} step={500} value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="text-foreground text-[13px] font-bold mt-1.5">${maxPrice.toLocaleString()}</div>
      </div>

      <div>
        <div className="text-muted-foreground text-[10px] tracking-[2px] font-bold mb-3 uppercase">Availability</div>
        <button
          onClick={() => setAvailOnly(!availOnly)}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 cursor-pointer text-[13px] font-sans transition-all border",
            availOnly
              ? "bg-[#6DBF7B]/10 border-[#6DBF7B]/30 text-[#6DBF7B] font-bold"
              : "bg-transparent border-border text-muted-foreground"
          )}
        >
          <span className="text-[11px]">✓</span> Available only
        </button>
      </div>

      {hasActiveFilters && (
        <Button
          onClick={() => { setCat("all"); setAvailOnly(false); setMaxPrice(priceMax); }}
          variant="ghost"
          className="w-full mt-5 text-[11px]"
        >
          Clear Filters
        </Button>
      )}
    </>
  );

  return (
    <div className="pt-[68px] min-h-screen flex flex-col">

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/8"
        style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #141008 60%, #0d0d0d 100%)" }}>
        {/* Gold glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #f0bf5a 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative max-w-[860px] mx-auto px-5 py-10 sm:py-14 text-center">
          <div className="inline-block text-primary text-[10px] tracking-[3px] font-bold uppercase border border-primary/20 rounded-full px-4 py-1.5 mb-5 bg-primary/5">
            ★ Elite Celebrity Roster
          </div>
          <h1 className="font-serif text-foreground font-bold leading-tight mb-4"
            style={{ fontSize: "clamp(26px, 5vw, 54px)" }}>
            Book the World's<br />Biggest Stars
          </h1>
          <p className="text-muted-foreground text-[14px] sm:text-[15px] leading-relaxed mb-7 max-w-[520px] mx-auto">
            From A-list actors to chart-topping musicians — browse our verified roster and submit a booking request in minutes.
          </p>

          {!user ? (
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => onAuth("register")} className="px-7 py-2.5 text-sm">
                Create Account →
              </Button>
              <Button onClick={() => onAuth("login")} variant="outline" className="px-7 py-2.5 text-sm">
                Sign In
              </Button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 bg-primary/8 border border-primary/20 rounded-full px-5 py-2.5">
              <span className="text-primary text-lg">✦</span>
              <span className="text-foreground text-sm font-semibold">Welcome back, {user.name.split(" ")[0]}</span>
              <span className="text-muted-foreground text-xs">— browse & book below</span>
            </div>
          )}
        </div>
      </div>

      <div className={cn("flex flex-1", isMobile ? "flex-col" : "flex-row")}>

      {/* Mobile filter toggle bar */}
      {isMobile && (
        <div className="bg-background border-b border-border px-3 py-2.5 flex gap-2 items-center">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={cn(
              "rounded-lg px-3 py-2 cursor-pointer text-[12px] font-sans font-semibold flex items-center gap-1.5 border transition-all shrink-0",
              filtersOpen ? "bg-primary/10 border-primary/50 text-primary" : "bg-card border-border text-muted-foreground"
            )}
          >
            ⚙ Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </button>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search talent..."
            className="flex-1 min-w-0 bg-card border border-border rounded-lg px-3 py-2 text-foreground text-[12px] outline-none font-sans placeholder:text-muted-foreground"
          />
          <select
            value={sort} onChange={e => setSort(e.target.value)}
            className="bg-card border border-border rounded-lg px-2 py-2 text-muted-foreground text-[11px] outline-none cursor-pointer font-sans shrink-0"
          >
            <option value="featured">Featured</option>
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </div>
      )}

      {/* Mobile filter drawer */}
      {isMobile && filtersOpen && (
        <div className="bg-background border-b border-border px-4 py-5">
          <FilterContent />
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-[220px] shrink-0 bg-background border-r border-border px-6 py-9 sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto">
          <FilterContent />
        </aside>
      )}

      {/* Main content */}
      <div className={cn("flex-1 min-w-0", isMobile ? "px-3 py-5" : "px-9 py-9")}>
        <div className="mb-5">
          <div className="text-primary text-[10px] tracking-[3px] font-bold mb-2 uppercase">The Stage is Yours</div>
          <h1 className="font-serif text-foreground font-bold leading-tight mb-2.5" style={{ fontSize: "clamp(22px,4vw,52px)" }}>
            Elite Talent Discovery.
          </h1>
          {!isMobile && (
            <div className="flex justify-between items-center flex-wrap gap-3">
              <p className="text-muted-foreground text-[13px] m-0">{filtered.length} Stars available</p>
              <div className="flex gap-2.5 items-center">
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search talent..."
                  className="bg-background border border-border rounded-full px-[18px] py-2.5 text-foreground text-[13px] outline-none font-sans w-[200px] placeholder:text-muted-foreground"
                />
                <select
                  value={sort} onChange={e => setSort(e.target.value)}
                  className="bg-background border border-border rounded-full px-4 py-2.5 text-muted-foreground text-[12px] outline-none cursor-pointer font-sans"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>
            </div>
          )}
          {isMobile && <p className="text-muted-foreground text-[12px] m-0">{filtered.length} stars available</p>}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-card border border-white/8 animate-pulse">
                <div className="h-44 sm:h-64 bg-white/5 rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/5 rounded-full w-3/4" />
                  <div className="h-3 bg-white/5 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-[44px] mb-4">🔍</div>
            <div className="text-[16px] mb-2 text-foreground">No celebrities match your filters</div>
            <div className="text-[13px]">Try adjusting your search or clearing filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map(c => <CelebCard key={c.id} c={c} onView={onView} onBook={onBook} onFav={onFav} isFav={favorites.includes(c.id)} />)}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
