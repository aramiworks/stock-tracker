import { render } from "@testing-library/react-native";
import { TrackerAlertHistoryBrowseEmptyStateView } from "./tracker-alertHistory-browse-emptyState.view";

describe("TrackerAlertHistoryBrowseEmptyStateView", () => {
  it("renders the empty state card + clipboard icon", () => {
    const { getByTestId } = render(<TrackerAlertHistoryBrowseEmptyStateView />);
    expect(getByTestId("alert-history-empty-state")).toBeTruthy();
    expect(getByTestId("alert-history-empty-icon")).toBeTruthy();
  });
});
