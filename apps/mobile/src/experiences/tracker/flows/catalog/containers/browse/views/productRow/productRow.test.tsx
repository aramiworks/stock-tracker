import { render, fireEvent } from "@testing-library/react-native";
import { TrackerCatalogBrowseProductRowView } from "./productRow";
import type { CatalogUnit } from "../../models/tracker-catalog-browse.type";

const unit: CatalogUnit = {
  id: "u-1",
  brand: "Hermès",
  productLine: "Bolide",
  modelName: "Bolide 27",
};

describe("TrackerCatalogBrowseProductRowView", () => {
  it("renders unchecked row", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseProductRowView unit={unit} checked={false} />,
    );
    expect(getByTestId("catalog-row-u-1")).toBeTruthy();
  });

  it("renders checked row", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseProductRowView unit={unit} checked />,
    );
    expect(getByTestId("catalog-row-u-1")).toBeTruthy();
  });

  it("invokes onTogglePress when pressed", () => {
    const onTogglePress = jest.fn();
    const { getByTestId } = render(
      <TrackerCatalogBrowseProductRowView
        unit={unit}
        checked={false}
        onTogglePress={onTogglePress}
      />,
    );
    fireEvent.press(getByTestId("catalog-row-u-1"));
    expect(onTogglePress).toHaveBeenCalledTimes(1);
  });
});
