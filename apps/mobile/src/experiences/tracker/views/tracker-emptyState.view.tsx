import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

type TrackerEmptyStateViewProps = {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  width?: number;
  height?: number;
  testID?: string;
};

export const TrackerEmptyStateView = memo(
  ({
    icon,
    title,
    subtitle,
    ctaLabel,
    onCtaPress,
    width = 340,
    height = 240,
    testID,
  }: TrackerEmptyStateViewProps) => {
    const { t } = useTranslation("tracker");
    const resolvedTitle = title ?? t("dashboard.emptyState.title");
    const resolvedSubtitle = subtitle ?? t("dashboard.emptyState.subtitle");
    const resolvedCtaLabel = ctaLabel ?? t("dashboard.emptyState.cta");
    return (
      <View style={[styles.container, { width, height }]} testID={testID}>
        <View style={styles.iconContainer}>{icon ?? <BagIcon />}</View>
        <Text style={styles.title}>{resolvedTitle}</Text>
        <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
        <Pressable
          style={styles.ctaButton}
          onPress={onCtaPress}
          testID={testID ? `${testID}-cta` : undefined}
        >
          <Text style={styles.ctaText}>{resolvedCtaLabel}</Text>
        </Pressable>
      </View>
    );
  },
);

TrackerEmptyStateView.displayName = "TrackerEmptyStateView";

const BagIcon = memo(() => (
  <View style={styles.bagContainer}>
    <View style={styles.bagHandle} />
    <View style={styles.bagBody} />
  </View>
));

BagIcon.displayName = "BagIcon";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  bagContainer: {
    width: 40,
    height: 56,
    alignItems: "center",
  },
  bagHandle: {
    width: 22,
    height: 16,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: "#FFE8ED",
  },
  bagBody: {
    width: 40,
    height: 44,
    backgroundColor: "#FFE8ED",
    borderRadius: 6,
    marginTop: -4,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#1A1A1A",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  ctaButton: {
    width: 140,
    height: 42,
    backgroundColor: "#FF2D55",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  ctaText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
