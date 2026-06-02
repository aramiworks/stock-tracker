import "../src/lib/i18n";
import * as Sentry from "@sentry/react-native";
import { Slot, useNavigationContainerRef } from "expo-router";
import { useEffect } from "react";
import { AuthModels } from "../src/experiences/auth/models/auth.models";
import { AnalyticsScreenTracker, initAnalytics } from "../src/lib/analytics";
import { AppApolloProvider } from "../src/lib/apollo/provider";
import {
  initSentry,
  registerSentryNavigationContainer,
  SentryEfcvTracker,
} from "../src/lib/sentry";
import { AppTamaguiProvider } from "../src/lib/tamagui/provider";

initSentry();
initAnalytics();

function RootLayout() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (navigationRef?.current) {
      registerSentryNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  return (
    <AppTamaguiProvider>
      <AuthModels>
        <AppApolloProvider>
          <SentryEfcvTracker />
          <AnalyticsScreenTracker />
          <Slot />
        </AppApolloProvider>
      </AuthModels>
    </AppTamaguiProvider>
  );
}

export default Sentry.wrap(RootLayout);
