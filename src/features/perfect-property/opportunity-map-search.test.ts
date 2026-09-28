import { describe, it, expect } from 'vitest';
import {
  searchMatchesParcel,
  filterParcels,
  toWorkspaceParcel,
  type WorkspaceParcel,
} from './live';
import { FALLBACK_RANKED_PARCELS } from '@/lib/fallback-parcels';

describe('Opportunity Map Property Search System', () => {
  const allParcels = FALLBACK_RANKED_PARCELS.map(toWorkspaceParcel).filter(
    (p): p is WorkspaceParcel => p !== null,
  );

  describe('searchMatchesParcel: Address & Name Matching', () => {
    const waltonParcel = allParcels.find((p) => p.address.includes('Walton'));
    const damenParcel = allParcels.find((p) => p.address.includes('Damen'));
    const commercialParcel = allParcels.find((p) => p.assetClass === 'commercial');

    it('matches property by exact or partial street address', () => {
      expect(waltonParcel).toBeDefined();
      if (waltonParcel) {
        expect(searchMatchesParcel(waltonParcel, 'Walton')).toBe(true);
        expect(searchMatchesParcel(waltonParcel, '2418 W Walton')).toBe(true);
        expect(searchMatchesParcel(waltonParcel, 'walton')).toBe(true);
      }

      expect(damenParcel).toBeDefined();
      if (damenParcel) {
        expect(searchMatchesParcel(damenParcel, 'Damen')).toBe(true);
        expect(searchMatchesParcel(damenParcel, '1508 N Damen')).toBe(true);
      }
    });

    it('matches property by city or municipality name', () => {
      expect(waltonParcel).toBeDefined();
      if (waltonParcel) {
        expect(searchMatchesParcel(waltonParcel, 'Chicago')).toBe(true);
        expect(searchMatchesParcel(waltonParcel, 'chicago')).toBe(true);
      }
    });

    it('matches property by property name, property type or asset class', () => {
      expect(commercialParcel).toBeDefined();
      if (commercialParcel) {
        expect(searchMatchesParcel(commercialParcel, 'Commercial')).toBe(true);
        expect(searchMatchesParcel(commercialParcel, commercialParcel.propertyType)).toBe(true);
      }

      const vacantParcel = allParcels.find((p) => p.assetClass === 'vacant_land');
      expect(vacantParcel).toBeDefined();
      if (vacantParcel) {
        expect(searchMatchesParcel(vacantParcel, 'Vacant')).toBe(true);
        expect(searchMatchesParcel(vacantParcel, 'Land')).toBe(true);
      }
    });

    it('matches property by APN (Assessor Parcel Number)', () => {
      const apnParcel = allParcels.find((p) => p.apn);
      expect(apnParcel).toBeDefined();
      if (apnParcel && apnParcel.apn) {
        const apnPrefix = apnParcel.apn.slice(0, 5);
        expect(searchMatchesParcel(apnParcel, apnPrefix)).toBe(true);
      }
    });

    it('supports multi-token queries across address, city, and property type', () => {
      if (waltonParcel) {
        expect(searchMatchesParcel(waltonParcel, 'Walton Chicago')).toBe(true);
        expect(searchMatchesParcel(waltonParcel, 'Chicago 2418')).toBe(true);
      }
    });

    it('returns false when no fields match query', () => {
      if (waltonParcel) {
        expect(searchMatchesParcel(waltonParcel, 'NonexistentStreetXYZ')).toBe(false);
        expect(searchMatchesParcel(waltonParcel, 'Beverly Hills 90210')).toBe(false);
      }
    });

    it('returns true when query is empty or whitespace', () => {
      if (waltonParcel) {
        expect(searchMatchesParcel(waltonParcel, '')).toBe(true);
        expect(searchMatchesParcel(waltonParcel, '   ')).toBe(true);
      }
    });
  });

  describe('filterParcels: Search Integration with Region & Asset Class Filters', () => {
    it('filters parcels strictly matching search query in Cook County', () => {
      const results = filterParcels(allParcels, 'Cook County, IL', 'all', 'Walton');
      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach((p) => {
        expect(p.address.toLowerCase()).toContain('walton');
      });
    });

    it('combines Region + Asset Class + Search query filters accurately', () => {
      const results = filterParcels(allParcels, 'Cook County, IL', 'commercial', 'Chicago');
      expect(results.length).toBeGreaterThanOrEqual(1);
      results.forEach((p) => {
        expect(p.assetClass).toBe('commercial');
        expect(searchMatchesParcel(p, 'Chicago')).toBe(true);
      });
    });

    it('returns empty array when search query does not match any parcels in the selected region', () => {
      const results = filterParcels(allParcels, 'Cook County, IL', 'all', 'XYZ123NoMatchQuery');
      expect(results.length).toBe(0);
    });

    it('returns all regional parcels when search query is empty string', () => {
      const unfiltered = filterParcels(allParcels, 'Cook County, IL', 'all');
      const withEmptySearch = filterParcels(allParcels, 'Cook County, IL', 'all', '');
      expect(withEmptySearch.length).toBe(unfiltered.length);
    });
  });
});
