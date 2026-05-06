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
import { ACCOUNT_QUERY } from "@/lib/graphql/queries";
import {
  UpdateAccountDocument,
  DeleteAccountDocument,
  CreatePurchaseDocument,
  UpdatePurchaseDocument,
  DeletePurchaseDocument,
} from "@/lib/graphql/generated/graphql";
import type { TrackerAccountsDetailControllersOutput } from "../models/tracker-accounts-detail.type";
import { useTrackerAccountsDetailLifecycle } from "../lifecycles";

const GOAL_AMOUNT = 30000000;

const ControllersContext =
  createContext<TrackerAccountsDetailControllersOutput | null>(null);

interface TrackerAccountsDetailControllersProps {
  children: ReactNode;
  accountId: string;
}

export const TrackerAccountsDetailControllers =
  memo<TrackerAccountsDetailControllersProps>(({ children, accountId }) => {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data, refetch } = useSuspenseQuery(ACCOUNT_QUERY, {
      variables: { id: accountId },
    });
    useTrackerAccountsDetailLifecycle(refetch);

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        void refetch().finally(() => setIsRefreshing(false));
      });
    }, [refetch]);

    const accountRefetchQueries = [
      { query: ACCOUNT_QUERY, variables: { id: accountId } },
      "Dashboard" as const,
      "Accounts" as const,
    ];
    const purchaseRefetchQueries = [
      ...accountRefetchQueries,
      "Purchases" as const,
    ];

    const [updateAccountMutation] = useMutation(UpdateAccountDocument, {
      refetchQueries: accountRefetchQueries,
    });
    const [deleteAccountMutation] = useMutation(DeleteAccountDocument, {
      refetchQueries: ["Dashboard", "Accounts"],
    });
    const [createPurchaseMutation] = useMutation(CreatePurchaseDocument, {
      refetchQueries: purchaseRefetchQueries,
    });
    const [updatePurchaseMutation] = useMutation(UpdatePurchaseDocument, {
      refetchQueries: purchaseRefetchQueries,
    });
    const [deletePurchaseMutation] = useMutation(DeletePurchaseDocument, {
      refetchQueries: purchaseRefetchQueries,
    });

    const account = data?.account;

    const totalSpend = useMemo(() => {
      /* istanbul ignore next -- defensive guard; useSuspenseQuery always returns data */
      if (!account?.purchases) return 0;
      return account.purchases.reduce((sum, p) => sum + p.amount, 0);
    }, [account?.purchases]);

    const purchases = useMemo(() => {
      /* istanbul ignore next -- defensive guard; useSuspenseQuery always returns data */
      if (!account?.purchases) return [];
      return account.purchases.map((p) => ({
        id: p.id,
        productName: p.itemName,
        date: new Date(p.purchaseDate).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        amount: p.amount,
        type: p.amount >= 5000000 ? ("tank" as const) : ("regular" as const),
      }));
    }, [account?.purchases]);

    const tankState =
      totalSpend === 0
        ? ("noPurchases" as const)
        : totalSpend >= GOAL_AMOUNT
          ? ("eligible" as const)
          : ("notEligible" as const);

    const onBack = useCallback(() => {
      router.back();
    }, [router]);

    const onUpdateAccount = useCallback(
      async (input: {
        storeName?: string;
        saName?: string;
        notes?: string;
      }) => {
        await updateAccountMutation({
          variables: { input: { id: accountId, ...input } },
        });
      },
      [updateAccountMutation, accountId],
    );

    const onDeleteAccount = useCallback(async () => {
      await deleteAccountMutation({ variables: { id: accountId } });
      router.back();
    }, [deleteAccountMutation, accountId, router]);

    const onCreatePurchase = useCallback(
      async (input: {
        itemName: string;
        itemCategory?: string;
        amount: number;
        currency?: string;
        purchaseDate: string;
        storeLocation?: string;
        notes?: string;
      }) => {
        await createPurchaseMutation({
          variables: { input: { accountId, ...input } },
        });
      },
      [createPurchaseMutation, accountId],
    );

    const onUpdatePurchase = useCallback(
      async (
        id: string,
        input: {
          itemName?: string;
          itemCategory?: string;
          amount?: number;
          currency?: string;
          purchaseDate?: string;
          storeLocation?: string;
          notes?: string;
        },
      ) => {
        await updatePurchaseMutation({
          variables: { input: { id, ...input } },
        });
      },
      [updatePurchaseMutation],
    );

    const onDeletePurchase = useCallback(
      async (id: string) => {
        await deletePurchaseMutation({ variables: { id } });
      },
      [deletePurchaseMutation],
    );

    const value: TrackerAccountsDetailControllersOutput = {
      screenState: "default",
      accountId,
      name: account?.saName ?? account?.storeName ?? "",
      initial: (account?.saName ?? account?.storeName ?? "").charAt(0),
      boutique: account?.storeName ?? "",
      saName: account?.saName ?? "",
      notes: account?.notes ?? "",
      totalSpend,
      tankState,
      purchases,
      onBack,
      onUpdateAccount,
      onDeleteAccount,
      onCreatePurchase,
      onUpdatePurchase,
      onDeletePurchase,
      isRefreshing,
      onRefresh,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerAccountsDetailControllers.displayName =
  "TrackerAccountsDetailControllers";

export const useTrackerAccountsDetailControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerAccountsDetailControllers must be used within TrackerAccountsDetailControllers",
    );
  }
  return context;
};
