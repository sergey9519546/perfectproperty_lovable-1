/**
 * Canonical Single Source of Truth for Profit Property Brand Identity.
 *
 * Defines names, display variants, copy tokens, and the SVG geometry
 * for the official architectural brand mark with illuminated amber windows.
 */

export const BRAND_CONFIG = {
  /** Canonical title-cased brand name */
  name: "Profit Property",
  /** Canonical all-caps wordmark representation */
  displayName: "PROFIT PROPERTY",
  /** Short identifier */
  shortName: "Profit Property",
  /** Primary brand tagline */
  tagline: "Find profitable real estate deals, calculate repair costs, check for hidden debts, and know your exact maximum offer before you buy.",
  /** Primary web domain */
  domain: "profitproperty.com",
  /** Official registered legal business entity */
  legalName: "PROFIT PROPERTY LLC",
  /** Copyright statement */
  copyright: `© ${new Date().getFullYear()} Profit Property (PROFIT PROPERTY LLC). All rights reserved.`,
  /** Support address */
  supportEmail: "support@profitproperty.com",
  /** Default metadata */
  meta: {
    defaultTitle: "Profit Property — Find Profitable Real Estate Deals & Check Exact Profits",
    description: "Find profitable real estate deals, calculate repair costs, check for hidden debts, and know your exact maximum offer before you buy.",
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
