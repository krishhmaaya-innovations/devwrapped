import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 mt-auto">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-3 text-center text-sm text-[var(--text-muted)]">
          <p className="flex items-center gap-1">
            <span className="font-medium text-[var(--text-secondary)]">
              DevWrapped
            </span>
            — Built with
            <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400 inline" />
            by{" "}
            <a
              href="https://krishhmaaya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              KrishMaaya
            </a>
          </p>

          <p className="text-xs">
            Data from{" "}
            <a
              href="https://docs.github.com/en/graphql"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--text-secondary)]"
            >
              GitHub GraphQL API
            </a>
            . Not affiliated with GitHub.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/privacy"
              className="hover:text-[var(--text-secondary)] transition-colors"
            >
              Privacy
            </Link>
            <span className="text-[var(--border)]">·</span>
            <a
              href="https://github.com/krishhmaaya-innovations"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-secondary)] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
