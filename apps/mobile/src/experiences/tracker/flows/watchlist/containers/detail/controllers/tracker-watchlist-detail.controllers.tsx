import {
  memo,
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "expo-router";
import { useSuspenseQuery } from "@apollo/client/react";
import { WATCHLIST_DETAIL_QUERY } from "@/lib/graphql/queries";
import type {
  WatchableState,
  WatchlistEntry,
} from "../../list/models/tracker-watchlist-list.type";
import type {
  DetailSku,
  DetailDropEvent,
  TrackerWatchlistDetailControllersOutput,
  TrackerWatchlistDetailScreenState,
  WatchlistDetailPayload,
} from "../models/tracker-watchlist-detail.type";
import { useTrackerWatchlistDetailLifecycle } from "../lifecycles/tracker-watchlist-detail.lifecycles";

/**
 * GraphQL response shape for `query WatchlistDetail` (see
 * `apps/subgraphs/tracker/schema.graphql`). Hand-written for the same reason as
 * the list query — the mobile codegen pipeline has pre-existing drift.
 */
interface WatchlistDetailQueryData {
  watchlistDetail: {
    entry: WatchlistEntry;
    skus: Array<{
      id: string;
      color: string;
      leather: string | null;
      hardware: string | null;
      size: string | null;
      referenceCode: string | null;
      inStock: boolean | null;
      lastChecked: string | null;
    }>;
    dropEvents: Array<{
      id: string;
      skuId: string;
      sourceUrl: string | null;
      detectedAt: string;
    }>;
  };
}

const ControllersContext =
  createContext<TrackerWatchlistDetailControllersOutput | null>(null);

interface TrackerWatchlistDetailControllersProps {
  /** Watchable-unit ID from the dynamic route (`/watchlist/[id]`). */
  watchableUnitId: string;
  children: ReactNode;
}

/**
 * Compose a human-readable descriptor from the SKU attribute set. Mirrors the
 * Korean copy seed convention (` · ` separator) used in the Figma mocks.
 */
const composeDescriptor = (sku: {
  color: string;
  leather: string | null;
  hardware: string | null;
  size: string | null;
}): string =>
  [sku.color, sku.leather, sku.hardware, sku.size]
    .filter((part): part is string => Boolean(part))
    .join(" · ");

/** Map GQL `inStock` nullable boolean to the local `WatchableState` enum. */
const inStockToState = (inStock: boolean | null): WatchableState => {
  if (inStock === true) return "in_stock";
  if (inStock === false) return "out_of_stock";
  return "unknown";
};

export const TrackerWatchlistDetailControllers =
  memo<TrackerWatchlistDetailControllersProps>(
    ({ watchableUnitId, children }) => {
      const router = useRouter();

      const { data, refetch } = useSuspenseQuery<WatchlistDetailQueryData>(
        WATCHLIST_DETAIL_QUERY,
        { variables: { watchableUnitId } },
      );

      useTrackerWatchlistDetailLifecycle(refetch);

      const payload = useMemo<WatchlistDetailPayload | null>(() => {
        /* istanbul ignore next -- useSuspenseQuery always resolves data before render */
        if (!data?.watchlistDetail) return null;

        const skus: DetailSku[] = data.watchlistDetail.skus.map((sku) => ({
          id: sku.id,
          referenceCode: sku.referenceCode,
          descriptor: composeDescriptor(sku),
          state: inStockToState(sku.inStock),
        }));

        // Build a lookup so each drop event can surface the descriptor of the
        // SKU it fired against. Drop events are by definition restock signals
        // (the scraper detected stock appearing), so `kind` is always
        // "restocked" until the backend models explicit out-of-stock events.
        const skuById = new Map(skus.map((s) => [s.id, s]));
        const dropEvents: DetailDropEvent[] = data.watchlistDetail.dropEvents.map(
          (evt) => ({
            id: evt.id,
            kind: "restocked",
            skuDescriptor:
              /* istanbul ignore next -- defensive: every drop event has a sku */
              skuById.get(evt.skuId)?.descriptor ?? "",
            occurredAt: evt.detectedAt,
          }),
        );

        return {
          entry: data.watchlistDetail.entry,
          skus,
          dropEvents,
        };
      }, [data?.watchlistDetail]);

      const onBack = useCallback(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push("/tracker/watchlist");
        }
      }, [router]);

      // `useSuspenseQuery` throws to the error boundary on failure rather than
      // returning a null payload, so the `: "error"` branch is unreachable in
      // practice. Kept for type-safety against future `?.watchlistDetail`
      // guard tightening.
      const screenState: TrackerWatchlistDetailScreenState = payload
        ? "default"
        : /* istanbul ignore next -- error boundary handles failure */ "error";

      const value: TrackerWatchlistDetailControllersOutput = {
        screenState,
        payload,
        onBack,
      };

      return (
        <ControllersContext.Provider value={value}>
          {children}
        </ControllersContext.Provider>
      );
    },
  );

TrackerWatchlistDetailControllers.displayName =
  "TrackerWatchlistDetailControllers";

export const useTrackerWatchlistDetailControllers = () => {
  const context = useContext(ControllersContext);
  /* istanbul ignore next -- defensive guard */
  if (!context) {
    throw new Error(
      "useTrackerWatchlistDetailControllers must be used within TrackerWatchlistDetailControllers",
    );
  }
  return context;
};
