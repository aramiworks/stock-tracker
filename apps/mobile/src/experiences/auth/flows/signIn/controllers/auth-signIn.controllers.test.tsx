import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  AuthSignInControllers,
  useAuthSignInControllers,
} from "./auth-signIn.controllers";

function Consumer() {
  const ctx = useAuthSignInControllers();
  return <Text>{JSON.stringify(ctx)}</Text>;
}

describe("AuthSignInControllers", () => {
  it("renders children and provides context", () => {
    const { getByText } = render(
      <AuthSignInControllers>
        <Consumer />
      </AuthSignInControllers>,
    );
    expect(getByText("{}")).toBeTruthy();
  });

  it("useAuthSignInControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useAuthSignInControllers must be used within");
  });
});
