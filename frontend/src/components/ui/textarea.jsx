import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground font-sans placeholder:text-muted-foreground/60 focus:border-primary/60 focus:bg-white/8 focus:outline-none focus:shadow-[0_0_0_3px_rgba(240,191,90,0.12)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
