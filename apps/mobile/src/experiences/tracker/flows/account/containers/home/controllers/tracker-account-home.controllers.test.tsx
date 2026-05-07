import React, { forwardRef, useImperativeHandle } from "react";
import { render, act } from "@testing-library/react-native";
import { Text } from "react-native";

const mockSignOut = jest.fn().mockResolvedValue(undefined);

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
}));

jest.mock("@/experiences/auth/controllers", () => ({
  useAuthControllers: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import { useAuthControllers } from "@/experiences/auth/controllers";
import {
  TrackerAccountHomeControllers,
  useTrackerAccountHomeControllers,
} from "./tracker-account-home.controllers";

function setQueryData(
  overrides: { me?: { id: string; email: string; createdAt: string } | null } = {},
) {
  (useSuspenseQuery as unknown as jest.Mock).mockReturnValue({
    data: {
      me:
        overrides.me !== undefined
          ? overrides.me
          : {
              id: "user-1",
              email: "test@example.com",
              createdAt: "2024-01-15T00:00:00Z",
            },
    },
  });
}

function setAuthControllers(overrides: { isSigningOut?: boolean } = {}) {
  (useAuthControllers as unknown as jest.Mock).mockReturnValue({
    signOut: mockSignOut,
    isSigningOut: overrides.isSigningOut ?? false,
  });
}

interface ConsumerHandle {
  signOut: () => Promise<void>;
  email: string;
  createdAt: string;
  isSigningOut: boolean;
}

const Consumer = forwardRef<ConsumerHandle>((_props, ref) => {
  const ctx = useTrackerAccountHomeControllers();
  useImperativeHandle(ref, () => ({
    signOut: ctx.signOut,
    email: ctx.email,
    createdAt: ctx.createdAt,
    isSigningOut: ctx.isSigningOut,
  }));
  return (
    <>
      <Text testID="email">{ctx.email}</Text>
      <Text testID="createdAt">{ctx.createdAt}</Text>
      <Text testID="isSigningOut">{String(ctx.isSigningOut)}</Text>
    </>
  );
});
Consumer.displayName = "Consumer";

describe("TrackerAccountHomeControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setQueryData();
    setAuthControllers();
  });

  it("provides email from query data", () => {
    const { getByTestId } = render(
      <TrackerAccountHomeControllers>
        <Consumer />
      </TrackerAccountHomeControllers>,
    );
    expect(getByTestId("email").props.children).toBe("test@example.com");
  });

  it("provides createdAt from query data", () => {
    const { getByTestId } = render(
      <TrackerAccountHomeControllers>
        <Consumer />
      </TrackerAccountHomeControllers>,
    );
    expect(getByTestId("createdAt").props.children).toBe(
      "2024-01-15T00:00:00Z",
    );
  });

  it("falls back to empty string when me is null", () => {
    setQueryData({ me: null });
    const { getByTestId } = render(
      <TrackerAccountHomeControllers>
        <Consumer />
      </TrackerAccountHomeControllers>,
    );
    expect(getByTestId("email").props.children).toBe("");
    expect(getByTestId("createdAt").props.children).toBe("");
  });

  it("forwards isSigningOut from auth controllers", () => {
    setAuthControllers({ isSigningOut: true });
    const { getByTestId } = render(
      <TrackerAccountHomeControllers>
        <Consumer />
      </TrackerAccountHomeControllers>,
    );
    expect(getByTestId("isSigningOut").props.children).toBe("true");
  });

  it("signOut calls auth signOut", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountHomeControllers>
        <Consumer ref={ref} />
      </TrackerAccountHomeControllers>,
    );
    await act(async () => {
      await ref.current!.signOut();
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("useTrackerAccountHomeControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerAccountHomeControllers must be used within");
  });
});
