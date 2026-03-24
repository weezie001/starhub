import { useState, useMemo } from "react";
import { G } from "../lib/tokens.js";
import { CELEBS, CATS } from "../lib/data.js";
import { Btn } from "../components/ui.jsx";
import CelebCard from "../components/CelebCard.jsx";
import { useIsMobile } from "../lib/useIsMobile.js";

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

  const FilterContent = () => (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: G.muted, fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Category</div>
        {[{ id: "all", name: "All Talent", icon: "◼" }, ...CATS].map(c => (
          <button key={c.id} onClick={() => { setCat(c.id); if (isMobile) setFiltersOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: cat === c.id ? `${G.gold}15` : "none", border: cat === c.id ? `1px solid ${G.gold}30` : "1px solid transparent", borderRadius: 8, padding: "9px 12px", cursor: "pointer", color: cat === c.id ? G.gold : G.muted, fontSize: 13, fontFamily: G.sans, fontWeight: cat === c.id ? 700 : 400, marginBottom: 4, textAlign: "left", transition: "all 0.2s" }}>
            <span style={{ fontSize: 11 }}>{c.icon || "◼"}</span> {c.name}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ color: G.muted, fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Max Budget</div>
        <input type="range" min={1000} max={20000} step={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: "100%", accentColor: G.gold }} />
        <div style={{ color: G.text, fontSize: 13, fontWeight: 700, marginTop: 6 }}>${maxPrice.toLocaleString()}</div>
      </div>

      <div>
        <div style={{ color: G.muted, fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Availability</div>
        <button onClick={() => setAvailOnly(!availOnly)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: availOnly ? `${G.green}15` : "none", border: availOnly ? `1px solid ${G.green}30` : `1px solid ${G.border}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", color: availOnly ? G.green : G.muted, fontSize: 13, fontFamily: G.sans, fontWeight: availOnly ? 700 : 400, transition: "all 0.2s" }}>
          <span style={{ fontSize: 11 }}>✓</span> Available only
        </button>
      </div>

      {hasActiveFilters && (
        <Btn onClick={() => { setCat("all"); setAvailOnly(false); setMaxPrice(20000); }} variant="ghost" style={{ width: "100%", marginTop: 20, padding: "8px 0", fontSize: 11 }}>
          Clear Filters
        </Btn>
      )}
    </>
  );

  return (
    <div style={{ paddingTop: 68, minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row" }}>

      {/* ── MOBILE FILTER TOGGLE BAR ── */}
      {isMobile && (
        <div style={{ background: G.s1, borderBottom: `1px solid ${G.border}`, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setFiltersOpen(o => !o)} style={{
            background: filtersOpen ? `${G.gold}15` : G.card,
            border: `1px solid ${filtersOpen ? G.gold + "50" : G.border}`,
            color: filtersOpen ? G.gold : G.muted,
            borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13,
            fontFamily: G.sans, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
          }}>
            ⚙ Filters {hasActiveFilters ? `(${[cat !== "all", availOnly, maxPrice < 20000].filter(Boolean).length})` : ""}
          </button>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search talent..." style={{ flex: 1, background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 14px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans }} />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 10px", color: G.muted, fontSize: 12, outline: "none", cursor: "pointer", fontFamily: G.sans }}>
            <option value="featured">Featured</option>
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </div>
      )}

      {/* ── MOBILE FILTER DRAWER ── */}
      {isMobile && filtersOpen && (
        <div style={{ background: G.s1, borderBottom: `1px solid ${G.border}`, padding: "20px 16px" }}>
          <FilterContent />
        </div>
      )}

      {/* ── DESKTOP LEFT SIDEBAR ── */}
      {!isMobile && (
        <aside style={{ width: 220, flexShrink: 0, background: G.s1, borderRight: `1px solid ${G.border}`, padding: "36px 24px", position: "sticky", top: 68, height: "calc(100vh - 68px)", overflowY: "auto" }}>
          <FilterContent />
        </aside>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: isMobile ? "24px 16px" : "36px 36px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: G.gold, fontSize: 10, letterSpacing: 3, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>The Stage is Yours</div>
          <h1 style={{ fontSize: "clamp(24px,4vw,52px)", fontFamily: G.serif, color: G.text, margin: "0 0 10px", fontWeight: 700, lineHeight: 1.05 }}>Elite Talent Discovery.</h1>
          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>{filtered.length} Stars available</p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search talent..." style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 50, padding: "9px 18px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans, width: 200 }} />
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: G.s1, border: `1px solid ${G.border}`, borderRadius: 50, padding: "9px 16px", color: G.muted, fontSize: 12, outline: "none", cursor: "pointer", fontFamily: G.sans }}>
                  <option value="featured">Sort: Featured</option>
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>
            </div>
          )}
          {isMobile && <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>{filtered.length} Stars available</p>}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: G.muted }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, marginBottom: 8, color: G.text }}>No celebrities match your filters</div>
            <div style={{ fontSize: 13 }}>Try adjusting your search or clearing filters</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(250px,1fr))", gap: isMobile ? 14 : 22 }}>
            {filtered.map(c => <CelebCard key={c.id} c={c} onView={onView} onBook={onBook} onFav={onFav} isFav={favorites.includes(c.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}
