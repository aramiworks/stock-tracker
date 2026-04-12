export type TrackerHistoryBrowseScreenState =
  | "default"
  | "empty"
  | "loading"
  | "error";

export type DateFilter = "thisMonth" | "threeMonths" | "thisYear" | "all";

export type ItemCategory =
  | "브레이슬릿"
  | "목걸이"
  | "시계"
  | "반지"
  | "귀걸이"
  | "가방"
  | "지갑"
  | "벨트"
  | "기타";

export type PurchaseHistoryItem = {
  id: string;
  productName: string;
  date: string;
  amount: number;
  type: "regular" | "tank";
};

export type TrackerHistoryBrowseControllersOutput = {
  screenState: TrackerHistoryBrowseScreenState;
  purchases: PurchaseHistoryItem[];
  selectedFilter: DateFilter;
  onFilterSelect: (filter: DateFilter) => void;
  onDeletePurchase: (id: string) => Promise<void>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ItemCategory | null;
  onCategorySelect: (category: ItemCategory | null) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
};
