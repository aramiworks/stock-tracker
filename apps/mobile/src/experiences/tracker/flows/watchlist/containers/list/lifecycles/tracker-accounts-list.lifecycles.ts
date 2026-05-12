import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

export const useTrackerAccountsListLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
