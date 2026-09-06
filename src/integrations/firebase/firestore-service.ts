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
import { db } from "./config";

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
          email,
          displayName: displayName || snap.data()?.displayName || "",
          photoURL: photoURL || snap.data()?.photoURL || "",
          updatedAt: now,
        },
        { merge: true },
      );
    }
  } catch (err) {
    console.error("Failed to sync user profile to Firestore:", err);
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
  const dealRef = doc(db, "users", userId, "savedDeals", deal.id);
  const now = new Date().toISOString();

  const existingSnap = await getDoc(dealRef).catch(() => null);
  const isUpdate = existingSnap?.exists();

  const payload: SavedDealData = {
    ...deal,
    userId,
    createdAt: isUpdate ? existingSnap.data()?.createdAt || now : now,
    updatedAt: now,
  };

  await setDoc(dealRef, payload, { merge: true });
}

/**
 * Fetches all saved deals for a given user.
 */
export async function getSavedDealsFromFirestore(userId: string): Promise<SavedDealData[]> {
  if (!userId) return [];
  const dealsCol = collection(db, "users", userId, "savedDeals");
  const q = query(dealsCol, orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => docSnap.data() as SavedDealData);
}

/**
 * Removes a saved deal from the user's watchlist.
 */
export async function removeSavedDealFromFirestore(userId: string, dealId: string): Promise<void> {
  if (!userId || !dealId) return;
  const dealRef = doc(db, "users", userId, "savedDeals", dealId);
  await deleteDoc(dealRef);
}

/**
 * Saves a user filter preset.
 */
export async function saveFilterPresetToFirestore(
  userId: string,
  preset: Omit<UserFilterPresetData, "userId" | "createdAt">,
): Promise<void> {
  if (!userId || !preset.id) return;
  const presetRef = doc(db, "users", userId, "filterPresets", preset.id);
  const payload: UserFilterPresetData = {
    ...preset,
    userId,
    createdAt: new Date().toISOString(),
  };
  await setDoc(presetRef, payload);
}

/**
 * Retrieves all saved filter presets for a user.
 */
export async function getFilterPresetsFromFirestore(userId: string): Promise<UserFilterPresetData[]> {
  if (!userId) return [];
  const presetsCol = collection(db, "users", userId, "filterPresets");
  const q = query(presetsCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => docSnap.data() as UserFilterPresetData);
}

/**
 * Deletes a filter preset.
 */
export async function removeFilterPresetFromFirestore(userId: string, presetId: string): Promise<void> {
  if (!userId || !presetId) return;
  const presetRef = doc(db, "users", userId, "filterPresets", presetId);
  await deleteDoc(presetRef);
}
