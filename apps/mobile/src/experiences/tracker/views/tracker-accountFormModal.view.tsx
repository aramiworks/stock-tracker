import { memo, useCallback, type ReactNode } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountCreateInputSchema } from "@stock-tracker/validation";
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

type AccountFormData = z.infer<typeof accountCreateInputSchema>;

type TrackerAccountFormModalViewProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    storeName: string;
    saName?: string;
    notes?: string;
  }) => Promise<void>;
};

export const TrackerAccountFormModalView = memo(
  ({ visible, onClose, onSubmit }: TrackerAccountFormModalViewProps) => {
    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AccountFormData>({
      resolver: zodResolver(accountCreateInputSchema),
      defaultValues: {
        storeName: "",
        saName: "",
        notes: "",
      },
    });

    const handleClose = useCallback(() => {
      reset();
      onClose();
    }, [reset, onClose]);

    const handleFormSubmit = useCallback(
      async (data: AccountFormData) => {
        await onSubmit({
          storeName: data.storeName,
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
        title="SA 계좌 추가"
        actionLabel="추가"
        onAction={handleSubmit(handleFormSubmit)}
        onClose={handleClose}
        keyboardAvoiding
        testID="account-form"
      >
        <TextInputField
          control={control}
          name="storeName"
          label="부티크 이름"
          placeholder="청담 부티크"
          error={errors.storeName?.message}
          testID="account-form-storeName"
        />
        <TextInputField
          control={control}
          name="saName"
          label="SA 이름 (선택)"
          placeholder="김서연 SA"
          error={errors.saName?.message}
          testID="account-form-saName"
        />
        <TextInputField
          control={control}
          name="notes"
          label="메모 (선택)"
          placeholder="메모를 입력하세요"
          multiline
          error={errors.notes?.message}
          testID="account-form-notes"
        />
      </FullScreenDialog>
    );
  },
);

TrackerAccountFormModalView.displayName = "TrackerAccountFormModalView";
