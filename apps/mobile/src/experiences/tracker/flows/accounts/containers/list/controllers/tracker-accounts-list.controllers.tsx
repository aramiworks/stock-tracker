import {
  memo,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  startTransition,
  type ReactNode,
} from "react";
import { useRouter } from "expo-router";
import { useSuspenseQuery, useMutation } from "@apollo/client/react";
import { ACCOUNTS_QUERY } from "@/lib/graphql/queries";
import {
  AccountSortBy as GqlAccountSortBy,
  SortOrder as GqlSortOrder,
  CreateAccountDocument,
  DeleteAccountDocument,
} from "@/lib/graphql/generated/graphql";
import { useTrackerAccountsListLifecycle } from "../lifecycles";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type {
  TrackerAccountsListControllersOutput,
  TrackerAccountsListScreenState,
  AccountSortBy,
} from "../models/tracker-accounts-list.type";

const GOAL_AMOUNT = 30000000;

const SORT_BY_TO_GQL: Record<AccountSortBy, GqlAccountSortBy> = {
  store_name: GqlAccountSortBy.StoreName,
  created_at: GqlAccountSortBy.CreatedAt,
};

const ControllersContext =
  createContext<TrackerAccountsListControllersOutput | null>(null);

interface TrackerAccountsListControllersProps {
  children: ReactNode;
}

export const TrackerAccountsListControllers =
  memo<TrackerAccountsListControllersProps>(({ children }) => {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<AccountSortBy>("created_at");
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data, refetch } = useSuspenseQuery(ACCOUNTS_QUERY, {
      variables: {
        sortBy: SORT_BY_TO_GQL[sortBy],
        sortOrder:
          sortBy === "store_name" ? GqlSortOrder.Asc : GqlSortOrder.Desc,
        search: debouncedSearch || undefined,
      },
    });
    useTrackerAccountsListLifecycle(refetch);

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        void refetch().finally(() => setIsRefreshing(false));
      });
    }, [refetch]);

    const [createAccountMutation] = useMutation(CreateAccountDocument, {
      refetchQueries: ["Dashboard", "Accounts"],
    });
    const [deleteAccountMutation] = useMutation(DeleteAccountDocument, {
      refetchQueries: ["Dashboard", "Accounts"],
    });

    const onCreateAccount = useCallback(
      async (input: { storeName: string; saName?: string; notes?: string }) => {
        await createAccountMutation({ variables: { input } });
      },
      [createAccountMutation],
    );

    const onDeleteAccount = useCallback(
      async (id: string) => {
        await deleteAccountMutation({ variables: { id } });
      },
      [deleteAccountMutation],
    );

    const screenState: TrackerAccountsListScreenState = !data?.accounts?.length
      ? "empty"
      : "default";

    const accounts = useMemo(() => {
      /* istanbul ignore next -- defensive guard; useSuspenseQuery always returns data */
      if (!data?.accounts) return [];
      return data.accounts
        .filter(
          (acc): acc is typeof acc & { id: string; storeName: string } =>
            acc.id != null && acc.storeName != null,
        )
        .map((acc) => {
          const spend = (acc.purchases ?? []).reduce(
            (sum, p) => sum + (p.amount ?? 0),
            0,
          );
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

    const onSaPress = useCallback(
      (id: string) => {
        router.push(`/tracker/accounts/detail/${id}`);
      },
      [router],
    );

    const onSearchChange = useCallback((query: string) => {
      setSearchQuery(query);
    }, []);

    const onSortByToggle = useCallback(() => {
      setSortBy((prev) =>
        prev === "created_at" ? "store_name" : "created_at",
      );
    }, []);

    const value: TrackerAccountsListControllersOutput = {
      screenState,
      accounts,
      onSaPress,
      onCreateAccount,
      onDeleteAccount,
      searchQuery,
      onSearchChange,
      sortBy,
      onSortByToggle,
      isRefreshing,
      onRefresh,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerAccountsListControllers.displayName = "TrackerAccountsListControllers";

export const useTrackerAccountsListControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerAccountsListControllers must be used within TrackerAccountsListControllers",
    );
  }
  return context;
};
