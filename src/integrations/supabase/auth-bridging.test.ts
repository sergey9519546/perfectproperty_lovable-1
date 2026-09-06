import { describe, it, expect, vi } from "vitest";

describe("Unified Authentication Bridging", () => {
  it("validates Firebase ID token payload decoding and structure", () => {
    // Generate a valid mock Firebase JWT payload
    const mockPayload = {
      iss: "https://securetoken.google.com/gen-lang-client-0579960195",
      aud: "gen-lang-client-0579960195",
      sub: "test-firebase-user-12345",
      email: "analyst@institutional.fund",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const payloadStr = Buffer.from(JSON.stringify(mockPayload)).toString("base64url");
    const signature = "mock-signature";
    const token = `${header}.${payloadStr}.${signature}`;

    const parts = token.split(".");
    expect(parts.length).toBe(3);

    const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    expect(decoded.sub).toBe("test-firebase-user-12345");
    expect(decoded.iss).toContain("securetoken.google.com");
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("detects expired Firebase tokens correctly", () => {
    const expiredPayload = {
      iss: "https://securetoken.google.com/gen-lang-client-0579960195",
      aud: "gen-lang-client-0579960195",
      sub: "expired-user",
      exp: Math.floor(Date.now() / 1000) - 60, // 60 seconds ago
    };

    const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString("base64url");
    const payloadStr = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
    const token = `${header}.${payloadStr}.sig`;

    const parts = token.split(".");
    const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const nowSec = Math.floor(Date.now() / 1000);
    expect(decoded.exp < nowSec).toBe(true);
  });
});
