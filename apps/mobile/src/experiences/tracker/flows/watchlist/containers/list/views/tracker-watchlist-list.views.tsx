import { memo, type ReactNode } from "react";
import { View, RefreshControl, StyleSheet } from "react-native";
import { ListTemplate, TopAppBar } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  WatchlistEntry,
  WatchlistGroup,
  TrackerWatchlistListScreenState,
} from "../models/tracker-watchlist-list.type";
import { WATCHLIST_LIST_MOCK_GROUPS } from "../models/tracker-watchlist-list.mock";
import { TrackerWatchlistListAddButtonView } from "./addButton/tracker-watchlist-list-addButton.view";
import { TrackerWatchlistListGroupHeaderView } from "./groupHeader/tracker-watchlist-list-groupHeader.view";
import { TrackerWatchlistListRowView } from "./row/tracker-watchlist-list-row.view";
import { TrackerWatchlistListEmptyStateView } from "./emptyState/tracker-watchlist-list-emptyState.view";
import { TrackerWatchlistListSkeletonCardView } from "./skeletonCard/tracker-watchlist-list-skeletonCard.view";

type Props = {
  screenState?: TrackerWatchlistListScreenState;
  groups?: WatchlistGroup[];
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onAddProductsPress?: () => void;
  onEntryPress?: (entry: WatchlistEntry) => void;
};

export const TrackerWatchlistListViews = memo(
  ({
    screenState = "default",
    groups = WATCHLIST_LIST_MOCK_GROUPS,
    isRefreshing = false,
    onRefresh,
    onAddProductsPress,
    onEntryPress,
  }: Props) => {
    const { t } = useTranslation("tracker");

    const content: Record<TrackerWatchlistListScreenState, ReactNode> = {
      default: (
        <>
          {groups.map((group) => (
            <View
              key={`${group.brand}-${group.productLine}`}
              style={styles.group}
            >
              <TrackerWatchlistListGroupHeaderView
                brand={group.brand}
                productLine={group.productLine}
              />
              {group.entries.map((entry) => (
                <TrackerWatchlistListRowView
                  key={entry.id}
                  entry={entry}
                  onPress={onEntryPress}
                />
              ))}
            </View>
          ))}
        </>
      ),
      empty: (
        <TrackerWatchlistListEmptyStateView onAddPress={onAddProductsPress} />
      ),
      loading: (
        <>
          <TrackerWatchlistListSkeletonCardView />
          <TrackerWatchlistListSkeletonCardView />
          <TrackerWatchlistListSkeletonCardView />
        </>
      ),
      error: (
        <TrackerWatchlistListEmptyStateView onAddPress={onAddProductsPress} />
      ),
    };

    return (
      <ListTemplate
        testID="watchlist-list-screen"
        topBar={
          <TopAppBar
            type="small"
            title={t("watchlist.title")}
            trailingContent={
              <TrackerWatchlistListAddButtonView onPress={onAddProductsPress} />
            }
            testID="watchlist-list-title"
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

TrackerWatchlistListViews.displayName = "TrackerWatchlistListViews";

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    backgroundColor: "#ffffff",
  },
  group: {
    marginBottom: 8,
  },
});
