import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerWatchlistDetailModels } from "./tracker-watchlist-detail.models";

describe("TrackerWatchlistDetailModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerWatchlistDetailModels>
        <Text>child</Text>
      </TrackerWatchlistDetailModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
