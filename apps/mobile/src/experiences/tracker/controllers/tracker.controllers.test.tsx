import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  TrackerControllers,
  useTrackerControllers,
} from "./tracker.controllers";

function Consumer() {
  const ctx = useTrackerControllers();
  return <Text>{JSON.stringify(ctx)}</Text>;
}

describe("TrackerControllers", () => {
  it("renders children and provides context", () => {
    const { getByText } = render(
      <TrackerControllers>
        <Consumer />
      </TrackerControllers>,
    );
    expect(getByText("{}")).toBeTruthy();
  });

  it("useTrackerControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerControllers must be used within");
  });
});
