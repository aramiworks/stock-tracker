import { render } from "@testing-library/react-native";
import { TrackerCatalogViews } from "./tracker-catalog.views";

describe("TrackerCatalogViews", () => {
  it("renders the Slot", () => {
    const { toJSON } = render(<TrackerCatalogViews />);
    expect(toJSON()).toBeTruthy();
  });
});
