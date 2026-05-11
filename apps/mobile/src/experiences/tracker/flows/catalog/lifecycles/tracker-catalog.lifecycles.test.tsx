import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { useTrackerCatalogLifecycle } from "./tracker-catalog.lifecycles";

const Harness = () => {
  useTrackerCatalogLifecycle();
  return <Text>ok</Text>;
};

describe("useTrackerCatalogLifecycle", () => {
  it("mounts without throwing", () => {
    const { getByText } = render(<Harness />);
    expect(getByText("ok")).toBeTruthy();
  });
});
