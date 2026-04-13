import { memo, createContext, useContext, type ReactNode } from "react";

interface AuthSignInControllersOutput {
  // TODO: Define controller outputs
}

const ControllersContext = createContext<AuthSignInControllersOutput | null>(
  null,
);

interface AuthSignInControllersProps {
  children: ReactNode;
}

export const AuthSignInControllers = memo<AuthSignInControllersProps>(
  ({ children }) => {
    const value: AuthSignInControllersOutput = {
      // TODO: Initialize controllers
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  },
);

AuthSignInControllers.displayName = "AuthSignInControllers";

export const useAuthSignInControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useAuthSignInControllers must be used within AuthSignInControllers",
    );
  }
  return context;
};
