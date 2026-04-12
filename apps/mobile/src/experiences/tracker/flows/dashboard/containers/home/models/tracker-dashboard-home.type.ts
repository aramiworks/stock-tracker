export type TrackerDashboardHomeScreenState =
  | "default"
  | "empty"
  | "loading"
  | "error";

export interface TrackerDashboardHomeState {
  // TODO: Define state
}

export type SaAccountData = {
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

export type TrackerDashboardHomeControllersOutput = {
  screenState: TrackerDashboardHomeScreenState;
  eligibilityStatus: "eligible" | "notEligible";
  totalSpend: number;
  goalAmount: number;
  saAccounts: SaAccountData[];
  onSaPress: (id: string) => void;
  onCreateAccount: (input: CreateAccountInput) => Promise<void>;
  isRefreshing: boolean;
  onRefresh: () => void;
};
