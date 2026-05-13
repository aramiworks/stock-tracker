import { render, fireEvent } from "@testing-library/react-native";
import { Text, Pressable } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
}));

// Capture the refetch callback the controllers hand to the lifecycle hook so
// we can assert it is wired up.
const mockLifecycle = jest.fn();
jest.mock("../lifecycles/tracker-watchlist-detail.lifecycles", () => ({
  useTrackerWatchlistDetailLifecycle: (refetch: () => void) =>
    mockLifecycle(refetch),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockCanGoBack = jest.fn(() => true);
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    canGoBack: mockCanGoBack,
  }),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import {
  TrackerWatchlistDetailControllers,
  useTrackerWatchlistDetailControllers,
} from "./tracker-watchlist-detail.controllers";

const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
  typeof useSuspenseQuery
>;

/**
 * Canonical GraphQL response shapes (mirror INF-1415's `watchlistDetail`).
 * Two seeds: a Hermès Bolide 27 (single SKU, in-stock, full restock history)
 * and a Cartier Tank Must Large Steel (4 SKUs spanning all three stock states,
 * no history).
 */
const BOLIDE_QUERY_DATA = {
  watchlistDetail: {
    entry: {
      id: "wl-bolide-27",
      watchableUnitId: "11111111-1111-1111-1111-000000000001",
      brand: "Hermès",
      productLine: "Bolide",
      modelName: "Bolide 27",
      state: "in_stock" as const,
      lastRestockedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    skus: [
      {
        id: "sku-bolide-27-togo-gold",
        color: "토고",
        leather: null,
        hardware: "골드 금장",
        size: null,
        referenceCode: null,
        inStock: true,
        lastChecked: new Date().toISOString(),
      },
    ],
    dropEvents: [
      {
        id: "drop-1",
        skuId: "sku-bolide-27-togo-gold",
        sourceUrl: null,
        detectedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: "drop-2",
        skuId: "sku-bolide-27-togo-gold",
        sourceUrl: null,
        detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
};

const TANK_MUST_QUERY_DATA = {
  watchlistDetail: {
    entry: {
      id: "wl-tank-must-large-steel",
      watchableUnitId: "22222222-2222-2222-2222-000000000001",
      brand: "Cartier",
      productLine: "Tank Must",
      modelName: "Tank Must Large Steel",
      state: "in_stock" as const,
      lastRestockedAt: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    skus: [
      {
        id: "sku-tm-large-steel-leather",
        color: "스틸 케이스",
        leather: "브라운 가죽",
        hardware: null,
        size: null,
        referenceCode: "WSTA0042",
        inStock: true,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "sku-tm-large-steel-black",
        color: "스틸 케이스",
        leather: "블랙 가죽",
        hardware: null,
        size: null,
        referenceCode: "WSTA0043",
        inStock: false,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "sku-tm-large-steel-vintage",
        color: "빈티지 다이얼",
        leather: null,
        hardware: null,
        size: null,
        referenceCode: "WSTA0099",
        inStock: null,
        lastChecked: null,
      },
    ],
    dropEvents: [],
  },
};

function setQueryData(payload: unknown) {
  mockedUseSuspenseQuery.mockReturnValue({
    data: payload,
    refetch: mockRefetch,
  } as unknown as ReturnType<typeof useSuspenseQuery>);
}

let captured: ReturnType<typeof useTrackerWatchlistDetailControllers> | null =
  null;

const Probe = () => {
  captured = useTrackerWatchlistDetailControllers();
  return (
    <>
      <Text testID="screen-state">{captured.screenState}</Text>
      <Pressable testID="back-press" onPress={captured.onBack} />
    </>
  );
};

const renderControllers = (watchableUnitId: string) =>
  render(
    <TrackerWatchlistDetailControllers watchableUnitId={watchableUnitId}>
      <Probe />
    </TrackerWatchlistDetailControllers>,
  );

describe("TrackerWatchlistDetailControllers", () => {
  beforeEach(() => {
    captured = null;
    mockBack.mockClear();
    mockPush.mockClear();
    mockLifecycle.mockClear();
    mockRefetch.mockClear();
    mockedUseSuspenseQuery.mockReset();
    mockCanGoBack.mockReturnValue(true);
    setQueryData(BOLIDE_QUERY_DATA);
  });

  it("exposes screenState=default and a fully mapped payload (single-SKU, in-stock, full history)", () => {
    renderControllers("11111111-1111-1111-1111-000000000001");
    expect(captured?.screenState).toBe("default");
    expect(captured?.payload).not.toBeNull();
    expect(captured?.payload?.entry.modelName).toBe("Bolide 27");
    // composeDescriptor filters null fields and joins with " · "
    expect(captured?.payload?.skus[0]?.descriptor).toBe("토고 · 골드 금장");
    expect(captured?.payload?.skus[0]?.state).toBe("in_stock");
    // Drop events always map to kind=restocked; skuDescriptor is looked up
    // from the sku map.
    expect(captured?.payload?.dropEvents).toHaveLength(2);
    expect(captured?.payload?.dropEvents[0]?.kind).toBe("restocked");
    expect(captured?.payload?.dropEvents[0]?.skuDescriptor).toBe(
      "토고 · 골드 금장",
    );
  });

  it("maps inStock=false to state='out_of_stock' and inStock=null to state='unknown' across SKUs", () => {
    setQueryData(TANK_MUST_QUERY_DATA);
    renderControllers("22222222-2222-2222-2222-000000000001");
    const skus = captured?.payload?.skus ?? [];
    expect(skus).toHaveLength(3);
    expect(skus.find((s) => s.id === "sku-tm-large-steel-leather")?.state).toBe(
      "in_stock",
    );
    expect(skus.find((s) => s.id === "sku-tm-large-steel-black")?.state).toBe(
      "out_of_stock",
    );
    expect(skus.find((s) => s.id === "sku-tm-large-steel-vintage")?.state).toBe(
      "unknown",
    );
    // dropEvents empty branch — the history section renders the empty view.
    expect(captured?.payload?.dropEvents).toEqual([]);
  });

  it("preserves the brand reference code on multi-SKU payloads", () => {
    setQueryData(TANK_MUST_QUERY_DATA);
    renderControllers("22222222-2222-2222-2222-000000000001");
    const sku = captured?.payload?.skus.find(
      (s) => s.id === "sku-tm-large-steel-leather",
    );
    expect(sku?.referenceCode).toBe("WSTA0042");
  });

  it("onBack calls router.back when canGoBack is true", () => {
    const { getByTestId } = renderControllers(
      "11111111-1111-1111-1111-000000000001",
    );
    fireEvent.press(getByTestId("back-press"));
    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("onBack falls back to /tracker/watchlist when canGoBack is false", () => {
    mockCanGoBack.mockReturnValue(false);
    const { getByTestId } = renderControllers(
      "11111111-1111-1111-1111-000000000001",
    );
    fireEvent.press(getByTestId("back-press"));
    expect(mockPush).toHaveBeenCalledWith("/tracker/watchlist");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("registers the Apollo refetch with the lifecycle hook (focus-driven refresh)", () => {
    renderControllers("11111111-1111-1111-1111-000000000001");
    expect(mockLifecycle).toHaveBeenCalled();
    const refetch = mockLifecycle.mock.calls.at(-1)?.[0] as () => void;
    expect(typeof refetch).toBe("function");
    // The refetch wired into the lifecycle is the Apollo refetch.
    expect(refetch).toBe(mockRefetch);
  });
});
