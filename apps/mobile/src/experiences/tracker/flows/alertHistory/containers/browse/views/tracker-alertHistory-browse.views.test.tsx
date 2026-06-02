import { render } from "@testing-library/react-native";
import { TrackerAlertHistoryBrowseViews } from "./tracker-alertHistory-browse.views";
import type { AlertHistoryEvent } from "../models/tracker-alertHistory-browse.type";

const sampleEvents: AlertHistoryEvent[] = [
  {
    id: "evt-1",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 27",
    skuDescriptor: "Noir · Togo · Gold",
    kind: "restocked",
    detectedAt: "2026-05-19T09:14:00.000Z",
  },
  {
    id: "evt-2",
    brand: "Hermès",
    productLine: "Bolide",
    modelName: "Bolide 31",
    skuDescriptor: null,
    kind: "soldOut",
    detectedAt: "2026-05-18T22:03:00.000Z",
  },
];

describe("TrackerAlertHistoryBrowseViews", () => {
  it("renders default state with the storybook fixture when no props passed", () => {
    const { getByTestId } = render(<TrackerAlertHistoryBrowseViews />);
    expect(getByTestId("alert-history-screen")).toBeTruthy();
  });

  it("renders default state with provided events", () => {
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseViews
        screenState="default"
        events={sampleEvents}
      />,
    );
    expect(getByTestId("alert-history-list")).toBeTruthy();
    expect(getByTestId("alert-history-row-evt-1")).toBeTruthy();
    expect(getByTestId("alert-history-row-evt-2")).toBeTruthy();
  });

  it("renders empty state", () => {
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseViews screenState="empty" />,
    );
    expect(getByTestId("alert-history-empty-state")).toBeTruthy();
  });

  it("renders error state as empty state (shares fallback view)", () => {
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseViews screenState="error" />,
    );
    expect(getByTestId("alert-history-empty-state")).toBeTruthy();
  });

  it("renders loading skeletons", () => {
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseViews screenState="loading" />,
    );
    expect(getByTestId("alert-history-skeleton-card")).toBeTruthy();
  });

  it("wires the RefreshControl via onRefresh", () => {
    const onRefresh = jest.fn();
    render(
      <TrackerAlertHistoryBrowseViews
        screenState="default"
        events={sampleEvents}
        isRefreshing
        onRefresh={onRefresh}
      />,
    );
    // RefreshControl rendering smoke — assertion is that no throw occurs.
    expect(onRefresh).not.toHaveBeenCalled();
  });
});
