import { memo, type ReactNode } from "react";
import { View, RefreshControl, StyleSheet, Alert } from "react-native";
import { ListTemplate, SearchBar, TopAppBar } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  TrackerHistoryBrowseScreenState,
  DateFilter,
  ItemCategory,
  PurchaseHistoryItem,
} from "../models/tracker-history-browse.type";
import { TrackerHistoryBrowseDateFilterChipsView } from "./tracker-history-browse-dateFilterChips.view";
import { TrackerHistoryBrowseCategoryFilterChipsView } from "./tracker-history-browse-categoryFilterChips.view";
import { TrackerHistoryBrowsePurchaseRowView } from "./tracker-history-browse-purchaseRow.view";
import { TrackerHistoryBrowseEmptyStateView } from "./tracker-history-browse-emptyState.view";
import { TrackerHistoryBrowseErrorStateView } from "./tracker-history-browse-errorState.view";
import { TrackerHistoryBrowseSkeletonCardView } from "./tracker-history-browse-skeletonCard.view";

const STORYBOOK_PURCHASES: PurchaseHistoryItem[] = [
  {
    id: "1",
    type: "regular",
    productName: "트리니티 링",
    date: "2024.03.15 · 김서연 SA",
    amount: 3200000,
  },
  {
    id: "2",
    type: "tank",
    productName: "러브 브레이슬릿",
    date: "2024.01.10 · 김서연 SA",
    amount: 5000000,
  },
  {
    id: "3",
    type: "regular",
    productName: "저스트 앵 끌루 링",
    date: "2023.12.20 · 김서연 SA",
    amount: 4200000,
  },
  {
    id: "4",
    type: "tank",
    productName: "팬터 드 까르띠에 목걸이",
    date: "2023.11.05 · 김서연 SA",
    amount: 8500000,
  },
];

type TrackerHistoryBrowseViewsProps = {
  screenState?: TrackerHistoryBrowseScreenState;
  purchases?: PurchaseHistoryItem[];
  selectedFilter?: DateFilter;
  onFilterSelect?: (filter: DateFilter) => void;
  onRetry?: () => void;
  onDeletePurchase?: (id: string) => Promise<void>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: ItemCategory | null;
  onCategorySelect?: (category: ItemCategory | null) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

export const TrackerHistoryBrowseViews = memo(
  ({
    screenState = "default",
    purchases = STORYBOOK_PURCHASES,
    selectedFilter = "all",
    onFilterSelect,
    onRetry,
    onDeletePurchase,
    searchQuery = "",
    onSearchChange,
    selectedCategory = null,
    onCategorySelect,
    isRefreshing = false,
    onRefresh,
  }: TrackerHistoryBrowseViewsProps) => {
    const { t } = useTranslation("tracker");
    const scrollContent: Record<TrackerHistoryBrowseScreenState, ReactNode> = {
      default: (
        <>
          {purchases.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <View style={styles.spacer16} />}
              <TrackerHistoryBrowsePurchaseRowView
                type={p.type}
                productName={p.productName}
                date={p.date}
                amount={p.amount}
                onLongPress={
                  onDeletePurchase
                    ? () =>
                        Alert.alert(
                          t("history.browse.confirmDelete.title", "구매 삭제"),
                          t("history.browse.confirmDelete.message", {
                            name: p.productName,
                          }),
                          [
                            { text: "취소", style: "cancel" },
                            {
                              text: "삭제",
                              style: "destructive",
                              onPress: () => onDeletePurchase(p.id),
                            },
                          ],
                        )
                    : undefined
                }
              />
            </View>
          ))}
        </>
      ),
      empty: <TrackerHistoryBrowseEmptyStateView />,
      loading: (
        <>
          <TrackerHistoryBrowseSkeletonCardView />
          <View style={styles.spacer12} />
          <TrackerHistoryBrowseSkeletonCardView />
          <View style={styles.spacer12} />
          <TrackerHistoryBrowseSkeletonCardView />
        </>
      ),
      error: <TrackerHistoryBrowseErrorStateView onRetry={onRetry} />,
    };

    const headerContent =
      screenState !== "error" ? (
        <>
          {onSearchChange && (
            <SearchBar
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={t(
                "history.browse.searchPlaceholder",
                "부티크 검색...",
              )}
              testID="history-browse-search"
            />
          )}
          <View style={styles.filterBar} testID="date-filter-bar">
            <TrackerHistoryBrowseDateFilterChipsView
              selected={selectedFilter}
              onSelect={onFilterSelect}
            />
          </View>
          <View style={styles.categoryBar} testID="category-filter-bar">
            <TrackerHistoryBrowseCategoryFilterChipsView
              selected={selectedCategory}
              onSelect={onCategorySelect}
            />
          </View>
        </>
      ) : undefined;

    return (
      <ListTemplate
        testID="history-browse-screen"
        topBar={
          <TopAppBar
            type="small"
            title={t("history.browse.title")}
            testID="history-browse-title"
          />
        }
        headerContent={headerContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {scrollContent[screenState]}
      </ListTemplate>
    );
  },
);

TrackerHistoryBrowseViews.displayName = "TrackerHistoryBrowseViews";

const styles = StyleSheet.create({
  filterBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  categoryBar: {
    paddingBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  spacer12: {
    height: 12,
  },
  spacer16: {
    height: 16,
  },
});
