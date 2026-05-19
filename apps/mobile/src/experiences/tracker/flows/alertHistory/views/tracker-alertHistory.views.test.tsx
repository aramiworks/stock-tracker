import { render } from "@testing-library/react-native";
import { TrackerAlertHistoryViews } from "./tracker-alertHistory.views";

describe("TrackerAlertHistoryViews", () => {
  it("renders nothing (flow-level slot)", () => {
    const { toJSON } = render(<TrackerAlertHistoryViews />);
    expect(toJSON()).toBeNull();
  });
});
