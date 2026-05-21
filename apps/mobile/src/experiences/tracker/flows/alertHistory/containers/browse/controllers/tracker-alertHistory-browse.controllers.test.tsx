import { render, act } from "@testing-library/react-native";
import { Text } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
}));

jest.mock("../lifecycles/tracker-alertHistory-browse.lifecycles", () => ({
  useTrackerAlertHistoryBrowseLifecycle: jest.fn(),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import {
  TrackerAlertHistoryBrowseControllers,
  useTrackerAlertHistoryBrowseControllers,
} from "./tracker-alertHistory-browse.controllers";
import { ALERT_HISTORY_MOCK } from "../models/tracker-alertHistory-browse.mock";

const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
  typeof useSuspenseQuery
>;

function setQueryData(
  events: typeof ALERT_HISTORY_MOCK = ALERT_HISTORY_MOCK,
  nextCursor: string | null = null,
) {
  mockedUseSuspenseQuery.mockReturnValue({
    data: { alertHistory: { events, nextCursor } },
    refetch: mockRefetch,
    // The rest of the useSuspenseQuery return is unused by the controllers — cast wide.
  } as unknown as ReturnType<typeof useSuspenseQuery>);
}

let captured: ReturnType<
  typeof useTrackerAlertHistoryBrowseControllers
> | null = null;

const Probe = () => {
  captured = useTrackerAlertHistoryBrowseControllers();
  return <Text testID="screen-state">{captured.screenState}</Text>;
};

const renderControllers = () =>
  render(
    <TrackerAlertHistoryBrowseControllers>
      <Probe />
    </TrackerAlertHistoryBrowseControllers>,
  );

describe("TrackerAlertHistoryBrowseControllers", () => {
  beforeEach(() => {
    captured = null;
    mockRefetch.mockClear();
    mockedUseSuspenseQuery.mockReset();
    setQueryData();
  });

  it("exposes screenState=default when alertHistory returns events", () => {
    renderControllers();
    expect(captured?.screenState).toBe("default");
    expect(captured?.events.length).toBe(ALERT_HISTORY_MOCK.length);
    expect(captured?.events[0]?.id).toBe(ALERT_HISTORY_MOCK[0]!.id);
    expect(captured?.isRefreshing).toBe(false);
  });

  it("exposes screenState=empty when alertHistory returns no events", () => {
    setQueryData([]);
    renderControllers();
    expect(captured?.screenState).toBe("empty");
    expect(captured?.events).toEqual([]);
  });

  it("maps every server event field onto the view-layer shape", () => {
    setQueryData([
      {
        id: "wire-1",
        brand: "Hermès",
        productLine: "Kelly",
        modelName: "Kelly 25",
        skuDescriptor: "Noir · Togo · Gold",
        // Server only emits "restocked" today (INF-1479); cover the
        // forward-compat soldOut value too so the cast is exercised.
        kind: "soldOut",
        detectedAt: "2026-05-19T09:14:00.000Z",
      },
      {
        id: "wire-2",
        brand: "Cartier",
        productLine: "Tank",
        modelName: "Tank Must",
        skuDescriptor: null,
        kind: "restocked",
        detectedAt: "2026-05-18T08:00:00.000Z",
      },
    ]);
    renderControllers();
    expect(captured?.events).toEqual([
      {
        id: "wire-1",
        brand: "Hermès",
        productLine: "Kelly",
        modelName: "Kelly 25",
        skuDescriptor: "Noir · Togo · Gold",
        kind: "soldOut",
        detectedAt: "2026-05-19T09:14:00.000Z",
      },
      {
        id: "wire-2",
        brand: "Cartier",
        productLine: "Tank",
        modelName: "Tank Must",
        skuDescriptor: null,
        kind: "restocked",
        detectedAt: "2026-05-18T08:00:00.000Z",
      },
    ]);
  });

  it("onRefresh triggers refetch via startTransition and clears the refreshing flag", async () => {
    renderControllers();
    await act(async () => {
      captured?.onRefresh();
      // Flush microtasks so the startTransition-scheduled state update lands
      // and the refetch promise resolves before assertions.
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockRefetch).toHaveBeenCalled();
    expect(captured?.isRefreshing).toBe(false);
  });
});
