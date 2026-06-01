import { render, fireEvent } from "@testing-library/react-native";
import { TrackerAccountsDetailAddPurchaseButtonView } from "./tracker-accounts-detail-addPurchaseButton.view";

describe("TrackerAccountsDetailAddPurchaseButtonView", () => {
  it("renders and calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TrackerAccountsDetailAddPurchaseButtonView onPress={onPress} />,
    );
    fireEvent.press(getByTestId("accounts-detail-add-purchase"));
    expect(onPress).toHaveBeenCalled();
  });
});
