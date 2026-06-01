import { render } from "@testing-library/react-native";
import { TrackerAccountsDetailRecentPurchasesLabelView } from "./tracker-accounts-detail-recentPurchasesLabel.view";

describe("TrackerAccountsDetailRecentPurchasesLabelView", () => {
  it("renders the section label from i18n", () => {
    const { getByTestId } = render(
      <TrackerAccountsDetailRecentPurchasesLabelView />,
    );
    expect(getByTestId("accounts-detail-recent-purchases-label")).toBeTruthy();
  });
});
