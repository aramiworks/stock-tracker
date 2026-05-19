import { render } from "@testing-library/react-native";
import { Text } from "react-native";

// Mock the fixture BEFORE importing the controllers module so the controller
// picks up the empty array at module-init time. Mirrors the
// `tracker-watchlist-list.controllers.empty.test.tsx` pattern that lived
// alongside watchlist/list pre-INF-1432.
jest.mock("../models/tracker-alertHistory-browse.mock", () => ({
  ALERT_HISTORY_MOCK: [],
}));

jest.mock("../lifecycles/tracker-alertHistory-browse.lifecycles", () => ({
  useTrackerAlertHistoryBrowseLifecycle: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
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

describe("TrackerAlertHistoryBrowseControllers (empty fixture)", () => {
  it("exposes screenState=empty when the source returns no events", () => {
    render(
      <TrackerAlertHistoryBrowseControllers>
        <Probe />
      </TrackerAlertHistoryBrowseControllers>,
    );
    expect(captured?.screenState).toBe("empty");
    expect(captured?.events).toEqual([]);
  });
});
