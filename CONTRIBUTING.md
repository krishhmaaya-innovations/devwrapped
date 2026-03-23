# Contributing to DevWrapped

Thanks for wanting to contribute! Here's everything you need.

---

## Tools — Are They Free?

| Tool | Free? | What it does |
|------|-------|--------------|
| **GitHub Actions** | ✅ Free — unlimited for public repos | Runs CI on every push/PR automatically |
| **Dependabot** | ✅ Free — built into GitHub | Weekly PRs when dependencies have updates |
| **CodeRabbit** | ✅ Free for open source | AI code review on every PR |
| **Codecov** | ✅ Free for open source | Test coverage % on PRs (opt-in) |

Zero paid tools. Zero credit cards.

---

## Quick Start

```bash
git clone https://github.com/krishhmaaya-innovations/devwrapped.git
cd devwrapped
npm install
cp .env.example .env.local
# Fill in GITHUB_TOKEN_1 — any classic PAT, no scopes needed
npm run dev
```

Open [http://localhost:4000](http://localhost:4000).

---

## All Checks — Run Before Every PR

```bash
# 1. Lint (catches bad patterns, <a> instead of <Link>, etc.)
npm run lint

# 2. Type check (no TypeScript errors)
npm run typecheck

# 3. Production build (catches build-time errors)
npm run build

# 4. E2E tests (118 tests across 11 spec files)
npm test
```

Or run them all in one command:

```bash
npm run check
```

All 4 must pass. The CI will block your PR if any fail.

---

## Workflow

1. **Fork** the repo
2. **Create a branch** — use a clear name:
   - `feat/aqua-heatmap-theme`
   - `fix/streak-shows-zero`
   - `chore/update-dependencies`
3. **Make your changes** (see guides below)
4. **Run checks** (`npm run check`)
5. **Open a PR** — fill in the template, select the type of change
6. **Wait for CodeRabbit** — the AI reviewer posts within ~1 min of opening your PR. Address its feedback.
7. **Wait for CI** — all 4 checks run automatically. Green = ready for review.

---

## What Makes a Good PR

- **One thing per PR** — don't mix a UI change with a refactor
- **Tests updated** — if you add a feature, add tests for it in `tests/e2e/`
- **No secrets committed** — never add real tokens. Use `.env.local` (gitignored)
- **No console.logs** — server-side logs in API routes are fine; debug logs are not

---

## Common Contribution Types

### Adding a new heatmap theme

All themes live in `lib/heatmap-themes.ts`. Add one entry:

```ts
{
  id: "aqua",
  name: "Aqua",
  colors: ["#eafbff", "#b3ecff", "#5dd4f9", "#0ea5e9", "#0369a1"],
}
```

That's it — it auto-appears in the theme selector on the profile page.

### Fixing a bug

1. Add a failing test first (in the relevant `tests/e2e/*.spec.ts` file)
2. Fix the bug
3. Confirm the test now passes

### Adding a new stat

Stats are computed in `lib/github.ts` → `computeStats()`. Add to the `DerivedStats` type and compute it there. Display it in `components/stats-cards.tsx`.

---

## Branch & Commit Style

```
feat: add aqua heatmap theme
fix: streak shows 0 when user hasn't committed today
chore: update next to 16.2.0
docs: add theme contribution guide
test: add battle results share button tests
```

---

## Questions?

Open a [GitHub Discussion](https://github.com/krishhmaaya-innovations/devwrapped/discussions) or a `question` issue.
