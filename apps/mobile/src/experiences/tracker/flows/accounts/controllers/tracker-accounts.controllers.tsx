import { memo, createContext, useContext, type ReactNode } from "react";

interface TrackerAccountsControllersOutput {
  // TODO: Define controller outputs
}

const ControllersContext =
  createContext<TrackerAccountsControllersOutput | null>(null);

interface TrackerAccountsControllersProps {
  children: ReactNode;
}

export const TrackerAccountsControllers = memo<TrackerAccountsControllersProps>(
  ({ children }) => {
    const value: TrackerAccountsControllersOutput = {
      // TODO: Initialize controllers
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  },
);

TrackerAccountsControllers.displayName = "TrackerAccountsControllers";

export const useTrackerAccountsControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerAccountsControllers must be used within TrackerAccountsControllers",
    );
  }
  return context;
};
