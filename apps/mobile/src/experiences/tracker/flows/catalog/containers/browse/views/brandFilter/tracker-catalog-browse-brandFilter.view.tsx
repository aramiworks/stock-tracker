import { memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { SegmentedButton, type SegmentedButtonSegment } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";

type Props = {
  /** Distinct brands to offer (e.g. ["Hermès", "Cartier"]). */
  brands: string[];
  /** Currently selected brand value. */
  selectedBrand: string;
  onBrandChange?: (brand: string) => void;
};

/**
 * Brand filter for the catalog browse screen — a segmented control that shows
 * one brand's lines at a time. Figma: `catalogBrandFilter.view` (986:2).
 *
 * Renders nothing when there is only one brand: a single-segment control has no
 * filtering value.
 */
export const TrackerCatalogBrowseBrandFilterView = memo(
  ({ brands, selectedBrand, onBrandChange }: Props) => {
    const { t } = useTranslation("tracker");

    const segments = useMemo<SegmentedButtonSegment[]>(
      () => brands.map((brand) => ({ value: brand, label: brand })),
      [brands],
    );

    if (brands.length < 2) return null;

    return (
      <View style={styles.container} testID="catalog-brand-filter">
        <SegmentedButton
          segments={segments}
          selected={selectedBrand}
          // Single-select: onSelectionChange always yields a string here.
          onSelectionChange={(value) => onBrandChange?.(value as string)}
          accessibilityLabel={t("catalog.brandFilterA11y")}
          testID="catalog-brand-filter-control"
        />
      </View>
    );
  },
);

TrackerCatalogBrowseBrandFilterView.displayName =
  "TrackerCatalogBrowseBrandFilterView";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
