import { createContext, useContext } from "react";
import type { AuthContextType } from "./auth-types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useFirebaseAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
}

export function useAuth(): AuthContextType {
  return useFirebaseAuth();
}
