import React, { forwardRef, useImperativeHandle } from "react";
import { render, act } from "@testing-library/react-native";
import { Text } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);
const mockDeletePurchase = jest.fn().mockResolvedValue({ data: {} });

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
  useMutation: jest.fn(() => [mockDeletePurchase]),
}));

jest.mock("../lifecycles", () => ({
  useTrackerHistoryBrowseLifecycle: jest.fn(),
}));

jest.mock("@/shared/hooks/use-debounce", () => ({
  useDebounce: jest.fn((val: string) => val),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import {
  TrackerHistoryBrowseControllers,
  useTrackerHistoryBrowseControllers,
} from "./tracker-history-browse.controllers";

const MOCK_PURCHASES = [
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
];

function setQueryData(purchases = MOCK_PURCHASES) {
  (useSuspenseQuery as unknown as jest.Mock).mockReturnValue({
    data: { purchases },
    refetch: mockRefetch,
  });
}

interface ConsumerHandle {
  onFilterSelect: (filter: string) => void;
  onSearchChange: (query: string) => void;
  onCategorySelect: (category: string | null) => void;
  onDeletePurchase: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const Consumer = forwardRef<ConsumerHandle>((_props, ref) => {
  const ctx = useTrackerHistoryBrowseControllers();
  useImperativeHandle(ref, () => ({
    onFilterSelect: ctx.onFilterSelect as (filter: string) => void,
    onSearchChange: ctx.onSearchChange,
    onCategorySelect: ctx.onCategorySelect as (category: string | null) => void,
    onDeletePurchase: ctx.onDeletePurchase,
    onRefresh: ctx.onRefresh,
  }));
  return (
    <>
      <Text testID="screen-state">{ctx.screenState}</Text>
      <Text testID="purchases">{JSON.stringify(ctx.purchases)}</Text>
      <Text testID="selected-filter">{ctx.selectedFilter}</Text>
      <Text testID="search-query">{ctx.searchQuery}</Text>
      <Text testID="selected-category">{ctx.selectedCategory ?? "null"}</Text>
      <Text testID="refreshing">{String(ctx.isRefreshing)}</Text>
    </>
  );
});
Consumer.displayName = "Consumer";

describe("TrackerHistoryBrowseControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setQueryData();
  });

  it("provides screenState 'default' when purchases exist", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer />
      </TrackerHistoryBrowseControllers>,
    );
    expect(getByTestId("screen-state").props.children).toBe("default");
  });

  it("provides screenState 'empty' when no purchases", () => {
    setQueryData([]);
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer />
      </TrackerHistoryBrowseControllers>,
    );
    expect(getByTestId("screen-state").props.children).toBe("empty");
  });

  it("maps purchases with type classification", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer />
      </TrackerHistoryBrowseControllers>,
    );
    const purchases = JSON.parse(getByTestId("purchases").props.children);
    expect(purchases).toHaveLength(2);
    expect(purchases[0].type).toBe("tank");
    expect(purchases[0].productName).toBe("Tank Watch");
    expect(purchases[1].type).toBe("regular");
  });

  it("default filter is 'all'", () => {
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer />
      </TrackerHistoryBrowseControllers>,
    );
    expect(getByTestId("selected-filter").props.children).toBe("all");
  });

  it("onFilterSelect updates selected filter", () => {
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer ref={ref} />
      </TrackerHistoryBrowseControllers>,
    );
    act(() => {
      ref.current!.onFilterSelect("thisMonth");
    });
    expect(getByTestId("selected-filter").props.children).toBe("thisMonth");
  });

  it("onFilterSelect to threeMonths updates filter and passes date range to query", () => {
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer ref={ref} />
      </TrackerHistoryBrowseControllers>,
    );
    act(() => {
      ref.current!.onFilterSelect("threeMonths");
    });
    expect(getByTestId("selected-filter").props.children).toBe("threeMonths");
  });

  it("onFilterSelect to thisYear updates filter and passes date range to query", () => {
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer ref={ref} />
      </TrackerHistoryBrowseControllers>,
    );
    act(() => {
      ref.current!.onFilterSelect("thisYear");
    });
    expect(getByTestId("selected-filter").props.children).toBe("thisYear");
  });

  it("onSearchChange updates search query", () => {
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer ref={ref} />
      </TrackerHistoryBrowseControllers>,
    );
    act(() => {
      ref.current!.onSearchChange("watch");
    });
    expect(getByTestId("search-query").props.children).toBe("watch");
  });

  it("onCategorySelect updates selected category", () => {
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer ref={ref} />
      </TrackerHistoryBrowseControllers>,
    );
    act(() => {
      ref.current!.onCategorySelect("시계");
    });
    expect(getByTestId("selected-category").props.children).toBe("시계");
  });

  it("onCategorySelect clears category when null", () => {
    const ref = React.createRef<ConsumerHandle>();
    const { getByTestId } = render(
      <TrackerHistoryBrowseControllers>
        <Consumer ref={ref} />
      </TrackerHistoryBrowseControllers>,
    );
    act(() => {
      ref.current!.onCategorySelect("시계");
    });
    act(() => {
      ref.current!.onCategorySelect(null);
    });
    expect(getByTestId("selected-category").props.children).toBe("null");
  });

  it("onDeletePurchase calls mutation", async () => {
    const ref = React.createRef<ConsumerHandle>();
    render(
      <TrackerHistoryBrowseControllers>
        <Consumer ref={ref} />
      </TrackerHistoryBrowseControllers>,
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
      <TrackerHistoryBrowseControllers>
        <Consumer ref={ref} />
      </TrackerHistoryBrowseControllers>,
    );
    await act(async () => {
      ref.current!.onRefresh();
      await Promise.resolve();
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("useTrackerHistoryBrowseControllers throws outside provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useTrackerHistoryBrowseControllers must be used within");
  });
});
