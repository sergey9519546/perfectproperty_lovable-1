import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  captureBoundaryCrash,
  captureException,
  getRecentCrashes,
  clearCrashHistory,
  subscribeToCrashes,
  exportCrashLogsAsJson,
  getCrashStats,
  type ProductionCrashRecord,
} from "./error-monitor";

describe("Production Crash & Error Monitoring Service", () => {
  beforeEach(() => {
    clearCrashHistory();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearCrashHistory();
  });

  it("captures structured boundary crash with stack, location, and component metadata", () => {
    const mockError = new Error("Lien calculation division by zero in UnderwritingEngine");
    mockError.stack = "Error: Lien calculation division by zero\n    at calculateUnderwritingScore (underwrite.ts:42:15)";

    const consoleGroupSpy = vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleGroupEndSpy = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

    const record = captureBoundaryCrash(mockError, {
      boundary: "SheriffSalesErrorBoundary",
      componentName: "UnderwritingModal",
      componentStack: "\n    in UnderwritingModal (at SheriffSalesDashboard.tsx:855)",
      metadata: {
        docketNumber: "F-019283-25",
        county: "Bergen",
      },
    });

    expect(record).toBeDefined();
    expect(record.id).toBeTruthy();
    expect(record.boundary).toBe("SheriffSalesErrorBoundary");
    expect(record.componentName).toBe("UnderwritingModal");
    expect(record.message).toBe("Lien calculation division by zero in UnderwritingEngine");
    expect(record.name).toBe("Error");
    expect(record.componentStack).toContain("in UnderwritingModal");
    expect(record.metadata).toEqual({
      docketNumber: "F-019283-25",
      county: "Bergen",
    });
    expect(record.handled).toBe(true);
    expect(record.severity).toBe("error");

    expect(consoleGroupSpy).toHaveBeenCalled();
  });

  it("handles string and non-standard thrown objects safely without throwing", () => {
    const recordFromString = captureBoundaryCrash("Network timeout requesting GIS parcel shape", {
      boundary: "SectionBoundary",
    });

    expect(recordFromString.name).toBe("StringError");
    expect(recordFromString.message).toBe("Network timeout requesting GIS parcel shape");

    const recordFromObject = captureBoundaryCrash({ code: "ERR_LIEN_ORPHAN", detail: "Senior mortgage missing" }, {
      boundary: "ManualCapture",
    });

    expect(recordFromObject.message).toContain("ERR_LIEN_ORPHAN");
  });

  it("maintains recent crash records in circular buffer and supports export", () => {
    for (let i = 1; i <= 5; i++) {
      captureException(new Error(`Test crash #${i}`), {
        boundary: i % 2 === 0 ? "SheriffSalesErrorBoundary" : "SectionBoundary",
      });
    }

    const recent = getRecentCrashes(10);
    expect(recent.length).toBe(5);
    expect(recent[0].message).toBe("Test crash #5");

    const stats = getCrashStats();
    expect(stats.total).toBe(5);
    expect(stats.byBoundary["SheriffSalesErrorBoundary"]).toBe(2);
    expect(stats.byBoundary["SectionBoundary"]).toBe(3);

    const jsonExport = exportCrashLogsAsJson();
    const parsed = JSON.parse(jsonExport);
    expect(parsed.count).toBe(5);
    expect(parsed.crashes.length).toBe(5);
  });

  it("notifies realtime subscribers when a new boundary crash occurs", () => {
    const subscriberSpy = vi.fn();
    const unsubscribe = subscribeToCrashes(subscriberSpy);

    const error = new TypeError("Cannot read property 'openingBid' of undefined");
    captureBoundaryCrash(error, {
      boundary: "SheriffSalesDashboard",
      componentName: "AuctionTable",
    });

    expect(subscriberSpy).toHaveBeenCalledTimes(1);
    const receivedRecord: ProductionCrashRecord = subscriberSpy.mock.calls[0][0];
    expect(receivedRecord.message).toBe("Cannot read property 'openingBid' of undefined");
    expect(receivedRecord.boundary).toBe("SheriffSalesDashboard");

    unsubscribe();

    captureBoundaryCrash(new Error("Another error"), { boundary: "TestBoundary" });
    expect(subscriberSpy).toHaveBeenCalledTimes(1);
  });
});
