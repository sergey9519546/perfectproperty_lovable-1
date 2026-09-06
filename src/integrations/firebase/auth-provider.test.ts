import { describe, it, expect } from "vitest";
import { firebaseConfig, firebaseAppletConfig } from "./config";
import {
  FirebaseAuthProvider,
  useFirebaseAuth,
  useAuth,
  formatAuthErrorMessage,
} from "./index";
import appletConfigJson from "../../../firebase-applet-config.json";

describe("Firebase Auth Provider & Credentials", () => {
  it("binds credentials directly from firebase-applet-config.json", () => {
    expect(firebaseConfig.projectId).toBe(appletConfigJson.projectId);
    expect(firebaseConfig.appId).toBe(appletConfigJson.appId);
    expect(firebaseConfig.apiKey).toBe(appletConfigJson.apiKey);
    expect(firebaseConfig.authDomain).toBe(appletConfigJson.authDomain);
    expect(firebaseConfig.storageBucket).toBe(appletConfigJson.storageBucket);
    expect(firebaseConfig.messagingSenderId).toBe(appletConfigJson.messagingSenderId);
    expect(firebaseAppletConfig.projectId).toBe(appletConfigJson.projectId);
  });

  it("exports FirebaseAuthProvider, useFirebaseAuth, and useAuth", () => {
    expect(FirebaseAuthProvider).toBeDefined();
    expect(typeof FirebaseAuthProvider).toBe("function");
    expect(useFirebaseAuth).toBeDefined();
    expect(typeof useFirebaseAuth).toBe("function");
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe("function");
  });

  it("translates Firebase auth error codes into human-readable messages", () => {
    const popupError = Object.assign(new Error("Popup was closed"), {
      code: "auth/popup-closed-by-user",
    });
    expect(formatAuthErrorMessage(popupError)).toBe(
      "Sign-in popup was closed before completing."
    );

    const credentialError = Object.assign(new Error("Bad credentials"), {
      code: "auth/invalid-credential",
    });
    expect(formatAuthErrorMessage(credentialError)).toBe("Invalid email or password.");

    const emailInUseError = Object.assign(new Error("Conflict"), {
      code: "auth/email-already-in-use",
    });
    expect(formatAuthErrorMessage(emailInUseError)).toBe(
      "An account with this email address already exists."
    );

    const weakPasswordError = Object.assign(new Error("Short"), {
      code: "auth/weak-password",
    });
    expect(formatAuthErrorMessage(weakPasswordError)).toBe(
      "Password is too weak. Please use at least 6 characters."
    );

    const networkError = Object.assign(new Error("Network offline"), {
      code: "auth/network-request-failed",
    });
    expect(formatAuthErrorMessage(networkError)).toBe(
      "Network connection issue. Please check your internet connection."
    );

    const rateLimitError = Object.assign(new Error("Rate limited"), {
      code: "auth/too-many-requests",
    });
    expect(formatAuthErrorMessage(rateLimitError)).toBe(
      "Access temporarily disabled due to multiple failed login attempts. Try again later."
    );

    const genericError = new Error("Custom unexpected failure");
    expect(formatAuthErrorMessage(genericError)).toBe("Custom unexpected failure");

    expect(formatAuthErrorMessage(null)).toBe("An unknown authentication error occurred.");
  });
});
