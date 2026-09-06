import { describe, expect, it } from "vitest";
import { BRAND_CONFIG } from "./brand";

describe("Brand Identity - Single Source of Truth", () => {
  it("defines the official brand names correctly", () => {
    expect(BRAND_CONFIG.name).toBe("Perfect Property");
    expect(BRAND_CONFIG.displayName).toBe("PERFECT PROPERTY");
    expect(BRAND_CONFIG.shortName).toBe("Perfect Property");
  });

  it("contains valid domain and legal metadata", () => {
    expect(BRAND_CONFIG.domain).toBe("perfectproperty.com");
    expect(BRAND_CONFIG.copyright).toContain("Perfect Property");
    expect(BRAND_CONFIG.copyright).toContain("All rights reserved");
  });

  it("defines the canonical architectural brand mark geometry", () => {
    const { mark } = BRAND_CONFIG;
    expect(mark.viewBox).toBe("0 0 64 64");
    expect(mark.windowColor).toBe("#efaa2d");
    expect(mark.gabledSilhouettePath).toBe(
      "M32 8 60 33v21l-9-8v-9L32 20 13 37v9l-9 8V33L32 8Z"
    );
    expect(mark.windows).toHaveLength(4);
    expect(mark.windows).toEqual([
      { x: 22, y: 37, width: 8, height: 8 },
      { x: 34, y: 37, width: 8, height: 8 },
      { x: 22, y: 49, width: 8, height: 8 },
      { x: 34, y: 49, width: 8, height: 8 },
    ]);
  });

  it("ensures no unspaced 'PERFECTPROPERTY' appears in brand titles or display names", () => {
    expect(BRAND_CONFIG.name).not.toBe("PERFECTPROPERTY");
    expect(BRAND_CONFIG.displayName).not.toBe("PERFECTPROPERTY");
    expect(BRAND_CONFIG.name.includes(" ")).toBe(true);
    expect(BRAND_CONFIG.displayName.includes(" ")).toBe(true);
  });
});
