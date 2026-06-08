import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { emitRestock } from "@/shared/hooks/use-refetch-on-restock";

/**
 * Foreground presentation behavior: a restock push arriving while the app is
 * open still shows a banner + notification-center entry and plays a sound, but
 * never sets an app badge. Registered once at module load.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_DEFAULT_CHANNEL_ID = "default";

type RestockNotificationData = {
  /** The watchable-unit id — the `[id]` route param, NOT a sku/watch id. */
  watchableUnitId?: string;
};

/**
 * Wire up notification handlers for the authenticated session. Mount once in
 * the authenticated layout (`app/(app)/_layout.tsx`).
 *
 * - foreground receipt → publishes into the restock refetch seam so any open
 *   watchlist screen refreshes live;
 * - response (tap) → deep-links to the watchlist detail of the restocked unit;
 * - cold start (app launched by a tap) → same deep-link via
 *   `getLastNotificationResponseAsync`.
 */
export function useNotificationHandlers(): void {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "android") {
      void Notifications.setNotificationChannelAsync(
        ANDROID_DEFAULT_CHANNEL_ID,
        {
          name: "Restock alerts",
          importance: Notifications.AndroidImportance.HIGH,
        },
      );
    }

    const navigateFromResponse = (
      response: Notifications.NotificationResponse,
    ) => {
      const data = response.notification.request.content.data as
        | RestockNotificationData
        | undefined;
      if (data?.watchableUnitId) {
        router.push({
          pathname: "/tracker/watchlist/[id]",
          params: { id: data.watchableUnitId },
        });
      }
    };

    // Foreground delivery → refresh open watchlist screens via the seam.
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      emitRestock();
    });

    // Tap while the app is running (foreground/background).
    const responseSub =
      Notifications.addNotificationResponseReceivedListener(
        navigateFromResponse,
      );

    // Cold start: the app was launched by tapping a notification.
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) navigateFromResponse(response);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [router]);
}
