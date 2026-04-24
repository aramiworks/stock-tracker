import React, { forwardRef, useImperativeHandle } from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);
const mockCreateAccount = jest.fn().mockResolvedValue({ data: {} });

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
  useMutation: jest.fn(() => [mockCreateAccount]),
}));

jest.mock("../lifecycles", () => ({
  useTrackerDashboardHomeLifecycle: jest.fn(),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import {
  TrackerDashboardHomeControllers,
  useTrackerDashboardHomeControllers,
} from "./tracker-dashboard-home.controllers";

const MOCK_ACCOUNTS = [
  {
    id: "acc-1",
    storeName: "Cartier Gangnam",
    saName: "Kim",
    purchases: [
      { id: "p1", amount: 20000000 },
      { id: "p2", amount: 15000000 },
    ],
  },
  {
    id: "acc-2",
    storeName: "Cartier Cheongdam",
    saName: null,
    purchases: [],
  },
];

function setQueryData(
  overrides: {
    accounts?: typeof MOCK_ACCOUNTS;
    totalSpent?: number;
  } = {},
) {
  (useSuspenseQuery as unknown as jest.Mock).mockReturnValue({
    data: {
      dashboard: {
        totalAccounts: (overrides.accounts ?? MOCK_ACCOUNTS).length,
        totalPurchases: 2,
        totalSpent: overrides.totalSpent ?? 35000000,
      },
      accounts: overrides.accounts ?? MOCK_ACCOUNTS,
    },
    refetch: mockRefetch,
  });
}

interface ConsumerHandle {
  onCreateAccount: (input: { storeName: string }) => Promise<void>;
  onRefresh: () => void;
}

const Consumer = forwardRef<ConsumerHandle>((_props, ref) => {
  const ctx = useTrackerDashboardHomeControllers();
  useImperativeHandle(ref, () => ({
    onCreateAccount: ctx.onCreateAccount,
    onRefresh: ctx.onRefresh,
  }));
  return (
    <>
      <Text testID="screen-state">{ctx.screenState}</Text>
      <Text testID="eligibility">{ctx.eligibilityStatus}</Text>
      <Text testID="total-spend">{String(ctx.totalSpend)}</Text>
      <Text testID="goal-amount">{String(ctx.goalAmount)}</Text>
      <Text testID="accounts">{JSON.stringify(ctx.saAccounts)}</Text>
      <Text testID="refreshing">{String(ctx.isRefreshing)}</Text>
      <Pressable testID="sa-press" onPress={() => ctx.onSaPress("acc-1")} />
    </>
  );
});
Consumer.displayName = "Consumer";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("TrackerDashboardHomeControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setQueryData();
  });

  it("provides screenState 'default' when accounts exist", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeControllers>
        <Consumer />
      </TrackerDashboardHomeControllers>,
    );
    expect(getByTestId("screen-state").props.children).toBe("default");
  });

  it("provides screenState 'empty' when no accounts", () => {
    setQueryData({ accounts: [] });
    const { getByTestId } = render(
      <TrackerDashboardHomeControllers>
        <Consumer />
      </TrackerDashboardHomeControllers>,
    );
    expect(getByTestId("screen-state").props.children).toBe("empty");
  });

  it("maps saAccounts with eligibility states", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeControllers>
        <Consumer />
      </TrackerDashboardHomeControllers>,
    );
    const accounts = JSON.parse(getByTestId("accounts").props.children);
    expect(accounts).toHaveLength(2);
    expect(accounts[0]).toEqual({
      id: "acc-1",
      name: "Kim",
      initial: "K",
      boutique: "Cartier Gangnam",
      totalSpend: 35000000,
      state: "eligible",
    });
    expect(accounts[1]).toEqual({
      id: "acc-2",
      name: "Cartier Cheongdam",
      initial: "C",
      boutique: "Cartier Cheongdam",
      totalSpend: 0,
      state: "noPurchases",
    });
  });

  it("computes eligibilityStatus based on totalSpend vs GOAL_AMOUNT", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeControllers>
        <Consumer />
      </TrackerDashboardHomeControllers>,
    );
    expect(getByTestId("eligibility").props.children).toBe("eligible");
    expect(getByTestId("goal-amount").props.children).toBe("30000000");
  });

  it("computes eligibilityStatus as notEligible when below goal", () => {
    setQueryData({ totalSpent: 10000000 });
    const { getByTestId } = render(
      <TrackerDashboardHomeControllers>
        <Consumer />
      </TrackerDashboardHomeControllers>,
    );
    expect(getByTestId("eligibility").props.children).toBe("notEligible");
  });

  it("onSaPress navigates to account detail", () => {
    const { getByTestId } = render(
      <TrackerDashboardHomeControllers>
        <Consumer />
      </TrackerDashboardHomeControllers>,
    );
    fireEvent.press(getByTestId("sa-press"));
    expect(mockPush).toHaveBeenCalledWith("/tracker/accounts/detail/acc-1");
  });

  it("onCreateAccount calls mutation", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerDashboardHomeControllers>
        <Consumer ref={ref} />
      </TrackerDashboardHomeControllers>,
    );
    await act(async () => {
      await ref.current!.onCreateAccount({ storeName: "Test" });
    });
    expect(mockCreateAccount).toHaveBeenCalledWith({
      variables: { input: { storeName: "Test" } },
    });
  });

  it("onRefresh calls refetch", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerDashboardHomeControllers>
        <Consumer ref={ref} />
      </TrackerDashboardHomeControllers>,
    );
    await act(async () => {
      ref.current!.onRefresh();
      await Promise.resolve();
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("useTrackerDashboardHomeControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerDashboardHomeControllers must be used within");
  });
});
