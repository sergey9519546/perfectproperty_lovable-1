// Global function middleware for attaching client authentication tokens
import { createMiddleware } from '@tanstack/react-start'
import { supabase } from './client'
import { getAuthenticatedFirebaseUser } from '@/integrations/firebase'

// Registered as global `functionMiddleware` in `src/start.ts`
// Attaches Supabase bearer token, or Firebase ID token as fallback
export const attachSupabaseAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    try {
      const { data } = await supabase.auth.getSession()
      let token = data.session?.access_token

      if (!token) {
        const fbUser = await getAuthenticatedFirebaseUser()
        if (fbUser) {
          token = await fbUser.getIdToken()
        }
      }

      if (!token && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('pp_demo_session');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            token = parsed.token;
          } catch {
            // Ignore unparseable demo session payload
          }
        }
      }

      return next({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch {
      return next({ headers: {} })
    }
  },
)

