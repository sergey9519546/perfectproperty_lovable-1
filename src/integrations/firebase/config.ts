import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  type Firestore,
} from "firebase/firestore";
import firebaseConfigJson from "../../../firebase-applet-config.json";

export { firebaseConfigJson, firebaseConfigJson as firebaseAppletConfig };

export const firebaseConfig = {
  projectId: firebaseConfigJson.projectId || "gen-lang-client-0579960195",
  appId: firebaseConfigJson.appId || "1:771166131239:web:058d4578f8b6224fccaa02",
  apiKey: firebaseConfigJson.apiKey || "AIzaSyCph3-KKDWDuI3raogxUes391uVoL3UbMs",
  authDomain: firebaseConfigJson.authDomain || "gen-lang-client-0579960195.firebaseapp.com",
  storageBucket: firebaseConfigJson.storageBucket || "gen-lang-client-0579960195.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "771166131239",
};

export const FIRESTORE_DATABASE_ID =
  firebaseConfigJson.firestoreDatabaseId ||
  "ai-studio-perfectproperty-2cd522d6-e85b-46eb-996e-c0d57ddad3e0";

// Initialize Firebase App singleton safely
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Suppress noisy network reconnect diagnostics in sandbox environments
try {
  setLogLevel("error");
} catch {
  // Ignore if unsupported in environment
}

// Initialize Firestore targeting the dedicated provisioned database with resilient forced long-polling transport
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
    },
    FIRESTORE_DATABASE_ID
  );
} catch {
  firestoreInstance = getFirestore(app, FIRESTORE_DATABASE_ID);
}

export const db: Firestore = firestoreInstance;

// Google Auth Provider
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Helper to get the authenticated user after Firebase has finished initializing its auth state.
 */
export async function getAuthenticatedFirebaseUser() {
  if (typeof (auth as any).authStateReady === "function") {
    await (auth as any).authStateReady();
  }
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("pp_demo_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.token) {
          return {
            uid: parsed.user.id || parsed.user.uid || "00000000-0000-4000-8000-000000000001",
            email: parsed.user.email || "demo@perfectproperty.ai",
            displayName: parsed.user.fullName || "Demo Analyst",
            emailVerified: true,
            isAnonymous: false,
            getIdToken: async () => parsed.token,
          } as any;
        }
      } catch {
        // Ignore unparseable demo session payload
      }
    }
  }
  return null;
}

/**
 * Validates connection to Firestore on initial boot without throwing unhandled network exceptions.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (!db) return false;
    await getDoc(doc(db, "test", "connection"));
    return true;
  } catch (error: any) {
    // Graceful fallback in offline/sandboxed environments
    return false;
  }
}
