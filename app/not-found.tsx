import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you're looking for doesn't exist on DevWrapped.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
        <span className="text-4xl font-extrabold text-[var(--accent)]">404</span>
      </div>
      <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)]">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-[var(--text-secondary)]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try searching for a GitHub username instead.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">
            <Search className="h-4 w-4" />
            Search profiles
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/battle">Dev Battle</Link>
        </Button>
      </div>
    </div>
  );
}
