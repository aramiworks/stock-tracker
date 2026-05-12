import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: () =>
    require("react").createElement(require("react-native").View, {
      testID: "icon",
    }),
}));

import { TrackerDashboardHomeProfileAvatarView } from "./tracker-dashboard-home-profileAvatar.view";

describe("TrackerDashboardHomeProfileAvatarView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with profile-avatar testID", () => {
    const { getByTestId } = render(<TrackerDashboardHomeProfileAvatarView />);
    expect(getByTestId("profile-avatar")).toBeTruthy();
  });

  it("navigates to account home when pressed", () => {
    const { getByTestId } = render(<TrackerDashboardHomeProfileAvatarView />);
    fireEvent.press(getByTestId("profile-avatar"));
    expect(mockPush).toHaveBeenCalledWith("/tracker/account/home");
  });
});
