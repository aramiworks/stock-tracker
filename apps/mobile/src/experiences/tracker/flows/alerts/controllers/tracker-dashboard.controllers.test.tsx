import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  TrackerDashboardControllers,
  useTrackerDashboardControllers,
} from "./tracker-dashboard.controllers";

function Consumer() {
  const ctx = useTrackerDashboardControllers();
  return <Text>{JSON.stringify(ctx)}</Text>;
}

describe("TrackerDashboardControllers", () => {
  it("renders children and provides context", () => {
    const { getByText } = render(
      <TrackerDashboardControllers>
        <Consumer />
      </TrackerDashboardControllers>,
    );
    expect(getByText("{}")).toBeTruthy();
  });

  it("useTrackerDashboardControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerDashboardControllers must be used within");
  });
});
