import { memo, createContext, useContext, type ReactNode } from "react";

interface TrackerDashboardControllersOutput {
  // TODO: Define controller outputs
}

const ControllersContext =
  createContext<TrackerDashboardControllersOutput | null>(null);

interface TrackerDashboardControllersProps {
  children: ReactNode;
}

export const TrackerDashboardControllers =
  memo<TrackerDashboardControllersProps>(({ children }) => {
    const value: TrackerDashboardControllersOutput = {
      // TODO: Initialize controllers
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerDashboardControllers.displayName = "TrackerDashboardControllers";

export const useTrackerDashboardControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerDashboardControllers must be used within TrackerDashboardControllers",
    );
  }
  return context;
};
