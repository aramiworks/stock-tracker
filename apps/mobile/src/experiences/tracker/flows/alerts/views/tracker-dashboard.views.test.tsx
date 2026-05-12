jest.mock("expo-router", () => ({
  Slot: () => "Slot",
}));

import { render } from "@testing-library/react-native";
import { TrackerDashboardViews } from "./tracker-dashboard.views";

describe("TrackerDashboardViews", () => {
  it("renders Slot for nested routing", () => {
    const { toJSON } = render(<TrackerDashboardViews />);
    expect(toJSON()).toBe("Slot");
  });
});
