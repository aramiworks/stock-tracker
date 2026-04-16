import { memo } from "react";
import { useTranslation } from "react-i18next";
import { TrackerErrorStateView } from "@/experiences/tracker/views";

type TrackerHistoryBrowseErrorStateViewProps = {
  onRetry?: () => void;
};

export const TrackerHistoryBrowseErrorStateView =
  memo<TrackerHistoryBrowseErrorStateViewProps>(({ onRetry }) => {
    const { t } = useTranslation("tracker");
    return (
      <TrackerErrorStateView
        testID="history-browse-error-state"
        title={t("history.browse.errorState.title")}
        subtitle={t("history.browse.errorState.subtitle")}
        retryLabel={t("history.browse.errorState.retry")}
        onRetry={onRetry}
        width={310}
        height={230}
      />
    );
  });

TrackerHistoryBrowseErrorStateView.displayName =
  "TrackerHistoryBrowseErrorStateView";
