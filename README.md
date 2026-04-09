<div align="center">

# &lt;/&gt; DevWrapped

**Your GitHub year, beautifully unwrapped.**

[devwrapped.kminnovations.dev](https://devwrapped.kminnovations.dev) · [Dev Battle](https://devwrapped.kminnovations.dev/battle) · [Privacy](https://devwrapped.kminnovations.dev/privacy)

[![CI](https://github.com/krishhmaaya-innovations/devwrapped/actions/workflows/ci.yml/badge.svg)](https://github.com/krishhmaaya-innovations/devwrapped/actions/workflows/ci.yml)
[![CodeRabbit](https://img.shields.io/badge/code%20review-CodeRabbit-orange?logo=github)](https://coderabbit.ai)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

---

<img width="700" alt="DevWrapped preview" src="https://devwrapped.kminnovations.dev/api/og/torvalds?year=2024" />

</div>

---

## What is DevWrapped?

DevWrapped turns any **public GitHub profile** into a beautiful, shareable visual card — contribution heatmaps with 9 stunning themes, streak stats, head-to-head developer battles, and export-ready PNG cards.

**No sign-in. No cookies. No tracking.**

---

## Features

| Feature | Details |
|---------|---------|
| 🎨 **9 Heatmap Themes** | GitHub Green, Indigo Night, Synthwave, Sunset, Deep Ocean, Forest, Cherry Blossom, Dracula, Monochrome |
| 📊 **Instant Stats** | Total contributions, current/longest streak, active days, busiest day/month, commits, PRs, issues, reviews |
| ⚔️ **Dev Battle** | Compare two developers head-to-head across 5 categories |
| 🖼️ **Export PNG** | Download your card as a 1200×630 ready-to-share image |
| 🔗 **SVG Embed** | Drop your stats card directly into your GitHub README |
| 🌓 **Dark / Light Mode** | Seamless toggle with flash-of-wrong-theme prevention |
| 📅 **Year Selector** | View stats for any year since your account was created |
| 🔒 **Privacy-First** | Read-only, public data only — nothing stored about you |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) — App Router, Turbopack |
| UI | React 19, Tailwind CSS v4 |
| Data | GitHub GraphQL API |
| Rate Limiting | 30 req/hr per IP — Upstash Redis (prod) / in-memory (dev) |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [GitHub Personal Access Token](https://github.com/settings/tokens) — classic, **no scopes needed** for public data

### Setup

```bash
git clone https://github.com/krishhmaaya-innovations/devwrapped.git
cd devwrapped
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in at minimum:

```env
GITHUB_TOKEN_1=ghp_your_token_here
```

```bash
npm run dev -- -p 4000
```

Open [http://localhost:4000](http://localhost:4000)

---

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `GITHUB_TOKEN_1` | ✅ | GitHub PAT (classic, no scopes needed) |
| `GITHUB_TOKEN_2` | ➖ | Extra PAT for rate limit rotation (15K points/hr per token) |
| `GITHUB_TOKEN_3` | ➖ | Extra PAT for rate limit rotation |
| `UPSTASH_REDIS_REST_URL` | ➖ | Upstash Redis URL — falls back to in-memory if omitted |
| `UPSTASH_REDIS_REST_TOKEN` | ➖ | Upstash Redis token |
| `NEXT_PUBLIC_SITE_URL` | ➖ | Your production URL for OG images (default: `https://devwrapped.kminnovations.dev`) |

> **Never commit `.env.local`** — it's in `.gitignore` by default.

---

## README Embed

Add your DevWrapped card to your GitHub profile README:

```markdown
[![DevWrapped](https://devwrapped.kminnovations.dev/api/embed/YOUR_USERNAME)](https://devwrapped.kminnovations.dev/YOUR_USERNAME)
```

**Customise with query params:**

| Param | Example | Description |
|-------|---------|-------------|
| `?theme=` | `?theme=synthwave` | Any of the 9 themes |
| `?year=` | `?year=2024` | Specific year |

---

## API

All endpoints are public and read-only.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/github?username=X&year=Y` | `GET` | GitHub profile + contribution data |
| `/api/og/[username]?year=Y` | `GET` | OG image — 1200×630 PNG |
| `/api/embed/[username]?theme=X&year=Y` | `GET` | SVG embed card |

Rate limit: **30 requests / hour / IP**

---

## Project Structure

```
app/
├── layout.tsx              # Root layout, metadata, JSON-LD
├── page.tsx                # Homepage
├── not-found.tsx           # Custom 404
├── sitemap.ts              # Dynamic sitemap
├── robots.ts               # robots.txt
├── privacy/page.tsx        # Privacy policy
├── battle/                 # Dev Battle feature
│   ├── page.tsx            # Entry form
│   └── [user1]/[user2]/    # Results page
├── [username]/             # Profile page
│   ├── page.tsx            # Server-side metadata + OG
│   └── client.tsx          # Client UI
└── api/
    ├── github/route.ts     # Data proxy + IP rate limiter
    ├── og/[username]/      # OG image generator (Satori)
    └── embed/[username]/   # SVG embed generator
components/                 # Shared UI components
lib/
├── github.ts               # GraphQL queries + token rotation
├── rate-limit.ts           # IP-based rate limiter
├── cache.ts                # Redis / in-memory cache layer
└── heatmap-themes.ts       # All 9 theme definitions
tests/e2e/                  # Playwright E2E tests (118 tests)
```

---

## Testing

```bash
# Run all 118 E2E tests
npm test

# Interactive UI mode
npm run test:ui

# Headed browser (watch it run)
npm run test:headed
```

See [TESTING.md](TESTING.md) for the full testing guide.

---

## Contributing

Contributions are welcome — bug fixes, new themes, new stats, all fair game.

**Quick flow:**

1. Fork → create a branch (`git checkout -b feat/my-feature`)
2. Make your changes
3. Run the full check suite:
   ```bash
   npm run lint          # ESLint — zero warnings
   npm run typecheck     # TypeScript — zero errors
   npm run build         # Production build — must pass
   npm test              # 118 Playwright tests
   ```
4. Open a PR — the template will walk you through it

Every PR is automatically reviewed by **CodeRabbit AI** within a minute of opening. It focuses on security, performance, and missing error handling — not style (ESLint handles that).

### Adding a heatmap theme

All themes live in `lib/heatmap-themes.ts`. Add one entry:

```ts
{
  id: "my-theme",
  name: "My Theme",
  colors: ["#eee", "#abc", "#789", "#456", "#123"],
}
```

It auto-appears in the theme selector — no other changes needed.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Security

Found a vulnerability? Please **do not open a public issue**.

Report privately via [GitHub Security Advisories](../../security/advisories/new) or email `krishhmaaya.innovations@gmail.com`.

See [SECURITY.md](SECURITY.md) for the full policy.

---

## License

MIT © [Krishhmaaya Innovations](https://kminnovations.dev)
