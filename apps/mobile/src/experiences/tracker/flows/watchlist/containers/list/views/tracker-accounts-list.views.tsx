import { memo, useState, type ReactNode } from "react";
import {
  Pressable,
  View,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import {
  FAB,
  ListTemplate,
  SearchBar,
  TopAppBar,
  useConfirmDialog,
} from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  TrackerAccountsListScreenState,
  SaAccountListItem,
  AccountSortBy,
} from "../models/tracker-accounts-list.type";
import { TrackerAccountsListSaListItemView } from "./tracker-accounts-list-saListItem.view";
import { TrackerAccountsListEmptyStateView } from "./tracker-accounts-list-emptyState.view";
import { TrackerAccountsListErrorStateView } from "./tracker-accounts-list-errorState.view";
import { TrackerAccountsListSkeletonCardView } from "./tracker-accounts-list-skeletonCard.view";
import { TrackerAccountsListSortToggleView } from "./tracker-accounts-list-sortToggle.view";
import { TrackerAccountFormModalView } from "@/experiences/tracker/views/tracker-accountFormModal.view";

const STORYBOOK_ACCOUNTS: SaAccountListItem[] = [
  {
    id: "1",
    state: "eligible",
    name: "김서연 SA",
    initial: "김",
    boutique: "청담 부티크",
    totalSpend: 8200000,
  },
  {
    id: "2",
    state: "notEligible",
    name: "박지민 SA",
    initial: "박",
    boutique: "신세계 부티크",
    totalSpend: 4250000,
  },
  {
    id: "3",
    state: "eligible",
    name: "이수진 SA",
    initial: "이",
    boutique: "갤러리아 부티크",
    totalSpend: 6100000,
  },
  {
    id: "4",
    state: "noPurchases",
    name: "정하윤 SA",
    initial: "정",
    boutique: "현대 부티크",
    totalSpend: 0,
  },
  {
    id: "5",
    state: "eligible",
    name: "최민서 SA",
    initial: "최",
    boutique: "롯데 부티크",
    totalSpend: 9800000,
  },
];

type TrackerAccountsListViewsProps = {
  screenState?: TrackerAccountsListScreenState;
  accounts?: SaAccountListItem[];
  onSaPress?: (id: string) => void;
  onRetry?: () => void;
  onCreateAccount?: (data: {
    storeName: string;
    saName?: string;
    notes?: string;
  }) => Promise<void>;
  onDeleteAccount?: (id: string) => Promise<void>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: AccountSortBy;
  onSortByToggle?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  /**
   * Shengsho-strict entry point for the catalog browse screen (INF-1391).
   * Rendered as a "+ 추가" action on the TopAppBar.
   */
  onAddProductsPress?: () => void;
};

export const TrackerAccountsListViews = memo(
  ({
    screenState = "default",
    accounts = STORYBOOK_ACCOUNTS,
    onSaPress,
    onRetry,
    onCreateAccount,
    onDeleteAccount,
    searchQuery = "",
    onSearchChange,
    sortBy = "created_at",
    onSortByToggle,
    isRefreshing = false,
    onRefresh,
    onAddProductsPress,
  }: TrackerAccountsListViewsProps) => {
    const { t } = useTranslation("tracker");
    const [showAccountModal, setShowAccountModal] = useState(false);
    const { showConfirmDialog, ConfirmDialogPortal } = useConfirmDialog();
    const content: Record<TrackerAccountsListScreenState, ReactNode> = {
      default: (
        <>
          {accounts.map((sa, i) => (
            <View key={sa.id}>
              {i > 0 && <View style={styles.spacer12} />}
              <TrackerAccountsListSaListItemView
                id={sa.id}
                state={sa.state}
                name={sa.name}
                initial={sa.initial}
                boutique={sa.boutique}
                totalSpend={sa.totalSpend}
                onPress={() => onSaPress?.(sa.id)}
                onLongPress={
                  onDeleteAccount
                    ? () =>
                        showConfirmDialog({
                          title: t("accounts.list.confirm.deleteAccount.title"),
                          message: t(
                            "accounts.list.confirm.deleteAccount.message",
                            { name: sa.name, boutique: sa.boutique },
                          ),
                          confirmLabel: "삭제",
                          dismissLabel: "취소",
                          onConfirm: () => onDeleteAccount(sa.id),
                        })
                    : undefined
                }
              />
            </View>
          ))}
        </>
      ),
      empty: (
        <TrackerAccountsListEmptyStateView
          onCtaPress={() => setShowAccountModal(true)}
        />
      ),
      loading: (
        <>
          <TrackerAccountsListSkeletonCardView />
          <View style={styles.spacer12} />
          <TrackerAccountsListSkeletonCardView />
          <View style={styles.spacer12} />
          <TrackerAccountsListSkeletonCardView />
        </>
      ),
      error: <TrackerAccountsListErrorStateView onRetry={onRetry} />,
    };

    const showFab = screenState === "default" || screenState === "empty";
    const fab = showFab ? (
      <FAB
        icon="add"
        color="primary"
        onPress={() => setShowAccountModal(true)}
        accessibilityLabel={t("accounts.list.addAccountFab", "계좌 추가")}
        testID="add-account-fab"
      />
    ) : undefined;

    const headerContent =
      screenState !== "error" && (onSearchChange || onSortByToggle) ? (
        <>
          {onSearchChange && (
            <SearchBar
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={t(
                "accounts.list.searchPlaceholder",
                "부티크 검색...",
              )}
              testID="accounts-list-search"
            />
          )}
          {onSortByToggle && (
            <View style={styles.sortBar} testID="sort-toggle-bar">
              <TrackerAccountsListSortToggleView
                sortBy={sortBy}
                onToggle={onSortByToggle}
              />
            </View>
          )}
        </>
      ) : undefined;

    const addProductsButton = onAddProductsPress ? (
      <Pressable
        onPress={onAddProductsPress}
        accessibilityRole="button"
        accessibilityLabel={t("watchlist.list.addProducts", "+ 추가")}
        testID="watchlist-add-products-button"
        style={styles.addProductsButton}
        hitSlop={8}
      >
        <Text style={styles.addProductsLabel}>
          {t("watchlist.list.addProducts", "+ 추가")}
        </Text>
      </Pressable>
    ) : undefined;

    return (
      <>
        <ListTemplate
          testID="accounts-list-screen"
          topBar={
            <TopAppBar
              type="small"
              title={t("accounts.list.title")}
              trailingContent={addProductsButton}
              testID="accounts-list-title"
            />
          }
          headerContent={headerContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
          fab={fab}
        >
          {content[screenState]}
        </ListTemplate>
        {onCreateAccount && (
          <TrackerAccountFormModalView
            visible={showAccountModal}
            onClose={() => setShowAccountModal(false)}
            onSubmit={onCreateAccount}
          />
        )}
        <ConfirmDialogPortal />
      </>
    );
  },
);

TrackerAccountsListViews.displayName = "TrackerAccountsListViews";

const styles = StyleSheet.create({
  sortBar: {
    paddingBottom: 12,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  spacer12: {
    height: 12,
  },
  addProductsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addProductsLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#1A1A1A",
  },
});
