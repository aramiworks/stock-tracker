import { create } from "zustand";

interface TrackerCatalogBrowseStoreState {
  /**
   * Watchable-unit IDs currently in the user's watchlist.
   *
   * Stored as a plain Set in Zustand state. The store is replaced (not mutated)
   * on every change so React equality checks fire correctly.
   *
   * TODO(INF-1393): Hydrate from the `watch.list` tRPC query once backend lands —
   * for now selection lives only in client memory and survives a tab swap but
   * not an app reload.
   */
  selectedUnitIds: Set<string>;
  toggleUnit: (id: string) => void;
  setUnits: (ids: Iterable<string>, value: boolean) => void;
  /**
   * Brand currently selected in the catalog's segmented filter (e.g. "Hermès").
   *
   * `null` means "not yet chosen" — the controller falls back to the first
   * brand in the catalog. Persists across a tab swap (same as selectedUnitIds)
   * but not an app reload.
   */
  selectedBrand: string | null;
  setSelectedBrand: (brand: string) => void;
}

export const useTrackerCatalogBrowseStore =
  create<TrackerCatalogBrowseStoreState>((set) => ({
    selectedUnitIds: new Set<string>(),
    selectedBrand: null,
    setSelectedBrand: (brand) => set({ selectedBrand: brand }),
    toggleUnit: (id) =>
      set((state) => {
        const next = new Set(state.selectedUnitIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { selectedUnitIds: next };
      }),
    setUnits: (ids, value) =>
      set((state) => {
        const next = new Set(state.selectedUnitIds);
        for (const id of ids) {
          if (value) {
            next.add(id);
          } else {
            next.delete(id);
          }
        }
        return { selectedUnitIds: next };
      }),
  }));
