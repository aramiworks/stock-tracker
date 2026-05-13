import { render } from "@testing-library/react-native";
import { TrackerCatalogFlow } from "./tracker-catalog.flow";

describe("TrackerCatalogFlow", () => {
  it("mounts the flow without throwing", () => {
    const { toJSON } = render(<TrackerCatalogFlow />);
    expect(toJSON()).toBeTruthy();
  });
});
