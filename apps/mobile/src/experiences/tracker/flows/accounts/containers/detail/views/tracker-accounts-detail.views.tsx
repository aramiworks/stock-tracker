import { memo, useState, useCallback, type ReactNode } from "react";
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  Pressable,
} from "react-native";
import { DetailTemplate, TopAppBar, useConfirmDialog } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  TrackerAccountsDetailScreenState,
  PurchaseItem,
  UpdateAccountInput,
  CreatePurchaseInput,
  UpdatePurchaseInput,
} from "../models/tracker-accounts-detail.type";
import { TrackerAccountsDetailSaHeaderView } from "./tracker-accounts-detail-saHeader.view";
import { TrackerAccountsDetailTankStatusView } from "./tracker-accounts-detail-tankStatus.view";
import { TrackerAccountsDetailPurchaseRowView } from "./tracker-accounts-detail-purchaseRow.view";
import { TrackerAccountsDetailErrorStateView } from "./tracker-accounts-detail-errorState.view";
import { TrackerAccountsDetailSkeletonCardView } from "./tracker-accounts-detail-skeletonCard.view";
import { TrackerAccountsDetailEditAccountModalView } from "./tracker-accounts-detail-editAccountModal.view";
import { TrackerAccountsDetailPurchaseFormModalView } from "./tracker-accounts-detail-purchaseFormModal.view";

const STORYBOOK_PURCHASES: PurchaseItem[] = [
  {
    id: "1",
    type: "regular",
    productName: "트리니티 링",
    date: "2024.03.15",
    amount: 3200000,
  },
  {
    id: "2",
    type: "tank",
    productName: "러브 브레이슬릿",
    date: "2024.01.10",
    amount: 5000000,
  },
  {
    id: "3",
    type: "regular",
    productName: "저스트 앵 끌루 링",
    date: "2023.12.20",
    amount: 4200000,
  },
];

