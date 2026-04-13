import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountCreateInputSchema } from "@stock-tracker/validation";
import { FormModal } from "@/shared/components/form-modal";
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
      <FormModal
        visible={visible}
        title="SA 계좌 추가"
        submitLabel="추가"
        onSubmit={handleSubmit(handleFormSubmit)}
        onClose={handleClose}
        testIDPrefix="account-form"
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
      </FormModal>
    );
  },
);

TrackerAccountFormModalView.displayName = "TrackerAccountFormModalView";
