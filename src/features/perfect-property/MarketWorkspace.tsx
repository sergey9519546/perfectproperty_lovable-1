import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TopBar } from "./components/TopBar";
import { NavigationRail } from "./components/NavigationRail";
import { EvidencePanel } from "./components/EvidencePanel";
import { DealTable } from "./components/DealTable";
import { CommandPalette } from "./components/CommandPalette";
import { MapCanvas } from "./components/MapCanvas";
import { DossierPanel } from "@/components/DossierPanel";
import { listRankedParcels } from "@/lib/parcels.functions";
import { supabase } from "@/integrations/supabase/client";
import { useFirebaseAuth } from "@/integrations/firebase";
import { BRAND_CONFIG } from "@/lib/brand";
import {
  observeProductExperience,
  recordWorkflowAction,
  trackProductEvent,
  type WorkflowActionType,
} from "@/lib/product-analytics";
import {
  coverageFromParcels,
  filterParcels,
  snapshotFromParcels,
  toWorkspaceParcel,
  type LiveLayerMode,
  type LiveRegionFilter,
  type WorkspaceParcel,
} from "./live";
import type { RankedParcelRow } from "./live-types";

const routeByNavigationId: Record<string, string> = {
  deals: "/deals",
  sheriff: "/sheriff-sales",
  notices: "/notices",
  assets: "/shadow",
  models: "/accuracy",
  targets: "/prophecy",
  sources: "/admin",
};

function initialsFromIdentity(name: string, email?: string | null): string {
  const source = name.trim() || email?.split("@")[0] || "PP";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function organizationFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): string {
  const meta = user.user_metadata ?? {};
  const org =
    (typeof meta.organization === "string" && meta.organization) ||
    (typeof meta.company === "string" && meta.company) ||
    (typeof meta.org_name === "string" && meta.org_name) ||
    null;
  if (org) return org;
  const email = user.email ?? "";
  const domain = email.split("@")[1]?.split(".")[0];
  if (domain && !["gmail", "yahoo", "outlook", "hotmail", "icloud"].includes(domain)) {
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  }
  return BRAND_CONFIG.name;
}

export type MarketWorkspaceProps = {
  initialQuery?: string;
  initialParcelId?: string;
};

