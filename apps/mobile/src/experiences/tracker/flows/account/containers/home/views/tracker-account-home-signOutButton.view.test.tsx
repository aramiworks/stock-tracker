import { render, fireEvent } from "@testing-library/react-native";
import { TrackerAccountHomeSignOutButtonView } from "./tracker-account-home-signOutButton.view";

describe("TrackerAccountHomeSignOutButtonView", () => {
  it("renders and calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountHomeSignOutButtonView onPress={onPress} />,
    );
    fireEvent.press(getByTestId("sign-out-button"));
    expect(onPress).toHaveBeenCalled();
  });

  it("disables the button when disabled prop is true", () => {
    const { getByTestId } = render(
      <TrackerAccountHomeSignOutButtonView disabled />,
    );
    expect(
      getByTestId("sign-out-button").props.accessibilityState?.disabled,
    ).toBe(true);
  });
});
