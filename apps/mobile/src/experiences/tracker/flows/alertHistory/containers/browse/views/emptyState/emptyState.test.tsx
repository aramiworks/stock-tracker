import { render } from "@testing-library/react-native";
import { TrackerAlertHistoryBrowseEmptyStateView } from "./emptyState";

describe("TrackerAlertHistoryBrowseEmptyStateView", () => {
  it("renders the empty state title + body", () => {
    const { getByTestId } = render(<TrackerAlertHistoryBrowseEmptyStateView />);
    expect(getByTestId("alert-history-empty-state")).toBeTruthy();
  });
});
