import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerAlertHistoryModels } from "./tracker-alertHistory.models";

describe("TrackerAlertHistoryModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerAlertHistoryModels>
        <Text>child</Text>
      </TrackerAlertHistoryModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
