import { memo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FullScreenDialog, Snackbar } from "@aramiworks/ui";
import { z } from "zod";
import { TextInputField } from "@/shared/components/text-input-field";

const accountCreateInputSchema = z.object({
  storeName: z.string().min(1),
  saName: z.string().optional(),
  notes: z.string().optional(),
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

    const [errorVisible, setErrorVisible] = useState(false);

    const handleClose = useCallback(() => {
      reset();
      onClose();
    }, [reset, onClose]);

    const handleFormSubmit = useCallback(
      async (data: AccountFormData) => {
        try {
          await onSubmit({
            storeName: data.storeName,
            saName: data.saName || undefined,
            notes: data.notes || undefined,
          });
          reset();
          onClose();
        } catch {
          setErrorVisible(true);
        }
      },
      [onSubmit, reset, onClose],
    );

    return (
      <>
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
        <Snackbar
          visible={errorVisible}
          message="계좌를 추가하는 중 오류가 발생했습니다."
          onDismiss={() => setErrorVisible(false)}
          testID="account-form-error"
        />
      </>
    );
  },
);

TrackerAccountFormModalView.displayName = "TrackerAccountFormModalView";
