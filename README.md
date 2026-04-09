<p align="center">
  <span style="font-size:48px"><strong>&lt;/&gt; DevWrapped</strong></span>
  <br/>
  <em>Your GitHub year, beautifully unwrapped.</em>
</p>

<p align="center">
  <a href="https://devwrapped.kminnovations.dev">Live Site</a> ·
  <a href="https://devwrapped.kminnovations.dev/battle">Dev Battle</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="TESTING.md">Testing</a> ·
  <a href="https://devwrapped.kminnovations.dev/privacy">Privacy</a>
</p>

<p align="center">
  <a href="https://github.com/krishhmaaya-innovations/devwrapped/actions/workflows/ci.yml">
    <img src="https://github.com/krishhmaaya-innovations/devwrapped/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://coderabbit.ai">
    <img src="https://img.shields.io/badge/code%20reviews-CodeRabbit-orange?logo=github" alt="CodeRabbit" />
  </a>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
</p>

---

## What is DevWrapped?

DevWrapped turns any public GitHub profile into a beautiful, shareable visual — contribution heatmaps with 9 stunning themes, streak stats, head-to-head developer battles, and export-ready PNG cards. No sign-in required.

## Features

- **Beautiful Heatmaps** — 9 color themes: GitHub Green, Indigo Night, Synthwave, Sunset, Deep Ocean, Forest, Cherry Blossom, Dracula, Monochrome
- **Instant Stats** — Total contributions, current/longest streak, active days, busiest day/month, commits, PRs, issues, code reviews
- **Dev Battle** — Compare two developers head-to-head across 5 categories
- **Export PNG** — Download your card as a 1200×630 OG-ready image
- **SVG Embed** — Embed your stats card in your GitHub README
- **Dark/Light Mode** — Seamless theme toggle with FOWT prevention
- **Year Selector** — View stats for any year since your GitHub account was created
- **Privacy-first** — No accounts, no cookies, no tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| Data | GitHub GraphQL API |
| Cache | Upstash Redis (prod) / in-memory (dev) |
| Hosting | Vercel |

## Getting Started

```bash
# Clone
git clone https://github.com/krishhmaaya-innovations/devwrapped.git
cd devwrapped

# Install
npm install

# Configure
cp .env.example .env.local
# Add your GitHub PAT (classic, no scopes needed for public data)
# GITHUB_TOKEN_1=ghp_xxxxxxxxxxxxx

# Run
npm run dev -- -p 4000
```

Open [http://localhost:4000](http://localhost:4000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN_1` | Yes | GitHub PAT (classic, public data only) |
| `GITHUB_TOKEN_2` | No | Extra PAT for rate limit rotation |
| `GITHUB_TOKEN_3` | No | Extra PAT for rate limit rotation |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL (falls back to memory cache) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |
| `NEXT_PUBLIC_SITE_URL` | No | Production URL for OG images (default: `https://devwrapped.kminnovations.dev`) |

## README Embed

Add your DevWrapped stats to your GitHub profile:

```markdown
[![DevWrapped](https://devwrapped.kminnovations.dev/api/embed/YOUR_USERNAME)](https://devwrapped.kminnovations.dev/YOUR_USERNAME)
```

Customize with query params:
- `?theme=synthwave` — any of the 9 themes
- `?year=2024` — specific year

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/github?username=X&year=Y` | GET | GitHub profile + contribution data |
| `/api/og/[username]?year=Y` | GET | OG image (1200×630 PNG) |
| `/api/embed/[username]?theme=X&year=Y` | GET | SVG embed card |

## Testing

```bash
# Run all E2E tests
npm test

# UI mode
npm run test:ui

# Headed browser
npm run test:headed
```

## Project Structure

```
app/
├── layout.tsx              # Root layout, metadata, JSON-LD
├── page.tsx                # Homepage
├── not-found.tsx           # Custom 404
├── sitemap.ts              # SEO sitemap
├── robots.ts               # SEO robots.txt
├── privacy/page.tsx        # Privacy policy
├── battle/                 # 1v1 comparison
│   ├── layout.tsx          # Battle metadata
│   ├── page.tsx            # Entry form
│   └── [user1]/[user2]/    # Result page
├── [username]/             # Profile page
│   ├── page.tsx            # Server metadata + OG
│   └── client.tsx          # Client UI
└── api/
    ├── github/route.ts     # Data proxy + rate limiter
    ├── og/[username]/      # OG image generator
    └── embed/[username]/   # SVG embed generator
components/                 # Reusable UI components
lib/                        # Business logic, cache, rate limiter
tests/e2e/                  # Playwright E2E tests
```

## Contributing

Contributions are welcome! Here's how:

1. **Fork** the repo and create a branch (`git checkout -b feat/my-feature`)
2. **Make changes** — new heatmap theme, stat, or fix
3. **Check**: `npx eslint . --max-warnings=0` · `npx tsc --noEmit` · `npx next build` · `npx playwright test`
4. **Open a PR** — the template will guide you

Every PR gets automatically reviewed by CodeRabbit AI — look for its comments within a minute of opening.

### Adding a new heatmap theme

All themes live in `lib/heatmap-themes.ts`. Add an entry to the `THEMES` array:

```ts
{
  id: "my-theme",
  name: "My Theme",
  colors: ["#eee", "#lightColor", "#midColor", "#darkColor", "#darkestColor"],
}
```

That's it — it auto-appears in the theme selector.

## License

MIT © [KrishMaaya](https://krishhmaaya.com)
