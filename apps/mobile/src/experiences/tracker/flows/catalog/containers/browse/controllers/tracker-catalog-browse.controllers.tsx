import {
  memo,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { useSuspenseQuery } from "@apollo/client/react";
import { CATALOG_LIST_QUERY } from "@/lib/graphql/queries";
import { useTrackerCatalogBrowseStore } from "./tracker-catalog-browse.store";
import {
  type CatalogGroup,
  type GroupSelectionState,
  type TrackerCatalogBrowseControllersOutput,
  type TrackerCatalogBrowseScreenState,
} from "../models";
import { useTrackerCatalogBrowseLifecycle } from "../lifecycles";

/**
 * GraphQL response shape for `query CatalogList` (see
 * `apps/subgraphs/tracker/src/tracker/views/tracker.views.ts`). Hand-written
 * because the mobile codegen pipeline has pre-existing drift; once that drift
 * is resolved we can swap to `graphql(...)`-generated types.
 */
interface CatalogListQueryData {
  catalogList: Array<{
    brand: string;
    productLine: string;
    units: Array<{
      id: string;
      brand: string;
      productLine: string;
      modelName: string;
    }>;
  }>;
}

const ControllersContext =
  createContext<TrackerCatalogBrowseControllersOutput | null>(null);

interface TrackerCatalogBrowseControllersProps {
  children: ReactNode;
}

const computeGroupState = (
  group: CatalogGroup,
  selected: ReadonlySet<string>,
): GroupSelectionState => {
  /* istanbul ignore next -- defensive guard, every group has ≥1 unit by seed */
  if (group.units.length === 0) return "none";
  let checkedCount = 0;
  for (const unit of group.units) {
    if (selected.has(unit.id)) checkedCount += 1;
  }
  if (checkedCount === 0) return "none";
  if (checkedCount === group.units.length) return "all";
  return "some";
};

export const TrackerCatalogBrowseControllers =
  memo<TrackerCatalogBrowseControllersProps>(({ children }) => {
    const selectedUnitIds = useTrackerCatalogBrowseStore(
      (s) => s.selectedUnitIds,
    );
    const toggleUnit = useTrackerCatalogBrowseStore((s) => s.toggleUnit);
    const setUnits = useTrackerCatalogBrowseStore((s) => s.setUnits);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, refetch } =
      useSuspenseQuery<CatalogListQueryData>(CATALOG_LIST_QUERY);

    useTrackerCatalogBrowseLifecycle(refetch);

    const groups = useMemo<CatalogGroup[]>(
      // istanbul ignore next -- `useSuspenseQuery` always resolves data before
      // we render; the `?? []` guard is purely defensive against partial data.
      () => data?.catalogList ?? [],
      [data?.catalogList],
    );

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        void refetch().finally(() => setIsRefreshing(false));
      });
    }, [refetch]);

    const getGroupState = useCallback(
      (group: CatalogGroup) => computeGroupState(group, selectedUnitIds),
      [selectedUnitIds],
    );

    const onToggleUnit = useCallback(
      async (unitId: string) => {
        // TODO(INF-1393 follow-up): call `watch.create` / `watch.delete` mutations here.
        toggleUnit(unitId);
      },
      [toggleUnit],
    );

    const onToggleGroup = useCallback(
      async (group: CatalogGroup) => {
        const state = computeGroupState(group, selectedUnitIds);
        // "all"  → uncheck everything in the group.
        // "some" / "none" → check every unit in the group (Shengsho parity).
        const shouldSelect = state !== "all";
        setUnits(
          group.units.map((u) => u.id),
          shouldSelect,
        );
      },
      [selectedUnitIds, setUnits],
    );

    const screenState: TrackerCatalogBrowseScreenState =
      groups.length > 0 ? "default" : "empty";

    const value: TrackerCatalogBrowseControllersOutput = {
      screenState,
      groups,
      selectedUnitIds,
      getGroupState,
      onToggleUnit,
      onToggleGroup,
      isRefreshing,
      onRefresh,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerCatalogBrowseControllers.displayName = "TrackerCatalogBrowseControllers";

export const useTrackerCatalogBrowseControllers = () => {
  const context = useContext(ControllersContext);
  /* istanbul ignore next -- defensive guard */
  if (!context) {
    throw new Error(
      "useTrackerCatalogBrowseControllers must be used within TrackerCatalogBrowseControllers",
    );
  }
  return context;
};
