import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold tracking-wider uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] font-sans select-none",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-gradient-to-br from-[#f5cc6a] via-[#e8a830] to-[#c98a10] text-[#1a0f00] shadow-[0_4px_24px_rgba(240,191,90,0.45)] hover:shadow-[0_6px_32px_rgba(240,191,90,0.6)] hover:brightness-110 hover:-translate-y-0.5",
        outline:
          "rounded-full bg-transparent text-primary border-2 border-primary/60 hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_16px_rgba(240,191,90,0.2)]",
        ghost:
          "rounded-xl bg-secondary text-foreground border border-border hover:bg-secondary/80 hover:border-border/80",
        danger:
          "rounded-full bg-destructive/15 text-destructive border border-destructive/40 hover:bg-destructive/25 hover:shadow-[0_0_16px_rgba(224,64,64,0.25)]",
        success:
          "rounded-full bg-[#6DBF7B]/15 text-[#6DBF7B] border border-[#6DBF7B]/40 hover:bg-[#6DBF7B]/25",
        dark:
          "rounded-xl bg-secondary text-foreground border border-border hover:bg-secondary/60",
        link:
          "text-primary underline-offset-4 hover:underline rounded-none p-0 h-auto uppercase tracking-normal",
      },
      size: {
        default: "h-11 px-7 text-[12px]",
        sm:      "h-8 px-5 text-[11px]",
        lg:      "h-13 px-10 text-[13px]",
        icon:    "h-9 w-9 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
