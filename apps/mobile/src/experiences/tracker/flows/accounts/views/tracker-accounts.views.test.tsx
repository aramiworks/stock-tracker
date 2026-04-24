jest.mock("expo-router", () => ({
  Slot: () => "Slot",
}));

import { render } from "@testing-library/react-native";
import { TrackerAccountsViews } from "./tracker-accounts.views";

describe("TrackerAccountsViews", () => {
  it("renders Slot for nested routing", () => {
    const { toJSON } = render(<TrackerAccountsViews />);
    expect(toJSON()).toBe("Slot");
  });
});
