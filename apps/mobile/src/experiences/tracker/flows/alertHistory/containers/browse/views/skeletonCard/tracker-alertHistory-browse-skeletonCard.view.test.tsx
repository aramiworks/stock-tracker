import { render } from "@testing-library/react-native";
import { TrackerAlertHistoryBrowseSkeletonCardView } from "./tracker-alertHistory-browse-skeletonCard.view";

describe("TrackerAlertHistoryBrowseSkeletonCardView", () => {
  it("renders a single placeholder by default", () => {
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseSkeletonCardView />,
    );
    expect(getByTestId("alert-history-skeleton-card")).toBeTruthy();
    expect(getByTestId("alert-history-skeleton-row-0")).toBeTruthy();
  });

  it("renders `count` placeholder rows when supplied", () => {
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseSkeletonCardView count={3} />,
    );
    expect(getByTestId("alert-history-skeleton-row-0")).toBeTruthy();
    expect(getByTestId("alert-history-skeleton-row-1")).toBeTruthy();
    expect(getByTestId("alert-history-skeleton-row-2")).toBeTruthy();
  });
});
