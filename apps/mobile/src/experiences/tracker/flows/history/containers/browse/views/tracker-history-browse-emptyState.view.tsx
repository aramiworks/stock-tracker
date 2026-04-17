import { memo } from "react";
import { useTranslation } from "react-i18next";
import { TrackerEmptyStateView } from "@/experiences/tracker/views";

export const TrackerHistoryBrowseEmptyStateView = memo(() => {
  const { t } = useTranslation("tracker");
  return (
    <TrackerEmptyStateView
      testID="history-browse-empty-state"
      title={t("history.browse.emptyState.title")}
      subtitle={t("history.browse.emptyState.subtitle")}
      ctaLabel={t("history.browse.emptyState.cta")}
    />
  );
});

TrackerHistoryBrowseEmptyStateView.displayName =
  "TrackerHistoryBrowseEmptyStateView";
