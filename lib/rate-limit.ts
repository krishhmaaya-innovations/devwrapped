/**
 * Simple in-memory rate limiter.
 * 30 requests per hour per IP for the GitHub API proxy.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 30, windowMs: number = 3600000) {
    this.limits = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(identifier: string): {
    success: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetAt) {
      const resetAt = now + this.windowMs;
      this.limits.set(identifier, { count: 1, resetAt });
      return { success: true, remaining: this.maxRequests - 1, resetAt };
    }

    if (entry.count < this.maxRequests) {
      entry.count++;
      return {
        success: true,
        remaining: this.maxRequests - entry.count,
        resetAt: entry.resetAt,
      };
    }

    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}

/** 30 requests per hour per IP */
export const apiRateLimiter = new RateLimiter(30, 3600000);

// Cleanup every 10 minutes (server-side only)
if (typeof window === "undefined") {
  setInterval(() => {
    apiRateLimiter.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Extract client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIP = headers.get("x-real-ip");
  if (realIP) return realIP;

  return "unknown";
}
