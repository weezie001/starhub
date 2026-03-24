import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[1.5px] uppercase transition-all border",
  {
    variants: {
      variant: {
        default:
          "border-primary/40 bg-primary/15 text-primary shadow-[0_0_10px_rgba(240,191,90,0.2)]",
        secondary:
          "border-white/10 bg-white/5 text-muted-foreground",
        destructive:
          "border-destructive/40 bg-destructive/15 text-destructive",
        success:
          "border-[#6DBF7B]/40 bg-[#6DBF7B]/15 text-[#6DBF7B]",
        amber:
          "border-[#D4A84B]/40 bg-[#D4A84B]/15 text-[#D4A84B]",
        outline:
          "border-border bg-transparent text-foreground",
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
