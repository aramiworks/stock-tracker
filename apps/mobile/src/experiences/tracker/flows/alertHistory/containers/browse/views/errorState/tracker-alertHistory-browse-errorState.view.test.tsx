import { render, fireEvent } from "@testing-library/react-native";
import { TrackerAlertHistoryBrowseErrorStateView } from "./tracker-alertHistory-browse-errorState.view";

describe("TrackerAlertHistoryBrowseErrorStateView", () => {
  it("renders the error icon, copy, and retry pill", () => {
    const { getByTestId } = render(<TrackerAlertHistoryBrowseErrorStateView />);
    expect(getByTestId("alert-history-error-state")).toBeTruthy();
    expect(getByTestId("alert-history-error-icon")).toBeTruthy();
    expect(getByTestId("alert-history-error-retry")).toBeTruthy();
  });

  it("invokes `onRetry` when the retry pill is pressed", () => {
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseErrorStateView onRetry={onRetry} />,
    );
    fireEvent.press(getByTestId("alert-history-error-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders the retry pill even when no handler is supplied", () => {
    const { getByTestId } = render(<TrackerAlertHistoryBrowseErrorStateView />);
    expect(getByTestId("alert-history-error-retry")).toBeTruthy();
  });
});
