import { render } from "@testing-library/react-native";
import { TrackerCatalogBrowseSkeletonCardView } from "./tracker-catalog-browse-skeletonCard.view";

describe("TrackerCatalogBrowseSkeletonCardView", () => {
  it("renders the skeleton placeholder", () => {
    const { getByTestId } = render(<TrackerCatalogBrowseSkeletonCardView />);
    expect(getByTestId("catalog-skeleton-card")).toBeTruthy();
  });
});
