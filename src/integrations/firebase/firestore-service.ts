import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { db } from "./config";

export function handleFirestoreError(error: unknown): never {
  if (error instanceof FirebaseError) {
    console.error(`Firestore Error [${error.code}]: ${error.message}`);
    throw new Error(`Database operation failed: ${error.message}`);
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error("An unknown database error occurred");
}

export interface UserProfileData {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  tier?: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface SavedDealData {
  id: string;
  userId: string;
  parcelId: string;
  address: string;
  county?: string;
  state?: string;
  arv?: number;
  maxBid?: number;
  predictedSpread?: number;
  underwriteStatus?: "watch" | "active" | "underwritten" | "passed";
  notes?: string;
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilterPresetData {
  id: string;
  userId: string;
  name: string;
  county?: string;
  minScore?: number;
  maxPrice?: number;
  isShadowOnly?: boolean;
  createdAt: string;
}

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

function isDemoUser(userId: string): boolean {
  return userId === DEMO_USER_ID;
}

/**
 * Ensures user profile exists in Firestore /users/{userId}
 */
export async function syncUserProfile(
  userId: string,
  email: string,
  displayName?: string,
  photoURL?: string,
): Promise<void> {
  if (!userId || !email) return;
  if (isDemoUser(userId)) return;

  const userRef = doc(db, "users", userId);
  const now = new Date().toISOString();

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newProfile: UserProfileData = {
        id: userId,
        email,
        displayName: displayName || "",
        photoURL: photoURL || "",
        tier: "pro",
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, newProfile);
    } else {
      await setDoc(
        userRef,
        {
          id: userId,
          email,
          displayName: displayName || snap.data()?.displayName || "",
          photoURL: photoURL || snap.data()?.photoURL || "",
          createdAt: snap.data()?.createdAt || now,
          updatedAt: now,
        },
        { merge: true },
      );
    }
  } catch (error) {
    handleFirestoreError(error);
  }
}

/**
 * Saves or updates a deal in the user's watchlist / portfolio.
 */
export async function saveDealToFirestore(
  userId: string,
  deal: Omit<SavedDealData, "userId" | "createdAt" | "updatedAt">,
): Promise<void> {
  if (!userId || !deal.id) return;
  const now = new Date().toISOString();

  if (isDemoUser(userId)) {
    if (typeof localStorage === 'undefined') return;
    const deals = JSON.parse(localStorage.getItem('pp_demo_deals') || '[]');
    const existing = deals.find((d: any) => d.id === deal.id);
    const updated = [
      ...deals.filter((d: any) => d.id !== deal.id),
      {
        ...existing,
        ...deal,
        userId,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      }
    ];
    localStorage.setItem('pp_demo_deals', JSON.stringify(updated));
    return;
  }

  const dealRef = doc(db, "users", userId, "savedDeals", deal.id);

  try {
    const existingSnap = await getDoc(dealRef).catch(() => null);
    const isUpdate = existingSnap?.exists();

    const payload: SavedDealData = {
      ...deal,
      userId,
      createdAt: isUpdate ? existingSnap.data()?.createdAt || now : now,
      updatedAt: now,
    };

    await setDoc(dealRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error);
  }
}

/**
 * Fetches all saved deals for a given user.
 */
export async function getSavedDealsFromFirestore(userId: string): Promise<SavedDealData[]> {
  if (!userId) return [];

  if (isDemoUser(userId)) {
    if (typeof localStorage === 'undefined') return [];
    return JSON.parse(localStorage.getItem('pp_demo_deals') || '[]')
      .sort((a: any, b: any) => b.updatedAt.localeCompare(a.updatedAt));
  }

  const dealsCol = collection(db, "users", userId, "savedDeals");
  const q = query(dealsCol, orderBy("updatedAt", "desc"));
  
  try {
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => docSnap.data() as SavedDealData);
  } catch (error) {
    handleFirestoreError(error);
  }
}

/**
 * Removes a saved deal from the user's watchlist.
 */
export async function removeSavedDealFromFirestore(userId: string, dealId: string): Promise<void> {
  if (!userId || !dealId) return;

  if (isDemoUser(userId)) {
    if (typeof localStorage === 'undefined') return;
    const deals = JSON.parse(localStorage.getItem('pp_demo_deals') || '[]');
    localStorage.setItem('pp_demo_deals', JSON.stringify(deals.filter((d: any) => d.id !== dealId)));
    return;
  }

  const dealRef = doc(db, "users", userId, "savedDeals", dealId);
  try {
    await deleteDoc(dealRef);
  } catch (error) {
    handleFirestoreError(error);
  }
}

/**
 * Saves a user filter preset.
 */
export async function saveFilterPresetToFirestore(
  userId: string,
  preset: Omit<UserFilterPresetData, "userId" | "createdAt">,
): Promise<void> {
  if (!userId || !preset.id) return;

  if (isDemoUser(userId)) {
    if (typeof localStorage === 'undefined') return;
    const presets = JSON.parse(localStorage.getItem('pp_demo_presets') || '[]');
    const payload = {
      ...preset,
      userId,
      createdAt: new Date().toISOString(),
    };
    const updated = [
      ...presets.filter((p: any) => p.id !== preset.id),
      payload
    ];
    localStorage.setItem('pp_demo_presets', JSON.stringify(updated));
    return;
  }

  const presetRef = doc(db, "users", userId, "filterPresets", preset.id);
  const payload: UserFilterPresetData = {
    ...preset,
    userId,
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(presetRef, payload);
  } catch (error) {
    handleFirestoreError(error);
  }
}

/**
 * Retrieves all saved filter presets for a user.
 */
export async function getFilterPresetsFromFirestore(userId: string): Promise<UserFilterPresetData[]> {
  if (!userId) return [];

  if (isDemoUser(userId)) {
    if (typeof localStorage === 'undefined') return [];
    return JSON.parse(localStorage.getItem('pp_demo_presets') || '[]')
      .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  }

  const presetsCol = collection(db, "users", userId, "filterPresets");
  const q = query(presetsCol, orderBy("createdAt", "desc"));
  try {
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => docSnap.data() as UserFilterPresetData);
  } catch (error) {
    handleFirestoreError(error);
  }
}

/**
 * Deletes a filter preset.
 */
export async function removeFilterPresetFromFirestore(userId: string, presetId: string): Promise<void> {
  if (!userId || !presetId) return;

  if (isDemoUser(userId)) {
    if (typeof localStorage === 'undefined') return;
    const presets = JSON.parse(localStorage.getItem('pp_demo_presets') || '[]');
    localStorage.setItem('pp_demo_presets', JSON.stringify(presets.filter((p: any) => p.id !== presetId)));
    return;
  }

  const presetRef = doc(db, "users", userId, "filterPresets", presetId);
  try {
    await deleteDoc(presetRef);
  } catch (error) {
    handleFirestoreError(error);
  }
}
