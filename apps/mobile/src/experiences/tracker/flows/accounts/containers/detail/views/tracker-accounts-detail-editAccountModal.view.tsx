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
import { accountUpdateInputSchema } from "@stock-tracker/validation";
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
    keyboardAvoiding = false,
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
          keyboardAvoiding && Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <View style={dialogStyles.header}>
          <Pressable
            onPress={onClose}
            style={dialogStyles.closeButton}
            testID={testID ? `${testID}-cancel` : undefined}
          >
            <Text style={dialogStyles.closeText}>취소</Text>
          </Pressable>
          <Text style={dialogStyles.title}>{title}</Text>
          <Pressable
            onPress={onAction}
            style={dialogStyles.submitButton}
            testID={testID ? `${testID}-submit` : undefined}
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

type AccountUpdateFormData = z.infer<typeof accountUpdateInputSchema>;

type TrackerAccountsDetailEditAccountModalViewProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    storeName?: string;
    saName?: string;
    notes?: string;
  }) => Promise<void>;
  currentValues: {
    id: string;
    storeName: string;
    saName: string;
    notes: string;
  };
};

export const TrackerAccountsDetailEditAccountModalView = memo(
  ({
    visible,
    onClose,
    onSubmit,
    currentValues,
  }: TrackerAccountsDetailEditAccountModalViewProps) => {
    const { t } = useTranslation("tracker");
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AccountUpdateFormData>({
      resolver: zodResolver(accountUpdateInputSchema),
      defaultValues: {
        id: currentValues.id,
        storeName: currentValues.storeName,
        saName: currentValues.saName,
        notes: currentValues.notes,
      },
    });

    useEffect(() => {
      if (visible) {
        reset({
          id: currentValues.id,
          storeName: currentValues.storeName,
          saName: currentValues.saName,
          notes: currentValues.notes,
        });
      }
    }, [visible, currentValues, reset]);

    const handleClose = useCallback(() => {
      reset();
      onClose();
    }, [reset, onClose]);

    const handleFormSubmit = useCallback(
      async (data: AccountUpdateFormData) => {
        await onSubmit({
          storeName: data.storeName || undefined,
          saName: data.saName || undefined,
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
        title={t("accounts.form.edit.title")}
        actionLabel={t("accounts.form.edit.submit")}
        onAction={handleSubmit(handleFormSubmit)}
        onClose={handleClose}
        keyboardAvoiding
        testID="edit-account-form"
      >
        <TextInputField
          control={control}
          name="storeName"
          label={t("accounts.form.fields.boutiqueName.label")}
          placeholder={t("accounts.form.fields.boutiqueName.placeholder")}
          error={errors.storeName?.message}
          testID="edit-account-form-storeName"
        />
        <TextInputField
          control={control}
          name="saName"
          label={t("accounts.form.fields.saName.label")}
          placeholder={t("accounts.form.fields.saName.placeholder")}
          error={errors.saName?.message}
          testID="edit-account-form-saName"
        />
        <TextInputField
          control={control}
          name="notes"
          label={t("accounts.form.fields.notes.label")}
          placeholder={t("accounts.form.fields.notes.placeholder")}
          multiline
          error={errors.notes?.message}
          testID="edit-account-form-notes"
        />
      </FullScreenDialog>
    );
  },
);

TrackerAccountsDetailEditAccountModalView.displayName =
  "TrackerAccountsDetailEditAccountModalView";
