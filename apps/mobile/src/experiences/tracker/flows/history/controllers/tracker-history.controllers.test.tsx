import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  TrackerHistoryControllers,
  useTrackerHistoryControllers,
} from "./tracker-history.controllers";

function Consumer() {
  const ctx = useTrackerHistoryControllers();
  return <Text>{JSON.stringify(ctx)}</Text>;
}

describe("TrackerHistoryControllers", () => {
  it("renders children and provides context", () => {
    const { getByText } = render(
      <TrackerHistoryControllers>
        <Consumer />
      </TrackerHistoryControllers>,
    );
    expect(getByText("{}")).toBeTruthy();
  });

  it("useTrackerHistoryControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerHistoryControllers must be used within");
  });
});
