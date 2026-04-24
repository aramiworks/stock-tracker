import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  TrackerAccountsControllers,
  useTrackerAccountsControllers,
} from "./tracker-accounts.controllers";

function Consumer() {
  const ctx = useTrackerAccountsControllers();
  return <Text>{JSON.stringify(ctx)}</Text>;
}

describe("TrackerAccountsControllers", () => {
  it("renders children and provides context", () => {
    const { getByText } = render(
      <TrackerAccountsControllers>
        <Consumer />
      </TrackerAccountsControllers>,
    );
    expect(getByText("{}")).toBeTruthy();
  });

  it("useTrackerAccountsControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerAccountsControllers must be used within");
  });
});
