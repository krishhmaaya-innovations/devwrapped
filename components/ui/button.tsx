import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-white shadow-md hover:bg-[var(--accent-hover)] hover:shadow-lg active:scale-[0.98]",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-600 active:scale-[0.98]",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-[var(--accent)]",
        secondary:
          "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-tertiary)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
