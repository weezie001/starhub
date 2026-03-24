import { useState, useEffect } from "react";
import { useIsMobile } from "../lib/useIsMobile.js";
import { api } from "../api.js";
import { cn } from "../lib/utils.js";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";

const CATS = ["All", "Event Planning", "Trends", "Insights", "How It Works", "Strategy"];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function BlogCard({ post, onClick, featured }) {
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();

  if (featured) {
    return (
      <div
        onClick={() => onClick(post)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "cursor-pointer rounded-2xl overflow-hidden bg-card border transition-all duration-300",
          "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
          hovered
            ? "border-primary/40 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            : "border-white/8",
          isMobile ? "flex flex-col" : "grid"
        )}
        style={!isMobile ? { gridTemplateColumns: "1.2fr 1fr" } : undefined}
      >
        {/* Image side */}
        <div
          className="relative overflow-hidden"
          style={{
            height: isMobile ? 220 : "100%",
            minHeight: isMobile ? undefined : 380,
          }}
        >
          <img
            src={post.img}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? "scale(1.03)" : "scale(1)" }}
          />
          {/* Gradient overlay toward card bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/90" />
          {/* Featured badge */}
          <div className="absolute top-5 left-5">
            <span className="bg-primary text-[#1a1000] rounded-full px-4 py-1 text-[10px] font-extrabold tracking-[1.5px] uppercase">
              Featured
            </span>
          </div>
        </div>

        {/* Content side */}
        <div
          className={cn(
            "flex flex-col justify-center",
            isMobile ? "px-5 py-6" : "px-10 py-11"
          )}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <span className="bg-primary/10 text-primary border border-primary/30 rounded-full px-3.5 py-1 text-[10px] font-bold tracking-[1px] uppercase">
              {post.category}
            </span>
            <span className="text-muted-foreground/60 text-xs">{post.readTime}</span>
          </div>

          <h2
            className={cn(
              "font-serif font-extrabold text-foreground leading-tight mb-4",
              isMobile ? "text-[22px]" : "text-[30px]"
            )}
          >
            {post.title}
          </h2>

          <p className="text-muted-foreground text-sm leading-[1.8] mb-7">{post.excerpt}</p>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-foreground text-[13px] font-semibold">{post.author}</div>
              <div className="text-muted-foreground/60 text-[11px] mt-0.5">{formatDate(post.date)}</div>
            </div>
            <span className="text-primary text-[13px] font-bold">Read Article →</span>
          </div>
        </div>
      </div>
    );
  }

  // Regular card
  return (
    <div
      onClick={() => onClick(post)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "cursor-pointer rounded-2xl overflow-hidden bg-card border flex flex-col",
        "transition-all duration-300",
        hovered
          ? "border-primary/40 -translate-y-1 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          : "border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      )}
    >
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden flex-shrink-0">
        <img
          src={post.img}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        <div className="absolute top-3.5 left-3.5">
          <span className="bg-primary/[0.13] text-primary border border-primary/[0.21] backdrop-blur-sm rounded-full px-3 py-1 text-[9px] font-bold tracking-[1px] uppercase">
            {post.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-[22px] py-6 flex flex-col flex-1">
        <h3 className="font-serif text-[18px] font-bold text-foreground leading-snug mb-3 flex-1">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-[13px] leading-[1.7] mb-5">
          {post.excerpt.slice(0, 110)}...
        </p>
        <div className="border-t border-white/8 pt-4 flex items-center justify-between">
          <div>
            <div className="text-foreground text-xs font-semibold">{post.author}</div>
            <div className="text-muted-foreground/60 text-[11px] mt-px">
              {formatDate(post.date)} · {post.readTime}
            </div>
          </div>
          <span className="text-primary text-xs font-bold">Read →</span>
        </div>
      </div>
    </div>
  );
}

