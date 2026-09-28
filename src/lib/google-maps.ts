export const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';
export const DEFAULT_MAP_ID = 'DEMO_MAP_ID';
export const DEMO_KEY_URL =
  'https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio';
export const BILLING_ENABLE_URL =
  'https://console.cloud.google.com/project/_/billing/enable';
export const BILLING_DOCS_URL =
  'https://developers.google.com/maps/documentation/javascript/error-messages#billing-not-enabled-map-error';

const STORAGE_KEY = 'gmp_user_api_key';

let isBillingErrorState = false;
const statusListeners = new Set<(isError: boolean) => void>();

export function isGoogleMapsBillingError(): boolean {
  return isBillingErrorState;
}

export function setGoogleMapsBillingError(isError: boolean): void {
  isBillingErrorState = isError;
  statusListeners.forEach((callback) => {
    try {
      callback(isError);
    } catch (e) {
      console.warn('Google Maps status listener error:', e);
    }
  });
}

export function onGoogleMapsStatusChange(callback: (isError: boolean) => void): () => void {
  statusListeners.add(callback);
  return () => {
    statusListeners.delete(callback);
  };
}

// Hook Google Maps global auth failure callback and console.error if running in browser
if (typeof window !== 'undefined') {
  let userAuthFailure: (() => void) | undefined = (window as unknown as { gm_authFailure?: () => void }).gm_authFailure;

  try {
    Object.defineProperty(window, 'gm_authFailure', {
      configurable: true,
      enumerable: true,
      get() {
        return function () {
          console.warn('[Google Maps Platform] Authentication or billing failure detected (gm_authFailure). Enabling fallback mode.');
          setGoogleMapsBillingError(true);
          if (typeof userAuthFailure === 'function') {
            userAuthFailure();
          }
        };
      },
      set(fn: (() => void) | undefined) {
        userAuthFailure = fn;
      },
    });
  } catch (e) {
    // Fallback if property cannot be redefined
    const prevFn = (window as unknown as { gm_authFailure?: () => void }).gm_authFailure;
    (window as unknown as { gm_authFailure: () => void }).gm_authFailure = function () {
      console.warn('[Google Maps Platform] Authentication or billing failure detected (gm_authFailure).');
      setGoogleMapsBillingError(true);
      if (typeof prevFn === 'function') prevFn();
    };
  }

  // Intercept console.error to catch BillingNotEnabledMapError directly from Google Maps script
  const origConsoleError = console.error;
  console.error = function (...args: unknown[]) {
    const errorStr = args.map((a) => (typeof a === 'string' ? a : (a as Error)?.message || '')).join(' ');
    if (
      errorStr.includes('BillingNotEnabledMapError') ||
      errorStr.includes('billing-not-enabled-map-error') ||
      errorStr.includes('ApiNotActivatedMapError')
    ) {
      setGoogleMapsBillingError(true);
    }
    origConsoleError.apply(console, args);
  };

  window.addEventListener('gmp:billing_error', () => {
    setGoogleMapsBillingError(true);
  });
}

export function getGoogleMapsApiKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local !== null) {
      if (local === '__DISABLED__' || local.trim() === '') {
        return '';
      }
      return local.trim();
    }
  }
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  if (envKey.trim().length > 0) {
    return envKey.trim();
  }
  return '';
}

export function setGoogleMapsApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key && key.trim().length > 0) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.setItem(STORAGE_KEY, '__DISABLED__');
    }
  }
}

export function resetGoogleMapsApiKeyToEnv(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Clean, high-contrast slate & silver cartographic styling for Google Maps
 */
export const LIGHT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e293b' }, { weight: 1.5 }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#f1f5f9' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e2f4ea' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#15803d' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#f1f5f9' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e0f2fe' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }],
  },
];

/**
 * Elegant dark theme map style for Google Maps roadmaps matching the Perfect Property aesthetic
 */
export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#161920' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#161920' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ba3af' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d1d5db' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1f242e' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4b5563' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#262c37' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1b1f27' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#828c9b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#323947' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1b1f27' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d1b87a' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#232934' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ba3af' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0d1117' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4b5563' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0d1117' }],
  },
];
