import { render } from "@testing-library/react-native";
import { TrackerCatalogBrowseContainer } from "./tracker-catalog-browse.container";

describe("TrackerCatalogBrowseContainer", () => {
  it("renders the catalog browse screen", () => {
    const { getByTestId } = render(<TrackerCatalogBrowseContainer />);
    expect(getByTestId("catalog-browse-screen")).toBeTruthy();
  });
});
