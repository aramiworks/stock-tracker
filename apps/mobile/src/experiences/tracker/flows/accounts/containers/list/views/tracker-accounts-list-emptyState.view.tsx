import { memo } from "react";
import { useTranslation } from "react-i18next";
import { TrackerEmptyStateView } from "@/experiences/tracker/views";

type TrackerAccountsListEmptyStateViewProps = {
  onCtaPress?: () => void;
};

export const TrackerAccountsListEmptyStateView =
  memo<TrackerAccountsListEmptyStateViewProps>(({ onCtaPress }) => {
    const { t } = useTranslation("tracker");
    return (
      <TrackerEmptyStateView
        title={t("accounts.list.emptyState.title")}
        subtitle={t("accounts.list.emptyState.subtitle")}
        ctaLabel={t("accounts.list.emptyState.cta")}
        onCtaPress={onCtaPress}
        width={310}
        height={230}
        testID="accounts-list-empty-state"
      />
    );
  });

TrackerAccountsListEmptyStateView.displayName =
  "TrackerAccountsListEmptyStateView";
