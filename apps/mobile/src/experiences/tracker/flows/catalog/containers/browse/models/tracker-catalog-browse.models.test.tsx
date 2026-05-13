import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerCatalogBrowseModels } from "./tracker-catalog-browse.models";

describe("TrackerCatalogBrowseModels", () => {
  it("renders its children", () => {
    const { getByText } = render(
      <TrackerCatalogBrowseModels>
        <Text>child-content</Text>
      </TrackerCatalogBrowseModels>,
    );
    expect(getByText("child-content")).toBeTruthy();
  });
});
