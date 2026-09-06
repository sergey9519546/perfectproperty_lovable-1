import type { ReactNode } from "react";
import type { User } from "firebase/auth";

export interface FirebaseAuthProviderProps {
  children: ReactNode;
  /** Optional fallback component to display during the initial auth session resolution */
  fallback?: ReactNode;
  /** Whether to render an accessible banner when an authentication error is active. Defaults to false. */
  showErrorBanner?: boolean;
}

export interface AuthContextType {
  /** The currently authenticated Firebase user, or null if unauthenticated */
  user: User | null;
  /** True while the authentication state is being initialized or during auth operations */
  loading: boolean;
  /** True strictly while the initial Firebase session check is running */
  isInitializing: boolean;
  /** Boolean shorthand indicating whether a verified user session exists */
  isAuthenticated: boolean;
  /** Human-readable error message if the last operation failed or if Firebase failed to initialize */
  error: string | null;
  /** Raw Error object if available */
  authError: Error | null;
  /** Google OAuth Popup Sign-In */
  signInWithGoogle: () => Promise<User>;
  /** Email + Password Sign-In */
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  /** Email + Password Account Creation */
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<User>;
  /** Demo Analyst Sign-In */
  signInAsDemoUser: (demoData?: any) => Promise<User>;
  /** Sign out from current Firebase session */
  signOutUser: () => Promise<void>;
  /** Alias for signOutUser */
  signOut: () => Promise<void>;
  /** Resets the current error state to null */
  clearError: () => void;
  /** Public Firebase credentials from firebase-applet-config.json */
  config: {
    projectId: string;
    authDomain: string;
    appId: string;
  };
}
