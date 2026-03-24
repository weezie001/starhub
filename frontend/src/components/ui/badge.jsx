import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[1.5px] uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "border-gold/30 bg-gold/10 text-gold",
        secondary: "border-border bg-secondary text-muted-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        success: "border-[#6DBF7B]/30 bg-[#6DBF7B]/10 text-[#6DBF7B]",
        amber: "border-[#D4A84B]/30 bg-[#D4A84B]/10 text-[#D4A84B]",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
