import { render, act } from "@testing-library/react-native";
import { Text } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
}));

jest.mock("../lifecycles", () => ({
  useTrackerCatalogBrowseLifecycle: jest.fn(),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import {
  TrackerCatalogBrowseControllers,
  useTrackerCatalogBrowseControllers,
} from "./tracker-catalog-browse.controllers";
import { useTrackerCatalogBrowseStore } from "./tracker-catalog-browse.store";
import { CATALOG_MOCK_GROUPS } from "../models/tracker-catalog-browse.mock";

const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
  typeof useSuspenseQuery
>;

function setQueryData(
  groups: typeof CATALOG_MOCK_GROUPS = CATALOG_MOCK_GROUPS,
) {
  mockedUseSuspenseQuery.mockReturnValue({
    data: { catalogList: groups },
    refetch: mockRefetch,
    // The rest of the useSuspenseQuery return is unused by the controllers — cast wide.
  } as unknown as ReturnType<typeof useSuspenseQuery>);
}

let captured: ReturnType<typeof useTrackerCatalogBrowseControllers> | null =
  null;

const Probe = () => {
  captured = useTrackerCatalogBrowseControllers();
  return <Text>probe</Text>;
};

const renderControllers = () =>
  render(
    <TrackerCatalogBrowseControllers>
      <Probe />
    </TrackerCatalogBrowseControllers>,
  );

describe("TrackerCatalogBrowseControllers", () => {
  beforeEach(() => {
    captured = null;
    mockRefetch.mockClear();
    mockedUseSuspenseQuery.mockReset();
    setQueryData();
    useTrackerCatalogBrowseStore.setState({
      selectedUnitIds: new Set<string>(),
      selectedBrand: null,
    });
  });

  it("exposes screenState=default when catalog.list returns groups", () => {
    renderControllers();
    expect(captured?.screenState).toBe("default");
    // groups are filtered to the default (first) brand.
    expect(captured?.groups.length).toBeGreaterThan(0);
    expect(captured?.groups.every((g) => g.brand === "Hermès")).toBe(true);
  });

  it("derives the distinct brand list and defaults to the first brand", () => {
    renderControllers();
    expect(captured?.brands).toEqual(["Hermès", "Cartier"]);
    expect(captured?.selectedBrand).toBe("Hermès");
  });

  it("onBrandChange switches the selected brand and filters groups", async () => {
    renderControllers();
    await act(async () => {
      captured?.onBrandChange("Cartier");
    });
    expect(captured?.selectedBrand).toBe("Cartier");
    expect(captured?.groups.length).toBeGreaterThan(0);
    expect(captured?.groups.every((g) => g.brand === "Cartier")).toBe(true);
  });

  it("falls back to the first brand when the stored brand is not in the catalog", () => {
    useTrackerCatalogBrowseStore.setState({ selectedBrand: "Chanel" });
    renderControllers();
    expect(captured?.selectedBrand).toBe("Hermès");
  });

  it("exposes screenState=empty when catalog.list returns no groups", () => {
    setQueryData([]);
    renderControllers();
    expect(captured?.screenState).toBe("empty");
    expect(captured?.groups).toEqual([]);
    expect(captured?.brands).toEqual([]);
    expect(captured?.selectedBrand).toBe("");
  });

  it("getGroupState returns 'none' when no units selected", () => {
    renderControllers();
    const group = CATALOG_MOCK_GROUPS[0]!;
    expect(captured?.getGroupState(group)).toBe("none");
  });

  it("getGroupState returns 'some' when partial selection", async () => {
    renderControllers();
    const group = CATALOG_MOCK_GROUPS[0]!;
    await act(async () => {
      await captured?.onToggleUnit(group.units[0]!.id);
    });
    expect(captured?.getGroupState(group)).toBe("some");
  });

  it("getGroupState returns 'all' when every unit selected", async () => {
    renderControllers();
    const group = CATALOG_MOCK_GROUPS[0]!;
    await act(async () => {
      await captured?.onToggleGroup(group);
    });
    expect(captured?.getGroupState(group)).toBe("all");
  });

  it("onToggleGroup unchecks when state is 'all'", async () => {
    renderControllers();
    const group = CATALOG_MOCK_GROUPS[0]!;
    await act(async () => {
      await captured?.onToggleGroup(group);
    });
    expect(captured?.getGroupState(group)).toBe("all");
    await act(async () => {
      await captured?.onToggleGroup(group);
    });
    expect(captured?.getGroupState(group)).toBe("none");
  });

  it("onToggleGroup checks when state is 'some'", async () => {
    renderControllers();
    const group = CATALOG_MOCK_GROUPS[0]!;
    await act(async () => {
      await captured?.onToggleUnit(group.units[0]!.id);
    });
    expect(captured?.getGroupState(group)).toBe("some");
    await act(async () => {
      await captured?.onToggleGroup(group);
    });
    expect(captured?.getGroupState(group)).toBe("all");
  });

  it("onRefresh triggers refetch via startTransition", async () => {
    renderControllers();
    await act(async () => {
      captured?.onRefresh();
      // Flush microtasks so the startTransition-scheduled state update lands
      // and the refetch promise resolves before assertions.
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockRefetch).toHaveBeenCalled();
    expect(captured?.isRefreshing).toBe(false);
  });
});
