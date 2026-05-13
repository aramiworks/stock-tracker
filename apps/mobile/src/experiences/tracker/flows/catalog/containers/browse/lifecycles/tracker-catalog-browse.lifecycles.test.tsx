import { render } from "@testing-library/react-native";
import { Text } from "react-native";

const mockUseRefetchOnFocus = jest.fn();

jest.mock("@/shared/hooks/use-refetch-on-focus", () => ({
  useRefetchOnFocus: (cb: () => void) => mockUseRefetchOnFocus(cb),
}));

import { useTrackerCatalogBrowseLifecycle } from "./tracker-catalog-browse.lifecycles";

const Harness = ({ refetch }: { refetch: () => void }) => {
  useTrackerCatalogBrowseLifecycle(refetch);
  return <Text>ok</Text>;
};

describe("useTrackerCatalogBrowseLifecycle", () => {
  beforeEach(() => {
    mockUseRefetchOnFocus.mockClear();
  });

  it("mounts without throwing and forwards refetch to useRefetchOnFocus", () => {
    const refetch = jest.fn();
    const { getByText } = render(<Harness refetch={refetch} />);
    expect(getByText("ok")).toBeTruthy();
    expect(mockUseRefetchOnFocus).toHaveBeenCalledWith(refetch);
  });
});
