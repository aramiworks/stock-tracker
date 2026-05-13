import { memo, createContext, useContext, type ReactNode } from "react";

interface TrackerCatalogControllersOutput {
  // Reserved for future flow-level orchestration
}

const ControllersContext =
  createContext<TrackerCatalogControllersOutput | null>(null);

interface TrackerCatalogControllersProps {
  children: ReactNode;
}

export const TrackerCatalogControllers = memo<TrackerCatalogControllersProps>(
  ({ children }) => {
    const value: TrackerCatalogControllersOutput = {};

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  },
);

TrackerCatalogControllers.displayName = "TrackerCatalogControllers";

export const useTrackerCatalogControllers = () => {
  const context = useContext(ControllersContext);
  /* istanbul ignore next -- defensive guard */
  if (!context) {
    throw new Error(
      "useTrackerCatalogControllers must be used within TrackerCatalogControllers",
    );
  }
  return context;
};
