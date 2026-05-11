import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { useTrackerCatalogBrowseLifecycle } from "./tracker-catalog-browse.lifecycles";

const Harness = () => {
  useTrackerCatalogBrowseLifecycle();
  return <Text>ok</Text>;
};

describe("useTrackerCatalogBrowseLifecycle", () => {
  it("mounts without throwing", () => {
    const { getByText } = render(<Harness />);
    expect(getByText("ok")).toBeTruthy();
  });
});