function BlogPost({ post, onBack }) {
  const isMobile = useIsMobile();

  return (
    <div className="pt-[68px] min-h-screen">
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ height: isMobile ? 260 : 480 }}
      >
        <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/27 via-background/80 to-background" />
        <div
          className="absolute bottom-0 left-0 right-0 max-w-[860px] mx-auto"
          style={{ padding: isMobile ? "24px 20px" : "48px 60px" }}
        />
      </div>

      {/* Content */}
      <div
        className="max-w-[760px] mx-auto"
        style={{ padding: isMobile ? "0 20px 60px" : "0 40px 80px" }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="group flex items-center gap-1.5 py-6 text-[13px] font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer"
        >
          ← Back to Blog
        </button>

        {/* Meta */}
        <div className="flex items-center gap-2.5 mb-5 flex-wrap">
          <span className="bg-primary/10 text-primary border border-primary/30 rounded-full px-4 py-1 text-[10px] font-bold tracking-[1.5px] uppercase">
            {post.category}
          </span>
          <span className="text-muted-foreground/60 text-xs">{post.readTime}</span>
          <span className="text-muted-foreground/60 text-xs">·</span>
          <span className="text-muted-foreground/60 text-xs">{formatDate(post.date)}</span>
        </div>

        <h1
          className={cn(
            "font-serif font-extrabold text-foreground leading-[1.15] mb-6",
            isMobile ? "text-[28px]" : "text-[44px]"
          )}
        >
          {post.title}
        </h1>

        <p
          className={cn(
            "text-muted-foreground leading-[1.8] mb-9 italic border-l-[3px] border-primary pl-5",
            isMobile ? "text-[15px]" : "text-[18px]"
          )}
        >
          {post.excerpt}
        </p>

        {/* Author card */}
        <div className="flex items-center gap-3.5 px-6 py-5 bg-background rounded-xl border border-white/8 mb-12">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/30 flex items-center justify-center text-lg flex-shrink-0">
            ✍️
          </div>
          <div>
            <div className="text-foreground font-bold text-[14px]">{post.author}</div>
            <div className="text-muted-foreground/60 text-xs mt-0.5">{post.authorRole}</div>
          </div>
        </div>

        {/* Body */}
        <div>
          {post.content.map((block, i) => {
            if (block.type === "h2") return (
              <h2
                key={i}
                className={cn(
                  "font-serif font-bold text-foreground leading-tight mt-11 mb-4",
                  isMobile ? "text-[22px]" : "text-[28px]"
                )}
              >
                {block.text}
              </h2>
            );
            if (block.type === "p") return (
              <p
                key={i}
                className={cn(
                  "text-muted-foreground leading-[2] mb-[22px]",
                  isMobile ? "text-[15px]" : "text-[16px]"
                )}
              >
                {block.text}
              </p>
            );
            return null;
          })}
        </div>

        {/* Footer CTA */}
        <div
          className={cn(
            "mt-[60px] rounded-2xl border border-primary/25 text-center",
            "bg-gradient-to-br from-primary/[0.07] to-primary/[0.04]",
            isMobile ? "px-6 py-7" : "px-12 py-11"
          )}
        >
          <div className="text-primary text-[11px] tracking-[3px] font-bold mb-3 uppercase">
            Ready to Book?
          </div>
          <h3
            className={cn(
              "font-serif font-bold text-foreground mb-3",
              isMobile ? "text-[22px]" : "text-[28px]"
            )}
          >
            Turn Inspiration into Action
          </h3>
          <p className="text-muted-foreground text-sm mb-6 leading-[1.7]">
            Browse our roster of 500+ verified celebrities and start your booking today.
          </p>
          <Button onClick={onBack} variant="default" className="rounded-full px-9 py-3 text-[13px] font-extrabold tracking-[0.8px]">
            Browse Celebrities →
          </Button>
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
    <div className="pt-[68px] min-h-screen">
      {/* Header */}
      <section
        className="mx-auto max-w-[1280px]"
        style={{ padding: isMobile ? "48px 20px 40px" : "80px 60px 60px" }}
      >
        <div className="text-primary text-[11px] tracking-[3px] font-bold mb-3.5 uppercase">
          StarBook Journal
        </div>
        <div className="flex justify-between items-end flex-wrap gap-5 mb-10">
          <div>
            <h1
              className={cn(
                "font-serif font-extrabold text-foreground leading-[1.05] mb-3",
                isMobile ? "text-[32px]" : "text-[52px]"
              )}
            >
              Insights & Stories
            </h1>
            <p className="text-muted-foreground text-[15px] max-w-[480px] leading-[1.7]">
              Expert advice on celebrity bookings, event planning, and the business of star power.
            </p>
          </div>
        </div>

        {/* Category filter pills */}
        {loading ? (
          <div className="text-muted-foreground text-[13px]">Loading articles...</div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {CATS.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "rounded-full px-[18px] py-2 text-xs border transition-all duration-200 cursor-pointer bg-transparent",
                  activeCat === cat
                    ? "bg-primary text-[#1a1000] border-primary font-bold"
                    : "text-muted-foreground border-border font-medium hover:border-primary/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured posts (only when showing All) */}
      {activeCat === "All" && featured.length > 0 && (
        <section
          className="mx-auto max-w-[1280px]"
          style={{ padding: isMobile ? "0 20px 48px" : "0 60px 60px" }}
        >
          <div className="flex flex-col gap-6">
            {featured.map(post => (
              <BlogCard key={post.id} post={post} onClick={setSelected} featured />
            ))}
          </div>
        </section>
      )}

      {/* All posts grid */}
      <section
        className="mx-auto max-w-[1280px]"
        style={{ padding: isMobile ? "0 20px 80px" : "0 60px 100px" }}
      >
        {activeCat === "All" && (
          <div className="flex items-center gap-5 mb-9">
            <h2
              className={cn(
                "font-serif font-bold text-foreground whitespace-nowrap",
                isMobile ? "text-[22px]" : "text-[32px]"
              )}
            >
              All Articles
            </h2>
            <div className="h-px bg-border flex-1" />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20 px-5">
            <div className="text-[40px] mb-3.5">📭</div>
            <div className="text-foreground text-base mb-2">No articles in this category yet</div>
            <button
              onClick={() => setActiveCat("All")}
              className="bg-transparent border-none text-primary cursor-pointer text-[13px] font-bold"
            >
              View all articles →
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-5",
              isMobile ? "grid-cols-1" : "grid-cols-[repeat(auto-fill,minmax(320px,1fr))]"
            )}
            style={!isMobile ? { gap: 28 } : undefined}
          >
            {(activeCat === "All" ? blogs : filtered).map(post => (
              <BlogCard key={post.id} post={post} onClick={setSelected} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
