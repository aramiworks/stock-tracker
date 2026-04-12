export type TrackerAccountsListScreenState =
  | "default"
  | "empty"
  | "loading"
  | "error";

export type SaAccountListItem = {
  id: string;
  name: string;
  initial: string;
  boutique: string;
  totalSpend: number;
  state: "eligible" | "notEligible" | "noPurchases";
};

export type CreateAccountInput = {
  storeName: string;
  saName?: string;
  notes?: string;
};

export type AccountSortBy = "store_name" | "created_at";

export type TrackerAccountsListControllersOutput = {
  screenState: TrackerAccountsListScreenState;
  accounts: SaAccountListItem[];
  onSaPress: (id: string) => void;
  onCreateAccount: (input: CreateAccountInput) => Promise<void>;
  onDeleteAccount: (id: string) => Promise<void>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: AccountSortBy;
  onSortByToggle: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
};
