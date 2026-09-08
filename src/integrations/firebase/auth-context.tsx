import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useMemo } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, googleAuthProvider, testFirestoreConnection, firebaseConfig } from "./config";
import { syncUserProfile } from "./firestore-service";
import { AuthContext } from "./auth-context-core";
import { formatAuthErrorMessage } from "./auth-errors";
import type { AuthContextType, FirebaseAuthProviderProps } from "./auth-types";

function createDemoUser(sessionData: {
  token?: string;
  user?: { id?: string; email?: string; fullName?: string };
}): User {
  const uid = sessionData.user?.id || "00000000-0000-4000-8000-000000000001";
  const email = sessionData.user?.email || "demo@perfectproperty.ai";
  const displayName = sessionData.user?.fullName || "Demo Analyst";
  const token = sessionData.token || "";

  return {
    uid,
    email,
    displayName,
    photoURL: null,
    phoneNumber: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toUTCString(),
      lastSignInTime: new Date().toUTCString(),
    },
    providerData: [],
    providerId: "demo",
    tenantId: null,
    refreshToken: "",
    delete: async () => {},
    getIdToken: async () => token,
    getIdTokenResult: async () => ({
      token,
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 30 * 86400000).toISOString(),
      signInProvider: "demo",
      signInSecondFactor: null,
      claims: {
        admin: true,
        role: "admin",
      },
    }),
    reload: async () => {},
    toJSON: () => ({ uid, email, displayName }),
  } as unknown as User;
}

/**
 * FirebaseAuthProvider wraps the application and exposes real-time Firebase Authentication state,
 * credentials, and methods backed by 'firebase-applet-config.json'.
 */
export function FirebaseAuthProvider({
  children,
  fallback,
  showErrorBanner = false,
}: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    if (auth.currentUser) return auth.currentUser;
    if (typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem("pp_demo_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.token || parsed?.user) {
            return createDemoUser(parsed);
          }
        }
      } catch {
        // Ignore unparseable or corrupted session payload
      }
    }
    return null;
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isOperating, setIsOperating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(() => {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      return "Firebase configuration credentials missing from firebase-applet-config.json.";
    }
    return null;
  });
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    testFirestoreConnection().catch(() => {
      // Handled silently; offline persistence ensures local responsiveness
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          if (typeof localStorage !== "undefined") {
            localStorage.removeItem("pp_demo_session");
          }
          setUser(currentUser);
          try {
            await syncUserProfile(
              currentUser.uid,
              currentUser.email || "",
              currentUser.displayName || undefined,
              currentUser.photoURL || undefined,
            );
          } catch (syncErr) {
            console.warn("User profile background sync notice:", syncErr);
          }
        } else {
          // Check for active demo session if Firebase has no current user
          if (typeof localStorage !== "undefined") {
            try {
              const stored = localStorage.getItem("pp_demo_session");
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.token || parsed?.user) {
                  setUser(createDemoUser(parsed));
                  setIsInitializing(false);
                  return;
                }
              }
            } catch {
              // Ignore unparseable stored demo token
            }
          }
          setUser(null);
        }
        setIsInitializing(false);
      },
      (stateErr) => {
        console.error("Firebase auth state change error:", stateErr);
        const msg = formatAuthErrorMessage(stateErr);
        setError(msg);
        setAuthError(stateErr instanceof Error ? stateErr : new Error(msg));
        setIsInitializing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async (): Promise<User> => {
    setError(null);
    setAuthError(null);
    setIsOperating(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const loggedUser = result.user;
      setUser(loggedUser);
      try {
        await syncUserProfile(
          loggedUser.uid,
          loggedUser.email || "",
          loggedUser.displayName || undefined,
          loggedUser.photoURL || undefined,
        );
      } catch (syncErr) {
        console.warn("Profile sync notice:", syncErr);
      }
      return loggedUser;
    } catch (err: unknown) {
      const msg = formatAuthErrorMessage(err);
      setError(msg);
      const errObj = err instanceof Error ? err : new Error(msg);
      setAuthError(errObj);
      throw errObj;
    } finally {
      setIsOperating(false);
    }
  };

  const handleEmailSignIn = async (email: string, pass: string): Promise<User> => {
    setError(null);
    setAuthError(null);
    setIsOperating(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(result.user);
      return result.user;
    } catch (err: unknown) {
      const msg = formatAuthErrorMessage(err);
      setError(msg);
      const errObj = err instanceof Error ? err : new Error(msg);
      setAuthError(errObj);
      throw errObj;
    } finally {
      setIsOperating(false);
    }
  };

  const handleEmailSignUp = async (
    email: string,
    pass: string,
    name?: string
  ): Promise<User> => {
    setError(null);
    setAuthError(null);
    setIsOperating(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const newUser = result.user;
      setUser(newUser);
      try {
        await syncUserProfile(newUser.uid, newUser.email || "", name, undefined);
      } catch (syncErr) {
        console.warn("Profile creation sync notice:", syncErr);
      }
      return newUser;
    } catch (err: unknown) {
      const msg = formatAuthErrorMessage(err);
      setError(msg);
      const errObj = err instanceof Error ? err : new Error(msg);
      setAuthError(errObj);
      throw errObj;
    } finally {
      setIsOperating(false);
    }
  };

  const handleDemoSignIn = async (demoData?: any): Promise<User> => {
    setError(null);
    setAuthError(null);
    setIsOperating(true);
    try {
      const sessionData = demoData || {
        token: "demo-token",
        user: {
          id: "00000000-0000-4000-8000-000000000001",
          email: "demo@perfectproperty.ai",
          fullName: "Demo Analyst",
          role: "admin",
        },
      };
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pp_demo_session", JSON.stringify(sessionData));
      }
      const demoUser = createDemoUser(sessionData);
      setUser(demoUser);
      return demoUser;
    } finally {
      setIsOperating(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setError(null);
    setAuthError(null);
    setIsOperating(true);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("pp_demo_session");
      }
      await signOut(auth).catch(() => {});
      setUser(null);
    } catch (err: unknown) {
      const msg = formatAuthErrorMessage(err);
      setError(msg);
      const errObj = err instanceof Error ? err : new Error(msg);
      setAuthError(errObj);
      throw errObj;
    } finally {
      setIsOperating(false);
    }
  };

  const clearError = () => {
    setError(null);
    setAuthError(null);
  };

  const loading = isInitializing || isOperating;

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      isInitializing,
      isAuthenticated: Boolean(user),
      error,
      authError,
      signInWithGoogle: handleGoogleSignIn,
      signInWithEmail: handleEmailSignIn,
      signUpWithEmail: handleEmailSignUp,
      signInAsDemoUser: handleDemoSignIn,
      signOutUser: handleSignOut,
      signOut: handleSignOut,
      clearError,
      config: {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        appId: firebaseConfig.appId,
      },
    }),
    [user, loading, isInitializing, error, authError]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {showErrorBanner && error && (
        <div
          role="alert"
          aria-live="assertive"
          className="sticky top-0 z-[100] flex items-center justify-between border-b border-red-500/30 bg-red-950/90 px-4 py-2.5 text-xs text-red-200 shadow-md backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-red-400">Auth Notice:</span>
            <span>{error}</span>
          </div>
          <Button
            type="button"
            onClick={clearError}
            className="ml-4 rounded border border-red-500/30 bg-red-900/40 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red-300 hover:bg-red-800/50 hover:text-white"
          >
            Dismiss
          </Button>
        </div>
      )}
      {fallback && isInitializing ? fallback : children}
    </AuthContext.Provider>
  );
}

export default FirebaseAuthProvider;
