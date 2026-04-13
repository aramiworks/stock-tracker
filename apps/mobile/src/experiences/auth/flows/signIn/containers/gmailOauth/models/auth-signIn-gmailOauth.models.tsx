import { memo, type ReactNode } from "react";

interface AuthSignInGmailOauthModelsProps {
  children: ReactNode;
}

export const AuthSignInGmailOauthModels = memo<AuthSignInGmailOauthModelsProps>(
  ({ children }) => {
    return <>{children}</>;
  },
);

AuthSignInGmailOauthModels.displayName = "AuthSignInGmailOauthModels";
