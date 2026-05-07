import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("expo-constants", () => ({
  default: { expoConfig: { version: "1.2.3" } },
}));

jest.mock("@aramiworks/ui", () => {
  const { View } = require("react-native");
  return {
    Button: ({ children, onPress, disabled, testID }: any) =>
      require("react").createElement(View, { testID, onPress, accessibilityState: { disabled: !!disabled } }, children),
    Card: ({ children, testID }: any) =>
      require("react").createElement(View, { testID }, children),
    DashboardTemplate: ({ children, topBar, testID }: any) =>
      require("react").createElement(View, { testID }, topBar, children),
    Divider: () => require("react").createElement(View, { testID: "divider" }),
    TopAppBar: ({ onNavigationPress, testID }: any) =>
      require("react").createElement(View, { testID, onPress: onNavigationPress }),
    XStack: ({ children }: any) =>
      require("react").createElement(View, null, children),
    YStack: ({ children }: any) =>
      require("react").createElement(View, null, children),
  };
});

import { TrackerAccountHomeViews } from "./tracker-account-home.views";

describe("TrackerAccountHomeViews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders account home screen", () => {
    const { getByTestId } = render(<TrackerAccountHomeViews />);
    expect(getByTestId("account-home-screen")).toBeTruthy();
  });

  it("renders email value", () => {
    const { getByText } = render(
      <TrackerAccountHomeViews email="user@test.com" />,
    );
    expect(getByText("user@test.com")).toBeTruthy();
  });

  it("renders formatted date when createdAt provided", () => {
    const { getByText } = render(
      <TrackerAccountHomeViews createdAt="2024-01-15T00:00:00Z" />,
    );
    // Date is formatted to ko-KR locale
    expect(getByText(/2024/)).toBeTruthy();
  });

  it("renders empty string when createdAt is empty", () => {
    const { getByTestId } = render(
      <TrackerAccountHomeViews createdAt="" />,
    );
    expect(getByTestId("account-home-screen")).toBeTruthy();
  });

  it("renders version from expo-constants", () => {
    const { getByTestId } = render(<TrackerAccountHomeViews />);
    const versionEl = getByTestId("version-footer");
    expect(versionEl.props.children).toContain("1.2.3");
  });

  it("calls signOut when sign-out button pressed", () => {
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <TrackerAccountHomeViews signOut={mockSignOut} />,
    );
    fireEvent.press(getByTestId("sign-out-button"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("calls router.back when navigation icon pressed", () => {
    const { getByTestId } = render(<TrackerAccountHomeViews />);
    fireEvent.press(getByTestId("account-home-top-bar"));
    expect(mockBack).toHaveBeenCalled();
  });

  it("defaults to isSigningOut=false", () => {
    const { getByTestId } = render(<TrackerAccountHomeViews />);
    const btn = getByTestId("sign-out-button");
    expect(btn.props.accessibilityState?.disabled).toBe(false);
  });
});
