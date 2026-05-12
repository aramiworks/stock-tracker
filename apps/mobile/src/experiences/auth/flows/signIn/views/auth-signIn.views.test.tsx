jest.mock("expo-router", () => ({
  Slot: () => "Slot",
}));

import { render } from "@testing-library/react-native";
import { AuthSignInViews } from "./auth-signIn.views";

describe("AuthSignInViews", () => {
  it("renders Slot for nested routing", () => {
    const { toJSON } = render(<AuthSignInViews />);
    expect(toJSON()).toBe("Slot");
  });
});
