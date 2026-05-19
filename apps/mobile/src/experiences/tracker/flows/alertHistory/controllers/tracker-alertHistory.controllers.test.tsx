import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerAlertHistoryControllers } from "./tracker-alertHistory.controllers";

describe("TrackerAlertHistoryControllers", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerAlertHistoryControllers>
        <Text>child</Text>
      </TrackerAlertHistoryControllers>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
