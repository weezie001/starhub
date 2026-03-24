import { useState, useMemo } from "react";
import { G } from "../lib/tokens.js";
import { CELEBS, CATS } from "../lib/data.js";
import { Button } from "../components/ui/button.jsx";
import CelebCard from "../components/CelebCard.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";
import { cn } from "../lib/utils.js";

export default function CelebritiesPage({ onView, onBook, favorites, onFav }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    let list = CELEBS.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.country.toLowerCase().includes(search.toLowerCase()) && !c.cat.toLowerCase().includes(search.toLowerCase())) return false;
      if (cat !== "all" && c.cat !== cat) return false;
      if (c.price > maxPrice) return false;
      if (availOnly && !c.avail) return false;
      return true;
    });
    if (sort === "featured") list = [...list].sort((a, b) => (b.feat ? 1 : 0) - (a.feat ? 1 : 0));
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "reviews") list = [...list].sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [search, cat, maxPrice, availOnly, sort]);

  const hasActiveFilters = cat !== "all" || availOnly || maxPrice < 20000;
  const activeFilterCount = [cat !== "all", availOnly, maxPrice < 20000].filter(Boolean).length;

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
          type="range" min={1000} max={20000} step={500} value={maxPrice}
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
          onClick={() => { setCat("all"); setAvailOnly(false); setMaxPrice(20000); }}
          variant="ghost"
          className="w-full mt-5 text-[11px]"
        >
          Clear Filters
        </Button>
      )}
    </>
  );

  return (
    <div className={cn("pt-[68px] min-h-screen flex", isMobile ? "flex-col" : "flex-row")}>

      {/* Mobile filter toggle bar */}
      {isMobile && (
        <div className="bg-background border-b border-border px-4 py-3 flex gap-2.5 items-center">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={cn(
              "rounded-lg px-4 py-2 cursor-pointer text-[13px] font-sans font-semibold flex items-center gap-2 border transition-all",
              filtersOpen ? "bg-primary/10 border-primary/50 text-primary" : "bg-card border-border text-muted-foreground"
            )}
          >
            ⚙ Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </button>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search talent..."
            className="flex-1 bg-card border border-border rounded-lg px-3.5 py-2 text-foreground text-[13px] outline-none font-sans placeholder:text-muted-foreground"
          />
          <select
            value={sort} onChange={e => setSort(e.target.value)}
            className="bg-card border border-border rounded-lg px-2.5 py-2 text-muted-foreground text-[12px] outline-none cursor-pointer font-sans"
          >
            <option value="featured">Featured</option>
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviews</option>
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
      <div className={cn("flex-1", isMobile ? "px-4 py-6" : "px-9 py-9")}>
        <div className="mb-7">
          <div className="text-primary text-[10px] tracking-[3px] font-bold mb-2 uppercase">The Stage is Yours</div>
          <h1 className="font-serif text-foreground font-bold leading-tight mb-2.5" style={{ fontSize: "clamp(24px,4vw,52px)" }}>
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
          {isMobile && <p className="text-muted-foreground text-[13px] m-0">{filtered.length} Stars available</p>}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-[44px] mb-4">🔍</div>
            <div className="text-[16px] mb-2 text-foreground">No celebrities match your filters</div>
            <div className="text-[13px]">Try adjusting your search or clearing filters</div>
          </div>
        ) : (
          <div className={cn(
            "grid gap-[14px]",
            isMobile ? "grid-cols-2" : "grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[22px]"
          )}>
            {filtered.map(c => <CelebCard key={c.id} c={c} onView={onView} onBook={onBook} onFav={onFav} isFav={favorites.includes(c.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}
