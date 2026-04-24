import { render } from "@testing-library/react-native";
import { AuthViews } from "./auth.views";

describe("AuthViews", () => {
  it("renders placeholder text", () => {
    const { getByText } = render(<AuthViews />);
    expect(getByText("Auth")).toBeTruthy();
  });
});
