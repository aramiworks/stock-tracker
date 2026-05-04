import { memo } from "react";
import { useTranslation } from "react-i18next";
import { TrackerErrorStateView } from "@/experiences/tracker/views";

type TrackerAccountsDetailErrorStateViewProps = {
  onRetry?: () => void;
};

export const TrackerAccountsDetailErrorStateView =
  memo<TrackerAccountsDetailErrorStateViewProps>(({ onRetry }) => {
    const { t } = useTranslation("tracker");
    return (
      <TrackerErrorStateView
        title={t("accounts.detail.errorState.title")}
        subtitle={t("accounts.detail.errorState.subtitle")}
        retryLabel={t("accounts.detail.errorState.retry")}
        onRetry={onRetry}
        testID="accounts-detail-error-state"
      />
    );
  });

TrackerAccountsDetailErrorStateView.displayName =
  "TrackerAccountsDetailErrorStateView";
