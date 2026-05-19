import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerAlertHistoryBrowseModels } from "./tracker-alertHistory-browse.models";

describe("TrackerAlertHistoryBrowseModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerAlertHistoryBrowseModels>
        <Text>child</Text>
      </TrackerAlertHistoryBrowseModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
