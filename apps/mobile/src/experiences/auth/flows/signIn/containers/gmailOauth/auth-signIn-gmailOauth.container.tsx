import { memo } from "react";
import { AuthSignInGmailOauthModels } from "./models";
import {
  AuthSignInGmailOauthControllers,
  useAuthSignInGmailOauthControllers,
} from "./controllers";
import {
  AuthSignInGmailOauthErrorStateView,
  AuthSignInGmailOauthViews,
} from "./views";
import { ContainerErrorBoundary } from "@/shared/components/container-error-boundary";

const ConnectedViews = memo(() => {
  const controllers = useAuthSignInGmailOauthControllers();
  return (
    <AuthSignInGmailOauthViews
      {...controllers}
      onRetry={controllers.signInWithGoogle}
    />
  );
});

ConnectedViews.displayName = "AuthSignInGmailOauthConnectedViews";

export const AuthSignInGmailOauthContainer = memo(() => {
  return (
    <ContainerErrorBoundary
      fallback={
        /* istanbul ignore next -- error boundary fallback */ ({ retry }) => (
          <AuthSignInGmailOauthErrorStateView onRetry={retry} />
        )
      }
    >
      <AuthSignInGmailOauthModels>
        <AuthSignInGmailOauthControllers>
          <ConnectedViews />
        </AuthSignInGmailOauthControllers>
      </AuthSignInGmailOauthModels>
    </ContainerErrorBoundary>
  );
});

AuthSignInGmailOauthContainer.displayName = "AuthSignInGmailOauthContainer";
