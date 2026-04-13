import { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

type TrackerErrorStateViewProps = {
  title?: string;
  subtitle?: string;
  retryLabel?: string;
  onRetry?: () => void;
  width?: number;
  height?: number;
  testID?: string;
};

export const TrackerErrorStateView = memo(
  ({
    title,
    subtitle,
    retryLabel,
    onRetry,
    width = 340,
    height = 240,
    testID,
  }: TrackerErrorStateViewProps) => {
    const { t } = useTranslation("tracker");
    const resolvedTitle = title ?? t("dashboard.errorState.title");
    const resolvedSubtitle = subtitle ?? t("dashboard.errorState.subtitle");
    const resolvedRetryLabel = retryLabel ?? t("dashboard.errorState.retry");
    return (
      <View style={[styles.container, { width, height }]} testID={testID}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.title}>{resolvedTitle}</Text>
        <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          testID={testID ? `${testID}-retry` : undefined}
        >
          <Text style={styles.retryText}>{resolvedRetryLabel}</Text>
        </Pressable>
      </View>
    );
  },
);

TrackerErrorStateView.displayName = "TrackerErrorStateView";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFE8ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorIconText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    color: "#FF2D55",
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
  retryButton: {
    width: 140,
    height: 42,
    backgroundColor: "#FF2D55",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  retryText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
