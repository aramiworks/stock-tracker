import { memo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountUpdateInputSchema } from "@stock-tracker/validation";
import { FormModal } from "@/shared/components/form-modal";
import { TextInputField } from "@/shared/components/text-input-field";
import type { z } from "zod";

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
      <FormModal
        visible={visible}
        title={t("accounts.form.edit.title")}
        submitLabel={t("accounts.form.edit.submit")}
        onSubmit={handleSubmit(handleFormSubmit)}
        onClose={handleClose}
        testIDPrefix="edit-account-form"
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
      </FormModal>
    );
  },
);

TrackerAccountsDetailEditAccountModalView.displayName =
  "TrackerAccountsDetailEditAccountModalView";
