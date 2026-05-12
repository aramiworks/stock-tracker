jest.mock("expo-router", () => ({
  Slot: () => "Slot",
}));

import { render } from "@testing-library/react-native";
import { TrackerHistoryViews } from "./tracker-history.views";

describe("TrackerHistoryViews", () => {
  it("renders Slot for nested routing", () => {
    const { toJSON } = render(<TrackerHistoryViews />);
    expect(toJSON()).toBe("Slot");
  });
});
