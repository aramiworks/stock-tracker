import { memo, Suspense } from "react";
import { TrackerAccountsDetailModels } from "./models";
import {
  TrackerAccountsDetailControllers,
  useTrackerAccountsDetailControllers,
} from "./controllers";
import { TrackerAccountsDetailViews } from "./views";
import { QueryErrorBoundary } from "@/shared/components/query-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useTrackerAccountsDetailControllers();
  return (
    <TrackerAccountsDetailViews
      screenState={controllers.screenState}
      accountId={controllers.accountId}
      name={controllers.name}
      initial={controllers.initial}
      boutique={controllers.boutique}
      saName={controllers.saName}
      notes={controllers.notes}
      totalSpend={controllers.totalSpend}
      tankState={controllers.tankState}
      purchases={controllers.purchases}
      onBack={controllers.onBack}
      onUpdateAccount={controllers.onUpdateAccount}
      onDeleteAccount={controllers.onDeleteAccount}
      onCreatePurchase={controllers.onCreatePurchase}
      onUpdatePurchase={controllers.onUpdatePurchase}
      onDeletePurchase={controllers.onDeletePurchase}
    />
  );
});

ConnectedViews.displayName = "TrackerAccountsDetailConnectedViews";

interface TrackerAccountsDetailContainerProps {
  accountId: string;
}

export const TrackerAccountsDetailContainer = memo(
  ({ accountId }: TrackerAccountsDetailContainerProps) => {
    return (
      <QueryErrorBoundary
        fallback={({ retry }) => (
          <TrackerAccountsDetailViews screenState="error" onRetry={retry} />
        )}
      >
        <Suspense
          fallback={<TrackerAccountsDetailViews screenState="loading" />}
        >
          <TrackerAccountsDetailModels>
            <TrackerAccountsDetailControllers accountId={accountId}>
              <ConnectedViews />
            </TrackerAccountsDetailControllers>
          </TrackerAccountsDetailModels>
        </Suspense>
      </QueryErrorBoundary>
    );
  },
);

TrackerAccountsDetailContainer.displayName = "TrackerAccountsDetailContainer";
