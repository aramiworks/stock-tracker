import { memo, createContext, useContext, type ReactNode } from "react";

interface TrackerControllersOutput {
  // TODO: Define controller outputs
}

const ControllersContext = createContext<TrackerControllersOutput | null>(null);

interface TrackerControllersProps {
  children: ReactNode;
}

export const TrackerControllers = memo<TrackerControllersProps>(
  ({ children }) => {
    const value: TrackerControllersOutput = {
      // TODO: Initialize controllers
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  },
);

TrackerControllers.displayName = "TrackerControllers";

export const useTrackerControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerControllers must be used within TrackerControllers",
    );
  }
  return context;
};
