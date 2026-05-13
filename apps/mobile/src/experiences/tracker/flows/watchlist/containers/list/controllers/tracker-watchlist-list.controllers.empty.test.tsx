import { render } from "@testing-library/react-native";
import { Text } from "react-native";

jest.mock("../lifecycles/tracker-watchlist-list.lifecycles", () => ({
  useTrackerWatchlistListLifecycle: jest.fn(),
}));

jest.mock("../models/tracker-watchlist-list.mock", () => ({
  WATCHLIST_LIST_MOCK_GROUPS: [],
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import {
  TrackerWatchlistListControllers,
  useTrackerWatchlistListControllers,
} from "./tracker-watchlist-list.controllers";

let captured: ReturnType<typeof useTrackerWatchlistListControllers> | null =
  null;

const Probe = () => {
  captured = useTrackerWatchlistListControllers();
  return <Text testID="screen-state">{captured.screenState}</Text>;
};

describe("TrackerWatchlistListControllers (empty fixture)", () => {
  it("exposes screenState=empty when the fixture has no groups", () => {
    render(
      <TrackerWatchlistListControllers>
        <Probe />
      </TrackerWatchlistListControllers>,
    );
    expect(captured?.screenState).toBe("empty");
    expect(captured?.groups).toEqual([]);
  });
});
