import { memo, type ReactNode } from "react";
import {
  Pressable,
  View,
  Text,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { ListTemplate, TopAppBar } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  WatchlistEntry,
  WatchlistGroup,
  TrackerWatchlistListScreenState,
} from "../models/tracker-watchlist-list.type";
import { WATCHLIST_LIST_MOCK_GROUPS } from "../models/tracker-watchlist-list.mock";
import { TrackerWatchlistListGroupHeaderView } from "./tracker-watchlist-list-groupHeader.view";
import { TrackerWatchlistListRowView } from "./tracker-watchlist-list-row.view";
import { TrackerWatchlistListEmptyStateView } from "./tracker-watchlist-list-emptyState.view";
import { TrackerWatchlistListSkeletonCardView } from "./tracker-watchlist-list-skeletonCard.view";

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

    const addButton = onAddProductsPress ? (
      <Pressable
        onPress={onAddProductsPress}
        accessibilityRole="button"
        accessibilityLabel={t("watchlist.actions.add")}
        testID="watchlist-add-products-button"
        style={styles.addButton}
        hitSlop={8}
      >
        <Text style={styles.addLabel}>{t("watchlist.actions.add")}</Text>
      </Pressable>
    ) : undefined;

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
            trailingContent={addButton}
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
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#ff2d55",
  },
});
