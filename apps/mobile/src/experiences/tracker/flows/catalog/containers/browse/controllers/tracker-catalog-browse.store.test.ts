import { useTrackerCatalogBrowseStore } from "./tracker-catalog-browse.store";

describe("useTrackerCatalogBrowseStore", () => {
  beforeEach(() => {
    useTrackerCatalogBrowseStore.setState({
      selectedUnitIds: new Set<string>(),
    });
  });

  it("starts with an empty set of selected unit ids", () => {
    expect(useTrackerCatalogBrowseStore.getState().selectedUnitIds.size).toBe(
      0,
    );
  });

  it("toggleUnit adds an id when not present", () => {
    useTrackerCatalogBrowseStore.getState().toggleUnit("unit-1");
    expect(
      useTrackerCatalogBrowseStore.getState().selectedUnitIds.has("unit-1"),
    ).toBe(true);
  });

  it("toggleUnit removes an id when already present", () => {
    useTrackerCatalogBrowseStore.getState().toggleUnit("unit-1");
    useTrackerCatalogBrowseStore.getState().toggleUnit("unit-1");
    expect(
      useTrackerCatalogBrowseStore.getState().selectedUnitIds.has("unit-1"),
    ).toBe(false);
  });

  it("setUnits adds every id when value=true", () => {
    useTrackerCatalogBrowseStore.getState().setUnits(["a", "b", "c"], true);
    const ids = useTrackerCatalogBrowseStore.getState().selectedUnitIds;
    expect(ids.has("a")).toBe(true);
    expect(ids.has("b")).toBe(true);
    expect(ids.has("c")).toBe(true);
  });

  it("setUnits removes every id when value=false", () => {
    useTrackerCatalogBrowseStore.getState().setUnits(["a", "b"], true);
    useTrackerCatalogBrowseStore.getState().setUnits(["a"], false);
    const ids = useTrackerCatalogBrowseStore.getState().selectedUnitIds;
    expect(ids.has("a")).toBe(false);
    expect(ids.has("b")).toBe(true);
  });

  it("setUnits replaces the set reference (does not mutate)", () => {
    const before = useTrackerCatalogBrowseStore.getState().selectedUnitIds;
    useTrackerCatalogBrowseStore.getState().setUnits(["x"], true);
    const after = useTrackerCatalogBrowseStore.getState().selectedUnitIds;
    expect(after).not.toBe(before);
  });
});
