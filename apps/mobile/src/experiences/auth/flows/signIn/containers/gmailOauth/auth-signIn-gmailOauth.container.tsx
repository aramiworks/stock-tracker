import { memo } from "react";
import { AuthSignInGmailOauthModels } from "./models";
import {
  AuthSignInGmailOauthControllers,
  useAuthSignInGmailOauthControllers,
} from "./controllers";
import { AuthSignInGmailOauthViews } from "./views";

const ConnectedViews = memo(() => {
  const controllers = useAuthSignInGmailOauthControllers();
  return <AuthSignInGmailOauthViews {...controllers} />;
});

ConnectedViews.displayName = "AuthSignInGmailOauthConnectedViews";

export const AuthSignInGmailOauthContainer = memo(() => {
  return (
    <AuthSignInGmailOauthModels>
      <AuthSignInGmailOauthControllers>
        <ConnectedViews />
      </AuthSignInGmailOauthControllers>
    </AuthSignInGmailOauthModels>
  );
});

AuthSignInGmailOauthContainer.displayName = "AuthSignInGmailOauthContainer";
