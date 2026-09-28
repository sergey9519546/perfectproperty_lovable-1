import { describe, it, expect } from 'vitest';
import {
  normalizeAssetClass,
  assetClassDisplayName,
  filterParcels,
  toWorkspaceParcel,
  type WorkspaceParcel,
} from './live';
import { FALLBACK_RANKED_PARCELS } from '@/lib/fallback-parcels';

describe('Opportunity Map Property Type & Asset Class Filter System', () => {
  describe('normalizeAssetClass & assetClassDisplayName', () => {
    it('accurately normalizes property types into standardized asset classes', () => {
      expect(normalizeAssetClass('Single Family Residential')).toBe('residential');
      expect(normalizeAssetClass('2-Story Colonial SFR')).toBe('residential');
      expect(normalizeAssetClass('Multi-Family 3-Unit')).toBe('residential');
      expect(normalizeAssetClass('Condo / Co-op')).toBe('residential');
      expect(normalizeAssetClass('Commercial Mixed-Use')).toBe('commercial');
      expect(normalizeAssetClass('Commercial Retail')).toBe('commercial');
      expect(normalizeAssetClass('Commercial Office')).toBe('commercial');
      expect(normalizeAssetClass('Vacant Land')).toBe('vacant_land');
      expect(normalizeAssetClass('Vacant Infill Lot')).toBe('vacant_land');
      expect(normalizeAssetClass('vacant-land')).toBe('vacant_land');
      expect(normalizeAssetClass(null)).toBe('residential');
    });

    it('returns human-readable display labels for each asset class', () => {
      expect(assetClassDisplayName('residential')).toBe('Residential');
      expect(assetClassDisplayName('commercial')).toBe('Commercial');
      expect(assetClassDisplayName('vacant_land')).toBe('Vacant Land');
    });
  });

  describe('Fallback Parcels Data Coverage', () => {
    it('contains representative properties across residential, commercial, and vacant land', () => {
      const parcels = FALLBACK_RANKED_PARCELS.map(toWorkspaceParcel).filter(
        (p): p is WorkspaceParcel => p !== null,
      );

      const residential = parcels.filter((p) => p.assetClass === 'residential');
      const commercial = parcels.filter((p) => p.assetClass === 'commercial');
      const vacantLand = parcels.filter((p) => p.assetClass === 'vacant_land');

      expect(residential.length).toBeGreaterThanOrEqual(10);
      expect(commercial.length).toBeGreaterThanOrEqual(3);
      expect(vacantLand.length).toBeGreaterThanOrEqual(3);

      // Verify each parcel has valid coordinates and financial models
      parcels.forEach((p) => {
        expect(p.coordinates[0]).toBeDefined();
        expect(p.coordinates[1]).toBeDefined();
        expect(p.score).toBeGreaterThan(0);
        expect(p.assetClass).toBeDefined();
        expect(['residential', 'commercial', 'vacant_land']).toContain(p.assetClass);
      });
    });
  });

  describe('filterParcels by Asset Class and Region', () => {
    const allParcels = FALLBACK_RANKED_PARCELS.map(toWorkspaceParcel).filter(
      (p): p is WorkspaceParcel => p !== null,
    );

    it('filters strictly by residential property type', () => {
      const filtered = filterParcels(allParcels, 'All regions', 'residential');
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((p) => {
        expect(p.assetClass).toBe('residential');
      });
    });

    it('filters strictly by commercial property type', () => {
      const filtered = filterParcels(allParcels, 'All regions', 'commercial');
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((p) => {
        expect(p.assetClass).toBe('commercial');
      });
    });

    it('filters strictly by vacant land property type using both snake_case and kebab-case keys', () => {
      const filteredSnake = filterParcels(allParcels, 'All regions', 'vacant_land');
      const filteredKebab = filterParcels(allParcels, 'All regions', 'vacant-land' as any);

      expect(filteredSnake.length).toBeGreaterThan(0);
      expect(filteredKebab.length).toBe(filteredSnake.length);
      filteredSnake.forEach((p) => {
        expect(p.assetClass).toBe('vacant_land');
      });
    });

    it('returns all parcels when asset class filter is "all"', () => {
      const filtered = filterParcels(allParcels, 'All regions', 'all');
      expect(filtered.length).toBe(allParcels.length);
    });

    it('allows compound filtering of Region + Asset Class simultaneously', () => {
      const cookCommercial = filterParcels(allParcels, 'Cook County, IL', 'commercial');
      expect(cookCommercial.length).toBeGreaterThan(0);
      cookCommercial.forEach((p) => {
        expect(p.assetClass).toBe('commercial');
        expect(p.countyFips === '17031' || p.state === 'IL').toBe(true);
      });

      const cookVacant = filterParcels(allParcels, 'Cook County, IL', 'vacant_land');
      expect(cookVacant.length).toBeGreaterThan(0);
      cookVacant.forEach((p) => {
        expect(p.assetClass).toBe('vacant_land');
        expect(p.countyFips === '17031' || p.state === 'IL').toBe(true);
      });
    });

    it('filters parcels by specific categories (multifamily, industrial, office)', () => {
      const multifamily = filterParcels(allParcels, 'All regions', 'multifamily');
      expect(multifamily.length).toBeGreaterThan(0);

      const office = filterParcels(allParcels, 'All regions', 'office');
      expect(office.length).toBeGreaterThan(0);

      const industrial = filterParcels(allParcels, 'All regions', 'industrial');
      expect(industrial).toBeDefined();
    });
  });
});
