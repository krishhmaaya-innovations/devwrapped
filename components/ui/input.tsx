import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      suppressHydrationWarning
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
