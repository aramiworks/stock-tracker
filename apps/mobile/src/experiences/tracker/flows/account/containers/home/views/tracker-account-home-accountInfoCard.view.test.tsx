import { render } from "@testing-library/react-native";
import { TrackerAccountHomeAccountInfoCardView } from "./tracker-account-home-accountInfoCard.view";

describe("TrackerAccountHomeAccountInfoCardView", () => {
  it("renders email and a formatted ko-KR signup date", () => {
    const { getByTestId, getByText } = render(
      <TrackerAccountHomeAccountInfoCardView
        email="user@test.com"
        createdAt="2024-01-15T00:00:00Z"
      />,
    );
    expect(getByTestId("account-info-card")).toBeTruthy();
    expect(getByText("user@test.com")).toBeTruthy();
    expect(getByText(/2024/)).toBeTruthy();
  });

  it("renders blank date row when createdAt is empty", () => {
    const { getByTestId } = render(<TrackerAccountHomeAccountInfoCardView />);
    expect(getByTestId("account-signup-date").props.children).toBe("");
  });
});
