import { render } from "@testing-library/react-native";
import { TrackerCatalogBrowseEmptyStateView } from "./tracker-catalog-browse-emptyState.view";

describe("TrackerCatalogBrowseEmptyStateView", () => {
  it("renders the catalog empty state with translation keys", () => {
    const { getByTestId, getByText } = render(
      <TrackerCatalogBrowseEmptyStateView />,
    );
    expect(getByTestId("catalog-empty-state")).toBeTruthy();
    expect(getByText("catalog.empty.title")).toBeTruthy();
    expect(getByText("catalog.empty.body")).toBeTruthy();
  });
});
