/**
 * Production Crash & Error Monitoring Service
 * 
 * Lightweight, structured telemetry and crash capture engine that tracks
 * React Error Boundary failures, unhandled exceptions, and component stack traces.
 */

import { reportLovableError } from "./lovable-error-reporting";

export type CrashSeverity = "fatal" | "error" | "warning" | "info";

export interface ProductionCrashRecord {
  id: string;
  timestamp: string;
  boundary: string;
  componentName?: string;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  route?: string;
  severity: CrashSeverity;
  handled: boolean;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  sessionId?: string;
}

export interface BoundaryCrashOptions {
  boundary: string;
  componentName?: string;
  componentStack?: string;
  severity?: CrashSeverity;
  handled?: boolean;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "pp_crash_logs";
const MAX_BUFFER_SIZE = 50;

// In-memory ring buffer
const memoryCrashBuffer: ProductionCrashRecord[] = [];
const subscribers = new Set<(record: ProductionCrashRecord) => void>();

let isGlobalMonitoringInitialized = false;
let sessionUuid = "";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `crash_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getSessionId(): string {
  if (sessionUuid) return sessionUuid;
  if (typeof sessionStorage !== "undefined") {
    try {
      const stored = sessionStorage.getItem("pp_monitor_session_id");
      if (stored) {
        sessionUuid = stored;
        return sessionUuid;
      }
      sessionUuid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem("pp_monitor_session_id", sessionUuid);
      return sessionUuid;
    } catch {
      // Storage unavailable
    }
  }
  sessionUuid = `sess_${Date.now()}`;
  return sessionUuid;
}

function parseError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: error.message || "An unexpected error occurred",
      stack: error.stack,
    };
  }
  if (typeof error === "string") {
    return {
      name: "StringError",
      message: error,
    };
  }
  if (error && typeof error === "object") {
    try {
      return {
        name: (error as any).name || "ObjectError",
        message: (error as any).message || JSON.stringify(error),
        stack: (error as any).stack,
      };
    } catch {
      return {
        name: "UnserializableObjectError",
        message: "Object could not be converted to string",
      };
    }
  }
  return {
    name: "UnknownError",
    message: String(error ?? "Unknown error"),
  };
}

/**
 * Emit structured console logs with high-visibility formatting
 */
function logStructuredCrash(record: ProductionCrashRecord) {
  const prefix = `[CRASH_MONITOR][${record.severity.toUpperCase()}][${record.boundary}]`;
  const banner = `${prefix} ${record.componentName ? `in <${record.componentName}>: ` : ""}${record.message}`;

  if (typeof console !== "undefined") {
    if (record.severity === "fatal" || record.severity === "error") {
      console.groupCollapsed(`%c🚨 ${banner}`, "color: #ff3344; font-weight: bold; background: #fff1f2; padding: 2px 6px; border-radius: 4px;");
      console.error("Crash Record:", record);
      if (record.stack) console.error("Error Stack:\n", record.stack);
      if (record.componentStack) console.warn("React Component Stack:\n", record.componentStack);
      if (record.metadata && Object.keys(record.metadata).length > 0) {
        console.info("Attached Metadata:", record.metadata);
      }
      console.groupEnd();
    } else {
      console.warn(`[CRASH_MONITOR] ${banner}`, record);
    }
  }
}

/**
 * Persist crash record into local storage ring buffer
 */
function persistCrash(record: ProductionCrashRecord) {
  // Add to in-memory buffer
  memoryCrashBuffer.unshift(record);
  if (memoryCrashBuffer.length > MAX_BUFFER_SIZE) {
    memoryCrashBuffer.pop();
  }

  // Persist to localStorage safely
  if (typeof localStorage !== "undefined") {
    try {
      const existingJson = localStorage.getItem(STORAGE_KEY);
      let existingList: ProductionCrashRecord[] = [];
      if (existingJson) {
        existingList = JSON.parse(existingJson);
      }
      existingList.unshift(record);
      if (existingList.length > MAX_BUFFER_SIZE) {
        existingList = existingList.slice(0, MAX_BUFFER_SIZE);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingList));
    } catch {
      // Ignore quota or privacy exceptions
    }
  }

  // Notify active subscribers
  subscribers.forEach((subscriber) => {
    try {
      subscriber(record);
    } catch (err) {
      console.error("[CRASH_MONITOR] Subscriber callback failed:", err);
    }
  });

  // Dispatch custom browser event for telemetry collectors
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new CustomEvent("pp:crash_event", { detail: record }));
    } catch {
      // Event dispatch fallback
    }
  }
}

/**
 * Capture an error caught by a React Error Boundary
 */
export function captureBoundaryCrash(
  error: unknown,
  options: BoundaryCrashOptions
): ProductionCrashRecord {
  const { name, message, stack } = parseError(error);
  const locationUrl = typeof window !== "undefined" ? window.location.href : "unknown_location";
  const locationRoute = typeof window !== "undefined" ? window.location.pathname : "/";
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;

  const record: ProductionCrashRecord = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    boundary: options.boundary,
    componentName: options.componentName,
    name,
    message,
    stack,
    componentStack: options.componentStack,
    url: locationUrl,
    route: locationRoute,
    severity: options.severity || "error",
    handled: options.handled ?? true,
    metadata: options.metadata,
    userAgent,
    sessionId: getSessionId(),
  };

  // 1. Log structured entry to console
  logStructuredCrash(record);

  // 2. Persist locally and notify listeners
  persistCrash(record);

  // 3. Forward to Lovable telemetry if present
  try {
    reportLovableError(error, {
      boundary: options.boundary,
      componentName: options.componentName,
      crashId: record.id,
      componentStack: options.componentStack,
      ...options.metadata,
    });
  } catch {
    // Graceful fallback
  }

  return record;
}

/**
 * Capture an arbitrary unhandled exception or business logic failure
 */
export function captureException(
  error: unknown,
  context: Record<string, unknown> = {},
  severity: CrashSeverity = "error"
): ProductionCrashRecord {
  return captureBoundaryCrash(error, {
    boundary: (context.boundary as string) || "ManualCapture",
    componentName: (context.componentName as string) || undefined,
    severity,
    handled: (context.handled as boolean) ?? false,
    metadata: context,
  });
}

/**
 * Retrieve recent recorded crash events
 */
export function getRecentCrashes(limit = 20): ProductionCrashRecord[] {
  // If memory buffer has items, return them
  if (memoryCrashBuffer.length > 0) {
    return memoryCrashBuffer.slice(0, limit);
  }

  // Fallback to reading localStorage
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ProductionCrashRecord[] = JSON.parse(stored);
        return parsed.slice(0, limit);
      }
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Clear stored crash logs
 */
export function clearCrashHistory(): void {
  memoryCrashBuffer.length = 0;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable
    }
  }
}

/**
 * Subscribe to realtime crash events
 */
export function subscribeToCrashes(listener: (record: ProductionCrashRecord) => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

/**
 * Export crash history formatted as JSON
 */
export function exportCrashLogsAsJson(): string {
  const crashes = getRecentCrashes(MAX_BUFFER_SIZE);
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: crashes.length,
      crashes,
    },
    null,
    2
  );
}

/**
 * Get aggregated breakdown of errors by boundary
 */
export function getCrashStats(): {
  total: number;
  byBoundary: Record<string, number>;
  latest: string | null;
} {
  const crashes = getRecentCrashes(MAX_BUFFER_SIZE);
  const byBoundary: Record<string, number> = {};

  crashes.forEach((c) => {
    byBoundary[c.boundary] = (byBoundary[c.boundary] || 0) + 1;
  });

  return {
    total: crashes.length,
    byBoundary,
    latest: crashes[0]?.timestamp || null,
  };
}

/**
 * Hook global window unhandled errors and promise rejections
 */
export function initGlobalCrashMonitoring(): void {
  if (isGlobalMonitoringInitialized || typeof window === "undefined") {
    return;
  }

  isGlobalMonitoringInitialized = true;

  window.addEventListener("error", (event: ErrorEvent) => {
    captureBoundaryCrash(event.error || event.message, {
      boundary: "GlobalWindowOnError",
      componentName: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
      severity: "fatal",
      handled: false,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    captureBoundaryCrash(event.reason, {
      boundary: "UnhandledPromiseRejection",
      severity: "error",
      handled: false,
    });
  });
}

// Auto-initialize global listeners when in browser context
if (typeof window !== "undefined") {
  initGlobalCrashMonitoring();
}
