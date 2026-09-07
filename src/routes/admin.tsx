import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { getAuthenticatedFirebaseUser } from "@/integrations/firebase";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const firebaseUser = await getAuthenticatedFirebaseUser();
    if (firebaseUser) {
      const tokenResult = await firebaseUser.getIdTokenResult().catch(() => null);
      const isFbAdmin = Boolean(tokenResult?.claims?.admin || tokenResult?.claims?.role === "admin");
      if (!isFbAdmin) {
        const isDemo = typeof localStorage !== "undefined" && Boolean(localStorage.getItem("pp_demo_session"));
        if (!isDemo) {
          const { data: userRes } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
          if (userRes?.user) {
            const { data: isAdmin } = await (supabase as any).rpc("has_role", {
              _user_id: userRes.user.id,
              _role: "admin",
            }).catch(() => ({ data: false }));
            if (!isAdmin) {
              throw redirect({ to: "/" });
            }
          } else {
            throw redirect({ to: "/" });
          }
        }
      }
      return;
    }

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      throw redirect({ to: "/auth", search: { next: "/admin" } });
    }
    const { data: isAdmin, error } = await (supabase as any).rpc("has_role", {
      _user_id: userRes.user.id,
      _role: "admin",
    });
    if (error || !isAdmin) {
      throw redirect({ to: "/" });
    }
  },
  component: () => (
    <ProtectedLayout>
      <Outlet />
    </ProtectedLayout>
  ),
});
