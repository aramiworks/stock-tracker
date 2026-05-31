import { memo, Suspense } from "react";
import { TrackerAccountsDetailModels } from "./models";
import {
  TrackerAccountsDetailControllers,
  useTrackerAccountsDetailControllers,
} from "./controllers";
import { TrackerAccountsDetailViews } from "./views";
import { ContainerErrorBoundary } from "@/shared/components/container-error-boundary";

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
      isRefreshing={controllers.isRefreshing}
      onRefresh={controllers.onRefresh}
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
      <ContainerErrorBoundary
        fallback={
          /* istanbul ignore next -- error boundary fallback */ ({ retry }) => (
            <TrackerAccountsDetailViews screenState="error" onRetry={retry} />
          )
        }
      >
        <Suspense
          fallback={
            /* istanbul ignore next -- Suspense fallback */ <TrackerAccountsDetailViews screenState="loading" />
          }
        >
          <TrackerAccountsDetailModels>
            <TrackerAccountsDetailControllers accountId={accountId}>
              <ConnectedViews />
            </TrackerAccountsDetailControllers>
          </TrackerAccountsDetailModels>
        </Suspense>
      </ContainerErrorBoundary>
    );
  },
);

TrackerAccountsDetailContainer.displayName = "TrackerAccountsDetailContainer";
