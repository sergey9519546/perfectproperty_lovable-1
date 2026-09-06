/**
 * Canonical Single Source of Truth for Perfect Property Brand Identity.
 *
 * Defines names, display variants, copy tokens, and the SVG geometry
 * for the official architectural brand mark with illuminated amber windows.
 */

export const BRAND_CONFIG = {
  /** Canonical title-cased brand name */
  name: "Perfect Property",
  /** Canonical all-caps wordmark representation */
  displayName: "PERFECT PROPERTY",
  /** Short identifier */
  shortName: "Perfect Property",
  /** Primary brand tagline */
  tagline: "Real estate deal analysis and property discovery platform with cartographic workspace and underwriting engines.",
  /** Primary web domain */
  domain: "perfectproperty.com",
  /** Copyright statement */
  copyright: `© ${new Date().getFullYear()} Perfect Property. All rights reserved.`,
  /** Support address */
  supportEmail: "support@perfectproperty.com",
  /** Default metadata */
  meta: {
    defaultTitle: "Perfect Property — Real Estate Deal Analysis & Cartographic Workspace",
    description: "Real estate deal analysis and property discovery platform with cartographic workspace and underwriting engines.",
  },
  /** Official architectural brand mark geometry */
  mark: {
    viewBox: "0 0 64 64",
    gabledSilhouettePath: "M32 8 60 33v21l-9-8v-9L32 20 13 37v9l-9 8V33L32 8Z",
    windowColor: "#efaa2d",
    filterId: "pp-brand-window-softness",
    windows: [
      { x: 22, y: 37, width: 8, height: 8 },
      { x: 34, y: 37, width: 8, height: 8 },
      { x: 22, y: 49, width: 8, height: 8 },
      { x: 34, y: 49, width: 8, height: 8 },
    ],
  },
} as const;

export type BrandConfig = typeof BRAND_CONFIG;
