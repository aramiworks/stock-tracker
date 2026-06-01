import { render, fireEvent } from "@testing-library/react-native";
import { TrackerWatchlistListAddButtonView } from "./addButton";

describe("TrackerWatchlistListAddButtonView", () => {
  it("returns null when onPress is omitted", () => {
    const { queryByTestId } = render(<TrackerWatchlistListAddButtonView />);
    expect(queryByTestId("watchlist-add-products-button")).toBeNull();
  });

  it("renders and calls onPress when provided", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TrackerWatchlistListAddButtonView onPress={onPress} />,
    );
    fireEvent.press(getByTestId("watchlist-add-products-button"));
    expect(onPress).toHaveBeenCalled();
  });
});
