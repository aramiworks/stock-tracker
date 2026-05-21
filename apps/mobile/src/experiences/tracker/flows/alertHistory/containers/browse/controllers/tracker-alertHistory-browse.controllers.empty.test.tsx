import { render } from "@testing-library/react-native";
import { Text } from "react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(() => ({
    data: { alertHistory: { events: [], nextCursor: null } },
    refetch: mockRefetch,
  })),
}));

jest.mock("../lifecycles/tracker-alertHistory-browse.lifecycles", () => ({
  useTrackerAlertHistoryBrowseLifecycle: jest.fn(),
}));

import {
  TrackerAlertHistoryBrowseControllers,
  useTrackerAlertHistoryBrowseControllers,
} from "./tracker-alertHistory-browse.controllers";

let captured: ReturnType<
  typeof useTrackerAlertHistoryBrowseControllers
> | null = null;

const Probe = () => {
  captured = useTrackerAlertHistoryBrowseControllers();
  return <Text testID="screen-state">{captured.screenState}</Text>;
};

describe("TrackerAlertHistoryBrowseControllers (empty alertHistory)", () => {
  it("exposes screenState=empty when the server returns no events", () => {
    render(
      <TrackerAlertHistoryBrowseControllers>
        <Probe />
      </TrackerAlertHistoryBrowseControllers>,
    );
    expect(captured?.screenState).toBe("empty");
    expect(captured?.events).toEqual([]);
  });
});
