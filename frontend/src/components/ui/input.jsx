import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground font-sans placeholder:text-muted-foreground/60 focus:border-primary/60 focus:bg-white/8 focus:outline-none focus:shadow-[0_0_0_3px_rgba(240,191,90,0.12)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
