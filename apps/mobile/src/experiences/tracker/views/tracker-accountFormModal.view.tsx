import { memo, useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FullScreenDialog } from "@aramiworks/ui";
import { accountCreateInputSchema } from "@stock-tracker/validation";
import { TextInputField } from "@/shared/components/text-input-field";
import type { z } from "zod";

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
    const [submitError, setSubmitError] = useState<string | null>(null);

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
      setSubmitError(null);
      reset();
      onClose();
    }, [reset, onClose]);

    const handleFormSubmit = useCallback(
      async (data: AccountFormData) => {
        setSubmitError(null);
        try {
          await onSubmit({
            storeName: data.storeName,
            saName: data.saName || undefined,
            notes: data.notes || undefined,
          });
          reset();
          onClose();
        } catch (err) {
          setSubmitError(
            err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
          );
        }
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
        {submitError ? (
          <View style={styles.errorBanner} testID="account-form-error">
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}
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

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: "#FDECEA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#B00020",
    fontSize: 14,
  },
});

TrackerAccountFormModalView.displayName = "TrackerAccountFormModalView";
