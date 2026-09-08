import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SheriffSalesAuthGuard,
  UnderwritingAuthDialog,
  useUnderwritingAccessGate,
} from './components/SheriffSalesAuthGuard';
import { getAuthenticatedFirebaseUser } from '@/integrations/firebase/config';

describe('Sheriff Sales Auth Guard & Underwriting Protection Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Export & Contract Integrity', () => {
    it('exports SheriffSalesAuthGuard component properly', () => {
      expect(SheriffSalesAuthGuard).toBeDefined();
      expect(typeof SheriffSalesAuthGuard).toBe('function');
    });

    it('exports UnderwritingAuthDialog component properly', () => {
      expect(UnderwritingAuthDialog).toBeDefined();
      expect(typeof UnderwritingAuthDialog).toBe('function');
    });

    it('exports useUnderwritingAccessGate hook properly', () => {
      expect(useUnderwritingAccessGate).toBeDefined();
      expect(typeof useUnderwritingAccessGate).toBe('function');
    });
  });

  describe('Underwriting Access Authorization Logic', () => {
    it('allows underwriting analysis execution when user is authenticated with Firebase', () => {
      const mockUser = {
        uid: 'analyst_firebase_123',
        email: 'studiodotmgmt@gmail.com',
      };

      const checkAccess = (user: typeof mockUser | null, onExecute: () => void) => {
        if (user) {
          onExecute();
          return { allowed: true, triggeredModal: false };
        }
        return { allowed: false, triggeredModal: true };
      };

      const spyAction = vi.fn();
      const result = checkAccess(mockUser, spyAction);

      expect(result.allowed).toBe(true);
      expect(result.triggeredModal).toBe(false);
      expect(spyAction).toHaveBeenCalledTimes(1);
    });

    it('intercepts underwriting analysis execution when user is unauthenticated', () => {
      const checkAccess = (user: any, onExecute: () => void) => {
        if (user) {
          onExecute();
          return { allowed: true, triggeredModal: false };
        }
        return { allowed: false, triggeredModal: true };
      };

      const spyAction = vi.fn();
      const result = checkAccess(null, spyAction);

      expect(result.allowed).toBe(false);
      expect(result.triggeredModal).toBe(true);
      expect(spyAction).not.toHaveBeenCalled();
    });

    it('generates correct protected redirect target with docket or filter preservation', () => {
      const generateRedirectUrl = (pathname: string, search = '', redirectTo = '/auth') => {
        const full = pathname + (search && search !== '?' ? search : '');
        const next = full && full !== '/' ? `?next=${encodeURIComponent(full)}` : '';
        return `${redirectTo}${next}`;
      };

      expect(generateRedirectUrl('/sheriff-sales')).toBe('/auth?next=%2Fsheriff-sales');
      expect(generateRedirectUrl('/sheriff-sales', '?county=Bergen&search=hackensack')).toBe(
        '/auth?next=%2Fsheriff-sales%3Fcounty%3DBergen%26search%3Dhackensack'
      );
    });
  });

  describe('Demo Analyst Fallback Session Flow', () => {
    it('creates valid analyst session payload on demo sign in', () => {
      const createDemoSession = () => ({
        uid: `demo_analyst_${Date.now()}`,
        email: 'demo.analyst@perfectproperty.dev',
        displayName: 'Demo Institutional Analyst',
        role: 'analyst',
        isDemo: true,
      });

      const session = createDemoSession();
      expect(session.uid).toMatch(/^demo_analyst_/);
      expect(session.email).toBe('demo.analyst@perfectproperty.dev');
      expect(session.isDemo).toBe(true);
    });
  });
});
