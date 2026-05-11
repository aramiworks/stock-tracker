import { render, act } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  TrackerCatalogBrowseControllers,
  useTrackerCatalogBrowseControllers,
} from "./tracker-catalog-browse.controllers";
import { useTrackerCatalogBrowseStore } from "./tracker-catalog-browse.store";
import { CATALOG_MOCK_GROUPS } from "../models/tracker-catalog-browse.mock";

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
    useTrackerCatalogBrowseStore.setState({
      selectedUnitIds: new Set<string>(),
    });
  });

  it("exposes screenState=default when mock groups are non-empty", () => {
    renderControllers();
    expect(captured?.screenState).toBe("default");
    expect(captured?.groups).toBe(CATALOG_MOCK_GROUPS);
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

  it("onRefresh sets isRefreshing then resets it", async () => {
    jest.useFakeTimers();
    renderControllers();
    act(() => {
      captured?.onRefresh();
    });
    expect(captured?.isRefreshing).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(captured?.isRefreshing).toBe(false);
    jest.useRealTimers();
  });
});
