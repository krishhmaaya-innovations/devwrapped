# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Older branches | ❌ |

Only the latest commit on `main` receives security fixes.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report privately via one of:

- **GitHub Security Advisories**: [Report a vulnerability](../../security/advisories/new) ← preferred
- **Email**: krishhmaaya.innovations@gmail.com (subject: `[SECURITY] DevWrapped`)

### What to include

1. A clear description of the vulnerability
2. Steps to reproduce (URL, payload, request/response if applicable)
3. Potential impact (what an attacker could achieve)
4. Suggested fix (optional but appreciated)

### What to expect

| Step | Timeframe |
|------|-----------|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix + disclosure | Coordinated together |

## Scope

### In scope
- Rate limit bypass on `/api/github`, `/api/embed`, `/api/og`
- GitHub token leakage via API responses
- Server-Side Request Forgery (SSRF) via username input
- Dependency vulnerabilities with known exploits

### Out of scope
- Denial of service via public endpoints (rate limiting is intentional mitigation)
- Social engineering or phishing attacks unrelated to the codebase
- Issues already covered by the rate limiter (30 req/hr per IP)
- Vulnerabilities requiring physical access

## Security Architecture Notes

- **GitHub tokens** are server-side only — never exposed to the client
- **Rate limiting**: 30 requests/hour per IP (Upstash Redis in production, in-memory fallback in dev)
- **Input validation**: `username` parameter is validated client and server side
- **No auth required** — app is read-only, consuming public GitHub data only
- **Privacy-first**: No user data stored beyond optional Redis caching of public stats

## Dependency Security

[Dependabot](https://github.com/krishhmaaya-innovations/devwrapped/blob/main/.github/dependabot.yml) runs weekly and auto-opens PRs for dependency updates. All CI checks must pass before merging.
