import { memo, type ReactNode } from "react";
import { View, RefreshControl, StyleSheet } from "react-native";
import { ListTemplate, TopAppBar } from "@aramiworks/ui";
import { useTranslation } from "react-i18next";
import type {
  CatalogGroup,
  GroupSelectionState,
  TrackerCatalogBrowseScreenState,
} from "../models/tracker-catalog-browse.type";
import { CATALOG_MOCK_GROUPS } from "../models/tracker-catalog-browse.mock";
import { TrackerCatalogBrowseGroupHeaderView } from "./groupHeader/tracker-catalog-browse-groupHeader.view";
import { TrackerCatalogBrowseProductRowView } from "./productRow/tracker-catalog-browse-productRow.view";
import { TrackerCatalogBrowseEmptyStateView } from "./emptyState/tracker-catalog-browse-emptyState.view";
import { TrackerCatalogBrowseSkeletonCardView } from "./skeletonCard/tracker-catalog-browse-skeletonCard.view";

type Props = {
  screenState?: TrackerCatalogBrowseScreenState;
  groups?: CatalogGroup[];
  selectedUnitIds?: ReadonlySet<string>;
  getGroupState?: (group: CatalogGroup) => GroupSelectionState;
  onToggleUnit?: (unitId: string) => void | Promise<void>;
  onToggleGroup?: (group: CatalogGroup) => void | Promise<void>;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

const EMPTY_SET: ReadonlySet<string> = new Set<string>();

const defaultGroupState = (
  group: CatalogGroup,
  selected: ReadonlySet<string>,
): GroupSelectionState => {
  let count = 0;
  for (const unit of group.units) {
    if (selected.has(unit.id)) count += 1;
  }
  if (count === 0) return "none";
  if (count === group.units.length) return "all";
  return "some";
};

export const TrackerCatalogBrowseViews = memo(
  ({
    screenState = "default",
    groups = CATALOG_MOCK_GROUPS,
    selectedUnitIds = EMPTY_SET,
    getGroupState,
    onToggleUnit,
    onToggleGroup,
    isRefreshing = false,
    onRefresh,
  }: Props) => {
    const { t } = useTranslation("tracker");

    const resolveGroupState =
      getGroupState ??
      ((g: CatalogGroup) => defaultGroupState(g, selectedUnitIds));

    const content: Record<TrackerCatalogBrowseScreenState, ReactNode> = {
      default: (
        <>
          {groups.map((group) => (
            <View
              key={`${group.brand}-${group.productLine}`}
              style={styles.group}
            >
              <TrackerCatalogBrowseGroupHeaderView
                group={group}
                state={resolveGroupState(group)}
                onTogglePress={
                  onToggleGroup ? () => onToggleGroup(group) : undefined
                }
              />
              {group.units.map((unit) => (
                <TrackerCatalogBrowseProductRowView
                  key={unit.id}
                  unit={unit}
                  checked={selectedUnitIds.has(unit.id)}
                  onTogglePress={
                    onToggleUnit ? () => onToggleUnit(unit.id) : undefined
                  }
                />
              ))}
            </View>
          ))}
        </>
      ),
      empty: <TrackerCatalogBrowseEmptyStateView />,
      loading: (
        <>
          <TrackerCatalogBrowseSkeletonCardView />
          <TrackerCatalogBrowseSkeletonCardView />
          <TrackerCatalogBrowseSkeletonCardView />
        </>
      ),
      error: <TrackerCatalogBrowseEmptyStateView />,
    };

    return (
      <ListTemplate
        testID="catalog-browse-screen"
        topBar={
          <TopAppBar
            type="small"
            title={t("catalog.title")}
            testID="catalog-browse-title"
          />
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {content[screenState]}
      </ListTemplate>
    );
  },
);

TrackerCatalogBrowseViews.displayName = "TrackerCatalogBrowseViews";

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    backgroundColor: "#ffffff",
  },
  group: {
    marginBottom: 8,
  },
});
