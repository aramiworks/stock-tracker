import { memo, type ReactNode } from "react";
import { View, RefreshControl, StyleSheet } from "react-native";
import { ListTemplate, TopAppBar } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  AlertHistoryEvent,
  TrackerAlertHistoryBrowseScreenState,
} from "../models/tracker-alertHistory-browse.type";
import { ALERT_HISTORY_MOCK } from "../models/tracker-alertHistory-browse.mock";
import { TrackerAlertHistoryBrowseRowView } from "./row/tracker-alertHistory-browse-row.view";
import { TrackerAlertHistoryBrowseEmptyStateView } from "./emptyState/tracker-alertHistory-browse-emptyState.view";
import { TrackerAlertHistoryBrowseErrorStateView } from "./errorState/tracker-alertHistory-browse-errorState.view";
import { TrackerAlertHistoryBrowseSkeletonCardView } from "./skeletonCard/tracker-alertHistory-browse-skeletonCard.view";

type Props = {
  screenState?: TrackerAlertHistoryBrowseScreenState;
  events?: AlertHistoryEvent[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
  /**
   * Tap handler for the error-state retry pill (Figma 623:1216). Falls back to
   * `onRefresh` when omitted — pull-to-refresh and the retry button drive the
   * same refetch downstream.
   */
  onRetry?: () => void;
};

/**
 * Alert-history browse views composer.
 *
 * Mirrors the watchlist/list views shape (INF-1414):
 *   default → list of `Row` cards keyed by event id
 *   empty   → centered clipboard icon + title + body (no CTA)
 *   loading → 5 skeleton rows with avatar + bars
 *   error   → centered error icon + title + body + retry pill
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
    onRetry,
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
      error: (
        <TrackerAlertHistoryBrowseErrorStateView
          onRetry={onRetry ?? onRefresh}
        />
      ),
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
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
    backgroundColor: "#ffffff",
  },
});
