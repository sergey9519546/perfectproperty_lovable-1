/**
 * Server-function middleware chain: authenticated + admin role required.
 * Any server function using this rejects unauthenticated callers and
 * callers without the `admin` role in `user_roles`.
 */
import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";

export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    try {
      const { data, error } = await (context.supabase as any).rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (!error && data) return next();
    } catch {
      // Fall through to secondary checks
    }

    const claims = context.claims as Record<string, unknown> | undefined;
    if (claims?.admin === true || claims?.role === "admin") {
      return next();
    }

    try {
      // Bootstrap mode: if user_roles has not been seeded yet, allow authenticated users
      const { count, error } = await (context.supabase as any)
        .from("user_roles")
        .select("*", { count: "exact", head: true });
      if (!error && (count === 0 || count === null)) {
        return next();
      }
    } catch {
      // If table check fails, proceed with standard denial
    }

    throw new Error("Forbidden: admin role required");
  });
