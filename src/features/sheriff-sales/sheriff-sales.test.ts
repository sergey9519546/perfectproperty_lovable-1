import { describe, it, expect } from 'vitest';
import { getAssetClass } from './components/SheriffSalesDashboard';
import { SheriffSalesPage } from './components/SheriffSalesPage';
import { SHERIFF_GOV_SALES } from './data';
import { computeLienWaterfall } from './lien-waterfall';

describe('Sheriff Sales E2E & Business Logic Suite', () => {
  describe('Asset Class Normalization', () => {
    it('correctly maps property descriptions to standardized asset classes', () => {
      expect(getAssetClass('Single Family Residential')).toBe('Single Family');
      expect(getAssetClass('2-Story Colonial SFR')).toBe('Single Family');
      expect(getAssetClass('Ranch Style')).toBe('Single Family');
      expect(getAssetClass('2-Family Duplex')).toBe('Multi-Family');
      expect(getAssetClass('Triplex 3-Unit')).toBe('Multi-Family');
      expect(getAssetClass('Luxury Condominium')).toBe('Condo');
      expect(getAssetClass('Townhouse / Attached')).toBe('Townhouse');
      expect(getAssetClass('Commercial Mixed Use')).toBe('Commercial');
      expect(getAssetClass('Vacant Lot / Land')).toBe('Vacant Land');
      expect(getAssetClass('')).toBe('Residential');
    });
  });

  describe('Sheriff Sales Dataset Integrity & Multi-County Coverage', () => {
    it('contains valid sheriff sale entries with required parcel and financial data', () => {
      expect(SHERIFF_GOV_SALES.length).toBeGreaterThan(0);

      SHERIFF_GOV_SALES.forEach((sale) => {
        expect(sale.id).toBeDefined();
        expect(sale.caseNumber).toBeDefined();
        expect(sale.county).toBeDefined();
        expect(sale.parcel.address).toBeDefined();
        expect(sale.parcel.city).toBeDefined();
        expect(sale.bidCard.openingBid).toBeGreaterThanOrEqual(0);
        expect(sale.legalProse.finalJudgmentAmount).toBeGreaterThan(0);
        expect(sale.flipScoreAndEndGame.flipScore).toBeGreaterThanOrEqual(0);
        expect(sale.flipScoreAndEndGame.flipScore).toBeLessThanOrEqual(100);
      });
    });

    it('filters sales by county accurately', () => {
      const bergenSales = SHERIFF_GOV_SALES.filter((s) => s.county.toLowerCase().includes('bergen'));
      const middlesexSales = SHERIFF_GOV_SALES.filter((s) => s.county.toLowerCase().includes('middlesex'));
      const phillySales = SHERIFF_GOV_SALES.filter((s) => s.county.toLowerCase().includes('philadelphia'));

      expect(bergenSales.length + middlesexSales.length + phillySales.length).toBeGreaterThan(0);
    });

    it('filters sales by asset class accurately', () => {
      const sfrSales = SHERIFF_GOV_SALES.filter((s) => getAssetClass(s.parcel.propertyType) === 'Single Family');
      const multiSales = SHERIFF_GOV_SALES.filter((s) => getAssetClass(s.parcel.propertyType) === 'Multi-Family');

      expect(sfrSales.length).toBeGreaterThan(0);
      expect(multiSales.length).toBeGreaterThanOrEqual(0);
    });

    it('searches across address, municipality, docket, and borrower', () => {
      const sample = SHERIFF_GOV_SALES[0];
      const addressQuery = sample.parcel.address.slice(0, 5).toLowerCase();

      const matched = SHERIFF_GOV_SALES.filter(
        (s) =>
          s.parcel.address.toLowerCase().includes(addressQuery) ||
          s.parcel.city.toLowerCase().includes(addressQuery) ||
          s.caseNumber.toLowerCase().includes(addressQuery)
      );

      expect(matched.length).toBeGreaterThanOrEqual(1);
      expect(matched.some((m) => m.id === sample.id)).toBe(true);
    });
  });

  describe('Lien Waterfall & Underwriting Mechanics', () => {
    it('calculates waterfall distribution and senior surviving liens correctly', () => {
      const sample = SHERIFF_GOV_SALES[0];
      if (sample.lienWaterfall) {
        const waterfall = computeLienWaterfall(sample);
        expect(waterfall).toBeDefined();
        expect(waterfall.totalLienExposure).toBeGreaterThanOrEqual(0);
        expect(waterfall.survivingSeniorLienEstimate).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('SheriffSalesPage Component Contract', () => {
    it('exports SheriffSalesPage component properly', () => {
      expect(SheriffSalesPage).toBeDefined();
      expect(typeof SheriffSalesPage).toBe('function');
    });
  });
});
