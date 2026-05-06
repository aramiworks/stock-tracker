import { memo } from "react";
import { useTranslation } from "react-i18next";
import { TrackerEmptyStateView } from "@/experiences/tracker/views";

type TrackerDashboardHomeEmptyStateViewProps = {
  onCtaPress?: () => void;
};

export const TrackerDashboardHomeEmptyStateView =
  memo<TrackerDashboardHomeEmptyStateViewProps>(({ onCtaPress }) => {
    const { t } = useTranslation("tracker");
    return (
      <TrackerEmptyStateView
        testID="dashboard-empty-state"
        title={t("dashboard.emptyState.title")}
        subtitle={t("dashboard.emptyState.subtitle")}
        ctaLabel={t("dashboard.emptyState.cta")}
        onCtaPress={onCtaPress}
      />
    );
  });

TrackerDashboardHomeEmptyStateView.displayName =
  "TrackerDashboardHomeEmptyStateView";
