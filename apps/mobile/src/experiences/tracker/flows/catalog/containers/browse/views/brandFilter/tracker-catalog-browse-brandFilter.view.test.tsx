import { render, fireEvent } from "@testing-library/react-native";
import { TrackerCatalogBrowseBrandFilterView } from "./tracker-catalog-browse-brandFilter.view";

const BRANDS = ["Hermès", "Cartier"];

describe("TrackerCatalogBrowseBrandFilterView", () => {
  it("renders a segment per brand", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseBrandFilterView
        brands={BRANDS}
        selectedBrand="Hermès"
      />,
    );
    expect(getByTestId("catalog-brand-filter")).toBeTruthy();
    expect(
      getByTestId("catalog-brand-filter-control-segment-Hermès"),
    ).toBeTruthy();
    expect(
      getByTestId("catalog-brand-filter-control-segment-Cartier"),
    ).toBeTruthy();
  });

  it("invokes onBrandChange with the pressed brand", () => {
    const onBrandChange = jest.fn();
    const { getByTestId } = render(
      <TrackerCatalogBrowseBrandFilterView
        brands={BRANDS}
        selectedBrand="Hermès"
        onBrandChange={onBrandChange}
      />,
    );
    fireEvent.press(
      getByTestId("catalog-brand-filter-control-segment-Cartier"),
    );
    expect(onBrandChange).toHaveBeenCalledWith("Cartier");
  });

  it("does not throw when pressed without an onBrandChange handler", () => {
    const { getByTestId } = render(
      <TrackerCatalogBrowseBrandFilterView
        brands={BRANDS}
        selectedBrand="Hermès"
      />,
    );
    fireEvent.press(
      getByTestId("catalog-brand-filter-control-segment-Cartier"),
    );
    expect(getByTestId("catalog-brand-filter")).toBeTruthy();
  });

  it("renders nothing with fewer than two brands", () => {
    const { queryByTestId } = render(
      <TrackerCatalogBrowseBrandFilterView
        brands={["Hermès"]}
        selectedBrand="Hermès"
      />,
    );
    expect(queryByTestId("catalog-brand-filter")).toBeNull();
  });
});
