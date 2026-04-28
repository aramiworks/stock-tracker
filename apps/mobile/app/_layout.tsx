import "../src/lib/i18n";
import * as Sentry from "@sentry/react-native";
import { Slot } from "expo-router";
import { AuthModels } from "../src/experiences/auth/models/auth.models";
import { AppApolloProvider } from "../src/lib/apollo/provider";
import { initSentry, SentryEfcvTracker } from "../src/lib/sentry";
import { AppTamaguiProvider } from "../src/lib/tamagui/provider";

initSentry();

function RootLayout() {
  return (
    <AppTamaguiProvider>
      <AuthModels>
        <AppApolloProvider>
          <SentryEfcvTracker />
          <Slot />
        </AppApolloProvider>
      </AuthModels>
    </AppTamaguiProvider>
  );
}

export default Sentry.wrap(RootLayout);
