import { useState, useEffect } from "react";
import { Check, Crown, Lightning, Sparkle } from "@phosphor-icons/react";
import { api } from "../api.js";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";

const TIER_META = {
  free: {
    label: "Free",
    icon: Sparkle,
    color: "text-muted-foreground",
    border: "border-border",
    bg: "bg-card",
    badge: null,
  },
  premium: {
    label: "Premium",
    sublabel: "VIP",
    icon: Crown,
    color: "text-amber-400",
    border: "border-amber-400/40",
    bg: "bg-card",
    badge: "Most Popular",
    badgeVariant: "warning",
  },
  platinum: {
    label: "Platinum",
    sublabel: "Executive",
    icon: Lightning,
    color: "text-sky-300",
    border: "border-sky-400/40",
    bg: "bg-card",
    badge: "Best Value",
    badgeVariant: "default",
  },
};

export default function PricingPage({ user, setPage, onAuth, onUpgrade }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlans().then(p => { setPlans(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function handleSelect(tier) {
    if (!user) { onAuth("register"); return; }
    if (tier === "free") return;
    onUpgrade?.(tier, plans.find(p => p.tier === tier));
  }

  const userPlan = user?.plan || "free";

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-primary text-[11px] tracking-[3px] font-bold mb-3 uppercase font-sans">Membership Plans</div>
        <h1 className="text-[clamp(28px,4vw,52px)] font-serif text-foreground font-bold mb-4">
          Choose Your Experience
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
          From casual browsing to dedicated concierge access — unlock the level of celebrity connection that suits you.
        </p>
      </div>

      {/* Plans */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading plans…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const meta = TIER_META[plan.tier] || TIER_META.free;
            const Icon = meta.icon;
            const isCurrent = userPlan === plan.tier;
            const isUpgrade = plan.tier !== "free" && (
              (plan.tier === "premium" && userPlan === "free") ||
              (plan.tier === "platinum" && userPlan !== "platinum")
            );

            return (
              <div
                key={plan.tier}
                className={`relative rounded-2xl border ${meta.border} ${meta.bg} p-6 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.15)] ${plan.tier === "premium" ? "md:-translate-y-2" : ""} transition-transform`}
              >
                {meta.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant={meta.badgeVariant} className="text-[10px] px-3 py-1 shadow-lg">
                      {meta.badge}
                    </Badge>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${plan.tier === "platinum" ? "bg-sky-400/10" : plan.tier === "premium" ? "bg-amber-400/10" : "bg-white/5"}`}>
                    <Icon size={20} className={meta.color} weight="fill" />
                  </div>
                  <div className={`text-xl font-serif font-bold ${meta.color}`}>
                    {meta.label}
                    {meta.sublabel && <span className="text-sm font-sans font-normal text-muted-foreground ml-1.5">/ {meta.sublabel}</span>}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <div className="text-[clamp(28px,3vw,36px)] font-serif font-bold text-foreground">Free</div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-[clamp(28px,3vw,36px)] font-serif font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground text-sm mb-1.5">/{plan.billingCycle || "mo"}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check size={14} className="text-primary mt-0.5 shrink-0" weight="bold" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="rounded-xl border border-border bg-white/5 py-2.5 text-center text-sm text-muted-foreground font-semibold font-sans">
                    ✓ Current Plan
                  </div>
                ) : plan.tier === "free" ? (
                  <div className="rounded-xl border border-border bg-white/5 py-2.5 text-center text-sm text-muted-foreground font-sans">
                    Default
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSelect(plan.tier)}
                    className={`w-full ${plan.tier === "platinum" ? "bg-sky-500/20 border border-sky-400/40 text-sky-300 hover:bg-sky-500/30" : ""}`}
                    variant={plan.tier === "premium" ? "default" : "outline"}
                  >
                    {isUpgrade ? `Upgrade to ${meta.label}` : `Get ${meta.label}`} →
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ note */}
      <div className="mt-12 text-center text-muted-foreground text-sm">
        <p>All plans include access to StarBook's global celebrity network.</p>
        <p className="mt-1">
          Questions?{" "}
          <button onClick={() => setPage("contact")} className="text-primary underline bg-transparent border-none cursor-pointer font-sans">
            Contact our team
          </button>
        </p>
      </div>
    </div>
  );
}
