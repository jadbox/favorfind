import { describe, it, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";

import {
  getClientIP,
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
} from "./rateLimiter";

// Clean up rate limits for test IP before each test
const db = new Database("db.sqlite");

// Get the actual rate limit from the module (default 12 or env override)
const RATE_LIMIT = Number.parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || "12",
  10
);

describe("rateLimiter", () => {
  beforeEach(() => {
    // Clean up any existing rate limit entries for test IPs
    db.run("DELETE FROM rate_limits_v2 WHERE ip LIKE 'test-ip-%'");
  });

  describe("getClientIP", () => {
    it("should extract IP from fly-client-ip header", () => {
      const request = new Request("http://localhost", {
        headers: { "fly-client-ip": "1.2.3.4" },
      });
      expect(getClientIP(request)).toBe("1.2.3.4");
    });

    it("should extract IP from cf-connecting-ip header", () => {
      const request = new Request("http://localhost", {
        headers: { "cf-connecting-ip": "5.6.7.8" },
      });
      expect(getClientIP(request)).toBe("5.6.7.8");
    });

    it("should extract first IP from x-forwarded-for header", () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "9.10.11.12, 13.14.15.16" },
      });
      expect(getClientIP(request)).toBe("9.10.11.12");
    });

    it("should extract IP from x-real-ip header", () => {
      const request = new Request("http://localhost", {
        headers: { "x-real-ip": "17.18.19.20" },
      });
      expect(getClientIP(request)).toBe("17.18.19.20");
    });

    it("should return unknown when no IP headers present", () => {
      const request = new Request("http://localhost");
      expect(getClientIP(request)).toBe("unknown");
    });

    it("should prioritize fly-client-ip over other headers", () => {
      const request = new Request("http://localhost", {
        headers: {
          "fly-client-ip": "1.1.1.1",
          "cf-connecting-ip": "2.2.2.2",
          "x-forwarded-for": "3.3.3.3",
        },
      });
      expect(getClientIP(request)).toBe("1.1.1.1");
    });
  });

  describe("checkRateLimit", () => {
    it("should allow requests under the limit", () => {
      const uniqueIP = `test-ip-${Date.now()}-allow`;
      const result = checkRateLimit(uniqueIP);

      expect(result.allowed).toBe(true);
      // remaining = RATE_LIMIT - 0 (prior count) - 1 (current request)
      expect(result.remaining).toBe(RATE_LIMIT - 1);
    });

    it("should block requests over the limit", () => {
      const uniqueIP = `test-ip-${Date.now()}-block`;

      // Make requests up to the limit
      for (let i = 0; i < RATE_LIMIT; i++) {
        checkRateLimit(uniqueIP);
      }

      // Next request should be blocked
      const result = checkRateLimit(uniqueIP);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should track remaining requests correctly", () => {
      const uniqueIP = `test-ip-${Date.now()}-remaining`;

      // First request: remaining = RATE_LIMIT - 0 - 1
      const first = checkRateLimit(uniqueIP);
      expect(first.allowed).toBe(true);
      expect(first.remaining).toBe(RATE_LIMIT - 1);

      // Second request: remaining = RATE_LIMIT - 1 - 1
      const second = checkRateLimit(uniqueIP);
      expect(second.allowed).toBe(true);
      expect(second.remaining).toBe(RATE_LIMIT - 2);
    });

    it("should return resetIn value", () => {
      const uniqueIP = `test-ip-${Date.now()}-reset`;
      const result = checkRateLimit(uniqueIP);

      expect(result.resetIn).toBeGreaterThan(0);
      expect(result.resetIn).toBeLessThanOrEqual(60 * 1000); // 1 minute window
    });

    it("should not record blocked requests", () => {
      const uniqueIP = `test-ip-${Date.now()}-norecord`;

      // Exhaust the limit
      for (let i = 0; i < RATE_LIMIT; i++) {
        checkRateLimit(uniqueIP);
      }

      // Try multiple blocked requests
      checkRateLimit(uniqueIP);
      checkRateLimit(uniqueIP);
      checkRateLimit(uniqueIP);

      // Check DB - should only have RATE_LIMIT entries
      const count = db
        .query("SELECT COUNT(*) as count FROM rate_limits_v2 WHERE ip = ?")
        .get(uniqueIP) as { count: number };

      expect(count.count).toBe(RATE_LIMIT);
    });
  });

  describe("createRateLimitResponse", () => {
    it("should create a 429 response with correct headers", async () => {
      const response = createRateLimitResponse(30000);

      expect(response.status).toBe(429);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      expect(response.headers.get("Retry-After")).toBe("30");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");

      const body = await response.json();
      expect(body.error).toBe("Too many requests. Please try again later.");
      expect(body.retryAfter).toBe(30);
    });
  });

  describe("addRateLimitHeaders", () => {
    it("should add rate limit headers to response", () => {
      const originalResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const newResponse = addRateLimitHeaders(originalResponse, 5);

      expect(newResponse.status).toBe(200);
      expect(newResponse.headers.get("X-RateLimit-Remaining")).toBe("5");
      expect(newResponse.headers.get("X-RateLimit-Limit")).toBe(
        String(RATE_LIMIT)
      );
      expect(newResponse.headers.get("Content-Type")).toBe("application/json");
    });
  });
});
