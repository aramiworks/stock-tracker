import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TrackerWatchlistListModels } from "./tracker-watchlist-list.models";

describe("TrackerWatchlistListModels", () => {
  it("renders children", () => {
    const { getByText } = render(
      <TrackerWatchlistListModels>
        <Text>child</Text>
      </TrackerWatchlistListModels>,
    );
    expect(getByText("child")).toBeTruthy();
  });
});
