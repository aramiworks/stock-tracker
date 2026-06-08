import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { gql } from "@apollo/client";
import { apolloClient } from "@/lib/apollo/provider";

/**
 * Device push-token registration (INF-1615).
 *
 * Raw `gql` documents (not codegen-generated) intentionally mirror the
 * catalog / watchlist / alertHistory queries in `src/lib/graphql/queries.ts`:
 * the mobile codegen pipeline has pre-existing drift against the pivoted
 * GraphQL schema (legacy account/purchase ops in the SDL), so new operations
 * are hand-authored with `gql` rather than generated. The `Boolean!` return
 * value is not consumed.
 */
const REGISTER_PUSH_DEVICE = gql`
  mutation RegisterPushDevice($expoToken: String!, $platform: String!) {
    registerPushDevice(expoToken: $expoToken, platform: $platform)
  }
`;

const UNREGISTER_PUSH_DEVICE = gql`
  mutation UnregisterPushDevice($expoToken: String!) {
    unregisterPushDevice(expoToken: $expoToken)
  }
`;

/* istanbul ignore next -- thin accessor over Expo config; the optional chain is
   defensive (extra.eas.projectId is hard-set in app.config.ts and always present
   at runtime). The truthiness branch in callers is exercised via the mock. */
function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
}

/**
 * Request notification permission, mint the device's Expo push token, and
 * register it with the backend. Returns the token on success, or `null` when
 * registration is skipped (simulator, denied permission, or missing project id).
 *
 * No settings UI exists yet (INF-1615) so a denied prompt is a silent no-op —
 * we simply don't register a device and the user receives no pushes.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push requires a physical device — simulators have no APNs/FCM token.
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let status = existingStatus;
  if (existingStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return null;

  const projectId = getProjectId();
  if (!projectId) return null;

  const { data: expoToken } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  await apolloClient.mutate({
    mutation: REGISTER_PUSH_DEVICE,
    variables: { expoToken, platform: Platform.OS },
  });

  return expoToken;
}

/**
 * Deactivate this device's push token on the backend.
 *
 * MUST be called BEFORE `supabase.auth.signOut()` — once signed out the JWT is
 * gone and this mutation would be unauthenticated (the server scopes the
 * deactivation to the caller's identity).
 */
export async function unregisterFromPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;

  const projectId = getProjectId();
  if (!projectId) return;

  const { data: expoToken } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  await apolloClient.mutate({
    mutation: UNREGISTER_PUSH_DEVICE,
    variables: { expoToken },
  });
}
