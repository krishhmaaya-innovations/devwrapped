import Link from "next/link";
import { Github, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--text-primary)] hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[var(--accent)]">&lt;/&gt;</span>{" "}
            DevWrapped
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <ThemeToggle />

          <Button variant="ghost" size="sm" asChild>
            <Link href="/battle" className="gap-1.5">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">Battle</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/krishhmaaya-innovations"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1.5"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>


        </nav>
      </div>
    </header>
  );
}
