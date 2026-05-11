import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerCatalogModels } from "./tracker-catalog.models";

describe("TrackerCatalogModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerCatalogModels>
        <Text>flow-child</Text>
      </TrackerCatalogModels>,
    );
    expect(getByText("flow-child")).toBeTruthy();
  });
});
