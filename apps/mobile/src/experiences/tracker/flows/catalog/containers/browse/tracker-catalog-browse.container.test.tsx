import { render } from "@testing-library/react-native";

const mockRefetch = jest.fn().mockResolvedValue(undefined);

jest.mock("@apollo/client/react", () => ({
  useSuspenseQuery: jest.fn(),
}));

jest.mock("@/shared/hooks/use-refetch-on-focus", () => ({
  useRefetchOnFocus: jest.fn(),
}));

import { useSuspenseQuery } from "@apollo/client/react";
import { TrackerCatalogBrowseContainer } from "./tracker-catalog-browse.container";
import { CATALOG_MOCK_GROUPS } from "./models/tracker-catalog-browse.mock";

(useSuspenseQuery as unknown as jest.Mock).mockReturnValue({
  data: { catalogList: CATALOG_MOCK_GROUPS },
  refetch: mockRefetch,
});

describe("TrackerCatalogBrowseContainer", () => {
  it("renders the catalog browse screen with real query data", () => {
    const { getByTestId } = render(<TrackerCatalogBrowseContainer />);
    expect(getByTestId("catalog-browse-screen")).toBeTruthy();
  });
});
