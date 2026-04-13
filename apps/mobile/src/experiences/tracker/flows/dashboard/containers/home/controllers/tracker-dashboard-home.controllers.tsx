import {
  memo,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { useRouter } from "expo-router";
import { useSuspenseQuery, useMutation } from "@apollo/client/react";
import { DASHBOARD_QUERY } from "@/lib/graphql/queries";
import { CreateAccountDocument } from "@/lib/graphql/generated/graphql";
import { useTrackerDashboardHomeLifecycle } from "../lifecycles";
import type {
  TrackerDashboardHomeControllersOutput,
  TrackerDashboardHomeScreenState,
} from "../models/tracker-dashboard-home.type";

const GOAL_AMOUNT = 30000000;

const ControllersContext =
  createContext<TrackerDashboardHomeControllersOutput | null>(null);

interface TrackerDashboardHomeControllersProps {
  children: ReactNode;
}

export const TrackerDashboardHomeControllers =
  memo<TrackerDashboardHomeControllersProps>(({ children }) => {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data, refetch } = useSuspenseQuery(DASHBOARD_QUERY);
    useTrackerDashboardHomeLifecycle(refetch);

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        void refetch().finally(() => setIsRefreshing(false));
      });
    }, [refetch]);

    const [createAccountMutation] = useMutation(CreateAccountDocument, {
      refetchQueries: ["Dashboard", "Accounts"],
    });

    const onCreateAccount = useCallback(
      async (input: { storeName: string; saName?: string; notes?: string }) => {
        await createAccountMutation({ variables: { input } });
      },
      [createAccountMutation],
    );

    const screenState: TrackerDashboardHomeScreenState = !data?.accounts?.length
      ? "empty"
      : "default";

    const totalSpend = data?.dashboard?.totalSpent ?? 0;

    const saAccounts = useMemo(() => {
      if (!data?.accounts) return [];
      return data.accounts.map((acc) => {
        const spend = acc.purchases.reduce((sum, p) => sum + p.amount, 0);
        return {
          id: acc.id,
          name: acc.saName ?? acc.storeName,
          initial: (acc.saName ?? acc.storeName).charAt(0),
          boutique: acc.storeName,
          totalSpend: spend,
          state:
            spend === 0
              ? ("noPurchases" as const)
              : spend >= GOAL_AMOUNT
                ? ("eligible" as const)
                : ("notEligible" as const),
        };
      });
    }, [data?.accounts]);

    const eligibilityStatus =
      totalSpend >= GOAL_AMOUNT ? "eligible" : "notEligible";

    const onSaPress = useCallback(
      (id: string) => {
        router.push(`/tracker/accounts/detail/${id}`);
      },
      [router],
    );

    const value: TrackerDashboardHomeControllersOutput = {
      screenState,
      eligibilityStatus,
      totalSpend,
      goalAmount: GOAL_AMOUNT,
      saAccounts,
      onSaPress,
      onCreateAccount,
      isRefreshing,
      onRefresh,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerDashboardHomeControllers.displayName = "TrackerDashboardHomeControllers";

export const useTrackerDashboardHomeControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerDashboardHomeControllers must be used within TrackerDashboardHomeControllers",
    );
  }
  return context;
};