export function MarketWorkspace({ initialQuery, initialParcelId }: MarketWorkspaceProps = {}) {
  const navigate = useNavigate();
  const listFn = useServerFn(listRankedParcels);
  const { user: firebaseUser, signOutUser } = useFirebaseAuth();
  const [activeNav, setActiveNav] = useState("map");
  const [region, setRegion] = useState<LiveRegionFilter>("All regions");
  const [layer, setLayer] = useState<LiveLayerMode>("Opportunity score");
  const [selected, setSelected] = useState<WorkspaceParcel | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dossierId, setDossierId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<WorkflowActionType | null>(null);
  const [detailsFocused, setDetailsFocused] = useState(false);
  const [organizationName, setOrganizationName] = useState<string>(BRAND_CONFIG.name);
  const [userInitials, setUserInitials] = useState("PP");
  const toastTimerRef = useRef<number | null>(null);
  const focusTimerRef = useRef<number | null>(null);
  const pendingActionRef = useRef(false);
  const userSelectedRef = useRef(false);
  const initialHandledRef = useRef(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.warn("Firebase sign out issue:", error);
    }
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Supabase sign out issue:", error);
    }
    window.location.assign("/auth");
  };

  const rankedQuery = useQuery({
    queryKey: ["ranked-all"],
    queryFn: () => listFn({ data: { limit: 500 } }),
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const parcels = useMemo(() => {
    const rows = (rankedQuery.data ?? []) as RankedParcelRow[];
    return rows.map(toWorkspaceParcel).filter((p): p is WorkspaceParcel => p != null);
  }, [rankedQuery.data]);

  const filteredParcels = useMemo(() => filterParcels(parcels, region), [parcels, region]);

  const snapshotIso = useMemo(() => snapshotFromParcels(filteredParcels), [filteredParcels]);
  const coverage = useMemo(() => coverageFromParcels(parcels), [parcels]);

  useEffect(() => {
    if (initialHandledRef.current || !parcels.length) return;
    if (initialParcelId) {
      const match = parcels.find((p) => p.id === initialParcelId);
      if (match) {
        initialHandledRef.current = true;
        userSelectedRef.current = true;
        setRegion("All regions");
        setSelected(match);
        return;
      }
    }
    if (initialQuery) {
      const q = initialQuery.trim().toLowerCase();
      if (q.includes("california") || q === "ca") {
        setRegion("California");
      } else if (q.includes("florida") || q === "fl") {
        setRegion("Florida");
      }
      const match = parcels.find((p) =>
        `${p.address} ${p.city} ${p.state} ${p.zip ?? ""} ${p.apn ?? ""}`
          .toLowerCase()
          .includes(q),
      );
      if (match) {
        initialHandledRef.current = true;
        userSelectedRef.current = true;
        setRegion("All regions");
        setSelected(match);
        return;
      }
      initialHandledRef.current = true;
    }
  }, [parcels, initialParcelId, initialQuery]);

  useEffect(() => {
    if (!filteredParcels.length) {
      setSelected(null);
      return;
    }
    const stillVisible = selected && filteredParcels.some((p) => p.id === selected.id);
    if (stillVisible) return;
    userSelectedRef.current = false;
    setSelected(filteredParcels[0]);
  }, [filteredParcels, selected]);

  useEffect(() => {
    void trackProductEvent("workspace_opened", { onceKey: "workspace-opened" });
    return observeProductExperience("workspace");
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      const displayName =
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "Analyst";
      setUserInitials(initialsFromIdentity(displayName, firebaseUser.email));
      if (firebaseUser.email) {
        const domain = firebaseUser.email.split("@")[1]?.split(".")[0];
        if (domain && !["gmail", "yahoo", "outlook", "hotmail", "icloud"].includes(domain)) {
          setOrganizationName(domain.charAt(0).toUpperCase() + domain.slice(1));
        }
      }
      return;
    }

    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      const meta = data.user.user_metadata ?? {};
      const displayName =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        data.user.email ||
        "User";
      setOrganizationName(organizationFromUser(data.user));
      setUserInitials(initialsFromIdentity(displayName, data.user.email));
    });
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  useEffect(() => {
    if (!selected) return;
    const timer = window.setTimeout(() => {
      void trackProductEvent("evidence_viewed", {
        entityType: "parcel",
        entityId: selected.id,
        durationMs: 5000,
        properties: {
          address: selected.address,
          score: selected.score,
          ring: selected.ring,
          county_fips: selected.countyFips,
        },
        onceKey: `evidence-viewed-${selected.id}`,
      });
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [selected]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      if (focusTimerRef.current !== null) window.clearTimeout(focusTimerRef.current);
    },
    [],
  );

  const notify = useCallback((message: string) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  const selectParcel = useCallback(
    (parcel: WorkspaceParcel, source: "map" | "deal_table" | "command_palette") => {
      userSelectedRef.current = true;
      setSelected(parcel);
      void trackProductEvent("market_selected", {
        entityType: "parcel",
        entityId: parcel.id,
        properties: {
          source,
          address: parcel.address,
          score: parcel.score,
          ring: parcel.ring,
          county_fips: parcel.countyFips,
        },
      });

      if (source === "map") {
        setDetailsFocused(true);
        if (focusTimerRef.current !== null) window.clearTimeout(focusTimerRef.current);
        focusTimerRef.current = window.setTimeout(() => setDetailsFocused(false), 1800);

        const panelEl = document.getElementById("property-details-panel");
        if (panelEl) {
          panelEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          panelEl.focus({ preventScroll: true });
        }
      }
    },
    [],
  );

  const runWorkflowAction = useCallback(
    async (actionType: WorkflowActionType) => {
      if (!selected || pendingActionRef.current) return;
      const parcel = selected;
      pendingActionRef.current = true;
      setPendingAction(actionType);
      const requestedEvent = actionType === "underwrite" ? "underwrite_requested" : "brief_export_requested";
      const failedEvent = actionType === "underwrite" ? "underwrite_failed" : "brief_export_failed";
      void trackProductEvent(requestedEvent, {
        entityType: "parcel",
        entityId: parcel.id,
        properties: { address: parcel.address, score: parcel.score },
      });

      try {
        const actionId = await recordWorkflowAction({
          actionType,
          marketId: parcel.id,
          marketName: parcel.address,
          inputSnapshot: {
            score: parcel.score,
            ring: parcel.ring,
            offer: parcel.offer,
            profit: parcel.profit,
            loss_risk: parcel.lossRisk,
            county_fips: parcel.countyFips,
            computed_at: parcel.computedAt,
          },
          properties: { layer },
        });

        if (!actionId) {
          void trackProductEvent(failedEvent, {
            entityType: "parcel",
            entityId: parcel.id,
            success: false,
            properties: { reason: "action_unavailable" },
          });
          notify(actionType === "underwrite" ? "Underwrite could not be recorded" : "Brief export failed");
          return;
        }

        if (actionType === "brief_export") {
          const brief = {
            actionId,
            exportedAt: new Date().toISOString(),
            parcelId: parcel.id,
            address: parcel.address,
            market: parcel.marketLabel,
            perfectScore: parcel.score,
            ring: parcel.ring,
            ringLabel: parcel.ringLabel,
            modeledOffer: parcel.offer,
            expectedProfit: parcel.profit,
            lossRisk: parcel.lossRisk,
            dealOdds: parcel.dealOdds,
            exitDays: parcel.exitDays,
            scope: parcel.scope,
            countyFips: parcel.countyFips,
            computedAt: parcel.computedAt,
          };
          const url = URL.createObjectURL(
            new Blob([JSON.stringify(brief, null, 2)], {
              type: "application/json;charset=utf-8",
            }),
          );
          const link = document.createElement("a");
          link.href = url;
          link.download = `perfect-property-${parcel.id}-brief.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          notify(`${parcel.address} investment brief exported`);
        } else {
          notify(`${parcel.address} underwrite request recorded`);
        }
      } finally {
        pendingActionRef.current = false;
        setPendingAction(null);
      }
    },
    [layer, notify, selected],
  );

  const handleNavigation = (id: string) => {
    setActiveNav(id);
    if (id === "map") return;
    const route = routeByNavigationId[id];
    if (route) void navigate({ to: route as "/deals" });
  };

  const loadError =
    rankedQuery.isError
      ? rankedQuery.error instanceof Error
        ? rankedQuery.error.message
        : "Failed to load live parcel scores"
      : null;

  return (
    <div className="perfect-property-ui app-shell min-h-[100dvh] bg-pp-page text-pp-text">
      <TopBar
        onHome={() => void navigate({ to: "/" })}
        onOpenPalette={() => setPaletteOpen(true)}
        onExport={() => void runWorkflowAction("brief_export")}
        onSignOut={handleSignOut}
        organizationName={organizationName}
        userInitials={userInitials}
        userEmail={firebaseUser?.email || null}
        coverage={coverage}
        exporting={pendingAction === "brief_export"}
      />
      <div className="app-body grid min-h-0 grid-cols-[72px_minmax(0,1fr)] max-md:grid-cols-1">
        <NavigationRail active={activeNav} onChange={handleNavigation} />
        <div className="product-grid grid min-h-0 grid-cols-[minmax(0,1fr)_420px] max-xl:grid-cols-[minmax(0,1fr)_380px] max-lg:grid-cols-1">
          <div className="center-workspace grid min-h-0 grid-rows-[minmax(0,1fr)_320px] max-lg:grid-rows-[620px_auto] max-md:grid-rows-[62dvh_auto]">
            <MapCanvas
              parcels={filteredParcels}
              selected={selected}
              onSelect={(parcel) => selectParcel(parcel, "map")}
              region={region}
              onRegionChange={setRegion}
              layer={layer}
              onLayerChange={setLayer}
              snapshotIso={snapshotIso}
              loading={rankedQuery.isLoading}
              isRefreshing={rankedQuery.isFetching && !rankedQuery.isLoading}
              error={loadError}
              onRetry={() => void rankedQuery.refetch()}
              totalCount={parcels.length}
              onOpenDeals={() => void navigate({ to: '/deals' })}
              onOpenAdmin={() => void navigate({ to: '/admin' })}
            />
            <DealTable
              parcels={filteredParcels}
              selectedId={selected?.id ?? null}
              onSelect={(parcel) => selectParcel(parcel, "deal_table")}
              loading={rankedQuery.isLoading}
            />
          </div>
          <EvidencePanel
            parcel={selected}
            onUnderwrite={() => void runWorkflowAction("underwrite")}
            isSubmitting={pendingAction === "underwrite"}
            onOpenFullDossier={(id) => setDossierId(id)}
            isFocused={detailsFocused}
          />
        </div>
      </div>
      <CommandPalette
        open={paletteOpen}
        parcels={parcels}
        onClose={() => setPaletteOpen(false)}
        onSelect={(parcel) => {
          setRegion("All regions");
          selectParcel(parcel, "command_palette");
        }}
      />
      <DossierPanel parcelId={dossierId} onClose={() => setDossierId(null)} />
      <AnimatePresence>
        {toast ? (
          <motion.div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-md border border-pp-border-strong/25 bg-pp-surface-raised px-4 py-3 text-sm shadow-toast"
          >
            <CheckCircle size={18} className="text-pp-live" />
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}