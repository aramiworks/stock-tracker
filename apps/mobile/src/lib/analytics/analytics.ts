import { Mixpanel } from "mixpanel-react-native";
import { hasAnalyticsConsent } from "./analytics-consent";

/**
 * Mixpanel singleton for the mobile app.
 *
 * No-ops when `EXPO_PUBLIC_MIXPANEL_TOKEN` is unset (e.g. tests, missing env).
 * Initialised lazily so test environments without the native module don't
 * blow up on import.
 *
 * One project per environment (local / develop / stage / master) — token is
 * injected per-build via Doppler. See observability conventions.
 */

const MIXPANEL_TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
const TRACK_AUTOMATIC_EVENTS = false;

let mixpanelInstance: Mixpanel | null = null;
let initPromise: Promise<Mixpanel | null> | null = null;

async function getMixpanel(): Promise<Mixpanel | null> {
  if (!MIXPANEL_TOKEN) return null;
  if (mixpanelInstance) return mixpanelInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const instance = new Mixpanel(MIXPANEL_TOKEN, TRACK_AUTOMATIC_EVENTS);
      await instance.init();
      mixpanelInstance = instance;
      return instance;
    } catch {
      initPromise = null;
      return null;
    }
  })();

  return initPromise;
}

/**
 * Initialise Mixpanel. Safe to call unconditionally from the root layout —
 * no-ops without a token.
 */
export function initAnalytics(): void {
  void getMixpanel();
}

/**
 * Track an event. Drops the event silently if the user has not granted
 * analytics consent (GDPR gate).
 *
 * Event names should be snake_case (Mixpanel convention).
 */
export async function trackEvent(
  name: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    if (!(await hasAnalyticsConsent())) return;
    const instance = await getMixpanel();
    instance?.track(name, properties);
  } catch {
    // best-effort; never block the calling flow
  }
}

/**
 * Identify the user with their Supabase user ID. Call on session restore and
 * after every successful sign-in — Mixpanel's Simplified ID Merge attaches
 * the anonymous distinct_id to the identified user.
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    if (!(await hasAnalyticsConsent())) return;
    const instance = await getMixpanel();
    instance?.identify(userId);
  } catch {
    // best-effort; never block the calling flow
  }
}

/**
 * Reset the analytics identity. Call on sign-out — generates a new anonymous
 * distinct_id and prevents the next user on the device from inheriting the
 * previous identity.
 */
export async function resetAnalytics(): Promise<void> {
  try {
    const instance = await getMixpanel();
    instance?.reset();
  } catch {
    // best-effort; never block the calling flow
  }
}

/**
 * Track a screen view. Container-level events use snake_case.
 */
export async function trackScreen(
  experience: string | undefined,
  flow: string | undefined,
  container: string | undefined,
): Promise<void> {
  if (!experience && !flow && !container) return;
  await trackEvent("screen_viewed", { experience, flow, container });
}
