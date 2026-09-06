import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthenticatedFirebaseUser, auth } from "@/integrations/firebase/config";

describe("Firebase Authentication & Protected Session Contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves authenticated user when Firebase authStateReady fires", async () => {
    const mockUser = {
      uid: "usr_fl_analyst_01",
      email: "analyst@perfectproperty.com",
      displayName: "Institutional Analyst",
      emailVerified: true,
    };

    (auth as any).authStateReady = vi.fn().mockResolvedValue(undefined);
    (auth as any).currentUser = mockUser;

    const user = await getAuthenticatedFirebaseUser();
    expect(user).toBeDefined();
    expect(user?.uid).toBe("usr_fl_analyst_01");
    expect(user?.email).toBe("analyst@perfectproperty.com");
  });

  it("returns null when no Firebase session exists", async () => {
    (auth as any).authStateReady = vi.fn().mockResolvedValue(undefined);
    (auth as any).currentUser = null;

    const user = await getAuthenticatedFirebaseUser();
    expect(user).toBeNull();
  });

  it("correctly constructs protected route redirection targets", () => {
    const calculateRedirect = (pathname: string, searchStr: string, redirectTo = "/auth") => {
      const fullPath = pathname + (searchStr && searchStr !== "?" ? searchStr : "");
      const nextParam = fullPath && fullPath !== "/" ? `?next=${encodeURIComponent(fullPath)}` : "";
      return `${redirectTo}${nextParam}`;
    };

    expect(calculateRedirect("/workspace", "?query=orlando")).toBe(
      "/auth?next=%2Fworkspace%3Fquery%3Dorlando"
    );
    expect(calculateRedirect("/deals", "")).toBe("/auth?next=%2Fdeals");
    expect(calculateRedirect("/shadow", "?ring=2")).toBe("/auth?next=%2Fshadow%3Fring%3D2");
    expect(calculateRedirect("/", "")).toBe("/auth");
  });
});
