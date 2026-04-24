import React, { forwardRef, useImperativeHandle } from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);
const mockCreateAccount = jest.fn().mockResolvedValue({ data: {} });
const mockDeleteAccount = jest.fn().mockResolvedValue({ data: {} });

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
  useMutation: jest.fn(),
}));

jest.mock("../lifecycles", () => ({
  useTrackerAccountsListLifecycle: jest.fn(),
}));

jest.mock("@/shared/hooks/use-debounce", () => ({
  useDebounce: jest.fn((val: string) => val),
}));

import { useSuspenseQuery, useMutation } from "@apollo/client/react";
import {
  TrackerAccountsListControllers,
  useTrackerAccountsListControllers,
} from "./tracker-accounts-list.controllers";

const MOCK_ACCOUNTS = [
  {
    id: "acc-1",
    storeName: "Cartier Gangnam",
    saName: "Kim",
    notes: null,
    createdAt: "2024-01-01",
    purchases: [
      { id: "p1", itemName: "Watch", amount: 35000000, purchaseDate: "2024-01-15" },
    ],
  },
  {
    id: "acc-2",
    storeName: "Cartier Cheongdam",
    saName: null,
    notes: "VIP",
    createdAt: "2024-02-01",
    purchases: [],
  },
];

function setQueryData(accounts = MOCK_ACCOUNTS) {
  (useSuspenseQuery as jest.Mock).mockReturnValue({
    data: { accounts },
    refetch: mockRefetch,
  });
}

interface ConsumerHandle {
  onCreateAccount: (input: { storeName: string }) => Promise<void>;
  onDeleteAccount: (id: string) => Promise<void>;
  onSearchChange: (query: string) => void;
  onSortByToggle: () => void;
  onRefresh: () => void;
}

const Consumer = forwardRef<ConsumerHandle>((_props, ref) => {
  const ctx = useTrackerAccountsListControllers();
  useImperativeHandle(ref, () => ({
    onCreateAccount: ctx.onCreateAccount,
    onDeleteAccount: ctx.onDeleteAccount,
    onSearchChange: ctx.onSearchChange,
    onSortByToggle: ctx.onSortByToggle,
    onRefresh: ctx.onRefresh,
  }));
  return (
    <>
      <Text testID="screen-state">{ctx.screenState}</Text>
      <Text testID="accounts">{JSON.stringify(ctx.accounts)}</Text>
      <Text testID="search-query">{ctx.searchQuery}</Text>
      <Text testID="sort-by">{ctx.sortBy}</Text>
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

describe("TrackerAccountsListControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mutations = [mockCreateAccount, mockDeleteAccount];
    let callIdx = 0;
    (useMutation as jest.Mock).mockImplementation(() => {
      const fn = mutations[callIdx % mutations.length];
      callIdx++;
      return [fn];
    });
    setQueryData();
  });

  it("provides screenState 'default' when accounts exist", () => {
    const { getByTestId } = render(
      <TrackerAccountsListControllers>
        <Consumer />
      </TrackerAccountsListControllers>,
    );
    expect(getByTestId("screen-state").props.children).toBe("default");
  });

  it("provides screenState 'empty' when no accounts", () => {
    setQueryData([]);
    const { getByTestId } = render(
      <TrackerAccountsListControllers>
        <Consumer />
      </TrackerAccountsListControllers>,
    );
    expect(getByTestId("screen-state").props.children).toBe("empty");
  });

  it("maps accounts with eligibility states", () => {
    const { getByTestId } = render(
      <TrackerAccountsListControllers>
        <Consumer />
      </TrackerAccountsListControllers>,
    );
    const accounts = JSON.parse(getByTestId("accounts").props.children);
    expect(accounts).toHaveLength(2);
    expect(accounts[0].state).toBe("eligible");
    expect(accounts[0].totalSpend).toBe(35000000);
    expect(accounts[1].state).toBe("noPurchases");
  });

  it("onSaPress navigates to account detail", () => {
    const { getByTestId } = render(
      <TrackerAccountsListControllers>
        <Consumer />
      </TrackerAccountsListControllers>,
    );
    fireEvent.press(getByTestId("sa-press"));
    expect(mockPush).toHaveBeenCalledWith("/tracker/accounts/detail/acc-1");
  });

  it("onCreateAccount calls mutation", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsListControllers>
        <Consumer ref={ref} />
      </TrackerAccountsListControllers>,
    );
    await act(async () => {
      await ref.current!.onCreateAccount({ storeName: "Test" });
    });
    expect(mockCreateAccount).toHaveBeenCalledWith({
      variables: { input: { storeName: "Test" } },
    });
  });

  it("onDeleteAccount calls mutation", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsListControllers>
        <Consumer ref={ref} />
      </TrackerAccountsListControllers>,
    );
    await act(async () => {
      await ref.current!.onDeleteAccount("acc-1");
    });
    expect(mockDeleteAccount).toHaveBeenCalledWith({
      variables: { id: "acc-1" },
    });
  });

  it("default sortBy is created_at", () => {
    const { getByTestId } = render(
      <TrackerAccountsListControllers>
        <Consumer />
      </TrackerAccountsListControllers>,
    );
    expect(getByTestId("sort-by").props.children).toBe("created_at");
  });

  it("onSortByToggle toggles between created_at and store_name", () => {
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <TrackerAccountsListControllers>
        <Consumer ref={ref} />
      </TrackerAccountsListControllers>,
    );
    act(() => {
      ref.current!.onSortByToggle();
    });
    expect(getByTestId("sort-by").props.children).toBe("store_name");
  });

  it("onRefresh calls refetch", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsListControllers>
        <Consumer ref={ref} />
      </TrackerAccountsListControllers>,
    );
    await act(async () => {
      ref.current!.onRefresh();
      await Promise.resolve();
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("useTrackerAccountsListControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerAccountsListControllers must be used within");
  });
});
