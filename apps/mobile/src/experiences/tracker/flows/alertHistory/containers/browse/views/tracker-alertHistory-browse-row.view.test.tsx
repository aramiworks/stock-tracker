import { render, fireEvent } from "@testing-library/react-native";
import { TrackerAlertHistoryBrowseRowView } from "./tracker-alertHistory-browse-row.view";
import type { AlertHistoryEvent } from "../models/tracker-alertHistory-browse.type";

const baseEvent: AlertHistoryEvent = {
  id: "evt-1",
  brand: "Hermès",
  productLine: "Bolide",
  modelName: "Bolide 27",
  skuDescriptor: null,
  kind: "restocked",
  detectedAt: "2026-05-19T09:14:00.000Z",
};

describe("TrackerAlertHistoryBrowseRowView", () => {
  it.each(["restocked", "soldOut"] as const)("renders for kind=%s", (kind) => {
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseRowView event={{ ...baseEvent, kind }} />,
    );
    expect(getByTestId("alert-history-row-evt-1")).toBeTruthy();
  });

  it("renders the left indicator bar only for kind=soldOut", () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <TrackerAlertHistoryBrowseRowView
        event={{ ...baseEvent, kind: "soldOut" }}
      />,
    );
    expect(getByTestId("alert-history-row-evt-1-bar")).toBeTruthy();

    rerender(
      <TrackerAlertHistoryBrowseRowView
        event={{ ...baseEvent, kind: "restocked" }}
      />,
    );
    expect(queryByTestId("alert-history-row-evt-1-bar")).toBeNull();
  });

  it("renders without an onPress handler", () => {
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseRowView event={baseEvent} />,
    );
    fireEvent.press(getByTestId("alert-history-row-evt-1"));
    expect(getByTestId("alert-history-row-evt-1")).toBeTruthy();
  });

  it("invokes onPress with the event when tapped", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TrackerAlertHistoryBrowseRowView event={baseEvent} onPress={onPress} />,
    );
    fireEvent.press(getByTestId("alert-history-row-evt-1"));
    expect(onPress).toHaveBeenCalledWith(baseEvent);
  });

  it("formats the detectedAt timestamp as YYYY.MM.DD with the brand label", () => {
    const { getByText } = render(
      <TrackerAlertHistoryBrowseRowView event={baseEvent} />,
    );
    expect(getByText("2026.05.19 · Hermès")).toBeTruthy();
  });
});
