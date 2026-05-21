import { memo, type ReactNode } from "react";
import { View, RefreshControl, StyleSheet } from "react-native";
import { ListTemplate, TopAppBar } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  AlertHistoryEvent,
  TrackerAlertHistoryBrowseScreenState,
} from "../models/tracker-alertHistory-browse.type";
import { ALERT_HISTORY_MOCK } from "../models/tracker-alertHistory-browse.mock";
import { TrackerAlertHistoryBrowseRowView } from "./tracker-alertHistory-browse-row.view";
import { TrackerAlertHistoryBrowseEmptyStateView } from "./tracker-alertHistory-browse-emptyState.view";
import { TrackerAlertHistoryBrowseSkeletonCardView } from "./tracker-alertHistory-browse-skeletonCard.view";

type Props = {
  screenState?: TrackerAlertHistoryBrowseScreenState;
  events?: AlertHistoryEvent[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

/**
 * Alert-history browse views composer.
 *
 * Mirrors the watchlist/list views shape (INF-1414):
 *   default → list of `Row` cards keyed by event id
 *   empty   → centered title + body (no CTA — see emptyState.view docstring)
 *   loading → 5 skeleton rows
 *   error   → re-use the empty state as a safe fallback
 *
 * The screen testID is `alert-history-screen` (Maestro flow + container test
 * rely on this).
 */
export const TrackerAlertHistoryBrowseViews = memo(
  ({
    screenState = "default",
    events = ALERT_HISTORY_MOCK,
    isRefreshing = false,
    onRefresh,
  }: Props) => {
    const { t } = useTranslation("tracker");

    const content: Record<TrackerAlertHistoryBrowseScreenState, ReactNode> = {
      default: (
        <View testID="alert-history-list">
          {events.map((event) => (
            <TrackerAlertHistoryBrowseRowView key={event.id} event={event} />
          ))}
        </View>
      ),
      empty: <TrackerAlertHistoryBrowseEmptyStateView />,
      loading: <TrackerAlertHistoryBrowseSkeletonCardView count={5} />,
      error: <TrackerAlertHistoryBrowseEmptyStateView />,
    };

    return (
      <ListTemplate
        testID="alert-history-screen"
        topBar={
          <TopAppBar
            type="small"
            title={t("alertHistory.title")}
            testID="alert-history-title"
          />
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {content[screenState]}
      </ListTemplate>
    );
  },
);

TrackerAlertHistoryBrowseViews.displayName = "TrackerAlertHistoryBrowseViews";

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
    backgroundColor: "#ffffff",
  },
});
