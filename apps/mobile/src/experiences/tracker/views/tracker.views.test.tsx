import { render } from "@testing-library/react-native";
import { TrackerViews } from "./tracker.views";

describe("TrackerViews", () => {
  it("renders placeholder text", () => {
    const { getByText } = render(<TrackerViews />);
    expect(getByText("Tracker")).toBeTruthy();
  });
});
