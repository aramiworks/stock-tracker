import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

export const useTrackerAccountsDetailLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
