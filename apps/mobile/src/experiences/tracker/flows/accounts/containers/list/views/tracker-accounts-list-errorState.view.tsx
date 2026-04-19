import { memo } from "react";
import { useTranslation } from "react-i18next";
import { TrackerErrorStateView } from "@/experiences/tracker/views";

type TrackerAccountsListErrorStateViewProps = {
  onRetry?: () => void;
};

export const TrackerAccountsListErrorStateView =
  memo<TrackerAccountsListErrorStateViewProps>(({ onRetry }) => {
    const { t } = useTranslation("tracker");
    return (
      <TrackerErrorStateView
        title={t("accounts.list.errorState.title")}
        subtitle={t("accounts.list.errorState.subtitle")}
        retryLabel={t("accounts.list.errorState.retry")}
        onRetry={onRetry}
        testID="accounts-list-error-state"
      />
    );
  });

TrackerAccountsListErrorStateView.displayName =
  "TrackerAccountsListErrorStateView";
