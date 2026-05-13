import { memo, type ReactNode } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { TopAppBar } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  TrackerWatchlistDetailScreenState,
  WatchlistDetailPayload,
} from "../models/tracker-watchlist-detail.type";
import { TrackerWatchlistDetailHeroView } from "./tracker-watchlist-detail-hero.view";
import { TrackerWatchlistDetailSkuRowView } from "./tracker-watchlist-detail-skuRow.view";
import { TrackerWatchlistDetailHistoryRowView } from "./tracker-watchlist-detail-historyRow.view";
import { TrackerWatchlistDetailHistoryEmptyView } from "./tracker-watchlist-detail-historyEmpty.view";
import { TrackerWatchlistDetailSkeletonCardView } from "./tracker-watchlist-detail-skeletonCard.view";

type Props = {
  screenState?: TrackerWatchlistDetailScreenState;
  payload?: WatchlistDetailPayload | null;
  onBack?: () => void;
};

export const TrackerWatchlistDetailViews = memo(
  ({ screenState = "default", payload, onBack }: Props) => {
    const { t } = useTranslation("tracker");

    const content: Record<TrackerWatchlistDetailScreenState, ReactNode> = {
      loading: <TrackerWatchlistDetailSkeletonCardView />,
      error: (
        <View style={styles.errorState} testID="watchlist-detail-error-state">
          <Text style={styles.errorTitle}>
            {t("watchlist.detail.errorState.title")}
          </Text>
          <Text style={styles.errorBody}>
            {t("watchlist.detail.errorState.subtitle")}
          </Text>
        </View>
      ),
      default:
        payload && payload.entry ? (
          <>
            <TrackerWatchlistDetailHeroView
              brand={payload.entry.brand}
              productLine={payload.entry.productLine}
              modelName={payload.entry.modelName}
            />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("watchlist.detail.sections.stock")}
              </Text>
              {payload.skus.map((sku) => (
                <TrackerWatchlistDetailSkuRowView key={sku.id} sku={sku} />
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("watchlist.detail.sections.history")}
              </Text>
              {payload.dropEvents.length > 0 ? (
                payload.dropEvents.map((event) => (
                  <TrackerWatchlistDetailHistoryRowView
                    key={event.id}
                    event={event}
                  />
                ))
              ) : (
                <TrackerWatchlistDetailHistoryEmptyView />
              )}
            </View>
          </>
        ) : (
          <View style={styles.errorState} testID="watchlist-detail-error-state">
            <Text style={styles.errorTitle}>
              {t("watchlist.detail.errorState.title")}
            </Text>
          </View>
        ),
    };

    return (
      <View style={styles.screen} testID="watchlist-detail-screen">
        <TopAppBar
          type="small"
          title={t("watchlist.detail.title")}
          navigationIcon="arrow-back"
          onNavigationPress={onBack}
          testID="watchlist-detail-title"
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
        >
          {content[screenState]}
        </ScrollView>
      </View>
    );
  },
);

TrackerWatchlistDetailViews.displayName = "TrackerWatchlistDetailViews";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  errorState: {
    paddingVertical: 64,
    alignItems: "center",
  },
  errorTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#1a1a1a",
  },
  errorBody: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#808080",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
