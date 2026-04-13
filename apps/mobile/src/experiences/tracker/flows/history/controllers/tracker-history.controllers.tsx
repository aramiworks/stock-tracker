import { memo, createContext, useContext, type ReactNode } from "react";

interface TrackerHistoryControllersOutput {
  // TODO: Define controller outputs
}

const ControllersContext =
  createContext<TrackerHistoryControllersOutput | null>(null);

interface TrackerHistoryControllersProps {
  children: ReactNode;
}

export const TrackerHistoryControllers = memo<TrackerHistoryControllersProps>(
  ({ children }) => {
    const value: TrackerHistoryControllersOutput = {
      // TODO: Initialize controllers
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  },
);

TrackerHistoryControllers.displayName = "TrackerHistoryControllers";

export const useTrackerHistoryControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerHistoryControllers must be used within TrackerHistoryControllers",
    );
  }
  return context;
};
