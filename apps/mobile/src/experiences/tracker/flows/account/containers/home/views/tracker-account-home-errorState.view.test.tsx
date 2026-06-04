import { render, fireEvent } from "@testing-library/react-native";
import { TrackerAccountHomeErrorStateView } from "./tracker-account-home-errorState.view";

describe("TrackerAccountHomeErrorStateView", () => {
  it("renders the tracker error state with retry handler wired", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountHomeErrorStateView onRetry={onRetry} />,
    );
    expect(getByTestId("account-home-error-state")).toBeTruthy();
    fireEvent.press(getByTestId("account-home-error-state-retry"));
    expect(onRetry).toHaveBeenCalled();
  });
});
