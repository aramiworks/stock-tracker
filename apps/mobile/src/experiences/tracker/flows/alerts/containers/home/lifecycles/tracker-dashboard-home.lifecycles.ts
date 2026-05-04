import { useRefetchOnFocus } from "@/shared/hooks/use-refetch-on-focus";

export const useTrackerDashboardHomeLifecycle = (refetch: () => void) => {
  useRefetchOnFocus(refetch);
};
