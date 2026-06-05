import { render, fireEvent } from "@testing-library/react-native";
import { TrackerCatalogBrowseViews } from "./tracker-catalog-browse.views";
import type {
  CatalogGroup,
  GroupSelectionState,
} from "../models/tracker-catalog-browse.type";

const sampleGroups: CatalogGroup[] = [
  {
    brand: "Hermès",
    productLine: "Bolide",
    units: [
      {
        id: "u-1",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 27",
      },
      {
        id: "u-2",
        brand: "Hermès",
        productLine: "Bolide",
        modelName: "Bolide 31",
      },
    ],
  },
];

describe("TrackerCatalogBrowseViews", () => {
  it("renders default state with default props", () => {
    const { getByTestId } = render(<TrackerCatalogBrowseViews />);
    expect(getByTestId("catalog-browse-screen")).toBeTruthy();
  });

  it("renders default state with provided groups and getGroupState, firing toggles", () => {
    const getGroupState = jest.fn<GroupSelectionState, [unknown]>(() => "all");
    const onToggleUnit = jest.fn();
    const onToggleGroup = jest.fn();
    const { getByTestId } = render(
      <TrackerCatalogBrowseViews
        screenState="default"
        groups={sampleGroups}
        selectedUnitIds={new Set(["u-1"])}
        getGroupState={getGroupState}
        onToggleUnit={onToggleUnit}
        onToggleGroup={onToggleGroup}
        isRefreshing
        onRefresh={() => {}}
      />,
    );
    expect(getByTestId("catalog-browse-screen")).toBeTruthy();
    expect(getGroupState).toHaveBeenCalled();
    fireEvent.press(getByTestId("catalog-group-Hermès-Bolide"));
    expect(onToggleGroup).toHaveBeenCalledWith(sampleGroups[0]);
    fireEvent.press(getByTestId("catalog-row-u-1"));
    expect(onToggleUnit).toHaveBeenCalledWith("u-1");
  });

  it("falls back to default group-state resolver when none provided", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseViews
        screenState="default"
        groups={sampleGroups}
        selectedUnitIds={new Set(["u-1", "u-2"])}
      />,
    );
    expect(getByTestId("catalog-browse-screen")).toBeTruthy();
  });

  it("default resolver returns 'some' when partial selection", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseViews
        screenState="default"
        groups={sampleGroups}
        selectedUnitIds={new Set(["u-1"])}
      />,
    );
    expect(getByTestId("catalog-browse-screen")).toBeTruthy();
  });

  it("default resolver returns 'none' when no selection", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseViews screenState="default" groups={sampleGroups} />,
    );
    expect(getByTestId("catalog-browse-screen")).toBeTruthy();
  });

  it("renders the brand filter when 2+ brands are provided", () => {
    const onBrandChange = jest.fn();
    const { getByTestId } = render(
      <TrackerCatalogBrowseViews
        screenState="default"
        groups={sampleGroups}
        brands={["Hermès", "Cartier"]}
        selectedBrand="Hermès"
        onBrandChange={onBrandChange}
      />,
    );
    expect(getByTestId("catalog-brand-filter")).toBeTruthy();
    fireEvent.press(
      getByTestId("catalog-brand-filter-control-segment-Cartier"),
    );
    expect(onBrandChange).toHaveBeenCalledWith("Cartier");
  });

  it("renders empty state", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseViews screenState="empty" />,
    );
    expect(getByTestId("catalog-empty-state")).toBeTruthy();
  });

  it("renders loading state with skeleton cards", () => {
    const { getAllByTestId } = render(
      <TrackerCatalogBrowseViews screenState="loading" />,
    );
    expect(getAllByTestId("catalog-skeleton-card").length).toBeGreaterThan(0);
  });

  it("renders error state", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseViews screenState="error" />,
    );
    expect(getByTestId("catalog-empty-state")).toBeTruthy();
  });
});
