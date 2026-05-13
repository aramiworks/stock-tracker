import { render, fireEvent } from "@testing-library/react-native";
import { TrackerCatalogBrowseGroupHeaderView } from "./tracker-catalog-browse-groupHeader.view";
import type {
  CatalogGroup,
  GroupSelectionState,
} from "../models/tracker-catalog-browse.type";

const group: CatalogGroup = {
  brand: "Hermès",
  productLine: "Bolide",
  units: [
    {
      id: "u-1",
      brand: "Hermès",
      productLine: "Bolide",
      modelName: "Bolide 27",
    },
  ],
};

describe("TrackerCatalogBrowseGroupHeaderView", () => {
  it.each<GroupSelectionState>(["all", "some", "none"])(
    "renders for state=%s",
    (state) => {
      const { getByTestId } = render(
        <TrackerCatalogBrowseGroupHeaderView group={group} state={state} />,
      );
      expect(getByTestId("catalog-group-Hermès-Bolide")).toBeTruthy();
    },
  );

  it("invokes onTogglePress when pressed", () => {
    const onTogglePress = jest.fn();
    const { getByTestId } = render(
      <TrackerCatalogBrowseGroupHeaderView
        group={group}
        state="none"
        onTogglePress={onTogglePress}
      />,
    );
    fireEvent.press(getByTestId("catalog-group-Hermès-Bolide"));
    expect(onTogglePress).toHaveBeenCalledTimes(1);
  });

  it("renders without an onTogglePress handler", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseGroupHeaderView group={group} state="none" />,
    );
    expect(getByTestId("catalog-group-Hermès-Bolide")).toBeTruthy();
  });
});
