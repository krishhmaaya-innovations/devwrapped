"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error service here if needed
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">
        Something went wrong
      </h1>
      <p className="mb-8 max-w-md text-[var(--text-secondary)]">
        An unexpected error occurred. Try refreshing the page or go back to the
        homepage.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
