import request from "supertest";
import app from "../index";

describe("Security Middleware", () => {
  it("should set security headers (Helmet)", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    // Helmet headers
    expect(res.headers["x-dns-prefetch-control"]).toBe("off");
    expect(res.headers["x-frame-options"]).toBeDefined();
    expect(res.headers["strict-transport-security"]).toBeDefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("should apply global rate limiting", async () => {
    const res = await request(app).get("/health");
    
    // Check for rate limit headers
    expect(res.headers["x-ratelimit-limit"]).toBeDefined();
    expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
  });

  describe("Auth Rate Limiting", () => {
    it("should impose stricter limits on login", async () => {
      // NOTE: We might not hit the limit in valid tests without making 50 requests, 
      // but we can check the limit header value if it's exposed.
      // Rate limit headers show the limit for the matching window.
      
      const res = await request(app).post("/auth/login").send({
          email: "test@example.com",
          password: "wrong"
      });

      // authLimiter limit is 50, global is 300.
      const limit = parseInt(res.headers["x-ratelimit-limit"]);
      expect(limit).toBe(50);
    });

    it("should allow higher limits on non-auth routes", async () => {
      const res = await request(app).get("/health");
      
      const limit = parseInt(res.headers["x-ratelimit-limit"]);
      expect(limit).toBe(300);
    });
  });
});
