import { memo, useCallback, useEffect, type ReactNode } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseCreateInputSchema } from "@stock-tracker/validation";
import { TextInputField } from "@/shared/components/text-input-field";
import type { z } from "zod";

type FullScreenDialogProps = {
  visible: boolean;
  title: string;
  actionLabel: string;
  onAction: () => void;
  onClose: () => void;
  keyboardAvoiding?: boolean;
  testID?: string;
  children: ReactNode;
};

const FullScreenDialog = memo(
  ({
    visible,
    title,
    actionLabel,
    onAction,
    onClose,
    keyboardAvoiding,
    testID,
    children,
  }: FullScreenDialogProps) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={dialogStyles.container}
        behavior={
          /* istanbul ignore next -- always called with keyboardAvoiding=true */
          keyboardAvoiding && Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <View style={dialogStyles.header}>
          <Pressable
            onPress={onClose}
            style={dialogStyles.closeButton}
            testID={/* istanbul ignore next */ testID ? `${testID}-cancel` : undefined}
          >
            <Text style={dialogStyles.closeText}>취소</Text>
          </Pressable>
          <Text style={dialogStyles.title}>{title}</Text>
          <Pressable
            onPress={onAction}
            style={dialogStyles.submitButton}
            testID={/* istanbul ignore next */ testID ? `${testID}-action` : undefined}
          >
            <Text style={dialogStyles.submitText}>{actionLabel}</Text>
          </Pressable>
        </View>
        <ScrollView
          style={dialogStyles.body}
          contentContainerStyle={dialogStyles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  ),
);

FullScreenDialog.displayName = "FullScreenDialog";

const dialogStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: { padding: 4 },
  closeText: { fontFamily: "Inter", fontSize: 15, color: "#999" },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 17,
    color: "#1A1A1A",
  },
  submitButton: {
    backgroundColor: "#FF2D55",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#FFFFFF",
  },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
});

type PurchaseFormData = z.input<typeof purchaseCreateInputSchema>;

type PurchaseFormDefaultValues = Partial<PurchaseFormData>;

type TrackerAccountsDetailPurchaseFormModalViewProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseFormData) => Promise<void>;
  defaultValues?: PurchaseFormDefaultValues;
};

export const TrackerAccountsDetailPurchaseFormModalView = memo(
  ({
    visible,
    onClose,
    onSubmit,
    defaultValues,
  }: TrackerAccountsDetailPurchaseFormModalViewProps) => {
    const { t } = useTranslation("tracker");
    const isEdit = !!defaultValues;

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<PurchaseFormData>({
      resolver: zodResolver(purchaseCreateInputSchema),
      defaultValues: {
        itemName: "",
        amount: undefined as unknown as number,
        purchaseDate: "",
        itemCategory: undefined,
        storeLocation: "",
        notes: "",
      },
    });

    useEffect(() => {
      if (visible && defaultValues) {
        reset({
          itemName: defaultValues.itemName ?? /* istanbul ignore next */ "",
          amount: defaultValues.amount ?? /* istanbul ignore next */ (undefined as unknown as number),
          purchaseDate: defaultValues.purchaseDate ?? "",
          itemCategory: defaultValues.itemCategory ?? undefined,
          storeLocation: defaultValues.storeLocation ?? "",
          notes: defaultValues.notes ?? "",
        });
      } else /* istanbul ignore next -- reset to blank form when opening without defaults */ if (visible) {
        reset({
          itemName: "",
          amount: undefined as unknown as number,
          purchaseDate: "",
          itemCategory: undefined,
          storeLocation: "",
          notes: "",
        });
      }
    }, [visible, defaultValues, reset]);

    const handleClose = useCallback(() => {
      reset();
      onClose();
    }, [reset, onClose]);

    const handleFormSubmit = useCallback(
      async (data: PurchaseFormData) => {
        await onSubmit({
          itemName: data.itemName,
          amount: data.amount,
          purchaseDate: data.purchaseDate,
          itemCategory: data.itemCategory || undefined,
          storeLocation: data.storeLocation || undefined,
          notes: data.notes || undefined,
        });
        reset();
        onClose();
      },
      [onSubmit, reset, onClose],
    );

    return (
      <FullScreenDialog
        visible={visible}
        title={
          isEdit
            ? t("purchases.form.edit.title")
            : t("purchases.form.add.title")
        }
        actionLabel={
          isEdit
            ? t("purchases.form.edit.submit")
            : t("purchases.form.add.submit")
        }
        onAction={handleSubmit(handleFormSubmit)}
        onClose={handleClose}
        keyboardAvoiding
        testID="purchase-form"
      >
        <TextInputField
          control={control}
          name="itemName"
          label={t("purchases.form.fields.itemName.label")}
          placeholder={t("purchases.form.fields.itemName.placeholder")}
          error={errors.itemName?.message}
          testID="purchase-form-itemName"
        />
        <TextInputField
          control={control}
          name="amount"
          label={t("purchases.form.fields.amount.label")}
          placeholder={t("purchases.form.fields.amount.placeholder")}
          keyboardType="numeric"
          error={errors.amount?.message}
          testID="purchase-form-amount"
        />
        <TextInputField
          control={control}
          name="purchaseDate"
          label={t("purchases.form.fields.purchaseDate.label")}
          placeholder={t("purchases.form.fields.purchaseDate.placeholder")}
          error={errors.purchaseDate?.message}
          testID="purchase-form-purchaseDate"
        />
        <TextInputField
          control={control}
          name="itemCategory"
          label={t("purchases.form.fields.itemCategory.label")}
          placeholder={t("purchases.form.fields.itemCategory.placeholder")}
          error={errors.itemCategory?.message}
          testID="purchase-form-itemCategory"
        />
        <TextInputField
          control={control}
          name="storeLocation"
          label={t("purchases.form.fields.storeLocation.label")}
          placeholder={t("purchases.form.fields.storeLocation.placeholder")}
          error={errors.storeLocation?.message}
          testID="purchase-form-storeLocation"
        />
        <TextInputField
          control={control}
          name="notes"
          label={t("purchases.form.fields.notes.label")}
          placeholder={t("purchases.form.fields.notes.placeholder")}
          multiline
          error={errors.notes?.message}
          testID="purchase-form-notes"
        />
      </FullScreenDialog>
    );
  },
);

TrackerAccountsDetailPurchaseFormModalView.displayName =
  "TrackerAccountsDetailPurchaseFormModalView";
