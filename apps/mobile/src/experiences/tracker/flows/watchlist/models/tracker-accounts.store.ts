import { create } from "zustand";
import type { TrackerAccountsState } from "./tracker-accounts.type";

export const useTrackerAccountsStore = create<TrackerAccountsState>()(() => ({
  // TODO: Define initial state
}));
