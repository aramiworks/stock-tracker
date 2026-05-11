import {
  memo,
  createContext,
  useContext,
  useCallback,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { useTrackerCatalogBrowseStore } from "./tracker-catalog-browse.store";
import {
  CATALOG_MOCK_GROUPS,
  type CatalogGroup,
  type GroupSelectionState,
  type TrackerCatalogBrowseControllersOutput,
  type TrackerCatalogBrowseScreenState,
} from "../models";
import { useTrackerCatalogBrowseLifecycle } from "../lifecycles";

// TODO(INF-1393): Replace mocks with `useSuspenseQuery(CATALOG_LIST_QUERY)` once
// the tracker subgraph exposes `catalog.list` ({ brand, productLine, units }[]).

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
    const [groups] = useState<CatalogGroup[]>(CATALOG_MOCK_GROUPS);

    useTrackerCatalogBrowseLifecycle();

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        // TODO(INF-1393): swap for refetch() from useSuspenseQuery once backend lands.
        setTimeout(() => setIsRefreshing(false), 250);
      });
    }, []);

    const getGroupState = useCallback(
      (group: CatalogGroup) => computeGroupState(group, selectedUnitIds),
      [selectedUnitIds],
    );

    const onToggleUnit = useCallback(
      async (unitId: string) => {
        // TODO(INF-1393): call `watch.create` / `watch.delete` mutations here.
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

    /* istanbul ignore next -- empty branch becomes reachable in INF-1393 once groups come from useSuspenseQuery; today CATALOG_MOCK_GROUPS is always non-empty */
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
