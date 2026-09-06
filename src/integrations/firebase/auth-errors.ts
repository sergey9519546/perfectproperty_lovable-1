export function formatAuthErrorMessage(error: unknown): string {
  if (!error) return "An unknown authentication error occurred.";
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing.";
      case "auth/cancelled-popup-request":
        return "Multiple popups were opened. Please retry with a single popup.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password.";
      case "auth/email-already-in-use":
        return "An account with this email address already exists.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/network-request-failed":
        return "Network connection issue. Please check your internet connection.";
      case "auth/too-many-requests":
        return "Access temporarily disabled due to multiple failed login attempts. Try again later.";
      default:
        return error.message || "Authentication request failed.";
    }
  }
  return "Authentication request failed.";
}
