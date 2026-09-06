import { describe, it, expect, vi } from "vitest";
import {
  syncUserProfile,
  saveDealToFirestore,
  getSavedDealsFromFirestore,
  removeSavedDealFromFirestore,
  saveFilterPresetToFirestore,
  type SavedDealData,
} from "./firestore-service";

// Mock firestore functions
const mockDocsMap = new Map<string, any>();

vi.mock("./config", () => ({
  db: { type: "firestore-mock" },
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, ...parts) => parts.join("/")),
  collection: vi.fn((_db, ...parts) => parts.join("/")),
  getDoc: vi.fn(async (path: string) => ({
    exists: () => mockDocsMap.has(path),
    data: () => mockDocsMap.get(path),
  })),
  setDoc: vi.fn(async (path: string, data: any, options?: { merge?: boolean }) => {
    if (options?.merge && mockDocsMap.has(path)) {
      mockDocsMap.set(path, { ...mockDocsMap.get(path), ...data });
    } else {
      mockDocsMap.set(path, data);
    }
  }),
  deleteDoc: vi.fn(async (path: string) => {
    mockDocsMap.delete(path);
  }),
  getDocs: vi.fn(async (collectionPath: string) => {
    const docs = Array.from(mockDocsMap.entries())
      .filter(([k]) => k.startsWith(collectionPath))
      .map(([_, v]) => ({ data: () => v }));
    return { docs };
  }),
  query: vi.fn((col) => col),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
}));

describe("Firestore Service", () => {
  it("creates and synchronizes user profile with pro tier default", async () => {
    await syncUserProfile("user-123", "analyst@perfectproperty.com", "Senior Analyst");
    const stored = mockDocsMap.get("users/user-123");
    expect(stored).toBeDefined();
    expect(stored.email).toBe("analyst@perfectproperty.com");
    expect(stored.displayName).toBe("Senior Analyst");
    expect(stored.tier).toBe("pro");
  });

  it("saves a deal to user watchlist and retrieves it correctly", async () => {
    const deal: Omit<SavedDealData, "userId" | "createdAt" | "updatedAt"> = {
      id: "deal-456",
      parcelId: "parcel-789",
      address: "100 Ocean Drive",
      county: "12086",
      state: "FL",
      arv: 450000,
      maxBid: 290000,
      underwriteStatus: "underwritten",
      notes: "High demand coastal submarket with recent comps above ask.",
      starred: true,
    };

    await saveDealToFirestore("user-123", deal);
    const deals = await getSavedDealsFromFirestore("user-123");
    expect(deals.length).toBeGreaterThanOrEqual(1);
    const found = deals.find((d) => d.id === "deal-456");
    expect(found).toBeDefined();
    expect(found?.address).toBe("100 Ocean Drive");
    expect(found?.arv).toBe(450000);
  });

  it("removes a saved deal from user watchlist", async () => {
    await removeSavedDealFromFirestore("user-123", "deal-456");
    const deals = await getSavedDealsFromFirestore("user-123");
    const found = deals.find((d) => d.id === "deal-456");
    expect(found).toBeUndefined();
  });

  it("saves filter presets with user ownership", async () => {
    await saveFilterPresetToFirestore("user-123", {
      id: "preset-1",
      name: "High Cap Rate FL",
      county: "Orange",
      minScore: 80,
      maxPrice: 350000,
      isShadowOnly: false,
    });
    const stored = mockDocsMap.get("users/user-123/filterPresets/preset-1");
    expect(stored).toBeDefined();
    expect(stored.name).toBe("High Cap Rate FL");
    expect(stored.userId).toBe("user-123");
  });
});
