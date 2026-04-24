import { memo, useState, useCallback, type ReactNode } from "react";
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { DetailTemplate } from "@aramiworks/ui";
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
    const [editAccountVisible, setEditAccountVisible] = useState(false);
    const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<PurchaseItem | null>(
      null,
    );

    const handleDeleteAccount = useCallback(() => {
      if (!onDeleteAccount) return;
      Alert.alert(
        t("accounts.list.confirm.deleteAccount.title"),
        t("common:confirm.deleteAccount.message"),
        [
          { text: "취소", style: "cancel" },
          {
            text: "삭제",
            style: "destructive",
            onPress: () => void onDeleteAccount(),
          },
        ],
      );
    }, [onDeleteAccount]);

    const handleDeletePurchase = useCallback(
      (id: string) => {
        if (!onDeletePurchase) return;
        Alert.alert(
          t("common:confirm.deletePurchase.title"),
          t("common:confirm.deletePurchase.message"),
          [
            { text: "취소", style: "cancel" },
            {
              text: "삭제",
              style: "destructive",
              onPress: () => void onDeletePurchase(id),
            },
          ],
        );
      },
      [onDeletePurchase],
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
            <>
              <View style={styles.statusBar} />
              <View style={styles.appBar}>
                <Pressable
                  onPress={onBack}
                  style={styles.backButton}
                  testID="accounts-detail-back"
                >
                  <Text style={styles.backArrow}>←</Text>
                </Pressable>
                <Text style={styles.appBarTitle}>
                  {t("accounts.detail.title")}
                </Text>
                <View style={styles.appBarSpacer} />
                {screenState === "default" && onUpdateAccount && (
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
                {screenState === "default" && onDeleteAccount && (
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
            </>
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
      </>
    );
  },
);

TrackerAccountsDetailViews.displayName = "TrackerAccountsDetailViews";

const styles = StyleSheet.create({
  statusBar: {
    height: 54,
  },
  appBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 8,
  },
  backArrow: {
    fontSize: 20,
    color: "#1A1A1A",
  },
  appBarTitle: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 20,
    color: "#1A1A1A",
  },
  appBarSpacer: {
    flex: 1,
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
