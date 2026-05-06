export type TrackerAccountsDetailScreenState = "default" | "loading" | "error";

export type PurchaseItem = {
  id: string;
  productName: string;
  date: string;
  amount: number;
  type: "regular" | "tank";
};

export type UpdateAccountInput = {
  storeName?: string;
  saName?: string;
  notes?: string;
};

export type CreatePurchaseInput = {
  itemName: string;
  itemCategory?: string;
  amount: number;
  currency?: string;
  purchaseDate: string;
  storeLocation?: string;
  notes?: string;
};

export type UpdatePurchaseInput = {
  itemName?: string;
  itemCategory?: string;
  amount?: number;
  currency?: string;
  purchaseDate?: string;
  storeLocation?: string;
  notes?: string;
};

export type TrackerAccountsDetailControllersOutput = {
  screenState: TrackerAccountsDetailScreenState;
  accountId: string;
  name: string;
  initial: string;
  boutique: string;
  saName: string;
  notes: string;
  totalSpend: number;
  tankState: "eligible" | "notEligible" | "noPurchases";
  purchases: PurchaseItem[];
  onBack: () => void;
  onUpdateAccount: (input: UpdateAccountInput) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onCreatePurchase: (input: CreatePurchaseInput) => Promise<void>;
  onUpdatePurchase: (id: string, input: UpdatePurchaseInput) => Promise<void>;
  onDeletePurchase: (id: string) => Promise<void>;
  isRefreshing: boolean;
  onRefresh: () => void;
};
