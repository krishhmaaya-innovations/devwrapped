import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Eye, Database, Cookie, Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "DevWrapped is built with your privacy in mind. No accounts, no tracking, no personal data stored.",
  alternates: {
    canonical: "https://devwrapped.kminnovations.dev/privacy",
  },
};

const sections = [
  {
    icon: Eye,
    title: "What we access",
    body: "DevWrapped reads only your public GitHub profile and contribution data through the GitHub GraphQL API. We never ask for your GitHub credentials, OAuth token, or any private repository data. Only public profiles can be looked up.",
  },
  {
    icon: Database,
    title: "What we store",
    body: "We do not store any personal data on our servers. API responses are temporarily cached in server memory (up to 6 hours) purely for performance — so the same profile loads faster on repeated visits. This cache is never written to a database and resets on every server restart.",
  },
  {
    icon: Cookie,
    title: "Cookies & local storage",
    body: "We do not use cookies. The only thing stored in your browser is your preferred color theme (dark or light), saved to localStorage under the key 'devwrapped-theme'. This stays on your device and is never sent to our servers.",
  },
  {
    icon: Lock,
    title: "GitHub API token",
    body: "We use server-side GitHub Personal Access Tokens with read-only public scopes to make API requests on your behalf. These tokens live only on our server, are never exposed to the browser, and are used solely to fetch public contribution data.",
  },
  {
    icon: Shield,
    title: "Third-party services",
    body: "DevWrapped uses the GitHub GraphQL API (governed by GitHub's own Privacy Policy). We do not use any advertising networks, behavior tracking, or analytics scripts. No data is sold or shared with any third party.",
  },
  {
    icon: Mail,
    title: "Contact",
    body: "Questions or concerns about privacy? Reach out via GitHub at github.com/krishhmaaya-innovations and we'll respond promptly.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-20">
      {/* Back */}
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
      >
        ← Back to DevWrapped
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs text-[var(--text-muted)]">
          <Shield className="h-3.5 w-3.5 text-[var(--accent)]" />
          Last updated: March 2026
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          DevWrapped is built on a simple principle:{" "}
          <span className="font-medium text-[var(--text-primary)]">
            your data is yours.
          </span>{" "}
          No accounts, no tracking, no data sold — ever.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <section.icon className="h-4.5 w-4.5 text-[var(--accent)]" />
              </div>
              <h2 className="font-semibold text-[var(--text-primary)]">
                {section.title}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {section.body}
            </p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-center text-xs text-[var(--text-muted)]">
        DevWrapped is not affiliated with GitHub, Inc.{" "}
        <a
          href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors"
        >
          View GitHub&apos;s Privacy Policy →
        </a>
      </p>
    </div>
  );
}
