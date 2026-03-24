import { useState, useEffect } from "react";
import { G } from "../lib/tokens.js";
import { useIsMobile } from "../lib/useIsMobile.js";
import { api } from "../api.js";

const CATS = ["All", "Event Planning", "Trends", "Insights", "How It Works", "Strategy"];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function BlogCard({ post, onClick, featured }) {
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();

  if (featured) {
    return (
      <div onClick={() => onClick(post)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer", borderRadius: 20, overflow: "hidden", background: G.card, border: `1px solid ${hovered ? G.gold + "50" : G.border}`, transition: "all 0.3s", boxShadow: hovered ? `0 20px 60px #00000060` : `0 4px 20px #00000030`, display: isMobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: isMobile ? undefined : "1.2fr 1fr" }}>
        <div style={{ position: "relative", height: isMobile ? 220 : "100%", minHeight: isMobile ? undefined : 380 }}>
          <img src={post.img} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", transform: hovered ? "scale(1.03)" : "scale(1)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, " + G.card + ")" }} />
          <div style={{ position: "absolute", top: 20, left: 20 }}>
            <span style={{ background: G.gold, color: "#1a1000", borderRadius: 50, padding: "5px 16px", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>Featured</span>
          </div>
        </div>
        <div style={{ padding: isMobile ? "24px 20px" : "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ background: `${G.gold}18`, color: G.gold, border: `1px solid ${G.gold}30`, borderRadius: 50, padding: "4px 14px", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{post.category}</span>
            <span style={{ color: G.dim, fontSize: 12 }}>{post.readTime}</span>
          </div>
          <h2 style={{ fontFamily: G.serif, fontSize: isMobile ? 22 : 30, fontWeight: 800, color: G.cream, margin: "0 0 16px", lineHeight: 1.2 }}>{post.title}</h2>
          <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.8, margin: "0 0 28px" }}>{post.excerpt}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: G.text, fontSize: 13, fontWeight: 600 }}>{post.author}</div>
              <div style={{ color: G.dim, fontSize: 11, marginTop: 2 }}>{formatDate(post.date)}</div>
            </div>
            <span style={{ color: G.gold, fontSize: 13, fontWeight: 700 }}>Read Article →</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onClick(post)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", borderRadius: 16, overflow: "hidden", background: G.card, border: `1px solid ${hovered ? G.gold + "40" : G.border}`, transition: "all 0.3s", transform: hovered ? "translateY(-4px)" : "none", boxShadow: hovered ? `0 16px 40px #00000050` : "none", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img src={post.img} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, " + G.card + "90 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", top: 14, left: 14 }}>
          <span style={{ background: `${G.gold}22`, color: G.gold, border: `1px solid ${G.gold}35`, backdropFilter: "blur(8px)", borderRadius: 50, padding: "4px 12px", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{post.category}</span>
        </div>
      </div>
      <div style={{ padding: "24px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 700, color: G.cream, margin: "0 0 12px", lineHeight: 1.3, flex: 1 }}>{post.title}</h3>
        <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 20px" }}>{post.excerpt.slice(0, 110)}...</p>
        <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: G.text, fontSize: 12, fontWeight: 600 }}>{post.author}</div>
            <div style={{ color: G.dim, fontSize: 11, marginTop: 1 }}>{formatDate(post.date)} · {post.readTime}</div>
          </div>
          <span style={{ color: G.gold, fontSize: 12, fontWeight: 700 }}>Read →</span>
        </div>
      </div>
    </div>
  );
}

function BlogPost({ post, onBack }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ paddingTop: 68, minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: isMobile ? 260 : 480, overflow: "hidden" }}>
        <img src={post.img} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${G.bg}44 0%, ${G.bg}cc 70%, ${G.bg} 100%)` }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "24px 20px" : "48px 60px", maxWidth: 860, margin: "0 auto" }}>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "0 20px 60px" : "0 40px 80px" }}>
        {/* Back */}
        <button onClick={onBack} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: G.sans, display: "flex", alignItems: "center", gap: 6, padding: "24px 0", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = G.muted}>
          ← Back to Blog
        </button>

        {/* Meta */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ background: `${G.gold}18`, color: G.gold, border: `1px solid ${G.gold}30`, borderRadius: 50, padding: "5px 16px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>{post.category}</span>
          <span style={{ color: G.dim, fontSize: 12 }}>{post.readTime}</span>
          <span style={{ color: G.dim, fontSize: 12 }}>·</span>
          <span style={{ color: G.dim, fontSize: 12 }}>{formatDate(post.date)}</span>
        </div>

        <h1 style={{ fontFamily: G.serif, fontSize: isMobile ? 28 : 44, fontWeight: 800, color: G.cream, margin: "0 0 24px", lineHeight: 1.15 }}>{post.title}</h1>

        <p style={{ color: G.muted, fontSize: isMobile ? 15 : 18, lineHeight: 1.8, margin: "0 0 36px", fontStyle: "italic", borderLeft: `3px solid ${G.gold}`, paddingLeft: 20 }}>{post.excerpt}</p>

        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", background: G.s1, borderRadius: 12, border: `1px solid ${G.border}`, marginBottom: 48 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${G.gold}40, ${G.goldD}20)`, border: `1px solid ${G.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✍️</div>
          <div>
            <div style={{ color: G.text, fontWeight: 700, fontSize: 14 }}>{post.author}</div>
            <div style={{ color: G.dim, fontSize: 12, marginTop: 2 }}>{post.authorRole}</div>
          </div>
        </div>

        {/* Body */}
        <div>
          {post.content.map((block, i) => {
            if (block.type === "h2") return (
              <h2 key={i} style={{ fontFamily: G.serif, fontSize: isMobile ? 22 : 28, fontWeight: 700, color: G.cream, margin: "44px 0 16px", lineHeight: 1.2 }}>{block.text}</h2>
            );
            if (block.type === "p") return (
              <p key={i} style={{ color: G.muted, fontSize: isMobile ? 15 : 16, lineHeight: 2, margin: "0 0 22px" }}>{block.text}</p>
            );
            return null;
          })}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: 60, padding: isMobile ? "28px 24px" : "44px 48px", background: `linear-gradient(135deg, ${G.gold}12, ${G.gold}06)`, border: `1px solid ${G.gold}25`, borderRadius: 20, textAlign: "center" }}>
          <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Ready to Book?</div>
          <h3 style={{ fontFamily: G.serif, fontSize: isMobile ? 22 : 28, fontWeight: 700, color: G.cream, margin: "0 0 12px" }}>Turn Inspiration into Action</h3>
          <p style={{ color: G.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>Browse our roster of 500+ verified celebrities and start your booking today.</p>
          <button onClick={onBack} style={{ background: `linear-gradient(45deg, ${G.gold}, ${G.goldD})`, color: "#1a1000", border: "none", borderRadius: 50, padding: "13px 36px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: G.sans, letterSpacing: 0.8 }}>
            Browse Celebrities →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlogsPage() {
  const [selected, setSelected] = useState(null);
  const [activeCat, setActiveCat] = useState("All");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    api.getBlogs().then(data => { setBlogs(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (selected) {
    return <BlogPost post={selected} onBack={() => setSelected(null)} />;
  }

  const featured = blogs.filter(b => b.feat);
  const filtered = activeCat === "All" ? blogs : blogs.filter(b => b.category === activeCat);

  return (
    <div style={{ paddingTop: 68, minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ padding: isMobile ? "48px 20px 40px" : "80px 60px 60px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>StraBook Journal</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: G.serif, fontSize: isMobile ? 32 : 52, fontWeight: 800, color: G.cream, margin: "0 0 12px", lineHeight: 1.05 }}>Insights & Stories</h1>
            <p style={{ color: G.muted, fontSize: 15, margin: 0, maxWidth: 480, lineHeight: 1.7 }}>Expert advice on celebrity bookings, event planning, and the business of star power.</p>
          </div>
        </div>

        {/* Category filter */}
        {loading ? (
          <div style={{ color: G.muted, fontSize: 13 }}>Loading articles...</div>
        ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} style={{
              background: activeCat === cat ? G.gold : "none",
              color: activeCat === cat ? "#1a1000" : G.muted,
              border: `1px solid ${activeCat === cat ? G.gold : G.border}`,
              borderRadius: 50, padding: "8px 18px", cursor: "pointer",
              fontSize: 12, fontWeight: activeCat === cat ? 700 : 500,
              fontFamily: G.sans, transition: "all 0.2s",
            }}>
              {cat}
            </button>
          ))}
        </div>
        )}
      </section>

      {/* Featured posts (only when showing All) */}
      {activeCat === "All" && featured.length > 0 && (
        <section style={{ padding: isMobile ? "0 20px 48px" : "0 60px 60px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {featured.map(post => (
              <BlogCard key={post.id} post={post} onClick={setSelected} featured />
            ))}
          </div>
        </section>
      )}

      {/* All posts grid */}
      <section style={{ padding: isMobile ? "0 20px 80px" : "0 60px 100px", maxWidth: 1280, margin: "0 auto" }}>
        {activeCat === "All" && (
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
            <h2 style={{ fontFamily: G.serif, fontSize: isMobile ? 22 : 32, fontWeight: 700, color: G.cream, margin: 0, whiteSpace: "nowrap" }}>All Articles</h2>
            <div style={{ height: 1, background: G.border, flex: 1 }} />
          </div>
        )}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: G.muted }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
            <div style={{ color: G.text, fontSize: 16, marginBottom: 8 }}>No articles in this category yet</div>
            <button onClick={() => setActiveCat("All")} style={{ background: "none", border: "none", color: G.gold, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>View all articles →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: isMobile ? 20 : 28 }}>
            {(activeCat === "All" ? blogs : filtered).map(post => (
              <BlogCard key={post.id} post={post} onClick={setSelected} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
