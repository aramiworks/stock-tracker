import React, { forwardRef, useImperativeHandle } from "react";
import { render, act } from "@testing-library/react-native";
import { Text } from "react-native";
import { supabase } from "../../../lib/supabase";

jest.mock("@apollo/client/react", () => {
  const { View } = require("react-native");
  return {
    ApolloProvider: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock("@apollo/client/testing/react", () => {
  const { View } = require("react-native");
  return {
    MockedProvider: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock("../../../lib/apollo/mocks", () => ({
  trackerMocks: [],
}));

import { apolloClient } from "../../../lib/apollo/provider";
import {
  AuthControllers,
  useAuthControllers,
} from "./auth.controllers";

interface ConsumerHandle {
  signOut: () => Promise<void>;
}

const Consumer = forwardRef<ConsumerHandle>((_props, ref) => {
  const { signOut, isSigningOut } = useAuthControllers();
  useImperativeHandle(ref, () => ({ signOut }));
  return <Text testID="signing-out">{String(isSigningOut)}</Text>;
});
Consumer.displayName = "Consumer";

describe("AuthControllers", () => {
  let resetStoreSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    resetStoreSpy = jest
      .spyOn(apolloClient, "resetStore")
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    resetStoreSpy.mockRestore();
  });

  it("renders children and provides context", () => {
    const { getByText } = render(
      <AuthControllers>
        <Text>child</Text>
      </AuthControllers>,
    );
    expect(getByText("child")).toBeTruthy();
  });

  it("useAuthControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useAuthControllers must be used within");
  });

  it("isSigningOut starts as false", () => {
    const { getByTestId } = render(
      <AuthControllers>
        <Consumer />
      </AuthControllers>,
    );
    expect(getByTestId("signing-out").props.children).toBe("false");
  });

  it("signOut calls supabase.auth.signOut and apolloClient.resetStore", async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce(undefined);
    const ref = React.createRef<ConsumerHandle>();
    render(
      <AuthControllers>
        <Consumer ref={ref} />
      </AuthControllers>,
    );
    await act(async () => {
      await ref.current!.signOut();
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(resetStoreSpy).toHaveBeenCalled();
  });

  it("signOut resets isSigningOut to false even on error", async () => {
    (supabase.auth.signOut as jest.Mock).mockRejectedValueOnce(
      new Error("fail"),
    );
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <AuthControllers>
        <Consumer ref={ref} />
      </AuthControllers>,
    );
    await act(async () => {
      await ref.current!.signOut().catch(() => {});
    });
    expect(getByTestId("signing-out").props.children).toBe("false");
  });
});