type TrackerAccountsDetailViewsProps = {
  screenState?: TrackerAccountsDetailScreenState;
  name?: string;
  initial?: string;
  boutique?: string;
  totalSpend?: number;
  tankState?: "eligible" | "notEligible" | "noPurchases";
  purchases?: PurchaseItem[];
  accountId?: string;
  saName?: string;
  notes?: string;
  onBack?: () => void;
  onRetry?: () => void;
  onUpdateAccount?: (input: UpdateAccountInput) => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
  onCreatePurchase?: (input: CreatePurchaseInput) => Promise<void>;
  onUpdatePurchase?: (id: string, input: UpdatePurchaseInput) => Promise<void>;
  onDeletePurchase?: (id: string) => Promise<void>;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

export const TrackerAccountsDetailViews = memo(
  ({
    screenState = "default",
    name = "김서연 SA",
    initial = "김",
    boutique = "청담 부티크",
    totalSpend = 8200000,
    tankState = "eligible",
    purchases = STORYBOOK_PURCHASES,
    accountId = "",
    saName = "",
    notes = "",
    onBack,
    onRetry,
    onUpdateAccount,
    onDeleteAccount,
    onCreatePurchase,
    onUpdatePurchase,
    onDeletePurchase,
    isRefreshing = false,
    onRefresh,
  }: TrackerAccountsDetailViewsProps) => {
    const { t } = useTranslation("tracker");
    const { showConfirmDialog, ConfirmDialogPortal } = useConfirmDialog();
    const [editAccountVisible, setEditAccountVisible] = useState(false);
    const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<PurchaseItem | null>(
      null,
    );

    const handleDeleteAccount = useCallback(() => {
      /* istanbul ignore next -- defensive guard; button only renders when handler exists */
      if (!onDeleteAccount) return;
      showConfirmDialog({
        title: t("accounts.list.confirm.deleteAccount.title"),
        message: t("common:confirm.deleteAccount.message"),
        confirmLabel: "삭제",
        dismissLabel: "취소",
        onConfirm: () => onDeleteAccount(),
      });
    }, [onDeleteAccount, showConfirmDialog, t]);

    const handleDeletePurchase = useCallback(
      (id: string) => {
        if (!onDeletePurchase) return;
        showConfirmDialog({
          title: t("common:confirm.deletePurchase.title"),
          message: t("common:confirm.deletePurchase.message"),
          confirmLabel: "삭제",
          dismissLabel: "취소",
          onConfirm: () => onDeletePurchase(id),
        });
      },
      [onDeletePurchase, showConfirmDialog, t],
    );

    const handleEditPurchase = useCallback((purchase: PurchaseItem) => {
      setEditingPurchase(purchase);
      setPurchaseModalVisible(true);
    }, []);

    const handlePurchaseSubmit = useCallback(
      async (data: CreatePurchaseInput) => {
        if (editingPurchase && onUpdatePurchase) {
          await onUpdatePurchase(editingPurchase.id, data);
        } else if (onCreatePurchase) {
          await onCreatePurchase(data);
        }
      },
      [editingPurchase, onUpdatePurchase, onCreatePurchase],
    );

    const handlePurchaseModalClose = useCallback(() => {
      setPurchaseModalVisible(false);
      setEditingPurchase(null);
    }, []);

    const content: Record<TrackerAccountsDetailScreenState, ReactNode> = {
      default: (
        <>
          <TrackerAccountsDetailSaHeaderView
            name={name}
            initial={initial}
            boutique={boutique}
            totalSpend={totalSpend}
            testID="accounts-detail-sa-header"
          />
          <View style={styles.spacer12} />
          <TrackerAccountsDetailTankStatusView
            state={tankState === "noPurchases" ? "notEligible" : tankState}
            testID="accounts-detail-tank-status"
          />
          <View style={styles.spacer20} />
          <Text style={styles.sectionLabel}>
            {t("accounts.detail.recentPurchases")}
          </Text>
          <View style={styles.spacer12} />
          {purchases.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <View style={styles.spacer16} />}
              <TrackerAccountsDetailPurchaseRowView
                id={p.id}
                type={p.type}
                productName={p.productName}
                date={p.date}
                amount={p.amount}
                onEdit={() => handleEditPurchase(p)}
                onDelete={() => handleDeletePurchase(p.id)}
              />
            </View>
          ))}
          <View style={styles.spacer20} />
          <Pressable
            style={styles.addPurchaseButton}
            onPress={() => {
              setEditingPurchase(null);
              setPurchaseModalVisible(true);
            }}
            testID="accounts-detail-add-purchase"
          >
            <Text style={styles.addPurchaseText}>
              {t("accounts.detail.addPurchase")}
            </Text>
          </Pressable>
        </>
      ),
      loading: (
        <>
          <TrackerAccountsDetailSkeletonCardView />
          <View style={styles.spacer12} />
          <TrackerAccountsDetailSkeletonCardView />
          <View style={styles.spacer12} />
          <TrackerAccountsDetailSkeletonCardView />
        </>
      ),
      error: <TrackerAccountsDetailErrorStateView onRetry={onRetry} />,
    };

    return (
      <>
        <DetailTemplate
          testID="accounts-detail-screen"
          topBar={
            <TopAppBar
              type="small"
              title={t("accounts.detail.title")}
              navigationIcon="arrow-back"
              onNavigationPress={onBack}
              testID="accounts-detail"
              trailingContent={
                screenState === "default" &&
                (onUpdateAccount || onDeleteAccount) ? (
                  <View style={styles.trailingActions}>
                    {onUpdateAccount && (
                      <Pressable
                        onPress={() => setEditAccountVisible(true)}
                        style={styles.appBarAction}
                        testID="accounts-detail-edit"
                      >
                        <Text style={styles.appBarActionText}>
                          {t("accounts.detail.editAction")}
                        </Text>
                      </Pressable>
                    )}
                    {onDeleteAccount && (
                      <Pressable
                        onPress={handleDeleteAccount}
                        style={styles.appBarAction}
                        testID="accounts-detail-delete"
                      >
                        <Text style={styles.appBarDeleteText}>
                          {t("accounts.detail.deleteAction")}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ) : undefined
              }
            />
          }
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {content[screenState]}
        </DetailTemplate>

        {onUpdateAccount && (
          <TrackerAccountsDetailEditAccountModalView
            visible={editAccountVisible}
            onClose={() => setEditAccountVisible(false)}
            onSubmit={onUpdateAccount}
            currentValues={{
              id: accountId,
              storeName: boutique,
              saName: saName,
              notes: notes,
            }}
          />
        )}

        {(onCreatePurchase || onUpdatePurchase) && (
          <TrackerAccountsDetailPurchaseFormModalView
            visible={purchaseModalVisible}
            onClose={handlePurchaseModalClose}
            onSubmit={handlePurchaseSubmit}
            defaultValues={
              editingPurchase
                ? {
                    itemName: editingPurchase.productName,
                    amount: editingPurchase.amount,
                    purchaseDate: editingPurchase.date,
                  }
                : undefined
            }
          />
        )}

        <ConfirmDialogPortal />
      </>
    );
  },
);

TrackerAccountsDetailViews.displayName = "TrackerAccountsDetailViews";

const styles = StyleSheet.create({
  trailingActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  appBarAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  appBarActionText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#FF2D55",
  },
  appBarDeleteText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#999",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  sectionLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#888",
    alignSelf: "flex-start",
  },
  addPurchaseButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addPurchaseText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#FF2D55",
  },
  spacer12: {
    height: 12,
  },
  spacer16: {
    height: 16,
  },
  spacer20: {
    height: 20,
  },
});
