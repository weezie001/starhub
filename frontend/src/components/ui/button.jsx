import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 font-sans",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-gold to-gold-dark text-[#261900] shadow-[0_2px_20px_rgba(241,201,125,0.3)] hover:brightness-110",
        outline:
          "bg-transparent text-gold border border-gold/50 hover:bg-gold/10",
        ghost:
          "bg-[#353534]/60 text-foreground border border-border hover:bg-[#353534]",
        danger:
          "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20",
        success:
          "bg-[#6DBF7B]/10 text-[#6DBF7B] border border-[#6DBF7B]/30 hover:bg-[#6DBF7B]/20",
        dark:
          "bg-secondary text-foreground border border-border hover:bg-secondary/80",
        link:
          "text-gold underline-offset-4 hover:underline p-0 h-auto uppercase tracking-normal",
      },
      size: {
        default: "px-7 py-3 text-[13px]",
        sm: "px-5 py-2 text-xs",
        lg: "px-10 py-4 text-sm",
        icon: "h-9 w-9 rounded-full p-0",
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
