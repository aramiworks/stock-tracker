import { render } from "@testing-library/react-native";
import { TrackerAccountHomeLoadingStateView } from "./tracker-account-home-loadingState.view";

describe("TrackerAccountHomeLoadingStateView", () => {
  it("renders the loading skeleton card", () => {
    const { getByTestId } = render(<TrackerAccountHomeLoadingStateView />);
    expect(getByTestId("account-home-loading-card")).toBeTruthy();
  });
});
