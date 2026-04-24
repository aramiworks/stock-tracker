import React, { forwardRef, useImperativeHandle } from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);
const mockUpdateAccount = jest.fn().mockResolvedValue({ data: {} });
const mockDeleteAccountMut = jest.fn().mockResolvedValue({ data: {} });
const mockCreatePurchase = jest.fn().mockResolvedValue({ data: {} });
const mockUpdatePurchase = jest.fn().mockResolvedValue({ data: {} });
const mockDeletePurchase = jest.fn().mockResolvedValue({ data: {} });

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
  useMutation: jest.fn(),
}));

jest.mock("../lifecycles", () => ({
  useTrackerAccountsDetailLifecycle: jest.fn(),
}));

import { useSuspenseQuery, useMutation } from "@apollo/client/react";
import {
  TrackerAccountsDetailControllers,
  useTrackerAccountsDetailControllers,
} from "./tracker-accounts-detail.controllers";

const MOCK_ACCOUNT = {
  id: "acc-1",
  storeName: "Cartier Gangnam",
  saName: "Kim",
  notes: "VIP client",
  createdAt: "2024-01-01",
  purchases: [
    {
      id: "p1",
      itemName: "Tank Watch",
      itemCategory: "시계",
      amount: 15000000,
      currency: "KRW",
      purchaseDate: "2024-06-15",
      storeLocation: "Gangnam",
      notes: null,
      createdAt: "2024-06-15",
    },
    {
      id: "p2",
      itemName: "Ring",
      itemCategory: "주얼리",
      amount: 3000000,
      currency: "KRW",
      purchaseDate: "2024-07-01",
      storeLocation: null,
      notes: null,
      createdAt: "2024-07-01",
    },
  ],
};

function setupMocks(account = MOCK_ACCOUNT) {
  (useSuspenseQuery as unknown as jest.Mock).mockReturnValue({
    data: { account },
    refetch: mockRefetch,
  });
  const mutations = [
    mockUpdateAccount,
    mockDeleteAccountMut,
    mockCreatePurchase,
    mockUpdatePurchase,
    mockDeletePurchase,
  ];
  let callIdx = 0;
  (useMutation as unknown as jest.Mock).mockImplementation(() => {
    const fn = mutations[callIdx % mutations.length];
    callIdx++;
    return [fn];
  });
}

interface ConsumerHandle {
  onUpdateAccount: (input: { storeName?: string }) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onCreatePurchase: (input: {
    itemName: string;
    amount: number;
    purchaseDate: string;
  }) => Promise<void>;
  onUpdatePurchase: (
    id: string,
    input: { amount?: number },
  ) => Promise<void>;
  onDeletePurchase: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const Consumer = forwardRef<ConsumerHandle>((_props, ref) => {
  const ctx = useTrackerAccountsDetailControllers();
  useImperativeHandle(ref, () => ({
    onUpdateAccount: ctx.onUpdateAccount,
    onDeleteAccount: ctx.onDeleteAccount,
    onCreatePurchase: ctx.onCreatePurchase,
    onUpdatePurchase: ctx.onUpdatePurchase,
    onDeletePurchase: ctx.onDeletePurchase,
    onRefresh: ctx.onRefresh,
  }));
  return (
    <>
      <Text testID="screen-state">{ctx.screenState}</Text>
      <Text testID="name">{ctx.name}</Text>
      <Text testID="initial">{ctx.initial}</Text>
      <Text testID="boutique">{ctx.boutique}</Text>
      <Text testID="sa-name">{ctx.saName}</Text>
      <Text testID="notes">{ctx.notes}</Text>
      <Text testID="total-spend">{String(ctx.totalSpend)}</Text>
      <Text testID="tank-state">{ctx.tankState}</Text>
      <Text testID="purchases">{JSON.stringify(ctx.purchases)}</Text>
      <Text testID="refreshing">{String(ctx.isRefreshing)}</Text>
      <Pressable testID="back" onPress={ctx.onBack} />
    </>
  );
});
Consumer.displayName = "Consumer";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
}));

