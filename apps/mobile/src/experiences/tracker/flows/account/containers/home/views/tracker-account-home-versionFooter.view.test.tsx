import { render } from "@testing-library/react-native";
import { TrackerAccountHomeVersionFooterView } from "./tracker-account-home-versionFooter.view";

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { version: "1.2.3" } },
}));

describe("TrackerAccountHomeVersionFooterView", () => {
  it("renders the app version from expo-constants", () => {
    const { getByTestId } = render(<TrackerAccountHomeVersionFooterView />);
    expect(getByTestId("version-footer").props.children).toContain("1.2.3");
  });

  it("falls back to 0.0.0 when expoConfig has no version", () => {
    const Constants = jest.requireMock("expo-constants").default;
    const original = Constants.expoConfig;
    Constants.expoConfig = {};
    const { getByTestId } = render(<TrackerAccountHomeVersionFooterView />);
    expect(getByTestId("version-footer").props.children).toContain("0.0.0");
    Constants.expoConfig = original;
  });
});
