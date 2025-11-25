import { Database } from "bun:sqlite";

const DB_PATH = "db.sqlite";
const db = new Database(DB_PATH);

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = Number.parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || "12",
  10
); // Max requests per window

// Initialize rate limit table (global per IP, no endpoint separation)
db.run(`
  CREATE TABLE IF NOT EXISTS rate_limits_v2 (
    ip TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    PRIMARY KEY (ip, timestamp)
  );
`);

// Create index for faster lookups
db.run(`
  CREATE INDEX IF NOT EXISTS idx_rate_limits_v2_lookup 
  ON rate_limits_v2 (ip, timestamp);
`);

// Cleanup old rate limit entries periodically
const cleanupRateLimits = () => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  const deleted = db.run("DELETE FROM rate_limits_v2 WHERE timestamp < ?", [
    cutoff,
  ]);
  if (deleted.changes > 0) {
    console.log(`Rate limit cleanup: removed ${deleted.changes} old entries`);
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupRateLimits, 10 * RATE_LIMIT_WINDOW_MS);
cleanupRateLimits(); // Run once on startup

/**
 * Extract client IP from request headers
 * Handles various proxy configurations (fly.io, cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  // Check various headers that proxies use
  const headers = request.headers;

  // Fly.io uses Fly-Client-IP
  const flyClientIP = headers.get("fly-client-ip");
  if (flyClientIP) return flyClientIP;

  // Cloudflare uses CF-Connecting-IP
  const cfIP = headers.get("cf-connecting-ip");
  if (cfIP) return cfIP;

  // Standard X-Forwarded-For (may contain multiple IPs)
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Take the first IP (original client)
    const firstIP = xForwardedFor.split(",")[0];
    return firstIP ? firstIP.trim() : "unknown";
  }

  // X-Real-IP (nginx)
  const xRealIP = headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  // Fallback to unknown (shouldn't happen in production)
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // milliseconds until window resets
}

/**
 * Check and record a rate limit request (global per IP)
 * Returns whether the request is allowed and remaining quota
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Count requests in current window
  const result = db
    .query(
      "SELECT COUNT(*) as count FROM rate_limits_v2 WHERE ip = ? AND timestamp > ?"
    )
    .get(ip, windowStart) as { count: number };

  const requestCount = result.count;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - requestCount - 1);
  const allowed = requestCount < RATE_LIMIT_MAX_REQUESTS;

  if (allowed) {
    // Record this request
    db.run("INSERT INTO rate_limits_v2 (ip, timestamp) VALUES (?, ?)", [
      ip,
      now,
    ]);
  }

  // Calculate reset time (time until oldest request in window expires)
  const oldestInWindow = db
    .query(
      "SELECT MIN(timestamp) as oldest FROM rate_limits_v2 WHERE ip = ? AND timestamp > ?"
    )
    .get(ip, windowStart) as { oldest: number | null };

  const resetIn = oldestInWindow.oldest
    ? oldestInWindow.oldest + RATE_LIMIT_WINDOW_MS - now
    : RATE_LIMIT_WINDOW_MS;

  return { allowed, remaining, resetIn };
}

/**
 * Create a rate limit error response with appropriate headers
 */
export function createRateLimitResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(resetIn / 1000)),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: Response,
  remaining: number
): Response {
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Remaining", String(remaining));
  headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
