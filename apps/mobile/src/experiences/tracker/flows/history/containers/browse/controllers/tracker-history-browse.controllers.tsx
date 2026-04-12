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
import { useSuspenseQuery, useMutation } from "@apollo/client/react";
import { PURCHASES_QUERY } from "@/lib/graphql/queries";
import { DeletePurchaseDocument } from "@/lib/graphql/generated/graphql";
import { useTrackerHistoryBrowseLifecycle } from "../lifecycles";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type {
  TrackerHistoryBrowseControllersOutput,
  TrackerHistoryBrowseScreenState,
  DateFilter,
  ItemCategory,
} from "../models/tracker-history-browse.type";

const ControllersContext =
  createContext<TrackerHistoryBrowseControllersOutput | null>(null);

interface TrackerHistoryBrowseControllersProps {
  children: ReactNode;
}

function dateFilterToDateRange(
  filter: DateFilter
): { from?: string; to?: string } | undefined {
  if (filter === "all") return undefined;
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  switch (filter) {
    case "thisMonth": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      return { from, to };
    }
    case "threeMonths": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return { from: d.toISOString().split("T")[0], to };
    }
    case "thisYear":
      return { from: `${now.getFullYear()}-01-01`, to };
  }
}

export const TrackerHistoryBrowseControllers =
  memo<TrackerHistoryBrowseControllersProps>(({ children }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<DateFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] =
      useState<ItemCategory | null>(null);
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data, refetch } = useSuspenseQuery(PURCHASES_QUERY, {
      variables: {
        dateRange: dateFilterToDateRange(selectedFilter),
        search: debouncedSearch || undefined,
        itemCategory: selectedCategory || undefined,
      },
    });
    useTrackerHistoryBrowseLifecycle(refetch);

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        void refetch().finally(() => setIsRefreshing(false));
      });
    }, [refetch]);

    const [deletePurchaseMutation] = useMutation(DeletePurchaseDocument, {
      refetchQueries: ["Purchases", "Dashboard", "Accounts"],
    });

    const onDeletePurchase = useCallback(
      async (id: string) => {
        await deletePurchaseMutation({ variables: { id } });
      },
      [deletePurchaseMutation]
    );

    const purchases = useMemo(() => {
      if (!data?.purchases) return [];
      return data.purchases.map((p) => ({
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
    }, [data?.purchases]);

    const screenState: TrackerHistoryBrowseScreenState = !purchases.length
      ? "empty"
      : "default";

    const onFilterSelect = useCallback((filter: DateFilter) => {
      setSelectedFilter(filter);
    }, []);

    const onSearchChange = useCallback((query: string) => {
      setSearchQuery(query);
    }, []);

    const onCategorySelect = useCallback((category: ItemCategory | null) => {
      setSelectedCategory(category);
    }, []);

    const value: TrackerHistoryBrowseControllersOutput = {
      screenState,
      purchases,
      selectedFilter,
      onFilterSelect,
      onDeletePurchase,
      searchQuery,
      onSearchChange,
      selectedCategory,
      onCategorySelect,
      isRefreshing,
      onRefresh,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerHistoryBrowseControllers.displayName = "TrackerHistoryBrowseControllers";

export const useTrackerHistoryBrowseControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerHistoryBrowseControllers must be used within TrackerHistoryBrowseControllers"
    );
  }
  return context;
};
