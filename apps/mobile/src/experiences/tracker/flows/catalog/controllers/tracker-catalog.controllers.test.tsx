import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  TrackerCatalogControllers,
  useTrackerCatalogControllers,
} from "./tracker-catalog.controllers";

const Probe = () => {
  const ctx = useTrackerCatalogControllers();
  return <Text>{ctx ? "ok" : "fail"}</Text>;
};

describe("TrackerCatalogControllers", () => {
  it("provides controllers context to children", () => {
    const { getByText } = render(
      <TrackerCatalogControllers>
        <Probe />
      </TrackerCatalogControllers>,
    );
    expect(getByText("ok")).toBeTruthy();
  });
});