describe("TrackerAccountsDetailControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it("provides account fields from query data", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer />
      </TrackerAccountsDetailControllers>,
    );
    expect(getByTestId("name").props.children).toBe("Kim");
    expect(getByTestId("initial").props.children).toBe("K");
    expect(getByTestId("boutique").props.children).toBe("Cartier Gangnam");
    expect(getByTestId("sa-name").props.children).toBe("Kim");
    expect(getByTestId("notes").props.children).toBe("VIP client");
  });

  it("computes totalSpend from purchases", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer />
      </TrackerAccountsDetailControllers>,
    );
    expect(getByTestId("total-spend").props.children).toBe("18000000");
  });

  it("maps purchases with type classification", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer />
      </TrackerAccountsDetailControllers>,
    );
    const purchases = JSON.parse(getByTestId("purchases").props.children);
    expect(purchases).toHaveLength(2);
    expect(purchases[0].type).toBe("tank");
    expect(purchases[0].productName).toBe("Tank Watch");
    expect(purchases[1].type).toBe("regular");
    expect(purchases[1].amount).toBe(3000000);
  });

  it("computes tankState as notEligible when below goal", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer />
      </TrackerAccountsDetailControllers>,
    );
    expect(getByTestId("tank-state").props.children).toBe("notEligible");
  });

  it("computes tankState as eligible when at goal", () => {
    setupMocks({
      ...MOCK_ACCOUNT,
      purchases: [{ ...MOCK_ACCOUNT.purchases[0], amount: 30000000 }],
    });
    const { getByTestId } = render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer />
      </TrackerAccountsDetailControllers>,
    );
    expect(getByTestId("tank-state").props.children).toBe("eligible");
  });

  it("computes tankState as noPurchases when no purchases", () => {
    setupMocks({ ...MOCK_ACCOUNT, purchases: [] });
    const { getByTestId } = render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer />
      </TrackerAccountsDetailControllers>,
    );
    expect(getByTestId("tank-state").props.children).toBe("noPurchases");
  });

  it("onBack calls router.back", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer />
      </TrackerAccountsDetailControllers>,
    );
    fireEvent.press(getByTestId("back"));
    expect(mockBack).toHaveBeenCalled();
  });

  it("onUpdateAccount calls mutation with accountId", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer ref={ref} />
      </TrackerAccountsDetailControllers>,
    );
    await act(async () => {
      await ref.current!.onUpdateAccount({ storeName: "New" });
    });
    expect(mockUpdateAccount).toHaveBeenCalledWith({
      variables: { input: { id: "acc-1", storeName: "New" } },
    });
  });

  it("onDeleteAccount calls mutation and navigates back", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer ref={ref} />
      </TrackerAccountsDetailControllers>,
    );
    await act(async () => {
      await ref.current!.onDeleteAccount();
    });
    expect(mockDeleteAccountMut).toHaveBeenCalledWith({
      variables: { id: "acc-1" },
    });
    expect(mockBack).toHaveBeenCalled();
  });

  it("onCreatePurchase calls mutation with accountId", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer ref={ref} />
      </TrackerAccountsDetailControllers>,
    );
    await act(async () => {
      await ref.current!.onCreatePurchase({
        itemName: "Bracelet",
        amount: 5000000,
        purchaseDate: "2024-08-01",
      });
    });
    expect(mockCreatePurchase).toHaveBeenCalledWith({
      variables: {
        input: {
          accountId: "acc-1",
          itemName: "Bracelet",
          amount: 5000000,
          purchaseDate: "2024-08-01",
        },
      },
    });
  });

  it("onUpdatePurchase calls mutation with purchase id", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer ref={ref} />
      </TrackerAccountsDetailControllers>,
    );
    await act(async () => {
      await ref.current!.onUpdatePurchase("p1", { amount: 20000000 });
    });
    expect(mockUpdatePurchase).toHaveBeenCalledWith({
      variables: { input: { id: "p1", amount: 20000000 } },
    });
  });

  it("onDeletePurchase calls mutation", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer ref={ref} />
      </TrackerAccountsDetailControllers>,
    );
    await act(async () => {
      await ref.current!.onDeletePurchase("p1");
    });
    expect(mockDeletePurchase).toHaveBeenCalledWith({
      variables: { id: "p1" },
    });
  });

  it("onRefresh calls refetch", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerAccountsDetailControllers accountId="acc-1">
        <Consumer ref={ref} />
      </TrackerAccountsDetailControllers>,
    );
    await act(async () => {
      ref.current!.onRefresh();
      await Promise.resolve();
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("useTrackerAccountsDetailControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerAccountsDetailControllers must be used within");
  });
});
